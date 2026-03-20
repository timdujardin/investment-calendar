import { webcrypto } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const PBKDF2_ITERATIONS = 100_000;

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/encrypt-wage-data.mjs <password>');
  process.exit(1);
}

const configPath = new URL('../config/wage-data.config.ts', import.meta.url);
const source = readFileSync(configPath, 'utf-8');

const stripped = source
  .replace(/^import.*;\n/gm, '')
  .replace(/export const WAGE_DATA:\s*WageEntry\[\]\s*=\s*/, '')
  .trim()
  .replace(/;$/, '');

const data = new Function(`return ${stripped}`)();
console.log(`Parsed ${data.length} wage entries`);

const plaintext = JSON.stringify(data);

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

const toBase64 = (buf) => Buffer.from(buf).toString('base64');

const output = `export const ENCRYPTED_WAGE_DATA = '${toBase64(encrypted)}';\n\nexport const ENCRYPTION_IV = '${toBase64(iv)}';\n\nexport const ENCRYPTION_SALT = '${toBase64(salt)}';\n`;

writeFileSync(configPath, output, 'utf-8');
console.log('Encrypted wage data written to config/wage-data.config.ts');
