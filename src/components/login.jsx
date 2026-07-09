import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isValidEmail = (value) => /@(gmail|hotmail)\.com$/i.test(value);

  const handleSubmit = () => {
    if (!isValidEmail(email)) {
      setError("El correo debe ser @gmail.com o @hotmail.com");
      return;
    }
    if (!password.trim()) {
      setError("Ingresa tu contraseña");
      return;
    }

    localStorage.setItem(
      "usuario",
      JSON.stringify({
        nombre: "Tobias",
        rol: "admin",
        email,
      }),
    );

    navigate("/");
  };

  return (
    <main className="page-auth">
      <section className="auth-card">
        <h1 className="auth-title">Iniciar Sesión</h1>
        <div className="auth-form">
          <input
            className="auth-input"
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) setError("");
            }}
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setError("");
            }}
          />
          {error && <p className="form-error">{error}</p>}
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
