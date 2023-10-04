const Estate = require("../models/estate")
// Prueba
const pruebaEstate = (req, res) => {
    return res.status(200).send({
        menaje: "Mensaje enviado desde el controller: controllers/estate.js"
    })
}

const newEstate = (req, res) => {
    let params = req.body
    const id = req.user.id
    const userToAddEstate = req.user
    if (!params.street || !params.addressNumber || !params.floor || !params.neighborhood || !params.state || !params.country
        || !params.estateType || !params.coveredSquareMeters || !params.semiUncoveredSquaremeters
        || !params.uncoveredSquareMeters || !params.roomsAmount || !params.bathroomsAmount
        || !params.bedroomsAmount || !params.terrace || !params.balcony || !params.garage || !params.storage
        || !params.frontOrBack || !params.antiquity || !params.orientation || !params.amenites
        || !params.status || !params.price || !params.currency || !params.latitude) {
        return res.status(400).json({
            status: "error",
            message: "Required fields missing",
        })
    }
    console.log(userToAddEstate);
    console.log(new Estate(params))
    userToAddEstate.estates.push(new Estate(params))
    console.log(id);
    try {
        let userUpdated = User.findByIdAndUpdate(id, userToAddEstate, { new: true })
        console.log(userUpdated);
        if (!userUpdated) {
            return res.status(400).send({
                status: "error",
                message: "Error updating user",
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Estate created successfully",
            estate: userToAddEstate.estates[userToAddEstate.estates.legth - 1]
        })
    } catch (error) {
        if (error) {
            return res.status(500).send({
                status: "error",
                message: "Error updating user",
            })
        }
    }
}

// Exportar acciones
module.exports = {
    pruebaEstate,
    newEstate
}