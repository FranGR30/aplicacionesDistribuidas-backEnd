const express = require("express")
const router = express.Router()
const contactController = require("../controllers/contact")
const check = require("../middleware/auth")

// Definir rutas
router.get("/prueba-contact", contactController.pruebaContact)
router.post("/", check.auth, contactController.createContact)
router.get("/me/:typeOfContact", check.auth, contactController.getContacts)

// Exportar router
module.exports = router