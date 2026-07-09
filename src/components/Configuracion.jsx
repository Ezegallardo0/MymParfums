import { Navigate } from "react-router-dom";
import "../styles/configuracion.css";

const Configuracion = () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="config-page">
      <section className="profile-card">
        <div className="profile-header">
          <i className="bx bx-cog profile-icon" />
          <div>
            <h1 className="profile-title">Configuración de cuenta</h1>
            <p className="profile-subtitle">Administra tu perfil y preferencias</p>
          </div>
        </div>
        <div className="profile-info">
          <div className="profile-row"><span>Nombre</span><strong>{usuario.nombre}</strong></div>
          <div className="profile-row"><span>Rol</span><strong>{usuario.rol}</strong></div>
          <div className="profile-row"><span>Email</span><strong>{usuario.email || "admin@mymparfums.com"}</strong></div>
          <div className="profile-row"><span>Teléfono</span><strong>{usuario.phone || "+56 9 1234 5678"}</strong></div>
        </div>
        <div className="profile-actions">
          <button type="button" className="profile-button">Editar perfil</button>
          <button type="button" className="profile-button profile-button-secondary">Seguridad</button>
        </div>
        <div className="profile-note">
          Bienvenido a tu panel de usuario. Aquí puedes revisar tu información personal y mantener tu cuenta segura.
        </div>
      </section>
    </main>
  );
};

export default Configuracion;