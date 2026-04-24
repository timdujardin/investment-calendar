import { webcrypto } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

import XLSX from 'xlsx';

const __dirname = dirname(fileURLToPath(import.meta.url));

const AUTH_SALT_B64 = 'cjEXv5/fQsHsJMJZuQTgew==';
const PBKDF2_ITERATIONS = 100_000;

const parseExcel = (filePath) => {
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1 });

  const rows = raw.slice(1).filter((r) => r.length > 0);

  return rows.map((r) => {
    const included = r[0] === 'x';

    let year, month, dateStr;
    const col1 = r[1];
    if (typeof col1 === 'number' && col1 > 2000 && col1 < 2100) {
      year = col1;
      month = 1;
      dateStr = `${year}-01`;
    } else if (typeof col1 === 'number') {
      const d = XLSX.SSF.parse_date_code(col1);
      year = d.y;
      month = d.m;
      dateStr = `${year}-${String(month).padStart(2, '0')}`;
    } else {
      year = null;
      month = null;
      dateStr = String(col1 ?? '');
    }

    const parseNum = (v) => {
      if (v == null || v === '' || v === '?') return null;
      if (typeof v === 'number') return v;
      const s = String(v).replace(/[€\s]/g, '').replace(/,/g, '');
      const n = parseFloat(s);
      return isNaN(n) ? null : n;
    };

    const parseDecimal = (v) => {
      if (v == null || v === '' || v === '?') return null;
      if (typeof v === 'number' && v <= 2) return v;
      if (typeof v === 'number') return v / 100;
      const s = String(v).replace('%', '').trim();
      const n = parseFloat(s);
      if (isNaN(n)) return null;
      return n / 100;
    };

    const parseCat = (v) => {
      if (v == null || v === '' || v === '?') return null;
      return String(v);
    };

    return {
      date: dateStr,
      year,
      month,
      included,
      gross: parseNum(r[4]),
      net: parseNum(r[5]),
      ratio: parseDecimal(r[6]),
      raise: parseDecimal(r[3]),
      premium: parseNum(r[7]),
      category: parseCat(r[2]),
      company: r[10] ?? '',
      jobTitle: r[11] ?? '',
      pc: parseNum(r[8]),
      note: r[9] != null && r[9] !== '' ? String(r[9]) : null,
    };
  });
};

const toBase64 = (buf) => Buffer.from(buf).toString('base64');

const encryptData = async (plaintext, password) => {
  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const iv = webcrypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await webcrypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveKey',
  ]);

  const key = await webcrypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt'],
  );

  const encrypted = await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext));

  return {
    ciphertext: toBase64(encrypted),
    iv: toBase64(iv),
    salt: toBase64(salt),
  };
};

const generateAuthHash = async (password) => {
  const keyMaterial = await webcrypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const salt = Uint8Array.from(Buffer.from(AUTH_SALT_B64, 'base64'));
  const bits = await webcrypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256,
  );
  return Array.from(new Uint8Array(bits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

const rl = createInterface({ input: process.stdin, output: process.stderr });

rl.question('Voer je wachtwoord in: ', async (password) => {
  rl.close();

  if (!password || password.length < 4) {
    console.error('Wachtwoord te kort (min. 4 tekens).');
    process.exit(1);
  }

  const excelPath = '/Users/tim.dujardin/Documents/Personal/Loonsevolutie.xlsx';
  console.error(`\nExcel parsen: ${excelPath}`);
  const entries = parseExcel(excelPath);
  console.error(`${entries.length} entries gevonden.`);

  const jun25 = entries.find((e) => e.date === '2025-06');
  const jul25 = entries.find((e) => e.date === '2025-07');
  if (jun25 && jul25) {
    jul25.net = jun25.net;
    jul25.ratio = jun25.ratio;
    console.error('Fix: juli 2025 net/ratio gekopieerd van juni 2025');
  }

  const sample = entries.find((e) => e.ratio !== null);
  if (sample) {
    console.error(`Voorbeeld: ratio=${sample.ratio}, raise=${sample.raise} (moeten decimaal zijn, bv. 0.68)`);
  }

  const plaintext = JSON.stringify(entries);

  console.error('Data versleutelen...');
  const { ciphertext, iv, salt } = await encryptData(plaintext, password);

  const configPath = join(__dirname, 'config', 'wage-data.config.ts');
  const configContent = `export const ENCRYPTED_BUMBA_DATA =\n  '${ciphertext}';\n\nexport const ENCRYPTION_IV = '${iv}';\n\nexport const ENCRYPTION_SALT = '${salt}';\n`;
  writeFileSync(configPath, configContent, 'utf-8');
  console.error(`Config geschreven: ${configPath}`);

  console.error('\nPBKDF2 auth hash genereren...');
  const authHash = await generateAuthHash(password);

  console.error('\n========================================');
  console.error('KLAAR! Kopieer de hash hieronder en');
  console.error('plak die in de chat:');
  console.error('========================================\n');
  console.log(authHash);
});
