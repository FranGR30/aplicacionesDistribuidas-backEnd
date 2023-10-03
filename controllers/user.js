const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("../services/jwt")

// Prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        menaje: "Mensaje enviado desde el controller: controllers/user.js"
    })
}

// Registro de usuarios
const register = (req, res) => {
    let params = req.body
    if (!params.name || !params.email || !params.password || !params.surname || !params.telephone) {
        return res.status(400).json({
            status: "error",
            message: "Required fields missing",
        })
    }
    User.find({
        $or: [
            { email: params.email.toLowerCase() },
            { telephone: params.telephone }
        ]
    }).exec(async (error, users) => {
        if (error) {
            return res.status(500).json({
                status: "error",
                message: "Error registering user",
            })
        }
        if (users && users.length >= 1) {
            return res.status(500).send({
                status: "success",
                message: "User already registered",
            })
        }
        let pwd = await bcrypt.hash(params.password, 10)
        params.password = pwd
        let newUser = new User(params)
        newUser.password = pwd
        newUser.save((error, userStored) => {
            if (error || !userStored) {
                return res.status(500).send({
                    status: "error",
                    message: "Error at saving user",
                })
            }
            if (userStored) {
                return res.status(200).json({
                    status: "success",
                    message: "User registered correctly",
                    user: userStored
                })
            }
        })
    })
}

const login = (req, res) => {
    let params = req.body
    if (!params.email || !params.password) {
        return res.status(400).json({
            status: "error",
            message: "Required fields missing",
        })
    }
    User.findOne({ email: params.email.toLowerCase() })
        .exec((error, user) => {
            if (error || !user) {
                return res.status(500).json({
                    status: "error",
                    message: "Error processing login",
                })
            }
            if(!bcrypt.compareSync(params.password, user.password)){
                return res.status(400).json({
                    status: "error",
                    message: "Authentication failed",
                })
            }
            const token = jwt.createToken(user)

            return res.status(200).json({
                status: "success",
                message: "Login successful",
                user:{
                    _id: user._id,
                    name: user.name,
                    surname: user.surname,
                    email: user.email,
                    telephone: user.telephone
                },
                token
            })
        })
}

// Exportar acciones
module.exports = {
    pruebaUser,
    register,
    login
}