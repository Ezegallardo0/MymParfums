import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/newproduct.css";

const Nuevopr = () => {
  const [producto, setProducto] = useState("");
  const [precio, setPrecio] = useState("");
  const [desc, setDesc] = useState("");
  const [imagen, setImagen] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const guardarPr = async (e) => {
    e.preventDefault();

    if (!producto.trim() || !precio.trim()) {
      setError("Producto y precio son campos obligatorios.");
      setSuccess("");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: producto.trim(),
          precio: Number(precio),
          descripcion: desc.trim(),
          img: imagen || "",
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar el producto");
      }

      setError("");
      setSuccess("Producto agregado correctamente.");
      setProducto("");
      setPrecio("");
      setDesc("");
      setImagen("");

      setTimeout(() => navigate("/card"), 800);
    } catch (err) {
      setError(err.message || "Ocurrió un error al guardar el producto.");
      setSuccess("");
    }
  };

  return (
    <div className="new-product-page">
      <div className="new-product-card">
        <h2 className="new-product-title">Agregar nuevo producto</h2>
        <p className="new-product-subtitle">Completa los datos para publicar un perfume en la tienda.</p>
        <form onSubmit={guardarPr} className="new-product-form">
          <input className="new-product-input" type="text" placeholder="Producto" value={producto} onChange={(e) => setProducto(e.target.value)} />
          <input className="new-product-input" type="number" placeholder="Precio" value={precio} onChange={(e) => setPrecio(e.target.value)} />
          <input className="new-product-input" type="text" placeholder="Descripción" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <input
            className="new-product-input"
            type="text"
            placeholder="URL de la imagen"
            value={imagen}
            onChange={(e) => setImagen(e.target.value)}
          />
          {error && <p className="new-product-message error">{error}</p>}
          {success && <p className="new-product-message success">{success}</p>}
          <button className="new-product-button" type="submit">Agregar</button>
        </form>
      </div>
    </div>
  );
};

export default Nuevopr