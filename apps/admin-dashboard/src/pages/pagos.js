import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// ── Datos simulados ──────────────────────────────────────────────────────────
const PLANES_INICIALES = [
  { id: 1, nombre: 'Mensual',    duracion: '1 mes',   precio: 350,  descripcion: 'Acceso completo por 1 mes' },
  { id: 2, nombre: 'Trimestral', duracion: '3 meses', precio: 900,  descripcion: 'Ahorra $150 vs mensual' },
  { id: 3, nombre: 'Anual',      duracion: '12 meses',precio: 3000, descripcion: 'El mejor precio, ahorra $1,200' },
];

const PAGOS_INICIALES = [
  { id: 1, folio: 'PAG-001', usuario: 'Juan Pérez',   plan: 'Mensual',    monto: 350,  fecha: '2025-07-01', metodo: 'Efectivo',  estatus: 'Pagado' },
  { id: 2, folio: 'PAG-002', usuario: 'María López',  plan: 'Trimestral', monto: 900,  fecha: '2025-06-15', metodo: 'Tarjeta',   estatus: 'Pagado' },
  { id: 3, folio: 'PAG-003', usuario: 'Carlos Gómez', plan: 'Anual',      monto: 3000, fecha: '2025-01-10', metodo: 'Transferencia', estatus: 'Pagado' },
  { id: 4, folio: 'PAG-004', usuario: 'Ana Torres',   plan: 'Mensual',    monto: 350,  fecha: '2025-06-20', metodo: 'Efectivo',  estatus: 'Pagado' },
  { id: 5, folio: 'PAG-005', usuario: 'Luis Ramírez', plan: 'Mensual',    monto: 350,  fecha: '2025-06-01', metodo: 'Tarjeta',   estatus: 'Pendiente' },
];

const PLAN_VACIO = { nombre: '', duracion: '', precio: '', descripcion: '' };
const PAGO_VACIO = { usuario: '', plan: 'Mensual', monto: '', fecha: '', metodo: 'Efectivo', estatus: 'Pagado' };

// ── Componente principal ─────────────────────────────────────────────────────
export default function PagosPlanes() {
  const router = useRouter();
  const [sesion, setSesion]         = useState(null);
  const [verificando, setVerificando] = useState(true);
  const [tab, setTab]               = useState('pagos'); // 'pagos' | 'planes'

  // Protección de ruta
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

  // ── Estado de Pagos ────────────────────────────────────────────────────────
  const [pagos, setPagos]           = useState(PAGOS_INICIALES);
  const [busquedaPago, setBusquedaPago] = useState('');
  const [modalPago, setModalPago]   = useState(false);
  const [formPago, setFormPago]     = useState(PAGO_VACIO);
  const [erroresPago, setErroresPago] = useState({});

  const pagosFiltrados = pagos.filter(p =>
    p.usuario.toLowerCase().includes(busquedaPago.toLowerCase()) ||
    p.folio.toLowerCase().includes(busquedaPago.toLowerCase())
  );

  function abrirModalPago() {
    setFormPago({ ...PAGO_VACIO, fecha: new Date().toISOString().split('T')[0] });
    setErroresPago({});
    setModalPago(true);
  }

  function validarPago() {
    const e = {};
    if (!formPago.usuario.trim()) e.usuario = 'El nombre del usuario es obligatorio.';
    if (!formPago.monto || isNaN(formPago.monto) || Number(formPago.monto) <= 0) e.monto = 'Ingresa un monto válido.';
    if (!formPago.fecha) e.fecha = 'La fecha es obligatoria.';
    return e;
  }

  function guardarPago() {
    const e = validarPago();
    if (Object.keys(e).length > 0) { setErroresPago(e); return; }
    const nuevoId  = Math.max(...pagos.map(p => p.id)) + 1;
    const nuevoFolio = `PAG-${String(nuevoId).padStart(3, '0')}`;
    setPagos([{ ...formPago, id: nuevoId, folio: nuevoFolio, monto: Number(formPago.monto) }, ...pagos]);
    setModalPago(false);
  }

  function eliminarPago(id) {
    if (confirm('¿Eliminar este pago?')) setPagos(pagos.filter(p => p.id !== id));
  }

  // ── Estado de Planes ───────────────────────────────────────────────────────
  const [planes, setPlanes]         = useState(PLANES_INICIALES);
  const [modalPlan, setModalPlan]   = useState(false);
  const [modoPlan, setModoPlan]     = useState(false);   // true = editar
  const [formPlan, setFormPlan]     = useState(PLAN_VACIO);
  const [erroresPlan, setErroresPlan] = useState({});

  function abrirNuevoPlan() {
    setFormPlan(PLAN_VACIO); setErroresPlan({}); setModoPlan(false); setModalPlan(true);
  }
  function abrirEditarPlan(plan) {
    setFormPlan({ ...plan }); setErroresPlan({}); setModoPlan(true); setModalPlan(true);
  }

  function validarPlan() {
    const e = {};
    if (!formPlan.nombre.trim())      e.nombre   = 'El nombre es obligatorio.';
    if (!formPlan.duracion.trim())    e.duracion  = 'La duración es obligatoria.';
    if (!formPlan.precio || isNaN(formPlan.precio) || Number(formPlan.precio) <= 0) e.precio = 'Ingresa un precio válido.';
    return e;
  }

  function guardarPlan() {
    const e = validarPlan();
    if (Object.keys(e).length > 0) { setErroresPlan(e); return; }
    if (modoPlan) {
      setPlanes(planes.map(p => p.id === formPlan.id ? { ...formPlan, precio: Number(formPlan.precio) } : p));
    } else {
      const nuevoId = Math.max(...planes.map(p => p.id)) + 1;
      setPlanes([...planes, { ...formPlan, id: nuevoId, precio: Number(formPlan.precio) }]);
    }
    setModalPlan(false);
  }

  function eliminarPlan(id) {
    if (confirm('¿Eliminar este plan?')) setPlanes(planes.filter(p => p.id !== id));
  }

  // ── Resumen de totales ─────────────────────────────────────────────────────
  const totalRecaudado = pagos.filter(p => p.estatus === 'Pagado').reduce((s, p) => s + p.monto, 0);
  const totalPendiente = pagos.filter(p => p.estatus === 'Pendiente').reduce((s, p) => s + p.monto, 0);

  if (verificando) return null;

  const coloresMetodo  = { Efectivo: '#dbeafe', Tarjeta: '#f3e8ff', Transferencia: '#dcfce7' };
  const coloresTextoM  = { Efectivo: '#1e40af', Tarjeta: '#6b21a8', Transferencia: '#15803d' };

  return (
    <div className="container">
      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <h2>GymSAAS 🏋️‍♂️</h2>
        <nav>
          <a href="/">Dashboard</a>
          <a href="/usuarios">Usuarios</a>
          <a href="/pagos" className="active">Pagos y Planes</a>
          <a href="/configuracion">Configuración</a>
        </nav>
        <div className="sidebar-footer">
          {sesion && <p className="sidebar-user">{sesion.email}</p>}
          <button className="btn-logout" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </aside>

      {/* ── Contenido ──────────────────────────────────────────────── */}
      <main className="main-content">
        <header className="header">
          <div>
            <h1>Pagos y Planes</h1>
            <p>Administra los cobros y membresías del gimnasio</p>
          </div>
        </header>

        {/* Tarjetas resumen */}
        <div className="resumen-cards">
          <div className="card-stat green">
            <span className="card-label">Total recaudado</span>
            <span className="card-value">${totalRecaudado.toLocaleString()}</span>
          </div>
          <div className="card-stat yellow">
            <span className="card-label">Pagos pendientes</span>
            <span className="card-value">${totalPendiente.toLocaleString()}</span>
          </div>
          <div className="card-stat blue">
            <span className="card-label">Planes activos</span>
            <span className="card-value">{planes.length}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab-btn ${tab === 'pagos'  ? 'tab-activo' : ''}`} onClick={() => setTab('pagos')}>
            💳 Historial de Pagos
          </button>
          <button className={`tab-btn ${tab === 'planes' ? 'tab-activo' : ''}`} onClick={() => setTab('planes')}>
            📋 Planes de Membresía
          </button>
        </div>

        {/* ── TAB: Pagos ───────────────────────────────────────────── */}
        {tab === 'pagos' && (
          <div className="table-section">
            <div className="section-toolbar">
              <input
                className="buscador"
                placeholder="Buscar por usuario o folio..."
                value={busquedaPago}
                onChange={e => setBusquedaPago(e.target.value)}
              />
              <button className="btn-primary" onClick={abrirModalPago}>+ Registrar Pago</button>
            </div>
            <p className="total-label">{pagosFiltrados.length} pago(s) encontrado(s)</p>
            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Folio</th>
                    <th>Usuario</th>
                    <th>Plan</th>
                    <th>Monto</th>
                    <th>Fecha</th>
                    <th>Método</th>
                    <th>Estatus</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagosFiltrados.length === 0 ? (
                    <tr><td colSpan={8} className="sin-resultados">No se encontraron pagos.</td></tr>
                  ) : pagosFiltrados.map(p => (
                    <tr key={p.id}>
                      <td><code>{p.folio}</code></td>
                      <td><strong>{p.usuario}</strong></td>
                      <td>{p.plan}</td>
                      <td><strong>${p.monto.toLocaleString()}</strong></td>
                      <td>{p.fecha}</td>
                      <td>
                        <span className="badge" style={{ backgroundColor: coloresMetodo[p.metodo] || '#f1f5f9', color: coloresTextoM[p.metodo] || '#334155' }}>
                          {p.metodo}
                        </span>
                      </td>
                      <td>
                        <span className="badge" style={p.estatus === 'Pagado' ? { backgroundColor:'#dcfce7', color:'#15803d' } : { backgroundColor:'#fef9c3', color:'#854d0e' }}>
                          {p.estatus}
                        </span>
                      </td>
                      <td>
                        <button className="btn-table btn-eliminar" onClick={() => eliminarPago(p.id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: Planes ──────────────────────────────────────────── */}
        {tab === 'planes' && (
          <div className="planes-section">
            <div className="section-toolbar">
              <p style={{ color:'#64748b', fontSize:'0.9rem' }}>Configura los tipos de membresía disponibles</p>
              <button className="btn-primary" onClick={abrirNuevoPlan}>+ Nuevo Plan</button>
            </div>
            <div className="planes-grid">
              {planes.map(plan => (
                <div key={plan.id} className="plan-card">
                  <div className="plan-header">
                    <h3>{plan.nombre}</h3>
                    <span className="plan-duracion">{plan.duracion}</span>
                  </div>
                  <p className="plan-precio">${plan.precio.toLocaleString()} <span>MXN</span></p>
                  <p className="plan-desc">{plan.descripcion}</p>
                  <div className="plan-acciones">
                    <button className="btn-table btn-editar" onClick={() => abrirEditarPlan(plan)}>Editar</button>
                    <button className="btn-table btn-eliminar" onClick={() => eliminarPlan(plan.id)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Modal: Registrar Pago ─────────────────────────────────── */}
      {modalPago && (
        <div className="modal-overlay" onClick={() => setModalPago(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Registrar Pago</h2>
              <button className="modal-cerrar" onClick={() => setModalPago(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="campo">
                <label>Nombre del usuario</label>
                <input value={formPago.usuario} onChange={e => setFormPago({...formPago, usuario: e.target.value})} placeholder="Juan Pérez" />
                {erroresPago.usuario && <span className="error">{erroresPago.usuario}</span>}
              </div>
              <div className="fila-dos">
                <div className="campo">
                  <label>Plan</label>
                  <select value={formPago.plan} onChange={e => setFormPago({...formPago, plan: e.target.value, monto: planes.find(p=>p.nombre===e.target.value)?.precio || formPago.monto })}>
                    {planes.map(p => <option key={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
                <div className="campo">
                  <label>Monto (MXN)</label>
                  <input type="number" value={formPago.monto} onChange={e => setFormPago({...formPago, monto: e.target.value})} placeholder="350" />
                  {erroresPago.monto && <span className="error">{erroresPago.monto}</span>}
                </div>
              </div>
              <div className="fila-dos">
                <div className="campo">
                  <label>Método de pago</label>
                  <select value={formPago.metodo} onChange={e => setFormPago({...formPago, metodo: e.target.value})}>
                    <option>Efectivo</option>
                    <option>Tarjeta</option>
                    <option>Transferencia</option>
                  </select>
                </div>
                <div className="campo">
                  <label>Estatus</label>
                  <select value={formPago.estatus} onChange={e => setFormPago({...formPago, estatus: e.target.value})}>
                    <option>Pagado</option>
                    <option>Pendiente</option>
                  </select>
                </div>
              </div>
              <div className="campo">
                <label>Fecha de pago</label>
                <input type="date" value={formPago.fecha} onChange={e => setFormPago({...formPago, fecha: e.target.value})} />
                {erroresPago.fecha && <span className="error">{erroresPago.fecha}</span>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalPago(false)}>Cancelar</button>
              <button className="btn-primary" onClick={guardarPago}>Registrar pago</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Plan ──────────────────────────────────────────────── */}
      {modalPlan && (
        <div className="modal-overlay" onClick={() => setModalPlan(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modoPlan ? 'Editar Plan' : 'Nuevo Plan'}</h2>
              <button className="modal-cerrar" onClick={() => setModalPlan(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="campo">
                <label>Nombre del plan</label>
                <input value={formPlan.nombre} onChange={e => setFormPlan({...formPlan, nombre: e.target.value})} placeholder="Ej. Mensual" />
                {erroresPlan.nombre && <span className="error">{erroresPlan.nombre}</span>}
              </div>
              <div className="fila-dos">
                <div className="campo">
                  <label>Duración</label>
                  <input value={formPlan.duracion} onChange={e => setFormPlan({...formPlan, duracion: e.target.value})} placeholder="Ej. 1 mes" />
                  {erroresPlan.duracion && <span className="error">{erroresPlan.duracion}</span>}
                </div>
                <div className="campo">
                  <label>Precio (MXN)</label>
                  <input type="number" value={formPlan.precio} onChange={e => setFormPlan({...formPlan, precio: e.target.value})} placeholder="350" />
                  {erroresPlan.precio && <span className="error">{erroresPlan.precio}</span>}
                </div>
              </div>
              <div className="campo">
                <label>Descripción</label>
                <input value={formPlan.descripcion} onChange={e => setFormPlan({...formPlan, descripcion: e.target.value})} placeholder="Descripción breve del plan" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalPlan(false)}>Cancelar</button>
              <button className="btn-primary" onClick={guardarPlan}>{modoPlan ? 'Guardar cambios' : 'Crear plan'}</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { background-color: #f4f6f9; color: #333; }
        .container { display: flex; min-height: 100vh; }

        /* Sidebar */
        .sidebar { width: 260px; background-color: #1e293b; color: #fff; padding: 2rem 1.5rem; display: flex; flex-direction: column; }
        .sidebar h2 { margin-bottom: 2rem; font-size: 1.5rem; text-align: center; }
        .sidebar nav { flex: 1; }
        .sidebar nav a { display: block; color: #94a3b8; text-decoration: none; padding: 0.75rem 1rem; margin-bottom: 0.5rem; border-radius: 6px; transition: all 0.2s; }
        .sidebar nav a:hover, .sidebar nav a.active { background-color: #334155; color: #fff; }
        .sidebar-footer { padding-top: 1.5rem; border-top: 1px solid #334155; }
        .sidebar-user { color: #94a3b8; font-size: 0.8rem; margin-bottom: 0.75rem; word-break: break-all; }
        .btn-logout { width: 100%; padding: 0.6rem 1rem; border: 1px solid #475569; border-radius: 6px; background: transparent; color: #f1f5f9; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-logout:hover { background-color: #ef4444; border-color: #ef4444; }

        /* Main */
        .main-content { flex: 1; padding: 2rem; overflow-y: auto; }
        .header { margin-bottom: 1.5rem; }
        .header h1 { font-size: 1.8rem; color: #0f172a; }
        .header p { color: #64748b; }

        /* Resumen */
        .resumen-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
        .card-stat { background: #fff; border-radius: 10px; padding: 1.25rem 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.07); display: flex; flex-direction: column; gap: 0.4rem; border-left: 4px solid; }
        .card-stat.green { border-color: #22c55e; }
        .card-stat.yellow { border-color: #eab308; }
        .card-stat.blue { border-color: #3b82f6; }
        .card-label { font-size: 0.82rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
        .card-value { font-size: 1.8rem; font-weight: 700; color: #0f172a; }

        /* Tabs */
        .tabs { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0; }
        .tab-btn { padding: 0.65rem 1.25rem; border: none; background: none; font-size: 0.95rem; font-weight: 600; color: #64748b; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; transition: all 0.2s; }
        .tab-btn:hover { color: #2563eb; }
        .tab-activo { color: #2563eb !important; border-bottom-color: #2563eb !important; }

        /* Toolbar */
        .section-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
        .buscador { flex: 1; min-width: 200px; padding: 0.65rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.95rem; outline: none; background-color: #fff !important; color: #1e293b !important; }
        .buscador:focus { border-color: #2563eb; }
        .buscador::placeholder { color: #94a3b8; }
        .total-label { font-size: 0.85rem; color: #64748b; margin-bottom: 0.75rem; }

        /* Tabla */
        .table-section { background: #fff; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .table-wrapper { overflow-x: auto; max-height: 55vh; overflow-y: auto; border-radius: 8px; border: 1px solid #e2e8f0; }
        .custom-table { width: 100%; border-collapse: collapse; text-align: left; }
        .custom-table thead { position: sticky; top: 0; z-index: 10; }
        .custom-table th { background-color: #f8fafc; padding: 0.75rem 1rem; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0; white-space: nowrap; }
        .custom-table td { padding: 0.85rem 1rem; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; white-space: nowrap; }
        .sin-resultados { text-align: center; color: #94a3b8; padding: 2rem !important; }
        .badge { padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }
        code { font-size: 0.82rem; background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 4px; color: #475569; }

        /* Planes grid */
        .planes-section { }
        .planes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem; margin-top: 1rem; }
        .plan-card { background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 0.75rem; }
        .plan-header { display: flex; justify-content: space-between; align-items: center; }
        .plan-header h3 { font-size: 1.1rem; color: #0f172a; }
        .plan-duracion { font-size: 0.8rem; background: #dbeafe; color: #1e40af; padding: 0.2rem 0.6rem; border-radius: 20px; font-weight: 600; }
        .plan-precio { font-size: 2rem; font-weight: 700; color: #2563eb; }
        .plan-precio span { font-size: 0.85rem; color: #64748b; font-weight: 400; }
        .plan-desc { font-size: 0.85rem; color: #64748b; flex: 1; }
        .plan-acciones { display: flex; gap: 0.5rem; margin-top: 0.5rem; }

        /* Botones */
        .btn-primary { padding: 0.7rem 1.4rem; border: none; border-radius: 8px; background-color: #2563eb; color: #fff; font-weight: 600; font-size: 0.95rem; cursor: pointer; white-space: nowrap; transition: background 0.2s; }
        .btn-primary:hover { background-color: #1d4ed8; }
        .btn-secondary { padding: 0.7rem 1.4rem; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; color: #334155; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: background 0.2s; }
        .btn-secondary:hover { background-color: #f1f5f9; }
        .btn-table { padding: 0.4rem 0.7rem; border: none; border-radius: 6px; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .btn-editar { background-color: #e0f2fe; color: #0369a1; }
        .btn-editar:hover { background-color: #bae6fd; }
        .btn-eliminar { background-color: #fee2e2; color: #b91c1c; }
        .btn-eliminar:hover { background-color: #fecaca; }

        /* Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem; }
        .modal { background: #fff; border-radius: 12px; width: 100%; max-width: 480px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid #e2e8f0; }
        .modal-header h2 { font-size: 1.2rem; color: #0f172a; }
        .modal-cerrar { background: none; border: none; font-size: 1.2rem; color: #94a3b8; cursor: pointer; }
        .modal-cerrar:hover { color: #334155; }
        .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .modal-footer { padding: 1.25rem 1.5rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 0.75rem; }
        .campo { display: flex; flex-direction: column; gap: 0.35rem; }
        .campo label { font-size: 0.85rem; font-weight: 600; color: #334155; }
        .campo input, .campo select { padding: 0.65rem 0.9rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.95rem; outline: none; background: #fff; color: #1e293b; }
        .campo input:focus, .campo select:focus { border-color: #2563eb; }
        .fila-dos { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .error { font-size: 0.8rem; color: #b91c1c; }
      `}</style>
    </div>
  );
}