import { createContext, useMemo, useState } from "react";

const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);

  const agregarCarrito = (producto) => {
    setCarrito((prevCarrito) => {
      const existe = prevCarrito.some((item) => item.id === producto.id);

      if (existe) {
        return prevCarrito.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item,
        );
      }

      return [...prevCarrito, { ...producto, cantidad: 1 }];
    });
  };

  const total = useMemo(
    () => carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0),
    [carrito],
  );

  const value = useMemo(
    () => ({
      carrito,
      agregarCarrito,
      total,
    }),
    [carrito, total],
  );

  return <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>;
};

export default CarritoContext;
