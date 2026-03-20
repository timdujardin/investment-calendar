const AUTH_SALT = 'investment-calendar-auth-salt-2026';

const EXPECTED_USERNAME = 'admin';
// eslint-disable-next-line sonarjs/no-hardcoded-passwords
const EXPECTED_PASSWORD_HASH = '5d67e05b14b164d38fb4057a92de328c3838207ab1e8029f1141803e7d73fe00';

export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(AUTH_SALT + password);
  const buffer = await crypto.subtle.digest('SHA-256', data);

  return Array.from(new Uint8Array(buffer))
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
