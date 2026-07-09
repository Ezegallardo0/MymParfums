import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import "../styles/configuracion.css";

const sections = [
  { id: "perfil", label: "Perfil", icon: "bx-user" },
  { id: "seguridad", label: "Seguridad", icon: "bx-lock-alt" },
  { id: "preferencias", label: "Preferencias", icon: "bx-slider" },
  { id: "acerca", label: "Acerca", icon: "bx-info-circle" },
];

const allowedRoles = [
  "Administrador",
  "Socio",
  "Vendedor",
];

const Configuracion = () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const [activeSection, setActiveSection] = useState("perfil");
  const [nombre, setNombre] = useState(usuario?.nombre || "");
  const [email, setEmail] = useState(usuario?.email || "");
  const [phone, setPhone] = useState(usuario?.phone || "");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  const handleSave = (event) => {
    event.preventDefault();
    if (!nombre.trim() || !email.trim()) {
      setError("Nombre y correo son obligatorios.");
      setSuccess("");
      return;
    }

    localStorage.setItem(
      "usuario",
      JSON.stringify({
        ...usuario,
        nombre: nombre.trim(),
        email: email.trim(),
        phone: phone.trim(),
      }),
    );

    setSuccess("Cambios guardados correctamente.");
    setError("");
  };

  const renderSection = () => {
    switch (activeSection) {
      case "perfil":
        return (
          <div className="settings-card">
            <div className="settings-card-header">
              <h2>Información de perfil</h2>
              <span>Actualiza tus datos básicos.</span>
            </div>
            <div className="settings-grid">
              <div className="settings-field">
                <label>Nombre</label>
                <input
                  className="config-input"
                  type="text"
                  value={nombre}
                  onChange={(event) => setNombre(event.target.value)}
                />
              </div>
              <div className="settings-field">
                <label>Email</label>
                <input
                  className="config-input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="settings-field">
                <label>Teléfono</label>
                <input
                  className="config-input"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
              <div className="settings-field">
                <label>Rol</label>
                <div className="info-chip">{usuario.rol}</div>
              </div>
            </div>
          </div>
        );
      case "seguridad":
        return (
          <div className="settings-card">
            <div className="settings-card-header">
              <h2>Seguridad</h2>
              <span>Configura accesos y protecciones.</span>
            </div>
            <div className="settings-list">
              <div className="settings-item">
                <div>
                  <strong>Cambiar contraseña</strong>
                  <p>Actualiza tu contraseña cuando lo necesites.</p>
                </div>
                <button type="button" className="secondary-button">Cambiar</button>
              </div>
              <div className="settings-item">
                <div>
                  <strong>Autenticación en dos pasos</strong>
                  <p>Protege tu cuenta con un segundo factor.</p>
                </div>
                <button type="button" className="secondary-button">Configurar</button>
              </div>
            </div>
          </div>
        );
      case "preferencias":
        return (
          <div className="settings-card">
            <div className="settings-card-header">
              <h2>Preferencias</h2>
              <span>Personaliza tu experiencia.</span>
            </div>
            <div className="settings-list">
              <div className="settings-item">
                <div>
                  <strong>Notificaciones</strong>
                  <p>Activa o desactiva alertas de novedades.</p>
                </div>
                <div className="toggle-chip">Activas</div>
              </div>
              <div className="settings-item">
                <div>
                  <strong>Dark mode</strong>
                  <p>Habilita un tema oscuro para la interfaz.</p>
                </div>
                <div className="toggle-chip">Automático</div>
              </div>
            </div>
          </div>
        );
      case "acerca":
        return (
          <div className="settings-card">
            <div className="settings-card-header">
              <h2>Acerca de tu cuenta</h2>
              <span>Información del sistema y actualizaciones.</span>
            </div>
            <div className="about-grid">
              <div className="about-item">
                <strong>Versión</strong>
                <span>1.0.0</span>
              </div>
              <div className="about-item">
                <strong>Correo asociado</strong>
                <span>{email || "No configurado"}</span>
              </div>
              <div className="about-item">
                <strong>Soporte</strong>
                <span>soporte@mymparfums.com</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="config-page">
      <section className="settings-wrapper">
        <aside className="settings-nav">
          <div className="nav-brand">
            <span className="nav-badge">Ajustes</span>
            <p>Panel clásico de configuración</p>
          </div>
          <div className="nav-list">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`nav-link ${activeSection === section.id ? "active" : ""}`}
                onClick={() => setActiveSection(section.id)}
              >
                <i className={`bx ${section.icon}`} />
                {section.label}
              </button>
            ))}
          </div>
        </aside>

        <div className="settings-panel">
          <div className="settings-header">
            <div>
              <h1 className="settings-title">Configuración</h1>
              <p className="settings-description">Ajusta tu cuenta y personaliza tu experiencia.</p>
            </div>
            <div className="button-group">
              <Link to="/" className="secondary-button">Inicio</Link>
              <button type="button" className="primary-button" onClick={handleSave}>Guardar</button>
            </div>
          </div>

          {error && <p className="config-message config-error">{error}</p>}
          {success && <p className="config-message config-success">{success}</p>}

          {renderSection()}
        </div>
      </section>
    </main>
  );
};

export default Configuracion;
