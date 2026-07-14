import { useEffect, useState } from "react";
import "../styles/card.css";

const Card = () => {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

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
      {!cargando && !error && productos.map((producto) => (
        <div className="product-card" key={producto.id}>
          <img className="product-card__image" src={producto.img} alt={producto.nombre} />
          <div className="product-card__content">
            <h3 className="product-card__title">{producto.nombre}</h3>
            <p className="product-card__price">${producto.precio}</p>
            <button className="product-card__button">Agregar al Carrito</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Card