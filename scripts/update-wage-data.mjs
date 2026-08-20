import { webcrypto } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

/**
 * Werkt de versleutelde loondata bij zonder dat de plaintext ooit op schijf komt: ontsleutelen,
 * de maanden hieronder aanpassen, opnieuw versleutelen met een nieuwe salt en IV.
 *
 * Gebruik: node scripts/update-wage-data.mjs <wachtwoord> [--net=<bedrag>] [--dry-run]
 *
 * --dry-run toont wat er zou veranderen zonder iets weg te schrijven.
 * --net overschrijft de berekende netto van 2027 met het cijfer van je loonbrief.
 */

const PBKDF2_ITERATIONS = 100_000;

const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith('--'));
const password = args.find((a) => !a.startsWith('--'));

if (!password) {
  console.error('Usage: node scripts/update-wage-data.mjs <password> [--net=<amount>] [--dry-run]');
  process.exit(1);
}

const unknownFlag = flags.find((f) => f !== '--dry-run' && !f.startsWith('--net='));
if (unknownFlag) {
  console.error(`Onbekende optie: ${unknownFlag}`);
  process.exit(1);
}

const isDryRun = flags.includes('--dry-run');
const netOverrideFlag = flags.find((f) => f.startsWith('--net='));

const pad2 = (n) => String(n).padStart(2, '0');
const round2 = (n) => Math.round(n * 100) / 100;
const round4 = (n) => Math.round(n * 10000) / 10000;

const GROSS_FROM_JULY_2026 = 4600;
const NET_FROM_JULY_2026 = 3150;
const GROSS_FROM_OCTOBER_2026 = 4750;
const NET_FROM_OCTOBER_2026 = 3210;

/**
 * Spiegelt INDEX_ADJUSTMENTS uit config/bumba.config.ts: onder het plafond krijg je de volle
 * index op je hele brutoloon, erboven valt het terug op CAPPED_RATE per schijf.
 */
const INDEX_CEILING = 4000;
const INDEX_RATE_2027 = 0.04;
const INDEX_CAPPED_RATE_2027 = 0.02;

const calculateIndexationAmount = (gross) => {
  const rate = gross > INDEX_CEILING ? INDEX_CAPPED_RATE_2027 : INDEX_RATE_2027;

  return gross * rate;
};

const INDEXATION_2027_AMOUNT = calculateIndexationAmount(GROSS_FROM_OCTOBER_2026);
const INDEXATION_2027_RATE = round4(INDEXATION_2027_AMOUNT / GROSS_FROM_OCTOBER_2026);
const GROSS_2027 = round2(GROSS_FROM_OCTOBER_2026 + INDEXATION_2027_AMOUNT);

/**
 * Netto schaalt niet mee met bruto: van de indexering blijft maar een deel over na belasting.
 * Spiegelt MARGINAL_NET_RATE uit config/bumba.config.ts.
 */
const MARGINAL_NET_RATE = 13 / 30;
const NET_2027 = netOverrideFlag
  ? Number(netOverrideFlag.slice('--net='.length))
  : round2(NET_FROM_OCTOBER_2026 + (GROSS_2027 - GROSS_FROM_OCTOBER_2026) * MARGINAL_NET_RATE);

if (!Number.isFinite(NET_2027)) {
  console.error(`--net moet een getal zijn, kreeg: ${netOverrideFlag}`);
  process.exit(1);
}

console.log(
  `Index 2027: ${round2(INDEXATION_2027_AMOUNT)} euro op ${GROSS_FROM_OCTOBER_2026} bruto ` +
    `(${(INDEXATION_2027_RATE * 100).toFixed(2)}% effectief) -> ${GROSS_2027} bruto, ${NET_2027} netto` +
    `${netOverrideFlag ? ' (netto handmatig opgegeven)' : ''}`,
);
console.log(
  `Netto stijging: ${round2(NET_2027 - NET_FROM_OCTOBER_2026)} euro op ${round2(INDEXATION_2027_AMOUNT)} bruto`,
);

/** Elke maand die deze run moet krijgen, met de waarden die erop van toepassing zijn. */
const targets = [];

for (const month of [7, 8, 9]) {
  targets.push({ year: 2026, month, gross: GROSS_FROM_JULY_2026, net: NET_FROM_JULY_2026 });
}
for (const month of [10, 11, 12]) {
  targets.push({ year: 2026, month, gross: GROSS_FROM_OCTOBER_2026, net: NET_FROM_OCTOBER_2026 });
}
for (let month = 1; month <= 12; month++) {
  targets.push({
    year: 2027,
    month,
    gross: GROSS_2027,
    net: NET_2027,
    // Alleen januari draagt de indexering als loonsverhoging; de rest van het jaar staat stil.
    raise: month === 1 ? INDEXATION_2027_RATE : null,
    note:
      month === 1
        ? `indexering ${round2(INDEXATION_2027_AMOUNT)} euro via schijven (${(INDEXATION_2027_RATE * 100).toFixed(2)}% effectief, prognose)`
        : null,
  });
}

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

const ciphertext = readExport('ENCRYPTED_BUMBA_DATA');
const iv = readExport('ENCRYPTION_IV');
const salt = readExport('ENCRYPTION_SALT');

const fromBase64 = (b64) => Buffer.from(b64, 'base64');
const toBase64 = (buf) => Buffer.from(buf).toString('base64');

const deriveKey = async (saltBytes, usages) => {
  const keyMaterial = await webcrypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveKey',
  ]);

  return webcrypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltBytes, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    usages,
  );
};

let entries;
try {
  const key = await deriveKey(fromBase64(salt), ['decrypt']);
  const decrypted = await webcrypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(iv) },
    key,
    fromBase64(ciphertext),
  );
  entries = JSON.parse(new TextDecoder().decode(decrypted));
} catch {
  console.error('Ontsleutelen mislukt. Verkeerd wachtwoord?');
  process.exit(1);
}

console.log(`Ontsleuteld: ${entries.length} loonregels`);

const template = entries.at(-1);
if (!template) {
  console.error('Geen bestaande loonregels om de bedrijfsgegevens uit over te nemen');
  process.exit(1);
}

const changes = [];

for (const target of targets) {
  const date = `${target.year}-${pad2(target.month)}`;
  const ratio = round4(target.net / target.gross);
  const existing = entries.find((e) => e.date === date);

  if (existing) {
    changes.push({
      date,
      actie: 'bijgewerkt',
      brutoVan: existing.gross,
      brutoNaar: round2(target.gross),
      nettoVan: existing.net,
      nettoNaar: round2(target.net),
    });
    existing.gross = round2(target.gross);
    existing.net = round2(target.net);
    existing.ratio = ratio;
    existing.included = true;
    if (target.raise !== undefined) {
      existing.raise = target.raise;
    }
    if (target.note != null) {
      existing.note = target.note;
    }
    continue;
  }

  entries.push({
    ...template,
    date,
    year: target.year,
    month: target.month,
    included: true,
    gross: round2(target.gross),
    net: round2(target.net),
    ratio,
    raise: target.raise ?? null,
    premium: null,
    note: target.note ?? null,
  });
  changes.push({
    date,
    actie: 'toegevoegd',
    brutoVan: null,
    brutoNaar: round2(target.gross),
    nettoVan: null,
    nettoNaar: round2(target.net),
  });
}

entries.sort((a, b) => a.date.localeCompare(b.date));

console.table(changes);
console.log(`Nieuw totaal: ${entries.length} loonregels`);

if (isDryRun) {
  console.log('Droogloop: er is niets weggeschreven.');
  process.exit(0);
}

const newSalt = webcrypto.getRandomValues(new Uint8Array(16));
const newIv = webcrypto.getRandomValues(new Uint8Array(12));
const encryptKey = await deriveKey(newSalt, ['encrypt']);
const encrypted = await webcrypto.subtle.encrypt(
  { name: 'AES-GCM', iv: newIv },
  encryptKey,
  new TextEncoder().encode(JSON.stringify(entries)),
);

const output = `export const ENCRYPTED_BUMBA_DATA = '${toBase64(encrypted)}';\n\nexport const ENCRYPTION_IV = '${toBase64(newIv)}';\n\nexport const ENCRYPTION_SALT = '${toBase64(newSalt)}';\n`;

writeFileSync(configPath, output, 'utf-8');
console.log('Versleutelde loondata weggeschreven naar config/wage-data.config.ts');
