const express = require("express")
const router = express.Router()
const userController = require("../controllers/user")
const check = require("../middleware/auth")
const multer = require("multer")

// Config de subida de imagenes
const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, "./uploads/avatars/")
    },
    filename: (req,file,cb) => {
        cb(null, "avatarImg-" + Date.now() + "-" + file.originalname )
    }
})

const uploads = multer({storage})
// Definir rutas
router.get("/prueba-usuario", check.auth, userController.pruebaUser)
router.post("/register",uploads.single("avatar"), userController.register)
router.post("/login", userController.login)
router.get("/me", check.auth, userController.getMe)
router.get("/:id", check.auth, userController.getUser)
router.put("/me", [check.auth, uploads.single("avatar")], userController.update)
router.delete("/me", check.auth, userController.deleteUser)
router.get("/media/:file", check.auth, userController.getAvatar)

// Exportar router
module.exports = router