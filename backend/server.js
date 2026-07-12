require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const empleadosRouter = require("./routes/empleados");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/empleados", empleadosRouter);

app.get("/productos", (req, res) => {
  const productosPath = path.join(__dirname, "data", "productos.json");
  try {
    const data = fs.readFileSync(productosPath, "utf8");
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: "No se pudieron cargar los productos" });
  }
});

app.post("/productos", (req, res) => {
  const productosPath = path.join(__dirname, "data", "productos.json");
  const { nombre, precio, descripcion = "" } = req.body;

  if (!nombre || !precio) {
    return res.status(400).json({ error: "Nombre y precio son obligatorios" });
  }

  try {
    const raw = fs.readFileSync(productosPath, "utf8");
    const productos = JSON.parse(raw || "[]");
    const nuevoProducto = {
      id: Date.now(),
      nombre: nombre.trim(),
      precio: Number(precio),
      descripcion: descripcion.trim(),
      img: "https://placehold.co/600x600/002030/E8EBFF?text=" + encodeURIComponent(nombre.trim()),
    };

    productos.push(nuevoProducto);
    fs.writeFileSync(productosPath, JSON.stringify(productos, null, 2), "utf8");
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(500).json({ error: "No se pudo guardar el producto" });
  }
});

app.get("/", (req, res) => {
  res.send("Servidor Funcionando.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT}.`);
});
