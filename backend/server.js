require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { testConnection, initializeDatabase } = require("./config/db");
const empleadosRouter = require("./routes/empleados");
const productoRoutes = require("./routes/producto");
const registroRoutes = require("./routes/registro");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("public/uploads"));

// Rutas
app.use("/api/empleados", empleadosRouter);
app.use("/api/productos", productoRoutes);
app.use("/api/registro", registroRoutes);
// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando.");
});

app.get("/api/db-status", async (req, res) => {
  try {
    const ok = await testConnection();
    res.json({
      ok,
      message: ok ? "Conexión a MySQL activa." : "No se pudo validar la conexión a MySQL.",
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

const PORT = process.env.PORT || 3000;

(async () => {

  app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}.`);
  });
})();