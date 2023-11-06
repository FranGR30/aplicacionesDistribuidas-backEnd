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
const { Storage } = require("@google-cloud/storage");
const { error } = require("console")
const bucketUrl = "https://storage.googleapis.com/my-home-storage/avatar/"

const config = {
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'denveruniversity30@gmail.com',
        pass: 'dbqi cxvt bewt qcjp',
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
const gcs = new Storage({
    projectId: 'myhome-403923', // Reemplaza con el ID de tu proyecto en GCP
    keyFilename: 'myKey.json', // Reemplaza con la ubicación de tu archivo de credenciales de GCP
});
const upload = async (req, res) => {
    console.log("Made it /upload");
    try {
        if (req.file) {
            console.log("File found, trying to upload...");
            const fileName = `avatarImg-${Date.now()}-${req.file.originalname}`
            const bucket = gcs.bucket('my-home-storage');
            const blob = bucket.file(`avatar/${fileName}`);
            await blob.save(req.file.buffer);
            const publicUrl = `${bucketUrl}${fileName}`;
            res.status(200).json({
                message: "Imagen cargada con exito",
                imageUrl: publicUrl
            });
        }
    } catch (error) {
        console.error("error gcs", error);
        res.status(500).json({
            error: error
        });
    }
};

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
        console.error(error);
        return res.status(400).json({
            status: "error",
            message: "Required fields missing",
        })
    }
    if (req.file) {
        return res.status(400).json({
            status: "error",
            message: "Error. No files allowed in the request",
        })
    }
    if (!params.email2) {
        params.email2 = params.email;
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
        newUser.email.toLowerCase();
        newUser.email2.toLowerCase();
        newUser.role = "realEstate"
        newUser.password = pwd
        newUser.avatar = `${bucketUrl}${DEFAULT_IMG}`
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
                try {
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
                } catch (error) {
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
    if (req.user.status == "inactive") {
        return res.status(500).send({
            status: "error",
            mensaje: "Unable to perform action. Inactive user"
        })
    }
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
    if (req.user.status == "inactive") {
        return res.status(500).send({
            status: "error",
            mensaje: "Unable to perform action. Inactive user"
        })
    }
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
    if (!userToUpdate.email2) {
        userToUpdate.email2 = userToUpdate.email
    }
    if (req.user.status == "inactive") {
        return res.status(500).send({
            status: "error",
            mensaje: "Unable to perform action. Inactive user"
        })
    }
    User.find({
        $or: [
            { email: userToUpdate.email.toLowerCase() },
            { email: userToUpdate.email2.toLowerCase() },
            { email2: userToUpdate.email.toLowerCase() },
            { email2: userToUpdate.email2.toLowerCase() },
            { telephone: userToUpdate.telephone },
        ]
    }).exec(async (error, users) => {
        if (error) {
            return res.status(500).json({
                status: "error",
                message: "Error trying to find users",
            })
        }
        let userIsSet = false;
        users.forEach(user => {
            if (user && user._id != userIdentity.id) {
                userIsSet = true
            }
        });
        if (userIsSet) {
            return res.status(400).send({
                status: "error",
                message: "User already registered",
            })
        }
        if (req.user.email != userToUpdate.email.toLowerCase()) {
            return res.status(400).json({
                status: "error",
                message: "Error. Email cant be modified",
            })
        }
        try {
            if (req.file) {
                let image = req.file.originalname
                let imageSplit = image.split("\.")
                let extension = imageSplit[1]
                if (extension != "png" && extension != "jpg" && extension != "jpeg") {
                    return res.status(400).send({
                        status: "error",
                        message: "Image/s extension invalid",
                    })
                }
                const bucket = gcs.bucket('my-home-storage');
                if (users[0].avatar != `${bucketUrl}${DEFAULT_IMG}`) {
                    const filePath = users[0].avatar;
                    const filePathSplit = filePath.split("/")
                    const fileName = filePathSplit[filePathSplit.length - 1]
                    await bucket.file(`avatar/${fileName}`).delete();
                }
                const fileName = `avatarImg-${Date.now()}-${req.file.originalname}`
                userToUpdate.avatar = `${bucketUrl}${fileName}`
                const blob = bucket.file(`avatar/${fileName}`);
                await blob.save(req.file.buffer);
            }
            if (userToUpdate.password) {
                let pwd = await bcrypt.hash(userToUpdate.password, 10)
                userToUpdate.password = pwd
            }
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
                    error: error
                })
            }
        }
    })
}

const deleteUser = async (req, res) => {
    const idUser = req.user.id;
    if (req.user.status == "inactive") {
        return res.status(500).send({
            status: "error",
            mensaje: "Unable to perform action. Inactive user"
        })
    }
    try {
        await User.findById(idUser).exec(async (error, userToDelete) => {
            if (error || !userToDelete) {
                return res.status(400).send({
                    status: "error",
                    message: "Error deleting user. User not found",
                })
            }
            Estate.find({ realEstate: idUser }).exec(async (error, estates) => {
                if (error) {
                    return res.status(500).send({
                        status: "error",
                        message: "Error deleting user",
                        error: error,
                        algo: "algo"
                    })
                }
                //Eliminando imagenes de las propiedades del usuario
                for (const estate of estates) {
                    for (const image of estate.images) {
                        const bucket = gcs.bucket('my-home-storage');
                        const filePathSplit = image.split("/")
                        const fileName = filePathSplit[filePathSplit.length - 1]
                        await bucket.file(`estateImages/${fileName}`).delete();
                    }
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
            })
            //Eliminando los favoritos del usuario
            Favorite.deleteMany({ user: idUser }).exec(error => {
                if (error) {
                    return res.status(400).send({
                        status: "error",
                        message: "Error deleting user",
                    })
                }
            })
            //Eliminando el avatar del usuario en caso de que no sea default
            if (userToDelete.avatar != `${bucketUrl}${DEFAULT_IMG}`) {
                const bucket = gcs.bucket('my-home-storage');
                const filePath = userToDelete.avatar;
                const filePathSplit = filePath.split("/")
                const fileName = filePathSplit[filePathSplit.length - 1]
                await bucket.file(`avatar/${fileName}`).delete();
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
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error deleting user",
            error: error
        })
    }
}

const verifyCode = async (req, res) => {
    const userEmail = req.body.email
    const code = req.body.code.toUpperCase()
    await User.find({
        email: userEmail
    }).exec(async (error, users) => {
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


const sendConfirmationCodeForgotPassword = async (req, res) => {
    await User.find({
        email: req.body.email
    }).exec(async (error, users) => {
        if (error || users.length == 0) {
            return res.status(404).send({
                status: "error",
                message: "Email not found or an error has occured",
            })
        }
        try {
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
        } catch (error) {
            console.error('Error al enviar el correo electronico', error);
            res.status(500).send('Error al enviar el correo electronico');
        }
    })
}

const passwordChange = async (req, res) => {
    await User.find({
        email: req.body.email
    }).exec(async (error, users) => {
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
    sendConfirmationCodeForgotPassword,
    verifyCode,
    passwordChange,
    upload
}