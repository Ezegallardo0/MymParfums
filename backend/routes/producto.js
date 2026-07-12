const express = require("express");
const router= express.router();
const productos = require("../data/productos.json");

router.get("/", (req,res) => {
    res.json(productos);
})
router.get("/:id", (req, res) => {
    const producto = productos.find(
        p => p.id === req.params.id
    );
    if(!producto){
        return res.status(404).json({
            error: "Producto no encontrado"
        });
    }
    res.json(producto);
})
module.express = router;