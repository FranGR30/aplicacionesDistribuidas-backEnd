const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("../services/jwt")
const Estate = require("../models/estate")
const fs = require("fs")
const path = require("path")

// Prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        menaje: "Mensaje enviado desde el controller: controllers/user.js",
        usuario: req.user
    })
}

// Registro de inmobiliarias
const register = (req, res) => {
    let params = req.body
    if (!params.name || !params.email || !params.password || !params.surname || !params.telephone || !params.nickName) {
        return res.status(400).json({
            status: "error",
            message: "Required fields missing",
        })
    }
    let image = req.file.originalname
    let imageSplit = image.split("\.")
    let extension = imageSplit[1]
    if (extension != "png" && extension != "jpg" && extension != "jpeg") {
        let filePath = req.file.path
        let fileDeleted = fs.unlinkSync(filePath)
        return res.status(400).send({
            status: "error",
            message: "Image/s extension invalid",
        })
    }
    User.find({
        $or: [
            { email: params.email.toLowerCase() },
            { telephone: params.telephone },
            { nickName: params.nickName }
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
        newUser.role = "realEstate"
        newUser.password = pwd
        if (req.file) {
            newUser.avatar = req.file.filename
        } else {
            newUser.avatar = "default.png"
        }
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
            if (!bcrypt.compareSync(params.password, user.password)) {
                return res.status(400).json({
                    status: "error",
                    message: "Authentication failed",
                })
            }
            const token = jwt.createToken(user)

            return res.status(200).json({
                status: "success",
                message: "Login successful",
                user: {
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

const getUser = (req, res) => {
    const id = req.params.id
    User.findById(id)
        .select({
            password: 0,
            role: 0
        })
        .exec((error, user) => {
            if (error || !user) {
                return res.status(404).send({
                    status: "error",
                    message: "User not found or an error has occured",
                })
            }
            return res.status(200).json({
                status: "success",
                message: "User found",
                user: user
            })
        })
}

const getMe = (req, res) => {
    const id = req.user.id
    User.findById(id)
        .select({
            password: 0,
            role: 0
        })
        .exec((error, user) => {
            if (error || !user) {
                return res.status(404).send({
                    status: "error",
                    message: "User not found or an error has occured",
                })
            }
            return res.status(200).json({
                status: "success",
                message: "User found",
                user: user
            })
        })
}

const update = (req, res) => {
    const userToUpdate = req.body
    const userIdentity = req.user
    delete userToUpdate.iat
    delete userToUpdate.exp
    delete userToUpdate.role
    User.find({
        $or: [
            { email: userToUpdate.email.toLowerCase() },
            { telephone: userToUpdate.telephone },
            { nickName: userToUpdate.nickName }
        ]
    })
        .exec(async (error, users) => {
            if (error) {
                return res.status(500).json({
                    status: "error",
                    message: "Error updating user",
                })
            }
            let userIsSet = false;
            users.forEach(user => {
                if (user && user._id != userIdentity.id) {
                    userIsSet = true
                }
            });
            if (userIsSet) {
                return res.status(200).send({
                    status: "success",
                    message: "User already registered",
                })
            }
            if (req.file) {
                let image = req.file.originalname
                let imageSplit = image.split("\.")
                let extension = imageSplit[1]
                if (extension != "png" && extension != "jpg" && extension != "jpeg") {
                    let filePath = req.file.path
                    let fileDeleted = fs.unlinkSync(filePath)
                    return res.status(400).send({
                        status: "error",
                        message: "Image/s extension invalid",
                    })
                }
                if (req.file.filename != "default.png") {
                    let filePath = "./uploads/avatars/" + req.user.avatar
                    console.log(filePath);
                    let fileDeleted = fs.unlinkSync(filePath)
                }
                userToUpdate.avatar = req.file.filename
            }
            if (userToUpdate.password) {
                let pwd = await bcrypt.hash(userToUpdate.password, 10)
                userToUpdate.password = pwd
            }
            try {
                let userUpdated = await User.findByIdAndUpdate(userIdentity.id, userToUpdate, { new: true })
                if (!userUpdated) {
                    return res.status(400).send({
                        status: "error",
                        message: "Error updating user",
                    })
                }
                return res.status(200).json({
                    status: "success",
                    message: "Data updated successfully",
                    user: userUpdated
                })
            } catch (error) {
                if (error || !userUpdated) {
                    return res.status(500).send({
                        status: "error",
                        message: "Error updating user",
                    })
                }
            }
        })
}

const deleteUser = (req, res) => {
    const idUser = req.user.id
    Estate.find({ realEstate: idUser }).exec(async (error, estates) => {
        if (error) {
            return res.status(500).send({
                status: "error",
                message: "Error deleting user",
            })
        }
        try {
            for (let i = 0; i < estates.length; i++) {
                for (let j = 0; j < estates[i].images.length; j++) {
                    let filePath = "./uploads/estateImages/" + estates[i].images[j]
                    let fileDeleted = fs.unlinkSync(filePath)
                }
            }
        } catch (error) {
            return res.status(500).send({
                status: "error",
                message: "Error deleting user",
            })
        }

    })
    Estate.deleteMany({ "realEstate": idUser }).exec(error => {
        if (error) {
            return res.status(400).send({
                status: "error",
                message: "Error deleting user",
            })
        }
        try {
            if (req.user.avatar != "default.png") {
                let filePath = "./uploads/avatars/" + req.user.avatar
                let fileDeleted = fs.unlinkSync(filePath)
            }
        } catch (error) {
            return res.status(500).send({
                status: "error",
                message: "Error deleting user",
                error: error
            })
        }
        User.findByIdAndDelete(idUser).exec((error, userDeleted) => {
            if (error || !userDeleted) {
                return res.status(400).send({
                    status: "error",
                    message: "Error deleting user",
                })
            }
            return res.status(200).json({
                status: "success",
                message: "User deleted",
                userId: idUser
            })
        })
    })
}

// Exportar acciones
module.exports = {
    pruebaUser,
    register,
    login,
    getUser,
    getMe,
    update,
    deleteUser
}