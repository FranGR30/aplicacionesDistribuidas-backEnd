const Estate = require("../models/estate")
const User = require("../models/user")
// Prueba
const pruebaEstate = (req, res) => {
    return res.status(200).send({
        menaje: "Mensaje enviado desde el controller: controllers/estate.js"
    })
}

const newEstate = async (req, res) => {
    let params = req.body
    const id = req.user.id
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
    await User.findById(id)
        .exec(async (error, user) => {
            console.log(user);
            if (error || !user) {
                return res.status(404).send({
                    status: "error",
                    message: "User not found or an error has occured",
                })
            }
            let newEstate = new Estate(params)
            user.estates.push(newEstate)
            console.log(user);
            try {
                let userUpdated = await User.findByIdAndUpdate(id, user, { new: true })
                if (!userUpdated) {
                    return res.status(400).send({
                        status: "error",
                        message: "Error updating user",
                    })
                }
                return res.status(200).json({
                    status: "success",
                    message: "Estate created successfully",
                    estate: newEstate
                })
            } catch (error) {
                if (error) {
                    return res.status(500).send({
                        status: "error",
                        message: "Error updating user",
                    })
                }
            }
        })
}

// Exportar acciones
module.exports = {
    pruebaEstate,
    newEstate
}