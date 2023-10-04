const jwt = require("jwt-simple")
const moment = require("moment")

// Clave secreta para generar el token
const secret = "UADE_2023_DesarrolloDeAplicaciones_1"

const createToken = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        telephone: user.telephone,
        iat: moment().unix(),
        exp: moment().add(30,"days").unix(),
        estates: user.estates
    }
    return jwt.encode(payload, secret)
}

module.exports = {
    createToken,
    secret
}