const express = require("express")
const router = express.Router()
const estateController = require("../controllers/estate")
const check = require("../middleware/auth")
const multer = require("multer")

// Config de subida de imagenes
const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, "./uploads/estateImages/")
    },
    filename: (req,file,cb) => {
        cb(null, "estateImg-" + Date.now() + "-" + file.originalname )
    }
})

const uploads = multer({storage})

// Definir rutas
router.get("/prueba-estate", estateController.pruebaEstate)
router.post("/", [check.auth, uploads.array("pictures",20)], estateController.newEstate)
router.get("/:idEstate",check.auth, estateController.getEstate)
router.delete("/:idEstate",check.auth, estateController.deleteEstate)
router.get("/user/:idUser",check.auth, estateController.getEstatesfromUser)
router.get("/media/:file",check.auth, estateController.getImage)
router.put("/:estateId",[check.auth, uploads.array("pictures",20)],estateController.updateEstate)

// Exportar router
module.exports = router