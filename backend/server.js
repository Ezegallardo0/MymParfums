require("dotenv").config();
const express = require("express");
const cors = require("cors");
const empleadosRouter = require("./routes/empleados");
const productoRoutes = require("./routes/producto");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("public/uploads"));

// Rutas
app.use("/api/empleados", empleadosRouter);
app.use("/api/productos", productoRoutes);
// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT}.`);
});