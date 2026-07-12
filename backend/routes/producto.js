const express = require("express");
const router = express.Router();

const productos = require("../data/productos.json");

router.get("/", (req, res) => {
  res.json(productos);
});

router.get("/:id", (req, res) => {
  const producto = productos.find(
    p => p.id === req.params.id
  );

  if (!producto) {
    return res.status(404).json({
      error: "Producto no encontrado"
    });
  }

  res.json(producto);
});

router.post("/", (req, res) => {
  console.log(req.body);

  res.status(201).json({
    mensaje: "Producto creado"
  });
});
console.log("Rutas de productos cargadas");
module.exports = router;