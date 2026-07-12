import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/register.css";

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

const CrearCuenta = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isValidEmail = (value) => /@(gmail|hotmail)\.com$/i.test(value);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!nombre.trim() || !apellido.trim()) {
      setError("Ingresa tu nombre y apellido.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("El correo debe ser @gmail.com o @hotmail.com");
      return;
    }
    if (!password.trim()) {
      setError("Ingresa tu contraseña");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/empleados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          email: email.trim().toLowerCase(),
          tel: phone,
          rol: "Ventas",
          password: password.trim(),
        }),
      });

      const data = await parseResponse(response);
      if (!response.ok) {
        throw new Error(data.error || "No se pudo crear la cuenta");
      }

      localStorage.setItem("usuario", JSON.stringify(data.empleado));
      navigate("/");
    } catch (saveError) {
      setError(saveError.message || "No se pudo crear la cuenta");
    }
  };

  return (
    <main className="page-auth">
      <section className="auth-card">
        <h1 className="auth-title">Crear Cuenta</h1>
        <div className="auth-form">
          <input
            className="auth-input"
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(event) => {
              setNombre(event.target.value);
              if (error) setError("");
            }}
          />
          <input
            className="auth-input"
            type="text"
            placeholder="Apellido"
            value={apellido}
            onChange={(event) => {
              setApellido(event.target.value);
              if (error) setError("");
            }}
          />
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
            type="number"
            placeholder="Número Telefónico"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
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
          <button className="primary-btn" type="submit" onClick={handleSubmit}>
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
