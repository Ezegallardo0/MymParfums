import { Link } from "react-router-dom";
import "../styles/nav.css";

const allowedRoles = ["Administrador", "Socio", "Vendedor"];

const canAccessSettings = (user) => {
  const email = user?.email?.toLowerCase();
  return allowedRoles.includes(user?.rol) || email === "plumiferogaming@gmail.com";
};

const Menu = () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  return (
    <header className="site-header">
      <nav className="nav-bar">
        <div className="brand-bar">
          <div className="brand-copy">
            <h1>Mym Parfums.</h1>
            <p>Fragancias formales con un toque azul</p>
          </div>
        </div>

        <div className="nav-controls">
          <ul className="nav-links nav-center">
            <li><Link to="/"><i className="bx bx-home-alt" />Inicio</Link></li>
            <li><Link to="/"><i className="bx bx-gift" />Perfumes</Link></li>
            <li><a href="#contact"><i className="bx bx-envelope" />Contacto</a></li>
          </ul>

          <div className="nav-actions-row">
            <ul className="nav-actions nav-right">
              {usuario ? (
                <>
                  {(usuario?.rol === "Administrador" || usuario?.rol === "Socio") && (
                    <li>
                      <Link to="/Nuevo-Producto"><button type="button" className="action-btn action-secondary add-product-btn">
                        <i className="bx bx-plus" />Nuevo Producto
                      </button></Link>
                    </li>
                  )}
                  {canAccessSettings(usuario) && (
                    <li>
                      <Link to="/configuracion" className="action-btn action-primary">
                        <i className="bx bx-user-circle" />Mi cuenta
                      </Link>
                    </li>
                  )}
                </>
              ) : (
                <li>
                  <Link to="/login" className="single-action-btn">
                    <i className="bx bx-log-in" />Iniciar sesión
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Menu;
