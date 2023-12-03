const Calification = require("../models/calification")
const User = require("../models/user")
// Prueba
const pruebaCalification = (req,res) => {
    return res.status(200).send({
        menaje:"Mensaje enviado desde el controller: controllers/calification.js"
    })
}

const createCalification = async (req, res) => {
    const userId = req.user.id
    const params = req.body
    let newCalification = new Calification(params)
    newCalification.user = userId
    if(req.user.status == "inactive") {
        return res.status(500).send({
            status: "error",
            mensaje:"Unable to perform action. Inactive user"
        })
    }
    if (userId == params.realEstate) {
        return res.status(500).send({
            status: "error",
            mensaje:"Unable to perform action"
        })
    }
    User.findById(newCalification.realEstate).exec((error, estate) => {
        if(error || !estate) {
            return res.status(404).send({
                status: "error",
                mensaje:"Unable to perform action. Realestate not found or an error has occurred"
            })
        }
        newCalification.save((error, calificationStored) => {
            if (error || !calificationStored) {
                return res.status(500).send({
                    status: "error",
                    mensaje:"Unable to perform action. Error saving calification"
                })
            }
            return res.status(200).json({
                status: "success",
                message: "Calification stored successfully",
                calification: calificationStored
            })
        })
    })
}

const getMyCalification = (req, res) => {
    const userId = req.user.id
    if(req.user.status == "inactive") {
        return res.status(500).send({
            status: "error",
            mensaje:"Unable to perform action. Inactive user"
        })
    }
    Calification.find({"realEstate":userId}).exec(async(error,califications) => {
        if (error || califications.length <= 0) {
            return res.status(404).send({
                status: "error",
                mensaje:"Unable to perform action. An error has occurred"
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Califications found",
            califications: califications
        })
    })
}

const getCalification = (req, res) => {
    const userId = req.params.userId
    if(req.user.status == "inactive") {
        return res.status(500).send({
            status: "error",
            mensaje:"Unable to perform action. Inactive user"
        })
    }
    Calification.find({realEstate:userId}).exec(async(error,califications) => {
        if (error || califications.length <= 0) {
            return res.status(404).send({
                status: "error",
                mensaje:"Unable to perform action. An error has occurred"
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Califications found",
            califications: califications
        })
    })
}

const getCalificationById = (req, res) => {
    const calificationId = req.params.calificationId
    if(req.user.status == "inactive") {
        return res.status(500).send({
            status: "error",
            mensaje:"Unable to perform action. Inactive user"
        })
    }
    Calification.findById(calificationId).exec( async (error, calification) => {
        if (error || !calification) {
            return res.status(404).send({
                status: "error",
                mensaje:"Unable to perform action. An error has occurred"
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Calification found",
            calification: calification
        })
    })
}


// Exportar acciones
module.exports = {
    pruebaCalification,
    createCalification,
    getCalification,
    getMyCalification,
    getCalificationById
}