const express = require("express")
const router = express.Router()
const estateController = require("../controllers/estate")
const check = require("../middleware/auth")

// Definir rutas
router.get("/prueba-estate", estateController.pruebaEstate)
router.put("/", check.auth, estateController.newEstate)

// Exportar router
module.exports = router