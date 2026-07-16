const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const archivo = path.join(__dirname, "../data/productos.json");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    const nombre = Date.now() + path.extname(file.originalname);
    cb(null, nombre);
  },
});
const upload = multer({ storage });

const leerProductos = () => {
  if (!fs.existsSync(archivo)) {
    fs.writeFileSync(archivo, "[]");
  }
  return JSON.parse(fs.readFileSync(archivo, "utf8"));
};

const guardarProductos = (productos) => {
  fs.writeFileSync(archivo, JSON.stringify(productos, null, 2));
};

router.get("/", (req, res) => {
  const productos = leerProductos();
  res.json(productos);
});
router.get("/:id", (req, res) => {
  const productos = leerProductos();
  const producto = productos.find((p) => p.id === req.params.id);
  if (!producto) {
    return res.status(404).json({
      error: "Producto no encontrado",
    });
  }
  res.json(producto);
});
router.post("/", upload.single("imagen"), (req, res) => {
  const productos = leerProductos();

  const nuevoProducto = {
    id: Date.now().toString(),
    nombre: req.body.nombre,
    descripcion: req.body.descripcion,
    categoria: req.body.categoria,
    precio: Number(req.body.precio),
    stock: Number(req.body.stock),
    imagen: req.file
      ? `/uploads/${req.file.filename}`
      : req.body.imagenUrl?.trim() || "",
  };

  productos.push(nuevoProducto);
  guardarProductos(productos);

  res.status(201).json(nuevoProducto);
});

//
// PUT - Editar producto
//
router.put("/:id", (req, res) => {
  const productos = leerProductos();

  const index = productos.findIndex((p) => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      error: "Producto no encontrado",
    });
  }

  productos[index] = {
    ...productos[index],
    ...req.body,
  };

  guardarProductos(productos);

  res.json(productos[index]);
});

//
// DELETE - Eliminar producto
//
router.delete("/:id", (req, res) => {
  const productos = leerProductos();

  const nuevosProductos = productos.filter((p) => p.id !== req.params.id);

  if (productos.length === nuevosProductos.length) {
    return res.status(404).json({
      error: "Producto no encontrado",
    });
  }

  guardarProductos(nuevosProductos);

  res.json({
    mensaje: "Producto eliminado correctamente",
  });
});

module.exports = router;
