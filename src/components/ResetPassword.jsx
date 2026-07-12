import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const token = params.get("token") || "";
  const email = params.get("email") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !email) {
      setError("El enlace de recuperación no es válido");
    }
  }, [token, email]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("Completa ambas contraseñas");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/empleados/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword }),
      });

      const data = await parseResponse(response);
      if (!response.ok) {
        throw new Error(data.error || "No se pudo actualizar la contraseña");
      }

      setMessage(data.message || "Contraseña actualizada correctamente");
      setTimeout(() => navigate("/login"), 1200);
    } catch (resetError) {
      setError(resetError.message || "No se pudo actualizar la contraseña");
    }
  };

  return (
    <main className="page-auth">
      <section className="auth-card">
        <h1 className="auth-title">Restablecer contraseña</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          {error && <p className="form-error">{error}</p>}
          {message && <p className="form-success">{message}</p>}
          <button className="primary-btn" type="submit">
            Guardar nueva contraseña
          </button>
        </form>
      </section>
    </main>
  );
};

export default ResetPassword;
