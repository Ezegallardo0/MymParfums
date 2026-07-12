import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import "../styles/configuracion.css";

const parseResponse = async (response) => {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
};

const sections = [
  { id: "perfil", label: "Perfil", icon: "bx-user" },
  { id: "seguridad", label: "Seguridad", icon: "bx-lock-alt" },
  { id: "preferencias", label: "Preferencias", icon: "bx-slider" },
  { id: "acerca", label: "Acerca", icon: "bx-info-circle" },
  { id: "empleados", label: "Empleados", icon: "bx bx-user-plus" },
];

const allowedRoles = ["Administrador", "Socio", "Vendedor"];

const canAccessSettings = (user) => {
  const email = user?.email?.toLowerCase();
  return allowedRoles.includes(user?.rol) || email === "plumiferogaming@gmail.com";
};

const Configuracion = () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("perfil");
  const [nombre, setNombre] = useState(usuario?.nombre || "");
  const [email, setEmail] = useState(usuario?.email || "");
  const [phone, setPhone] = useState(usuario?.phone || "");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [empleados, setEmpleados] = useState([]);
  const [empleadosError, setEmpleadosError] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const API_URL = "http://localhost:3000/api/empleados";

  const fetchEmpleados = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("No se pudo cargar la lista de empleados");
      }
      const data = await response.json();
      setEmpleados(data);
      setEmpleadosError("");
    } catch (fetchError) {
      setEmpleadosError(fetchError.message || "Error al cargar empleados");
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccessSettings(usuario)) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

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

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("Completa todos los campos de contraseña");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Las nuevas contraseñas no coinciden");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: usuario.email,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await parseResponse(response);
      if (!response.ok) {
        throw new Error(data.error || "No se pudo cambiar la contraseña");
      }

      setPasswordMessage(data.message || "Contraseña cambiada correctamente");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
    } catch (passwordErrorState) {
      setPasswordError(passwordErrorState.message || "No se pudo cambiar la contraseña");
    }
  };

  const handleDeleteEmpleado = async (id) => {
    const confirmDelete = window.confirm("¿Eliminar este empleado?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("No se pudo eliminar el empleado");
      }
      const actualizados = empleados.filter((empleado) => empleado.id !== id);
      setEmpleados(actualizados);
    } catch (deleteError) {
      setError(deleteError.message || "Error al eliminar empleado");
    }
  };

  const handleEditEmpleado = (empleado) => {
    navigate("/configuracion/agregar", { state: { empleado } });
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
                <button type="button" className="secondary-button" onClick={() => setShowPasswordForm((value) => !value)}>
                  {showPasswordForm ? "Ocultar" : "Cambiar"}
                </button>
              </div>
              {showPasswordForm && (
                <form className="security-form" onSubmit={handlePasswordSubmit}>
                  <div className="settings-grid">
                    <div className="settings-field">
                      <label>Contraseña actual</label>
                      <input
                        className="config-input"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
                      />
                    </div>
                    <div className="settings-field">
                      <label>Nueva contraseña</label>
                      <input
                        className="config-input"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
                      />
                    </div>
                    <div className="settings-field">
                      <label>Confirmar nueva contraseña</label>
                      <input
                        className="config-input"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
                      />
                    </div>
                  </div>
                  {passwordError && <p className="config-message config-error">{passwordError}</p>}
                  {passwordMessage && <p className="config-message config-success">{passwordMessage}</p>}
                  <div className="button-group">
                    <button type="submit" className="primary-button">
                      Guardar nueva contraseña
                    </button>
                  </div>
                </form>
              )}
              <div className="settings-item">
                <div>
                  <strong>Autenticación en dos pasos</strong>
                  <p>Protege tu cuenta con un segundo factor.</p>
                </div>
                <button type="button" className="secondary-button">
                  Configurar
                </button>
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
                <span>ezequieljoelgallardo@gmail.com</span>
              </div>
            </div>
          </div>
        );
      case "empleados":
        return (
          <div className="settings-card">
            <div className="settings-card-header">
              <h2>Empleados</h2>
              <span>Administra el personal de la tienda con mayor claridad.</span>
            </div>
            <div className="employee-section">
              <div className="employee-list">
                {empleados.length === 0 ? (
                  <div className="employee-empty">No hay empleados registrados todavía.</div>
                ) : (
                  empleados.map((empleado) => (
                    <div className="employee-item" key={empleado.id}>
                      <div className="employee-info">
                        <h3>
                          {empleado.nombre} {empleado.apellido}
                        </h3>
                        <p>{empleado.email}</p>
                        <p>{empleado.tel}</p>
                        <span className="employee-role">{empleado.rol}</span>
                      </div>
                      <div className="employee-actions">
                        <button
                          type="button"
                          className="secondary-button employee-action-btn"
                          onClick={() => handleEditEmpleado(empleado)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="danger-button employee-action-btn"
                          onClick={() => handleDeleteEmpleado(empleado.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="employee-side-card">
                <strong>Agregar Empleado</strong>
                <p>Registra un nuevo colaborador y asigna su rol.</p>
                <Link to="/configuracion/agregar" className="primary-button">
                  Agregar
                </Link>
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
              <p className="settings-description">
                Ajusta tu cuenta y personaliza tu experiencia.
              </p>
            </div>
            <div className="button-group">
              <Link to="/" className="secondary-button">
                Inicio
              </Link>
              <button type="button" className="secondary-button cerrar" onClick={handleLogout}>
                Cerrar sesión
              </button>
              <button type="button" className="primary-button" onClick={handleSave}>
                Guardar
              </button>
            </div>
          </div>

          {error && <p className="config-message config-error">{error}</p>}
          {success && <p className="config-message config-success">{success}</p>}
          {empleadosError && <p className="config-message config-error">{empleadosError}</p>}

          {renderSection()}
        </div>
      </section>
    </main>
  );
};

export default Configuracion;
