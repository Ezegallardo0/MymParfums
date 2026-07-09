import { useNavigate, Link } from "react-router-dom";
import "../styles/nav.css";

const Menu = () => {
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const handleConfig = () => {
    if (usuario) {
      navigate("/configuracion");
    } else {
      navigate("/login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  return (
    <nav className="nav-bar">
      <div className="brand-bar">
        <span className="brand-icon">🌿</span>
        <div>
          <h1>Mym Parfums</h1>
          <p>Fragancias claras y serenas</p>
        </div>
      </div>
      <ul className="nav-links">
        <li><Link to="/"><span className="link-icon">🏠</span>Inicio</Link></li>
        <li><a href="#contact"><span className="link-icon">📞</span>Contacto</a></li>
        <li><a href="#perfumes"><span className="link-icon">🌸</span>Perfumes</a></li>
      </ul>
      <div className="nav-actions">
        <button type="button" className="action-btn">❤️ Favoritos</button>
        <button type="button" className="action-btn action-config" onClick={handleConfig}>
          <span className="link-icon">👤</span>Mi cuenta
        </button>
        <button type="button" className="action-btn">🛒 Carrito</button>
        {usuario && (
          <button type="button" className="action-btn action-logout" onClick={handleLogout}>
            <span className="link-icon">🚪</span>Cerrar sesión
          </button>
        )}
      </div>
    </nav>
  );
};

export default Menu;
