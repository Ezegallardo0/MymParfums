import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/configuracion.css";

const Add = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const empleadoEditar = location.state?.empleado || null;
  const [nombre, setNombre] = useState(empleadoEditar?.nombre || "");
  const [apellido, setApellido] = useState(empleadoEditar?.apellido || "");
  const [email, setEmail] = useState(empleadoEditar?.email || "");
  const [tel, setTel] = useState(empleadoEditar?.tel || "");
  const [rol, setRol] = useState(empleadoEditar?.rol || "");

  const guardarEmp = (e) => {
    e.preventDefault();
    const nuevoEmp = {
      id: empleadoEditar?.id || Date.now(),
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim(),
      tel: tel.trim(),
      rol,
    };

    const empleados = JSON.parse(localStorage.getItem("empleados")) || [];

    if (empleadoEditar) {
      const index = empleados.findIndex((empleado) => empleado.id === empleadoEditar.id);
      if (index >= 0) {
        empleados[index] = nuevoEmp;
      } else {
        empleados.push(nuevoEmp);
      }
    } else {
      empleados.push(nuevoEmp);
    }

    localStorage.setItem("empleados", JSON.stringify(empleados));
    navigate("/configuracion");
  };

  return (
    <main className="config-page">
      <section className="settings-wrapper add-wrapper">
        <div className="settings-card add-card">
          <div className="settings-card-header">
            <h2>{empleadoEditar ? "Editar empleado" : "Agregar empleado"}</h2>
            <span>
              {empleadoEditar
                ? "Actualiza la información del colaborador."
                : "Completa los datos para registrar a un nuevo empleado."}
            </span>
          </div>

          <form className="employee-form" onSubmit={guardarEmp}>
            <div className="settings-grid">
              <div className="settings-field">
                <label>Nombre</label>
                <input
                  className="config-input"
                  type="text"
                  placeholder="Nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <div className="settings-field">
                <label>Apellido</label>
                <input
                  className="config-input"
                  type="text"
                  placeholder="Apellido"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                />
              </div>
              <div className="settings-field">
                <label>Email</label>
                <input
                  className="config-input"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="settings-field">
                <label>Teléfono</label>
                <input
                  className="config-input"
                  type="tel"
                  placeholder="Teléfono"
                  value={tel}
                  onChange={(e) => setTel(e.target.value)}
                />
              </div>
            </div>
            <div className="settings-field employee-select-field">
              <label>Rol</label>
              <select className="config-input" value={rol} onChange={(e) => setRol(e.target.value)}>
                <option value="">Seleccione un rol</option>
                <option value="Administrador">Administrador</option>
                <option value="Socio">Socio</option>
                <option value="Ventas">Ventas</option>
              </select>
            </div>
            <div className="button-group">
              <button type="button" className="secondary-button" onClick={() => navigate("/configuracion")}>
                Cancelar
              </button>
              <button type="submit" className="primary-button">
                {empleadoEditar ? "Guardar cambios" : "Guardar empleado"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Add