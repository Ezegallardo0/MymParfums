import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";

const Login = () => {
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
        <h1 className="auth-title">Iniciar Sesión</h1>
        <div className="auth-form">
          <input className="auth-input" type="email" placeholder="Correo Electrónico" />
          <input className="auth-input" type="password" placeholder="Contraseña" />
          <button className="primary-btn" type="button" onClick={handleSubmit}>
            Enviar
          </button>
        </div>
        <p className="auth-footer">
          ¿No tienes cuenta? | <Link className="auth-link" to="/crearcuenta">Crea una Ahora</Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
