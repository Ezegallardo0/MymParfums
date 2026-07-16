import { useContext, useState } from "react";
import Menu from "../components/navbar";
import Card from "../components/productCard";
import CarritoHome from "../components/carritoHome";
import CarritoContext from "../components/CarritoContext";
import "../styles/home.css";

const Home = () => {
  const { carrito } = useContext(CarritoContext);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  return (
    <>
      <Menu />
      <div className="home-cart-toggle">
        <button type="button" className="home-cart-button" onClick={() => setMostrarCarrito((prev) => !prev)}>
          <i className="bx bxs-cart-alt" />
          Ver carrito
          {carrito.length > 0 && <span className="home-cart-badge">{carrito.length}</span>}
        </button>
      </div>

      <div className={`home-cart-overlay ${mostrarCarrito ? "open" : ""}`} onClick={() => setMostrarCarrito(false)}>
        <aside id="carrito-seccion" className={`home-cart-section ${mostrarCarrito ? "open" : ""}`} onClick={(event) => event.stopPropagation()}>
          <div className="home-cart-header">
            <div>
              <p className="home-cart-eyebrow">Tu selección</p>
              <h2>Carrito de compras</h2>
            </div>
            <button type="button" className="home-cart-close" onClick={() => setMostrarCarrito(false)}>
              <i className="bx bx-x" />
            </button>
          </div>
          <CarritoHome />
        </aside>
      </div>
      <Card />
    </>
  );
};

export default Home;
