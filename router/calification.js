const express = require("express")
const router = express.Router()
const calificationController = require("../controllers/calification")

// Definir rutas
router.get("/prueba-calification", calificationController.pruebaCalification)

// Exportar router
module.exports = router