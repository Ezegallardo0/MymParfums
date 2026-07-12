const express = require("express");
const cors = require("cors");
const empleadosRouter = require("./routes/empleados");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/empleados", empleadosRouter);
app.get("/", (req,res )=>{
    res.send("Servidor Funcionando.");
})
const PORT = process.env.PORT||3000;
app.listen(PORT, ()=>{
    console.log(`Servidor iniciado en puerto ${PORT}.`);
})
