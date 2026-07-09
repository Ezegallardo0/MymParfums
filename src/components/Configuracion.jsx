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
          <span className="profile-icon">✨</span>
          <div>
            <h1 className="profile-title">Configuración de cuenta</h1>
            <p className="profile-subtitle">Administra tu perfil y preferencias</p>
          </div>
        </div>
        <div className="profile-info">
          <p><span>Nombre:</span> {usuario.nombre}</p>
          <p><span>Rol:</span> {usuario.rol}</p>
          <p><span>Email:</span> admin@mymparfums.com</p>
          <p><span>Teléfono:</span> +56 9 1234 5678</p>
        </div>
        <div className="profile-note">
          Bienvenido a tu panel de usuario. Aquí puedes revisar tu información personal y mantener tu cuenta segura.
        </div>
      </section>
    </main>
  );
};

export default Configuracion;