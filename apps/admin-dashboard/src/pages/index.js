import React, { useState, useEffect } from 'react';

export default function DashboardAdmin() {
  // Estados simulados (más adelante se conectarán a la API de Node.js con fetch)
  const [afluencia, setAfluencia] = useState(45); // Número de personas dentro
  const [capacidadMaxima] = useState(80);
  const [recientes, setRecientes] = useState([
    { id: 1, nombre: "Juan Pérez", hora: "21:30", estatus: "Pagado" },
    { id: 2, nombre: "María López", hora: "21:15", estatus: "Vencido" },
    { id: 3, nombre: "Carlos Gómez", hora: "20:45", estatus: "Pagado" },
  ]);

  // Lógica simple para el color del semáforo de afluencia
  const porcentaje = (afluencia / capacidadMaxima) * 100;
  let colorSemaforo = "#22c55e"; // Verde
  let textoSemaforo = "Despejado";

  if (porcentaje > 75) {
    colorSemaforo = "#ef4444"; // Rojo
    textoSemaforo = "Lleno (Hora Pico)";
  } else if (porcentaje > 40) {
    colorSemaforo = "#eab308"; // Amarillo
    textoSemaforo = "Moderado";
  }

  return (
    <div className="container">
      {/* Barra Lateral / Sidebar */}
      <aside className="sidebar">
        <h2>GymSAAS 🏋️‍♂️</h2>
        <nav>
          <a href="#" className="active">Dashboard</a>
          <a href="#">Usuarios</a>
          <a href="#">Pagos y Planes</a>
          <a href="#">Configuración</a>
        </nav>
      </aside>

      {/* Contenido Principal */}
      <main className="main-content">
        <header className="header">
          <h1>Panel de Recepción y Control</h1>
          <p>Monitoreo del gimnasio en tiempo real</p>
        </header>

        {/* Tarjetas de Métricas (Widgets) */}
        <section className="widgets-grid">
          
          {/* Tarjeta 1: Semáforo de Afluencia */}
          <div className="card">
            <h3>Afluencia en Sala</h3>
            <div className="counter">{afluencia} / {capacidadMaxima}</div>
            <p>Personas activas actualmente</p>
            <div className="status-badge" style={{ backgroundColor: colorSemaforo }}>
              {textoSemaforo}
            </div>
          </div>

          {/* Tarjeta 2: Alerta de Acceso Rápidos */}
          <div className="card">
            <h3>Acciones Rápidas</h3>
            <button className="btn-primary" onClick={() => alert("Abriendo escáner QR...")}>
               Simular Escáner QR Entrada
            </button>
            <button className="btn-secondary" onClick={() => setAfluencia(afluencia + 1)}>
              + Registrar Entrada Manual
            </button>
          </div>
        </section>

        {/* Tabla de Check-ins (Libreta Digital) */}
        <section className="table-section">
          <h2>Últimos Accesos Registrados</h2>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Nombre del Usuario</th>
                <th>Hora de Entrada</th>
                <th>Estatus de Membresía</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {recientes.map((usuario) => (
                <tr key={usuario.id}>
                  <td><strong>{usuario.nombre}</strong></td>
                  <td>{usuario.hora} hrs</td>
                  <td>
                    <span className={`badge ${usuario.estatus === 'Pagado' ? 'badge-success' : 'badge-danger'}`}>
                      {usuario.estatus}
                    </span>
                  </td>
                  <td>
                    <button className="btn-table">Ver Perfil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {/* Estilos CSS puros integrados para mantener el proyecto limpio */}
      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
          background-color: #f4f6f9;
          color: #333;
        }

        .container {
          display: flex;
          min-height: 100vh;
        }

        /* Sidebar Styles */
        .sidebar {
          width: 260px;
          background-color: #1e293b;
          color: #fff;
          padding: 2rem 1.5rem;
        }

        .sidebar h2 {
          margin-bottom: 2rem;
          font-size: 1.5rem;
          text-align: center;
        }

        .sidebar nav a {
          display: block;
          color: #94a3b8;
          text-decoration: none;
          padding: 0.75rem 1rem;
          margin-bottom: 0.5rem;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .sidebar nav a:hover, .sidebar nav a.active {
          background-color: #334155;
          color: #fff;
        }

        /* Main Content Styles */
        .main-content {
          flex: 1;
          padding: 2rem;
        }

        .header {
          margin-bottom: 2rem;
        }

        .header h1 {
          font-size: 1.8rem;
          color: #0f172a;
        }

        .header p {
          color: #64748b;
        }

        /* Grid Layout */
        .widgets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .card {
          background: #fff;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .card h3 {
          color: #475569;
          font-size: 1.1rem;
        }

        .counter {
          font-size: 2.2rem;
          font-weight: bold;
          color: #0f172a;
          margin: 0.5rem 0;
        }

        .status-badge {
          align-self: flex-start;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-top: 0.5rem;
        }

        /* Buttons */
        .btn-primary, .btn-secondary, .btn-table {
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-primary {
          background-color: #2563eb;
          color: white;
        }

        .btn-primary:hover { background-color: #1d4ed8; }

        .btn-secondary {
          background-color: #e2e8f0;
          color: #334155;
        }

        .btn-secondary:hover { background-color: #cbd5e1; }

        /* Tables */
        .table-section {
          background: #fff;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }

        .table-section h2 {
          margin-bottom: 1rem;
          font-size: 1.3rem;
          color: #0f172a;
        }

        .custom-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .custom-table th {
          background-color: #f8fafc;
          padding: 0.75rem 1rem;
          color: #64748b;
          font-weight: 600;
          border-bottom: 2px solid #e2e8f0;
        }

        .custom-table td {
          padding: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        /* Badges */
        .badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .badge-success { background-color: #dcfce7; color: #15803d; }
        .badge-danger { background-color: #fee2e2; color: #b91c1c; }
        
        .btn-table {
          padding: 0.4rem 0.7rem;
          font-size: 0.85rem;
          background-color: #f1f5f9;
          color: #475569;
        }
        .btn-table:hover { background-color: #e2e8f0; }
      `}</style>
    </div>
  );
}