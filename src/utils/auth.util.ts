const AUTH_SALT_B64 = 'cjEXv5/fQsHsJMJZuQTgew==';
const PBKDF2_ITERATIONS = 100_000;

const EXPECTED_USERNAME = 'admin';
// eslint-disable-next-line sonarjs/no-hardcoded-passwords
const EXPECTED_PASSWORD_HASH = 'ba25f74f8d692c64ae11c1a96e3291fa199c079167d31d2a4b9cd8ad70c3c899';

export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const salt = Uint8Array.from(atob(AUTH_SALT_B64), (c) => c.charCodeAt(0));
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256,
  );

  return Array.from(new Uint8Array(bits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

export const verifyCredentials = async (username: string, password: string): Promise<boolean> => {
  if (username !== EXPECTED_USERNAME) {
    return false;
  }

  const hash = await hashPassword(password);

  return hash === EXPECTED_PASSWORD_HASH;
};
