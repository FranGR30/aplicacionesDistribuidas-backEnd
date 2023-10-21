const express = require("express")
const router = express.Router()
const calificationController = require("../controllers/calification")
const check = require("../middleware/auth")

// Definir rutas
router.get("/prueba-calification", calificationController.pruebaCalification)
router.post("/", check.auth, calificationController.createCalification)
router.get("/me", check.auth, calificationController.getMyCalification)
router.get("/:userId", check.auth, calificationController.getCalification)
router.get("/view-calification/:calificationId", check.auth, calificationController.getCalificationById)

// Exportar router
module.exports = router