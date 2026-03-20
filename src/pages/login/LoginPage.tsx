import { useState, type FC, type FormEvent } from 'react';

import { useAuth } from '@/contexts/AuthContext';

import './LoginPage.css';

const LoginPage: FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(false);
    setLoading(true);

    const success = await login(username, password);
    if (!success) {
      setError(true);
    }

    setLoading(false);
  };

  return (
    <div className="login">
      <div className="login__card">
        <h1 className="login__title">Investment Calendar</h1>
        <p className="login__subtitle">Log in om verder te gaan</p>

        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__field">
            <label className="login__label" htmlFor="login-username">
              Gebruikersnaam
            </label>
            <input
              id="login-username"
              className="login__input"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="login__field">
            <label className="login__label" htmlFor="login-password">
              Wachtwoord
            </label>
            <input
              id="login-password"
              className="login__input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error ? <div className="login__error">Ongeldige gebruikersnaam of wachtwoord</div> : null}

          <button className="login__submit" type="submit" disabled={loading}>
            {loading ? 'Bezig...' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  );
};

export { LoginPage };
