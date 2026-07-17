import { useContext } from "react";
import CarritoContext from "./CarritoContext";
import { emitNotification } from "../utils/notifications";

const CarritoHome = () => {
  const { carrito, total } = useContext(CarritoContext);

  if (carrito.length === 0) {
    return (
      <div className="home-cart-empty">
        <i className="bx bx-cart-alt" />
        <h3>Aún no tienes productos</h3>
        <p>Agrega fragancias y aparecerán aquí con un diseño limpio y elegante.</p>
      </div>
    );
  }

  return (
    <div className="home-cart-body">
      <div className="home-cart-list">
        {carrito.map((item) => (
          <article className="home-cart-item" key={item.id}>
            <div className="home-cart-item-info">
              <h3>{item.nombre}</h3>
              <p>{item.cantidad} unidad(es)</p>
            </div>
            <div className="home-cart-item-price">
              <strong>${item.precio * item.cantidad}</strong>
              <span>${item.precio} c/u</span>
            </div>
          </article>
        ))}
      </div>

      <div className="home-cart-summary">
        <div>
          <p>Total estimado</p>
          <h3>${total}</h3>
        </div>
        <button
          type="button"
          className="home-cart-checkout"
          onClick={() => {
            const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
            emitNotification(
              `Compra finalizada por ${totalItems} artículo(s). Se registró una venta importante.`,
              { title: "Venta registrada", type: "success" },
            );
          }}
        >
          Finalizar compra
        </button>
      </div>
    </div>
  );
};

export default CarritoHome;
