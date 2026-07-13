import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Credenciales simuladas (más adelante esto se reemplaza por fetch al backend)
  const ADMIN_DEMO = {
    email: 'admin@gymsaas.com',
    password: '12345',
  };

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Completa todos los campos.');
      return;
    }

    setCargando(true);

    // Simulamos el tiempo de respuesta de una API real
    setTimeout(() => {
      if (email === ADMIN_DEMO.email && password === ADMIN_DEMO.password) {
        // Guardamos una "sesión" simulada en localStorage
        localStorage.setItem(
          'gymsaas_admin_session',
          JSON.stringify({ email, loginAt: new Date().toISOString() })
        );
        router.push('/');
      } else {
        setError('Correo o contraseña incorrectos.');
      }
      setCargando(false);
    }, 600);
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>GymSAAS </h2>
        

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            placeholder="admin@gymsaas.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" className="btn-login" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="demo-hint">
          Demo: admin@gymsaas.com / 12345
        </p>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
          background-color: #f4f6f9;
        }

        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .login-card {
          background: #fff;
          width: 100%;
          max-width: 380px;
          padding: 2.5rem 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(51, 13, 188, 0.05);
          text-align: center;
        }

        .login-card h2 {
          color: #34088b;
          font-size: 1.6rem;
          margin-bottom: 0.25rem;
        }

        .subtitle {
          color: #64748b;
          margin-bottom: 2rem;
          font-size: 0.95rem;
        }

        form {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.35rem;
          margin-top: 1rem;
        }

        input {
          padding: 0.7rem 0.9rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s;
        }

        input:focus {
          border-color: #2563eb;
        }

        .error-msg {
          margin-top: 1rem;
          background-color: #fee2e2;
          color: #b91c1c;
          padding: 0.6rem 0.8rem;
          border-radius: 6px;
          font-size: 0.85rem;
        }

        .btn-login {
          margin-top: 1.75rem;
          padding: 0.8rem;
          border: none;
          border-radius: 8px;
          background-color: #2563eb;
          color: #fff;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-login:hover {
          background-color: #1d4ed8;
        }

        .btn-login:disabled {
          background-color: #93c5fd;
          cursor: not-allowed;
        }

        .demo-hint {
          margin-top: 1.5rem;
          font-size: 0.8rem;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}