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
    <header className="site-header">
      <nav className="nav-bar">
        <div className="brand-bar">
          <div className="brand-copy">
            <h1>Mym Parfums.</h1>
            <p>Fragancias formales con un toque azul</p>
          </div>
        </div>

        <ul className="nav-links nav-center">
          <li><Link to="/"><i className="bx bx-home-alt" />Inicio</Link></li>
          <li><Link to="/"><i className="bx bx-gift" />Perfumes</Link></li>
          <li><a href="#contact"><i className="bx bx-envelope" />Contacto</a></li>
        </ul>

        <ul className="nav-actions nav-right">
          {usuario ? (
            <>
              {['Administrador', 'Socio', 'Vendedor'].includes(usuario.rol) && (
                <li>
                  <Link to="/configuracion" className="action-btn action-primary">
                    <i className="bx bx-user-circle" />Mi cuenta
                  </Link>
                </li>
              )}
              <li>
                <button type="button" className="action-btn action-logout" onClick={handleLogout}>
                  <i className="bx bx-log-out" />Cerrar sesión
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" className="single-action-btn">
                <i className="bx bx-log-in" />Iniciar sesión
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Menu;
