const express = require("express")
const router = express.Router()
const userController = require("../controllers/user")
const favoriteController = require("../controllers/favorite")
const check = require("../middleware/auth")
const multer = require("multer")
const storageMulter = multer.memoryStorage();
const uploadMulter = multer({
    storage: storageMulter,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    filename: (req,file,cb) => {
        cb(null, "avatarImg-" + Date.now() + "-" + file.originalname )
    }
});
// Definir rutas
router.get("/prueba-usuario", check.auth, userController.pruebaUser)
router.post("/register",uploadMulter.single("avatar"), userController.register)
router.post("/login", userController.login)
router.get("/me", check.auth, userController.getMe)
router.get("/:id", check.auth, userController.getUser)
router.put("/me", [check.auth, uploadMulter.single("avatar")], userController.update)
router.delete("/me", check.auth, userController.deleteUser)
router.post("/favorites/:estateId", check.auth, favoriteController.addFavorite)
router.delete("/favorites/:estateId", check.auth, favoriteController.unFavorite)
router.get("/me/favorites", check.auth, favoriteController.viewFavorites)
router.post("/confirmation-code", userController.sendConfirmationCodeForgotPassword)
router.post("/confirmation-code/verification", userController.verifyCode)
router.post("/reset-password", userController.passwordChange)
router.post("/user-login", userController.userLogin)

// Exportar router
module.exports = router