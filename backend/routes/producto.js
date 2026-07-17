const express = require("express");
const path = require("path");
const multer = require("multer");
const { pool } = require("../config/db");

const router = express.Router();

// Configuración de Multer
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


// ==========================
// GET TODOS LOS PRODUCTOS
// ==========================
router.get("/", async (req, res) => {
  try {
    const [productos] = await pool.execute("SELECT * FROM productos");
    res.json(productos);
  } catch (error) {
    console.error("Error obteniendo productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});


// ==========================
// GET PRODUCTO POR ID
// ==========================
router.get("/:id", async (req, res) => {
  try {
    const [producto] = await pool.execute(
      "SELECT * FROM productos WHERE id = ?",
      [req.params.id]
    );

    if (producto.length === 0) {
      return res.status(404).json({
        error: "Producto no encontrado",
      });
    }

    res.json(producto[0]);
  } catch (error) {
    console.error("Error obteniendo producto:", error);
    res.status(500).json({
      error: "Error al obtener producto",
    });
  }
});


// ==========================
// CREAR PRODUCTO
// ==========================
router.post("/", upload.single("imagen"), async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      categoria,
      precio,
      stock,
      imagenUrl,
    } = req.body;

    if (!nombre || precio === undefined) {
      return res.status(400).json({
        error: "Nombre y precio son obligatorios",
      });
    }

    const imagen = req.file
      ? `/uploads/${req.file.filename}`
      : imagenUrl?.trim() || null;

    const [resultado] = await pool.execute(
      `INSERT INTO productos
      (nombre, descripcion, categoria, precio, stock, imagen)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nombre.trim(),
        descripcion?.trim() || null,
        categoria?.trim() || null,
        Number(precio),
        Number(stock) || 0,
        imagen,
      ]
    );

    res.status(201).json({
      id: resultado.insertId,
      nombre,
      descripcion,
      categoria,
      precio,
      stock,
      imagen,
    });
  } catch (error) {
    console.error("Error creando producto:", error);
    res.status(500).json({
      error: "Error al crear producto",
    });
  }
});


// ==========================
// ACTUALIZAR PRODUCTO
// ==========================
router.put("/:id", upload.single("imagen"), async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      categoria,
      precio,
      stock,
      imagenUrl,
    } = req.body;

    const [actual] = await pool.execute(
      "SELECT * FROM productos WHERE id = ?",
      [req.params.id]
    );

    if (actual.length === 0) {
      return res.status(404).json({
        error: "Producto no encontrado",
      });
    }

    const producto = actual[0];

    const imagen = req.file
      ? `/uploads/${req.file.filename}`
      : imagenUrl !== undefined
      ? imagenUrl
      : producto.imagen;

    await pool.execute(
      `UPDATE productos
      SET nombre=?,
          descripcion=?,
          categoria=?,
          precio=?,
          stock=?,
          imagen=?
      WHERE id=?`,
      [
        nombre ?? producto.nombre,
        descripcion ?? producto.descripcion,
        categoria ?? producto.categoria,
        precio ?? producto.precio,
        stock ?? producto.stock,
        imagen,
        req.params.id,
      ]
    );

    const [actualizado] = await pool.execute(
      "SELECT * FROM productos WHERE id = ?",
      [req.params.id]
    );

    res.json(actualizado[0]);
  } catch (error) {
    console.error("Error actualizando producto:", error);
    res.status(500).json({
      error: "Error al actualizar producto",
    });
  }
});


// ==========================
// ELIMINAR PRODUCTO
// ==========================
router.delete("/:id", async (req, res) => {
  try {
    const [resultado] = await pool.execute(
      "DELETE FROM productos WHERE id = ?",
      [req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        error: "Producto no encontrado",
      });
    }

    res.json({
      mensaje: "Producto eliminado correctamente",
    });
  } catch (error) {
    console.error("Error eliminando producto:", error);
    res.status(500).json({
      error: "Error al eliminar producto",
    });
  }
});

module.exports = router;