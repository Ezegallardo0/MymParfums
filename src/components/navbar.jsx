import { Link } from "react-router-dom";
import "../styles/nav.css";
import { getStoredUser } from "../utils/storage";

const normalizeRole = (role) => {
  const value = role?.toString().trim().toLowerCase();
  switch (value) {
    case "administrador":
    case "adminsitrador":
    case "admin":
      return "Administrador";
    case "socio":
      return "Socio";
    case "ventas":
    case "vendedor":
    case "vendedores":
      return "Ventas";
    default:
      return role?.toString().trim() || "";
  }
};

const allowedRoles = ["Administrador", "Socio", "Ventas"];

const canAccessSettings = (user) => {
  const email = user?.email?.toLowerCase();
  return allowedRoles.includes(normalizeRole(user?.rol)) || email === "plumiferogaming@gmail.com";
};

const canAccessNewProduct = (user) => ["Administrador", "Socio"].includes(normalizeRole(user?.rol));

const Menu = () => {
  const usuario = getStoredUser();

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
                  {canAccessNewProduct(usuario) && (
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
