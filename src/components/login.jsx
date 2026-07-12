import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";

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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Ingresa tu correo");
      return;
    }
    if (!password.trim()) {
      setError("Ingresa tu contraseña");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/empleados/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const data = await parseResponse(response);
      if (!response.ok) {
        throw new Error(data.error || "No se pudo iniciar sesión");
      }

      localStorage.setItem("usuario", JSON.stringify(data.empleado));
      navigate("/");
    } catch (loginError) {
      setError(loginError.message || "No se pudo iniciar sesión");
    }
  };

  const handleRequestReset = async () => {
    setResetError("");
    setResetMessage("");

    const normalizedEmail = resetEmail.trim().toLowerCase();
    if (!normalizedEmail) {
      setResetError("Ingresa un correo para recuperar tu acceso");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/empleados/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await parseResponse(response);
      if (!response.ok) {
        throw new Error(data.error || "No se pudo enviar el enlace");
      }

      setResetMessage(data.message || "Revisa tu correo para continuar");
    } catch (resetError) {
      setResetError(resetError.message || "No se pudo enviar el enlace");
    }
  };

  return (
    <main className="page-auth">
      <section className="auth-card">
        <h1 className="auth-title">Iniciar Sesión</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
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
          <button className="primary-btn" type="submit">
            Enviar
          </button>
        </form>

        <div className="auth-recovery">
          <button type="button" className="auth-link-button" onClick={() => setIsResetting((value) => !value)}>
            {isResetting ? "Ocultar recuperación" : "¿Olvidaste tu contraseña?"}
          </button>

          {isResetting && (
            <div className="recovery-box">
              <input
                className="auth-input"
                type="email"
                placeholder="Tu correo para recuperar acceso"
                value={resetEmail}
                onChange={(event) => {
                  setResetEmail(event.target.value);
                  if (resetError) setResetError("");
                  if (resetMessage) setResetMessage("");
                }}
              />
              <button type="button" className="secondary-btn" onClick={handleRequestReset}>
                Enviar enlace
              </button>
              {resetError && <p className="form-error">{resetError}</p>}
              {resetMessage && <p className="form-success">{resetMessage}</p>}
            </div>
          )}
        </div>

        <p className="auth-footer">
          ¿No tienes cuenta? | <Link className="auth-link" to="/crearcuenta">Crea una Ahora</Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
