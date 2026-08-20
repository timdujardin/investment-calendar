import { webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';

/**
 * Leest de versleutelde loondata uit en drukt de gevraagde maanden af. Schrijft niets weg.
 *
 * Gebruik: node scripts/inspect-wage-data.mjs <wachtwoord> [vanaf] [tot]
 * Met datums: node scripts/inspect-wage-data.mjs geheim 2026-06 2027-12
 * Met indexen: node scripts/inspect-wage-data.mjs geheim 7 18
 */

const PBKDF2_ITERATIONS = 100_000;

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/inspect-wage-data.mjs <password> [fromDate] [toDate]');
  process.exit(1);
}

const from = process.argv[3] ?? '2026-06';
const to = process.argv[4] ?? '2027-12';
const isIndexRange = /^\d+$/.test(from);

const configPath = new URL('../config/wage-data.config.ts', import.meta.url);
const source = readFileSync(configPath, 'utf-8');

const readExport = (name) => {
  const match = source.match(new RegExp(`${name}\\s*=\\s*'([^']+)'`));
  if (!match) {
    console.error(`Kon ${name} niet vinden in config/wage-data.config.ts`);
    process.exit(1);
  }

  return match[1];
};

const fromBase64 = (b64) => Buffer.from(b64, 'base64');

const keyMaterial = await webcrypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
  'deriveKey',
]);
const key = await webcrypto.subtle.deriveKey(
  { name: 'PBKDF2', salt: fromBase64(readExport('ENCRYPTION_SALT')), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
  keyMaterial,
  { name: 'AES-GCM', length: 256 },
  false,
  ['decrypt'],
);

let entries;
try {
  const decrypted = await webcrypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(readExport('ENCRYPTION_IV')) },
    key,
    fromBase64(readExport('ENCRYPTED_BUMBA_DATA')),
  );
  entries = JSON.parse(new TextDecoder().decode(decrypted));
} catch {
  console.error('Ontsleutelen mislukt. Verkeerd wachtwoord?');
  process.exit(1);
}

console.log(`Totaal ${entries.length} loonregels, laatste is ${entries.at(-1)?.date}`);

const selected = isIndexRange
  ? entries.slice(Number(from), Number(to) + 1)
  : entries.filter((e) => e.date >= from && e.date <= to);

if (selected.length === 0) {
  console.log(`\nGeen regels gevonden voor ${from} tot ${to}.`);
  process.exit(0);
}

// Dubbele maanden zijn de meest waarschijnlijke oorzaak als de UI een ander bedrag toont.
const seen = new Map();
for (const entry of selected) {
  seen.set(entry.date, (seen.get(entry.date) ?? 0) + 1);
}
const duplicates = [...seen].filter(([, count]) => count > 1);
if (duplicates.length > 0) {
  console.log(
    `\nLET OP: dubbele maanden gevonden: ${duplicates.map(([date, count]) => `${date} (${count}x)`).join(', ')}`,
  );
}

console.table(
  selected.map((e) => ({
    index: entries.indexOf(e),
    datum: e.date,
    bruto: e.gross,
    netto: e.net,
    ratio: e.ratio,
    opslag: e.raise,
    premie: e.premium,
    meegerekend: e.included,
    note: e.note,
  })),
);
