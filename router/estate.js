const express = require("express")
const router = express.Router()
const estateController = require("../controllers/estate")
const check = require("../middleware/auth")
const multer = require("multer")
const storageMulter = multer.memoryStorage();

// Config de subida de imagenes
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
router.get("/prueba-estate", estateController.pruebaEstate)
router.get("/user/my-reservations", check.auth, estateController.getReservedEstates)
router.post("/", [check.auth, uploadMulter.array("pictures",10)], estateController.newEstate)
router.get("/:idEstate",check.auth, estateController.getEstate)
router.delete("/:idEstate",check.auth, estateController.deleteEstate)
router.get("/user/:idUser",check.auth, estateController.getEstatesfromUser)
router.get("/estatesNearBy/search",check.auth, estateController.getNearEstates)
router.put("/:estateId",[check.auth, uploadMulter.array("pictures",10)],estateController.updateEstate)
router.patch("/reservation/:estateId", check.auth, estateController.bookEstate)
router.patch("/sale-rent/:estateId", check.auth, estateController.sellOrRentEstate)
router.get("/filter", check.auth, estateController.getEstatesFiltered)


// Exportar router
module.exports = router