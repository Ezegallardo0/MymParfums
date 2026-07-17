import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../styles/newproduct.css";
import { emitNotification } from "../utils/notifications";

const Nuevopr = () => {
  const [producto, setProducto] = useState("");
  const [precio, setPrecio] = useState("");
  const [desc, setDesc] = useState("");
  const [imagen, setImagen] = useState(null);
  const [imagenUrl, setImagenUrl] = useState("");
  const [cate, setCate] = useState("");
  const [stock, setStock] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const categorias = ["Destacadas", "Armaf & Afnan", "Lattafa & Maison Alhambra"];

  const guardarPr = async (e) => {
    e.preventDefault();

    if (!producto.trim() || !precio.trim() || !cate.trim()) {
      setError("Todos los campos son obligatorios.");
      setSuccess("");
      return;
    }

    const precioNormalizado = precio.replace(/,/g, ".").trim();
    const precioNumerico = Number(precioNormalizado);

    if (!/^\d+(?:[.,]\d+)?$/.test(precio.trim()) || Number.isNaN(precioNumerico) || precioNumerico <= 0) {
      setError("El precio debe ser mayor a 0 y puede incluir punto o coma como decimal.");
      setSuccess("");
      return;
    }

    const stockNumerico = Number(stock);
    if (!Number.isInteger(stockNumerico) || stockNumerico < 0) {
      setError("El stock debe ser un número entero mayor o igual a 0.");
      setSuccess("");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("nombre", producto.trim());
      formData.append("precio", precioNumerico.toFixed(2));
      formData.append("categoria", cate.trim());
      formData.append("stock", stockNumerico);
      formData.append("descripcion", desc.trim());

      if (imagen) {
        formData.append("imagen", imagen);
      } else if (imagenUrl.trim()) {
        formData.append("imagenUrl", imagenUrl.trim());
      }

      const response = await fetch("http://localhost:3000/api/productos", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar el producto");
      }

      setError("");
      setSuccess("Producto agregado correctamente.");
      emitNotification(`Se agregó el producto ${producto.trim()} al inventario.`, { title: "Nuevo producto", type: "success" });

      setProducto("");
      setPrecio("");
      setDesc("");
      setImagen(null);
      setImagenUrl("");
      setCate("");
      setStock("");

      setTimeout(() => {
        navigate("/card");
      }, 800);
    } catch (err) {
      setError(err.message || "Ocurrió un error al guardar el producto.");
      setSuccess("");
    }
  };

  return (
    <div className="new-product-page">
      <div className="new-product-card">
        <h2 className="new-product-title">Agregar nuevo producto</h2>
        <p className="new-product-subtitle">
          Completa los datos para publicar un perfume en la tienda.
        </p>
        <form onSubmit={guardarPr} className="new-product-form">
          <input
            className="new-product-input"
            type="text"
            placeholder="Producto"
            value={producto}
            onChange={(e) => setProducto(e.target.value)}
          />
          <input
            className="new-product-input"
            type="text"
            inputMode="decimal"
            placeholder="Precio"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />
          <input
            className="new-product-input"
            type="text"
            placeholder="Descripción"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <div className="new-product-field">
            <label className="new-product-label">Categoría</label>
            <select
              className="new-product-input new-product-select"
              name="cates"
              value={cate}
              onChange={(e) => setCate(e.target.value)}
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>
          <div className="new-product-field">
            <label className="new-product-label">Stock</label>
            <input
              className="new-product-input"
              type="number"
              min="0"
              step="1"
              placeholder="Stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>

          <div className="new-product-field">
            <label className="new-product-label">Imagen del producto</label>
            <label className="upload-box" htmlFor="product-image-file">
              <span className="upload-icon">📷</span>
              <span>{imagen ? `Archivo: ${imagen.name}` : "Seleccionar archivo"}</span>
            </label>
            <input
              id="product-image-file"
              className="new-product-file-input"
              type="file"
              accept="image/*"
              onChange={(e) => setImagen(e.target.files?.[0] || null)}
            />
            <input
              className="new-product-input"
              type="url"
              placeholder="O pega una URL de imagen"
              value={imagenUrl}
              onChange={(e) => setImagenUrl(e.target.value)}
            />
          </div>
          {error && <p className="new-product-message error">{error}</p>}
          {success && <p className="new-product-message success">{success}</p>}
          <button className="new-product-button" type="submit">
            Agregar
          </button>
          <Link to="/">
            <button className="cancel-button">Cancelar</button>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Nuevopr;
