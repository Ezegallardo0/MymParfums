import { useNavigate, Link } from "react-router-dom";
import "../styles/nav.css";

const Menu = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  return (
    <nav className="nav-bar">
      <div className="brand-bar">
        <span className="brand-icon">💧</span>
        <div>
          <h1>Mym Parfums</h1>
          <p>Fragancias formales con un toque azul</p>
        </div>
      </div>
      <ul className="nav-links">
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/">Perfumes</Link></li>
        <li><a href="#contact">Contacto</a></li>
      </ul>
      <div className="nav-actions">
        {usuario ? (
          <>
            <Link to="/configuracion" className="action-btn action-primary">
              <span className="link-icon">👤</span>Mi cuenta
            </Link>
            <button type="button" className="action-btn action-logout" onClick={handleLogout}>
              <span className="link-icon">🚪</span>Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="action-btn action-primary">
              <span className="link-icon">🔐</span>Iniciar sesión
            </Link>
            <Link to="/crearcuenta" className="action-btn action-secondary">
              <span className="link-icon">✒️</span>Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Menu;
