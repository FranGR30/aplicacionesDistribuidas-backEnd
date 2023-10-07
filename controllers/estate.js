const Estate = require("../models/estate")
const fs = require("fs")
const path = require("path")

// Prueba
const pruebaEstate = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde el controller: controllers/estate.js"
    })
}

const newEstate = async (req, res) => {
    let params = req.body
    if (!params.street || !params.addressNumber || !params.floor || !params.neighborhood || !params.state || !params.country
        || !params.estateType || !params.coveredSquareMeters || !params.semiUncoveredSquaremeters
        || !params.uncoveredSquareMeters || !params.roomsAmount || !params.bathroomsAmount
        || !params.bedroomsAmount || !params.terrace || !params.balcony || !params.garage || !params.storage
        || !params.frontOrBack || !params.antiquity || !params.orientation || !params.amenites
        || !params.status || !params.price || !params.currency || !params.latitude || !req.files) {
        return res.status(400).json({
            status: "error",
            message: "Required fields missing",
        })
    }
    let newEstate = new Estate(params)
    for (let i = 0; i < req.files.length; i++) {
        let image = req.files[i].originalname
        let imageSplit = image.split("\.")
        let extension = imageSplit[1]
        if (extension != "png" && extension != "jpg" && extension != "jpeg") {
            let filePath = req.files[i].path
            let fileDeleted = fs.unlinkSync(filePath)
            for (let j = 0; j < i; j++) {
                filePath = req.files[j].path
                fileDeleted = fs.unlinkSync(filePath)
            }
            return res.status(400).send({
                status: "error",
                message: "Image/s extension invalid",
            })
        }
        newEstate.images.push(req.files[i].filename)
    }
    newEstate.realEstate = req.user.id
    await newEstate.save((error, estateStored) => {
        if (error || !estateStored) {
            return res.status(500).send({
                status: "error",
                message: "Error at saving estate",
                error: error
            })
        }
        if (estateStored) {
            return res.status(200).json({
                status: "success",
                message: "Estate created successfully",
                estate: newEstate
            })
        }
    })
}

const getEstate = (req, res) => {
    const id = req.params.idEstate
    Estate.findById(id)
        .exec((error, estate) => {
            if (error || !estate) {
                return res.status(404).send({
                    status: "error",
                    message: "Estate not found or an error has occured",
                })
            }
            return res.status(200).json({
                status: "success",
                message: "Estate found",
                estate: estate
            })
        })
}

const getImage = (req, res) => {
    const file = req.params.file
    const filePath = "./uploads/estateImages/" + file
    fs.stat(filePath, (error, exists) => {
        if (!exists) {
            return res.status(404).send({
                status: "error",
                message: "Image not found",
            })
        }
        return res.sendFile(path.resolve(filePath))
    })
}

const deleteEstate = (req, res) => {
    const id = req.params.idEstate
    Estate.find({ "realEstate": req.user.id, "_id": id }).exec(async (error, estates) => {
        if (error || estates.length < 1) {
            return res.status(500).send({
                status: "error",
                message: "Estate could not be deleted",
            })
        }
        for (let i = 0; i < estates[0].images.length; i++) {
            const filePath = "./uploads/estateImages/" + estates[0].images[i]
            let fileDeleted = fs.unlinkSync(filePath)
        }
        Estate.findByIdAndDelete(id).exec(async error => {
            if (error) {
                return res.status(500).send({
                    status: "error",
                    message: "Estate could not be deleted",
                })
            }
            return res.status(200).json({
                status: "success",
                message: "Estate deleted",
                estateId: id,
            })
        })
    })
}

const getEstatesfromUser = (req, res) => {
    const idUser = req.params.idUser
    Estate.find({ "realEstate": idUser }).exec((error, estates, total) => {
        if (error || estates.length <= 0) {
            return res.status(500).send({
                status: "error",
                message: "Estates not found or an error has occured",
                error: error
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Estates found",
            total,
            estates: estates
        })
    })
}

const updateEstate = (req, res) => {
    const estateId = req.params.estateId
    const userId = req.user.id
    const estateToUpdate = req.body
    const files = req.files
    Estate.findById(estateId).exec(async (error, estate) => {
        if (error || !estate) {
            for (let i = 0; i < files.length; i++) {
                const filePath = "./uploads/estateImages/" + files[i].filename
                let fileDeleted = fs.unlinkSync(filePath)
            }
            return res.status(404).send({
                status: "error",
                message: "Estate not found",
            })
        }
        //try {
            if (estate.realEstate != userId) {
                return res.status(500).send({
                    status: "error",
                    message: "Error updating estate",
                })
            }
            for (let i = 0; i < req.files.length; i++) {
                let image = req.files[i].originalname
                let imageSplit = image.split("\.")
                let extension = imageSplit[1]
                if (extension != "png" && extension != "jpg" && extension != "jpeg") {
                    let filePath = req.files[i].path
                    let fileDeleted = fs.unlinkSync(filePath)
                    for (let j = 0; j < i; j++) {
                        filePath = req.files[j].path
                        fileDeleted = fs.unlinkSync(filePath)
                    }
                    return res.status(400).send({
                        status: "error",
                        message: "Image/s extension invalid",
                    })
                }
            }
            for (let i = 0; i < estate.images.length; i++) {
                const filePath = "./uploads/estateImages/" + estate.images[i]
                let fileDeleted = fs.unlinkSync(filePath)
            }
            estateToUpdate.images = []
            for (let i = 0; i < req.files.length; i++) {
                estateToUpdate.images.push(files[i].filename)
            }
        /*} catch (error) {
            return res.status(500).send({
                status: "error",
                message: "An error has occured",
                error: error
            })
        }*/
        try {
            let estateUpdated = await Estate.findByIdAndUpdate(estateId, estateToUpdate, { new: true })
            if (!estateUpdated) {
                return res.status(500).send({
                    status: "error",
                    message: "Estate not found",
                })
            }
            return res.status(200).json({
                status: "success",
                message: "Estate updated",
                estate: estateUpdated
            })
        } catch (error) {
            return res.status(500).send({
                status: "error",
                message: "Estates not found or an error has occured",
            })
        }
    })

}

// Exportar acciones
module.exports = {
    pruebaEstate,
    newEstate,
    getEstate,
    deleteEstate,
    getEstatesfromUser,
    getImage,
    updateEstate
}