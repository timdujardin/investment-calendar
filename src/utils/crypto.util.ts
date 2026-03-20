const PBKDF2_ITERATIONS = 100_000;

const toBase64 = (buffer: ArrayBuffer): string => btoa(String.fromCharCode(...new Uint8Array(buffer)));

const fromBase64 = (base64: string): ArrayBuffer =>
  Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer as ArrayBuffer;

const deriveKey = async (password: string, salt: ArrayBuffer): Promise<CryptoKey> => {
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveKey',
  ]);

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );
};

export const encryptData = async (
  plaintext: string,
  password: string,
): Promise<{ ciphertext: string; iv: string; salt: string }> => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt.buffer as ArrayBuffer);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    new TextEncoder().encode(plaintext),
  );

  return {
    ciphertext: toBase64(encrypted),
    iv: toBase64(iv.buffer as ArrayBuffer),
    salt: toBase64(salt.buffer as ArrayBuffer),
  };
};

export const decryptData = async (ciphertext: string, iv: string, salt: string, password: string): Promise<string> => {
  const key = await deriveKey(password, fromBase64(salt));

  return decryptWithKey(ciphertext, iv, key);
};

export const decryptWithKey = async (ciphertext: string, iv: string, key: CryptoKey): Promise<string> => {
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(iv) }, key, fromBase64(ciphertext));

  return new TextDecoder().decode(decrypted);
};

export const deriveAndExportKey = async (password: string, salt: string): Promise<{ key: CryptoKey; raw: string }> => {
  const key = await deriveKey(password, fromBase64(salt));
  const exported = await crypto.subtle.exportKey('raw', key);

  return { key, raw: toBase64(exported) };
};

export const importKey = async (raw: string): Promise<CryptoKey> => {
  return crypto.subtle.importKey('raw', fromBase64(raw), { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
};
