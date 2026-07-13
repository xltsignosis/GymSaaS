import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// Datos simulados — se reemplazarán por fetch al backend
const USUARIOS_INICIALES = [
  { id: 1, nombre: 'Juan Pérez',    email: 'juan@email.com',   telefono: '222-111-0001', membresia: 'Mensual',   estatus: 'Activo',   fechaVencimiento: '2025-08-01' },
  { id: 2, nombre: 'María López',   email: 'maria@email.com',  telefono: '222-111-0002', membresia: 'Trimestral',estatus: 'Vencido',  fechaVencimiento: '2025-06-15' },
  { id: 3, nombre: 'Carlos Gómez',  email: 'carlos@email.com', telefono: '222-111-0003', membresia: 'Anual',    estatus: 'Activo',   fechaVencimiento: '2026-01-10' },
  { id: 4, nombre: 'Ana Torres',    email: 'ana@email.com',    telefono: '222-111-0004', membresia: 'Mensual',   estatus: 'Activo',   fechaVencimiento: '2025-07-20' },
  { id: 5, nombre: 'Luis Ramírez',  email: 'luis@email.com',   telefono: '222-111-0005', membresia: 'Mensual',   estatus: 'Suspendido',fechaVencimiento: '2025-07-01' },
];

const USUARIO_VACIO = {
  nombre: '', email: '', telefono: '', membresia: 'Mensual', estatus: 'Activo', fechaVencimiento: '',
};

export default function Usuarios() {
  const router = useRouter();
  const [sesion, setSesion] = useState(null);
  const [verificando, setVerificando] = useState(true);

  // Protección de ruta
  useEffect(() => {
    const data = localStorage.getItem('gymsaas_admin_session');
    if (!data) {
      router.replace('/login');
    } else {
      setSesion(JSON.parse(data));
      setVerificando(false);
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem('gymsaas_admin_session');
    router.push('/login');
  }

  const [usuarios, setUsuarios] = useState(USUARIOS_INICIALES);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstatus, setFiltroEstatus] = useState('Todos');

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formulario, setFormulario] = useState(USUARIO_VACIO);
  const [errores, setErrores] = useState({});

  // Lista filtrada
  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideBusqueda =
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstatus = filtroEstatus === 'Todos' || u.estatus === filtroEstatus;
    return coincideBusqueda && coincideEstatus;
  });

  // Abrir modal para nuevo usuario
  function abrirModalNuevo() {
    setFormulario(USUARIO_VACIO);
    setErrores({});
    setModoEdicion(false);
    setModalAbierto(true);
  }

  // Abrir modal para editar
  function abrirModalEditar(usuario) {
    setFormulario({ ...usuario });
    setErrores({});
    setModoEdicion(true);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
  }

  function handleCampo(e) {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  }

  function validar() {
    const e = {};
    if (!formulario.nombre.trim())          e.nombre    = 'El nombre es obligatorio.';
    if (!formulario.email.trim())           e.email     = 'El correo es obligatorio.';
    else if (!/\S+@\S+\.\S+/.test(formulario.email)) e.email = 'Correo inválido.';
    if (!formulario.fechaVencimiento)       e.fechaVencimiento = 'La fecha de vencimiento es obligatoria.';
    return e;
  }

  function guardarUsuario() {
    const e = validar();
    if (Object.keys(e).length > 0) { setErrores(e); return; }

    if (modoEdicion) {
      setUsuarios(usuarios.map((u) => u.id === formulario.id ? formulario : u));
    } else {
      const nuevoId = Math.max(...usuarios.map((u) => u.id)) + 1;
      setUsuarios([...usuarios, { ...formulario, id: nuevoId }]);
    }
    cerrarModal();
  }

  function eliminarUsuario(id) {
    if (confirm('¿Seguro que quieres eliminar este usuario?')) {
      setUsuarios(usuarios.filter((u) => u.id !== id));
    }
  }

  const coloresEstatus = {
    Activo:     { bg: '#dcfce7', color: '#15803d' },
    Vencido:    { bg: '#fee2e2', color: '#b91c1c' },
    Suspendido: { bg: '#fef9c3', color: '#854d0e' },
  };

  if (verificando) return null;

  return (
    <div className="container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>GymSAAS </h2>
        <nav>
          <a href="/">Dashboard</a>
          <a href="/usuarios" className="active">Usuarios</a>
          <a href="/pagos">Pagos y Planes</a>
          <a href="/configuracion">Configuración</a>
        </nav>
        <div className="sidebar-footer">
          {sesion && <p className="sidebar-user">{sesion.email}</p>}
          <button className="btn-logout" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="main-content">
        <header className="header">
          <div>
            <h1>Gestión de Usuarios</h1>
            <p>Administra los socios del gimnasio</p>
          </div>
          <button className="btn-primary" onClick={abrirModalNuevo}>
            + Nuevo Usuario
          </button>
        </header>

        {/* Barra de búsqueda y filtros */}
        <div className="toolbar">
          <input
            className="buscador"
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <div className="filtros-estatus">
            {['Todos', 'Activo', 'Vencido', 'Suspendido'].map((e) => (
              <button
                key={e}
                className={`filtro-btn ${filtroEstatus === e ? 'filtro-activo' : ''}`}
                onClick={() => setFiltroEstatus(e)}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla de usuarios */}
        <div className="table-section">
          <p className="total-usuarios">{usuariosFiltrados.length} usuario(s) encontrado(s)</p>
          <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Membresía</th>
                <th>Vencimiento</th>
                <th>Estatus</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="sin-resultados">No se encontraron usuarios.</td>
                </tr>
              ) : (
                usuariosFiltrados.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.nombre}</strong></td>
                    <td>{u.email}</td>
                    <td>{u.telefono}</td>
                    <td>{u.membresia}</td>
                    <td>{u.fechaVencimiento}</td>
                    <td>
                      <span
                        className="badge"
                        style={coloresEstatus[u.estatus]}
                      >
                        {u.estatus}
                      </span>
                    </td>
                    <td className="acciones">
                      <button className="btn-table btn-editar" onClick={() => abrirModalEditar(u)}>
                        Editar
                      </button>
                      <button className="btn-table btn-eliminar" onClick={() => eliminarUsuario(u.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </main>

      {/* Modal agregar / editar */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button className="modal-cerrar" onClick={cerrarModal}>✕</button>
            </div>

            <div className="modal-body">
              <div className="campo">
                <label>Nombre completo</label>
                <input name="nombre" value={formulario.nombre} onChange={handleCampo} placeholder="Juan Pérez" />
                {errores.nombre && <span className="error">{errores.nombre}</span>}
              </div>

              <div className="campo">
                <label>Correo electrónico</label>
                <input name="email" type="email" value={formulario.email} onChange={handleCampo} placeholder="juan@email.com" />
                {errores.email && <span className="error">{errores.email}</span>}
              </div>

              <div className="campo">
                <label>Teléfono</label>
                <input name="telefono" value={formulario.telefono} onChange={handleCampo} placeholder="222-111-0000" />
              </div>

              <div className="fila-dos">
                <div className="campo">
                  <label>Membresía</label>
                  <select name="membresia" value={formulario.membresia} onChange={handleCampo}>
                    <option>Mensual</option>
                    <option>Trimestral</option>
                    <option>Anual</option>
                  </select>
                </div>

                <div className="campo">
                  <label>Estatus</label>
                  <select name="estatus" value={formulario.estatus} onChange={handleCampo}>
                    <option>Activo</option>
                    <option>Vencido</option>
                    <option>Suspendido</option>
                  </select>
                </div>
              </div>

              <div className="campo">
                <label>Fecha de vencimiento</label>
                <input name="fechaVencimiento" type="date" value={formulario.fechaVencimiento} onChange={handleCampo} />
                {errores.fechaVencimiento && <span className="error">{errores.fechaVencimiento}</span>}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={cerrarModal}>Cancelar</button>
              <button className="btn-primary" onClick={guardarUsuario}>
                {modoEdicion ? 'Guardar cambios' : 'Crear usuario'}
              </button>
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
        .main-content { flex: 1; padding: 2rem; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
        .header h1 { font-size: 1.8rem; color: #0f172a; }
        .header p { color: #64748b; }

        /* Toolbar */
        .toolbar { display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .buscador { flex: 1; min-width: 220px; padding: 0.65rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.95rem; outline: none; background-color: #ffffff !important; color: #1e293b !important; }
        .buscador:focus { border-color: #2563eb; }
        .buscador::placeholder { color: #94a3b8; }
        .filtros-estatus { display: flex; gap: 0.5rem; }
        .filtro-btn { padding: 0.5rem 1rem; border: 1px solid #e2e8f0; border-radius: 20px; background: #fff; color: #64748b; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
        .filtro-btn:hover { border-color: #2563eb; color: #2563eb; }
        .filtro-activo { background-color: #2563eb; color: #fff !important; border-color: #2563eb !important; }

        /* Tabla */
        .table-section { background: #fff; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .total-usuarios { font-size: 0.85rem; color: #64748b; margin-bottom: 1rem; }
        .table-wrapper { overflow-x: auto; max-height: 60vh; overflow-y: auto; border-radius: 8px; border: 1px solid #e2e8f0; }
        .custom-table { width: 100%; border-collapse: collapse; text-align: left; }
        .custom-table thead { position: sticky; top: 0; z-index: 10; }
        .custom-table th { background-color: #f8fafc; padding: 0.75rem 1rem; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0; white-space: nowrap; }
        .custom-table td { padding: 1rem; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; white-space: nowrap; }
        .sin-resultados { text-align: center; color: #94a3b8; padding: 2rem !important; }
        .badge { padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }
        .acciones { display: flex; gap: 0.5rem; }
        .btn-table { padding: 0.4rem 0.7rem; border: none; border-radius: 6px; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .btn-editar { background-color: #e0f2fe; color: #0369a1; }
        .btn-editar:hover { background-color: #bae6fd; }
        .btn-eliminar { background-color: #fee2e2; color: #b91c1c; }
        .btn-eliminar:hover { background-color: #fecaca; }

        /* Botones globales */
        .btn-primary { padding: 0.7rem 1.4rem; border: none; border-radius: 8px; background-color: #2563eb; color: #fff; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: background 0.2s; }
        .btn-primary:hover { background-color: #1d4ed8; }
        .btn-secondary { padding: 0.7rem 1.4rem; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; color: #334155; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: background 0.2s; }
        .btn-secondary:hover { background-color: #f1f5f9; }

        /* Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem; }
        .modal { background: #fff; border-radius: 12px; width: 100%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid #e2e8f0; }
        .modal-header h2 { font-size: 1.2rem; color: #0f172a; }
        .modal-cerrar { background: none; border: none; font-size: 1.2rem; color: #94a3b8; cursor: pointer; }
        .modal-cerrar:hover { color: #334155; }
        .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .modal-footer { padding: 1.25rem 1.5rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 0.75rem; }
        .campo { display: flex; flex-direction: column; gap: 0.35rem; }
        .campo label { font-size: 0.85rem; font-weight: 600; color: #334155; }
        .campo input, .campo select { padding: 0.65rem 0.9rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.95rem; outline: none; }
        .campo input:focus, .campo select:focus { border-color: #2563eb; }
        .fila-dos { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .error { font-size: 0.8rem; color: #b91c1c; }
      `}</style>
    </div>
  );
}