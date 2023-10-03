const express = require("express")
const router = express.Router()
const estateController = require("../controllers/estate")

// Definir rutas
router.get("/prueba-estate", estateController.pruebaEstate)

// Exportar router
module.exports = router