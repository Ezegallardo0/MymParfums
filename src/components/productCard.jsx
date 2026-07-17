import { useContext, useEffect, useState } from "react";
import "../styles/card.css";
import CarritoContext from "./CarritoContext";

const Card = () => {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const { agregarCarrito } = useContext(CarritoContext);

  useEffect(() => {
    fetch("http://localhost:3000/api/productos")
      .then((res) => {
        if (!res.ok) {
          throw new Error("No se pudieron cargar los productos");
        }
        return res.json();
      })
      .then((data) => {
        setProductos(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch(() => {
        setError("No se pudieron cargar los productos en este momento.");
        setProductos([]);
      })
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="products-container">
      {cargando && <p className="product-card__message">Cargando productos...</p>}
      {!cargando && error && <p className="product-card__message">{error}</p>}
      {!cargando && !error && productos.length === 0 && (
        <p className="product-card__message">No hay productos disponibles.</p>
      )}
      {!cargando && !error &&
        productos.map((producto) => (
          <div className="card" key={producto.id}>
            <div className="wrapper">
              <span className="tag">Nuevo</span>
              <div className="card-image">
                <img className="product-card__image" src={producto.imagen || producto.img || "https://placehold.co/600x600/002030/E8EBFF?text=Sin+imagen"} alt={producto.nombre} />
              </div>
              <div className="content">
                <div>
                  <h3 className="title">{producto.nombre}</h3>
                  <p className="price">${producto.precio}</p>
                </div>
              </div>
              <button onClick={() => agregarCarrito(producto)} className="card-btn">
                Agregar
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Card;