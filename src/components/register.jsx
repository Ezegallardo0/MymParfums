import { Link, useNavigate } from "react-router-dom";
import "../styles/register.css";

const CrearCuenta = () => {
  const navigate = useNavigate();

  const handleSubmit = () => {
    localStorage.setItem(
      "usuario",
      JSON.stringify({
        nombre: "Admin",
        rol: "admin",
      }),
    );

    navigate("/");
  };

  return (
    <main className="page-auth">
      <section className="auth-card">
        <h1 className="auth-title">Crear Cuenta</h1>
        <div className="auth-form">
          <input className="auth-input" type="email" placeholder="Correo Electrónico" />
          <input className="auth-input" type="tel" placeholder="Número Telefónico" />
          <input className="auth-input" type="password" placeholder="Contraseña" />
          <button className="primary-btn" type="button" onClick={handleSubmit}>
            Enviar
          </button>
        </div>
        <p className="auth-footer">
          ¿Ya tienes cuenta? | <Link className="auth-link" to="/login">Iniciar Sesión</Link>
        </p>
      </section>
    </main>
  );
};

export default CrearCuenta;
