const express = require("express")
const router = express.Router()
const userController = require("../controllers/user")
const check = require("../middleware/auth")

// Definir rutas
router.get("/prueba-usuario", check.auth, userController.pruebaUser)
router.post("/register", userController.register)
router.post("/login", userController.login)
router.get("/me", check.auth, userController.getMe)
router.get("/:id", check.auth, userController.getUser)
router.put("/me", check.auth, userController.update)

// Exportar router
module.exports = router