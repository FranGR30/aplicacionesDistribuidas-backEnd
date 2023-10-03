const express = require("express")
const router = express.Router()
const contactController = require("../controllers/contact")

// Definir rutas
router.get("/prueba-contact", contactController.pruebaContact)

// Exportar router
module.exports = router