const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("../services/jwt")
const Estate = require("../models/estate")
const Favorite = require("../models/favorite")
const fs = require("fs")
const path = require("path")
const DEFAULT_IMG = "default.png"
const PATH_AVATARS = "./uploads/avatars/"
const nodemailer = require("nodemailer")
const user = require("../models/user")
const codeLength = 6

const config = {
    host : 'smtp.gmail.com',
    port : 587,
    auth: {
        user : 'denveruniversity30@gmail.com',
        pass : 'dbqi cxvt bewt qcjp',
    }
}

const transport = nodemailer.createTransport(config);

function generarCodigoAlfanumerico(length) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * caracteres.length);
      codigo += caracteres.charAt(randomIndex);
    }
    return codigo;
}

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
    if (!params.name || !params.email || !params.password || !params.telephone) {
        return res.status(400).json({
            status: "error",
            message: "Required fields missing",
        })
    }
    if (req.file) {
    let image = req.file.originalname
    let imageSplit = image.split("\.")
    let extension = imageSplit[1]
        if (extension != "png" && extension != "jpg" && extension != "jpeg") {
            let filePath = req.file.path
            fs.unlinkSync(filePath)
            return res.status(400).send({
                status: "error",
                message: "Image/s extension invalid",
            })
        }
    }
    if (!params.email2) {
        params.email2 = params.email
    }
    User.find({
        $or: [
            { email: params.email.toLowerCase() },
            { email: params.email2.toLowerCase() },
            { email2: params.email.toLowerCase() },
            { email2: params.email2.toLowerCase() },
            { telephone: params.telephone },
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
            newUser.avatar = DEFAULT_IMG
        }
        const code = generarCodigoAlfanumerico(codeLength)
        newUser.confirmationCode = code
        newUser.save(async (error, userStored) => {
            if (error || !userStored) {
                return res.status(500).send({
                    status: "error",
                    message: "Error at saving user",
                })
            }
            if (userStored) {
                try{
                    const mensaje = {
                        from: 'denveruniversity30@gmail.com',
                        to: params.email,
                        subject: "Confirmation code",
                        text: "Codigo de confirmacion: " + code,
                    };
                    await transport.sendMail(mensaje);
                    return res.status(200).json({
                        status: "success",
                        message: "Code sent",
                    })
                } catch(error){
                    return res.status(500).send({
                        status: "error",
                        message: "Error at saving user",
                    })
                }
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
            if (user.status == "inactive") {
                return res.status(400).json({
                    status: "error",
                    message: "Error. User inactive",
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
            { email2: params.email.toLowerCase() },
            { telephone: userToUpdate.telephone },  
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
                    fs.unlinkSync(filePath)
                    return res.status(400).send({
                        status: "error",
                        message: "Image/s extension invalid",
                    })
                }
                if (req.file.filename != DEFAULT_IMG) {
                    let filePath = PATH_AVATARS + req.user.avatar
                    fs.unlinkSync(filePath)
                }
                console.log(req.file);
                userToUpdate.avatar = req.file.filename
            } else {
                let filePath = PATH_AVATARS + req.user.avatar
                fs.unlinkSync(filePath)
                userToUpdate.avatar = DEFAULT_IMG
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
            //Eliminando imagenes de las propiuedades del usuario
            for (const element of estates) {
                for (let j = 0; j < element.images.length; j++) {
                    let filePath = "./uploads/estateImages/" + element.images[j]
                    fs.unlinkSync(filePath)
                }
            }
        } catch (error) {
            return res.status(500).send({
                status: "error",
                message: "Error deleting user",
            })
        }

    })
    //Eliminando los favoritos del usuario
    Favorite.deleteMany({user:idUser}).exec(error => {
        if (error) {
            return res.status(400).send({
                status: "error",
                message: "Error deleting user",
            })
        }
    })
    //Eliminando propiedades del usuario
    Estate.deleteMany({ "realEstate": idUser }).exec(error => {
        if (error) {
            return res.status(400).send({
                status: "error",
                message: "Error deleting user",
            })
        }
        try {
            if (req.user.avatar != DEFAULT_IMG) {
                let filePath = "./uploads/avatars/" + req.user.avatar
                fs.unlinkSync(filePath)
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

const getAvatar = (req, res) => {
    const file = req.params.file
    const filePath = PATH_AVATARS + file
    console.log(filePath);
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

const verifyCode = async (req, res) => {
    const userEmail = req.body.email
    const code = req.body.code.toUpperCase()
    await User.find({
        email: userEmail
    }).exec( async (error, users) => {
        if (error || users.length == 0) {
            return res.status(404).send({
                status: "error",
                message: "User not found or an error has occured",
            })
        }
        const userToVerify = users[0]
        if (userToVerify.confirmationCode != code) {
            return res.status(400).send({
                status: "error",
                message: "Information sent is incorrect",
            })
        }
        if (userToVerify.status == "active") {
            userToVerify.passwordRecovery = true
        }
        userToVerify.status = "active"
        await User.findByIdAndUpdate(userToVerify._id, userToVerify, { new: true }).exec((error, userUpdated) => {
            if (error || !userUpdated) {
                return res.status(500).send({
                    status: "error",
                    message: "Error verifying code",
                })
            }
            return res.status(200).json({
                status: "success",
                message: "Code verified correctly",
                user: userUpdated
            })
        })
    })
}


const sendConfirmationCodeForgotPassword = async (req,res) => {
    await User.find({
        email: req.body.email
    }).exec( async (error, users) => {
        if (error || users.length == 0) {
            return res.status(404).send({
                status: "error",
                message: "Email not found or an error has occured",
            })
        }
        try{
            const email = req.body.email
            const code = generarCodigoAlfanumerico(codeLength)
            const mensaje = {
                from: 'denveruniversity30@gmail.com',
                to: email,
                subject: "Confirmation code",
                text: "Codigo de confirmacion: " + code,
            };
            await transport.sendMail(mensaje);
            const user = users[0]
            user.confirmationCode = code
            await User.findByIdAndUpdate(user._id, user, { new: true }).exec((error, userUpdated) => {
            if (error || !userUpdated) {
                return res.status(500).send({
                    status: "error",
                    message: "Error verifying code",
                })
            }
            return res.status(200).json({
                status: "success",
                message: "Code sent correctly",
                user: userUpdated
            })
        })
        } catch(error){
            console.error('Error al enviar el correo electronico', error);
            res.status(500).send('Error al enviar el correo electronico');
        }
    })
}

const passwordChange = async (req, res) => {
    await User.find({
        email: req.body.email
    }).exec( async (error, users) => {
        if (error || users.length == 0) {
            return res.status(404).send({
                status: "error",
                message: "Email not found or an error has occured",
            })
        }
        const user = users[0]
        if (!user.passwordRecovery) {
            return res.status(400).send({
                status: "error",
                message: "Error changing the password",
            })
        }
        user.passwordRecovery = false
        let pwd = await bcrypt.hash(req.body.password, 10)
        user.password = pwd
        await User.findByIdAndUpdate(user._id, user, { new: true }).exec(async (error, userUpdated) => {
            if (error || !userUpdated) {
                return res.status(500).send({
                    status: "error",
                    message: "Error changing password",
                })
            }
            const mensaje = {
                from: 'denveruniversity30@gmail.com',
                to: req.body.email,
                subject: "Modificacion de contraseña exitosa",
                text: userUpdated.name + " tu contraseña ha sido modificada con exito ;)",
            }
            await transport.sendMail(mensaje);
            return res.status(200).json({
                status: "success",
                message: "Password changed successfully",
                user: userUpdated
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
    deleteUser,
    getAvatar,
    sendConfirmationCodeForgotPassword,
    verifyCode,
    passwordChange
}