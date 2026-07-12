import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "../styles/login.css";

const API_URL = "http://localhost:3000/api/empleados";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestReset = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Ingresa el correo del empleado");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "No se pudo enviar la solicitud");
      }

      setMessage(data.message || "Revisa tu correo para continuar");
    } catch (submitError) {
      setError(submitError.message || "No se pudo completar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReset = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("Completa ambos campos");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/reset-password/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "No se pudo actualizar la contraseña");
      }

      setMessage(data.message || "Contraseña actualizada");
      setTimeout(() => navigate("/login"), 1200);
    } catch (submitError) {
      setError(submitError.message || "No se pudo actualizar la contraseña");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page-auth">
      <section className="auth-card">
        <h1 className="auth-title">{token ? "Restablecer contraseña" : "Recuperar contraseña"}</h1>
        {token ? (
          <form className="auth-form" onSubmit={handleConfirmReset}>
            <input
              className="auth-input"
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
                if (error) setError("");
              }}
            />
            <input
              className="auth-input"
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                if (error) setError("");
              }}
            />
            {error && <p className="form-error">{error}</p>}
            {message && <p className="form-success">{message}</p>}
            <button className="primary-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Actualizar contraseña"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRequestReset}>
            <input
              className="auth-input"
              type="email"
              placeholder="Correo del empleado"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError("");
              }}
            />
            {error && <p className="form-error">{error}</p>}
            {message && <p className="form-success">{message}</p>}
            <button className="primary-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar enlace"}
            </button>
          </form>
        )}
        <p className="auth-footer">
          <Link className="auth-link" to="/login">Volver al inicio de sesión</Link>
        </p>
      </section>
    </main>
  );
};

export default ResetPassword;
