import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const CONFIG_INICIAL = {
  nombreGym:       'GymSAAS Puebla',
  email:           'contacto@gymsaas.com',
  telefono:        '222-000-0000',
  direccion:       'Av. Reforma 100, Puebla, México',
  horarioApertura: '06:00',
  horarioCierre:   '22:00',
  capacidadMax:    80,
  moneda:          'MXN',
};

const ADMIN_INICIAL = {
  nombreAdmin: 'Administrador',
  emailAdmin:  'admin@gymsaas.com',
  passwordActual: '',
  passwordNueva:  '',
  passwordConfirm:'',
};

export default function Configuracion() {
  const router = useRouter();
  const [sesion, setSesion]         = useState(null);
  const [verificando, setVerificando] = useState(true);
  const [tab, setTab]               = useState('gym'); // 'gym' | 'cuenta'

  useEffect(() => {
    const data = localStorage.getItem('gymsaas_admin_session');
    if (!data) { router.replace('/login'); return; }
    setSesion(JSON.parse(data));
    setVerificando(false);
  }, [router]);

  function handleLogout() {
    localStorage.removeItem('gymsaas_admin_session');
    router.push('/login');
  }

  // ── Config del gimnasio ────────────────────────────────────────────────────
  const [config, setConfig]         = useState(CONFIG_INICIAL);
  const [erroresGym, setErroresGym] = useState({});
  const [guardadoGym, setGuardadoGym] = useState(false);

  function handleConfigCampo(e) {
    setConfig({ ...config, [e.target.name]: e.target.value });
  }

  function validarGym() {
    const e = {};
    if (!config.nombreGym.trim())  e.nombreGym  = 'El nombre del gimnasio es obligatorio.';
    if (!config.email.trim())      e.email      = 'El correo es obligatorio.';
    if (!config.capacidadMax || config.capacidadMax <= 0) e.capacidadMax = 'Ingresa una capacidad válida.';
    return e;
  }

  function guardarConfig() {
    const e = validarGym();
    if (Object.keys(e).length > 0) { setErroresGym(e); return; }
    setErroresGym({});
    setGuardadoGym(true);
    setTimeout(() => setGuardadoGym(false), 2500);
  }

  // ── Config de cuenta admin ─────────────────────────────────────────────────
  const [cuenta, setCuenta]           = useState(ADMIN_INICIAL);
  const [erroresCuenta, setErroresCuenta] = useState({});
  const [guardadoCuenta, setGuardadoCuenta] = useState(false);

  function handleCuentaCampo(e) {
    setCuenta({ ...cuenta, [e.target.name]: e.target.value });
  }

  function validarCuenta() {
    const e = {};
    if (!cuenta.nombreAdmin.trim()) e.nombreAdmin = 'El nombre es obligatorio.';
    if (!cuenta.emailAdmin.trim() || !/\S+@\S+\.\S+/.test(cuenta.emailAdmin)) e.emailAdmin = 'Correo inválido.';
    if (cuenta.passwordNueva && cuenta.passwordNueva.length < 6) e.passwordNueva = 'Mínimo 6 caracteres.';
    if (cuenta.passwordNueva && cuenta.passwordNueva !== cuenta.passwordConfirm) e.passwordConfirm = 'Las contraseñas no coinciden.';
    return e;
  }

  function guardarCuenta() {
    const e = validarCuenta();
    if (Object.keys(e).length > 0) { setErroresCuenta(e); return; }
    setErroresCuenta({});
    setGuardadoCuenta(true);
    setCuenta({ ...cuenta, passwordActual: '', passwordNueva: '', passwordConfirm: '' });
    setTimeout(() => setGuardadoCuenta(false), 2500);
  }

  if (verificando) return null;

  return (
    <div className="container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>GymSAAS 🏋️‍♂️</h2>
        <nav>
          <a href="/">Dashboard</a>
          <a href="/usuarios">Usuarios</a>
          <a href="/pagos">Pagos y Planes</a>
          <a href="/configuracion" className="active">Configuración</a>
        </nav>
        <div className="sidebar-footer">
          {sesion && <p className="sidebar-user">{sesion.email}</p>}
          <button className="btn-logout" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="main-content">
        <header className="header">
          <h1>Configuración</h1>
          <p>Ajusta los datos del gimnasio y tu cuenta de administrador</p>
        </header>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab-btn ${tab === 'gym'    ? 'tab-activo' : ''}`} onClick={() => setTab('gym')}>
            🏢 Datos del Gimnasio
          </button>
          <button className={`tab-btn ${tab === 'cuenta' ? 'tab-activo' : ''}`} onClick={() => setTab('cuenta')}>
            👤 Mi Cuenta
          </button>
        </div>

        {/* ── TAB: Datos del gimnasio ──────────────────────────── */}
        {tab === 'gym' && (
          <div className="form-section">
            {guardadoGym && <div className="alerta-ok">✅ Cambios guardados correctamente.</div>}

            <div className="form-group">
              <h3 className="form-subtitle">Información general</h3>
              <div className="grid-2">
                <div className="campo">
                  <label>Nombre del gimnasio</label>
                  <input name="nombreGym" value={config.nombreGym} onChange={handleConfigCampo} placeholder="Mi Gimnasio" />
                  {erroresGym.nombreGym && <span className="error">{erroresGym.nombreGym}</span>}
                </div>
                <div className="campo">
                  <label>Correo de contacto</label>
                  <input name="email" type="email" value={config.email} onChange={handleConfigCampo} placeholder="contacto@gym.com" />
                  {erroresGym.email && <span className="error">{erroresGym.email}</span>}
                </div>
                <div className="campo">
                  <label>Teléfono</label>
                  <input name="telefono" value={config.telefono} onChange={handleConfigCampo} placeholder="222-000-0000" />
                </div>
                <div className="campo">
                  <label>Dirección</label>
                  <input name="direccion" value={config.direccion} onChange={handleConfigCampo} placeholder="Av. Principal 100" />
                </div>
              </div>
            </div>

            <div className="form-group">
              <h3 className="form-subtitle">Operación</h3>
              <div className="grid-3">
                <div className="campo">
                  <label>Horario de apertura</label>
                  <input name="horarioApertura" type="time" value={config.horarioApertura} onChange={handleConfigCampo} />
                </div>
                <div className="campo">
                  <label>Horario de cierre</label>
                  <input name="horarioCierre" type="time" value={config.horarioCierre} onChange={handleConfigCampo} />
                </div>
                <div className="campo">
                  <label>Capacidad máxima</label>
                  <input name="capacidadMax" type="number" value={config.capacidadMax} onChange={handleConfigCampo} min="1" />
                  {erroresGym.capacidadMax && <span className="error">{erroresGym.capacidadMax}</span>}
                </div>
                <div className="campo">
                  <label>Moneda</label>
                  <select name="moneda" value={config.moneda} onChange={handleConfigCampo}>
                    <option value="MXN">MXN — Peso mexicano</option>
                    <option value="USD">USD — Dólar americano</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-footer">
              <button className="btn-primary" onClick={guardarConfig}>Guardar cambios</button>
            </div>
          </div>
        )}

        {/* ── TAB: Mi Cuenta ───────────────────────────────────── */}
        {tab === 'cuenta' && (
          <div className="form-section">
            {guardadoCuenta && <div className="alerta-ok">✅ Cuenta actualizada correctamente.</div>}

            <div className="form-group">
              <h3 className="form-subtitle">Información personal</h3>
              <div className="grid-2">
                <div className="campo">
                  <label>Nombre del administrador</label>
                  <input name="nombreAdmin" value={cuenta.nombreAdmin} onChange={handleCuentaCampo} placeholder="Tu nombre" />
                  {erroresCuenta.nombreAdmin && <span className="error">{erroresCuenta.nombreAdmin}</span>}
                </div>
                <div className="campo">
                  <label>Correo electrónico</label>
                  <input name="emailAdmin" type="email" value={cuenta.emailAdmin} onChange={handleCuentaCampo} />
                  {erroresCuenta.emailAdmin && <span className="error">{erroresCuenta.emailAdmin}</span>}
                </div>
              </div>
            </div>

            <div className="form-group">
              <h3 className="form-subtitle">Cambiar contraseña <span className="opcional">(opcional)</span></h3>
              <div className="grid-2">
                <div className="campo">
                  <label>Contraseña actual</label>
                  <input name="passwordActual" type="password" value={cuenta.passwordActual} onChange={handleCuentaCampo} placeholder="••••••••" />
                </div>
                <div className="campo">
                  <label>Nueva contraseña</label>
                  <input name="passwordNueva" type="password" value={cuenta.passwordNueva} onChange={handleCuentaCampo} placeholder="Mínimo 6 caracteres" />
                  {erroresCuenta.passwordNueva && <span className="error">{erroresCuenta.passwordNueva}</span>}
                </div>
                <div className="campo">
                  <label>Confirmar nueva contraseña</label>
                  <input name="passwordConfirm" type="password" value={cuenta.passwordConfirm} onChange={handleCuentaCampo} placeholder="Repite la nueva contraseña" />
                  {erroresCuenta.passwordConfirm && <span className="error">{erroresCuenta.passwordConfirm}</span>}
                </div>
              </div>
            </div>

            <div className="form-footer">
              <button className="btn-primary" onClick={guardarCuenta}>Guardar cuenta</button>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { background-color: #f4f6f9; color: #333; }
        .container { display: flex; min-height: 100vh; }

        .sidebar { width: 260px; background-color: #1e293b; color: #fff; padding: 2rem 1.5rem; display: flex; flex-direction: column; }
        .sidebar h2 { margin-bottom: 2rem; font-size: 1.5rem; text-align: center; }
        .sidebar nav { flex: 1; }
        .sidebar nav a { display: block; color: #94a3b8; text-decoration: none; padding: 0.75rem 1rem; margin-bottom: 0.5rem; border-radius: 6px; transition: all 0.2s; }
        .sidebar nav a:hover, .sidebar nav a.active { background-color: #334155; color: #fff; }
        .sidebar-footer { padding-top: 1.5rem; border-top: 1px solid #334155; }
        .sidebar-user { color: #94a3b8; font-size: 0.8rem; margin-bottom: 0.75rem; word-break: break-all; }
        .btn-logout { width: 100%; padding: 0.6rem 1rem; border: 1px solid #475569; border-radius: 6px; background: transparent; color: #f1f5f9; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-logout:hover { background-color: #ef4444; border-color: #ef4444; }

        .main-content { flex: 1; padding: 2rem; overflow-y: auto; }
        .header { margin-bottom: 1.5rem; }
        .header h1 { font-size: 1.8rem; color: #0f172a; }
        .header p { color: #64748b; margin-top: 0.25rem; }

        .tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 2px solid #e2e8f0; }
        .tab-btn { padding: 0.65rem 1.25rem; border: none; background: none; font-size: 0.95rem; font-weight: 600; color: #64748b; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; transition: all 0.2s; }
        .tab-btn:hover { color: #2563eb; }
        .tab-activo { color: #2563eb !important; border-bottom-color: #2563eb !important; }

        .form-section { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-group { background: #fff; border-radius: 12px; padding: 1.75rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .form-subtitle { font-size: 1rem; color: #0f172a; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid #f1f5f9; }
        .opcional { font-size: 0.8rem; font-weight: 400; color: #94a3b8; }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }

        .campo { display: flex; flex-direction: column; gap: 0.35rem; }
        .campo label { font-size: 0.85rem; font-weight: 600; color: #334155; }
        .campo input, .campo select { padding: 0.65rem 0.9rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.95rem; outline: none; background: #fff !important; color: #1e293b !important; }
        .campo input:focus, .campo select:focus { border-color: #2563eb; }
        .error { font-size: 0.8rem; color: #b91c1c; }

        .form-footer { display: flex; justify-content: flex-end; }
        .alerta-ok { background: #dcfce7; color: #15803d; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.9rem; font-weight: 600; }

        .btn-primary { padding: 0.75rem 1.75rem; border: none; border-radius: 8px; background-color: #2563eb; color: #fff; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: background 0.2s; }
        .btn-primary:hover { background-color: #1d4ed8; }

        @media (max-width: 768px) {
          .grid-2, .grid-3 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}