const Estate = require("../models/estate")
const fs = require("fs")
const path = require("path")
const { Storage } = require("@google-cloud/storage");
const { error } = require("console")
const bucketUrl = "https://storage.googleapis.com/my-home-storage/estateImages/"

const gcs = new Storage({
    projectId: 'myhome-403923', // Reemplaza con el ID de tu proyecto en GCP
    keyFilename: 'myKey.json', // Reemplaza con la ubicación de tu archivo de credenciales de GCP
});

// Prueba
const pruebaEstate = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde el controller: controllers/estate.js"
    })
}

const newEstate = async (req, res) => {
    if (req.user.status == "inactive") {
        return res.status(500).send({
            status: "error",
            mensaje: "Unable to perform action. Inactive user"
        })
    }
    let params = req.body
    if (!params.street || !params.addressNumber || !params.neighborhood || !params.state || !params.country
        || !params.estateType || !params.coveredSquareMeters || !params.semiUncoveredSquaremeters
        || !params.uncoveredSquareMeters || !params.roomsAmount || !params.bathroomsAmount
        || !params.bedroomsAmount || !params.terrace || !params.balcony || !params.garage || !params.storage
        || !params.frontOrBack || !params.antiquity || !params.orientation|| !params.status || !params.price 
        || !params.currency || !params.latitude || !req.files || !params.title|| !params.description || !params.rentOrSale
        ) {
        return res.status(400).json({
            status: "error",
            message: "Required fields missing",
        })
    }
    let newEstate = new Estate(params);
    const filePromises = [];
    for (const file of req.files) {
        let image = file.originalname;
        let imageSplit = image.split("\.");
        let extension = imageSplit[1];
        if (extension != "png" && extension != "jpg" && extension != "jpeg") {
            return res.status(400).send({
                status: "error",
                message: "Image/s extension invalid",
            })
        }
        const bucket = gcs.bucket('my-home-storage');
        const fileName = `estateImg-${Date.now()}-${file.originalname}`;
        newEstate.images.push(`${bucketUrl}${fileName}`);
        const blob = bucket.file(`estateImages/${fileName}`);
        const blobStream = blob.createWriteStream();
        filePromises.push(
            new Promise((resolve, reject) => {
                blobStream.on('finish', () => {
                    resolve(`Archivo ${file.originalname} subido exitosamente.`);
                });
                blobStream.on('error', (err) => {
                    reject(`Error al subir ${file.originalname}: ${err}`);
                });

                blobStream.end(file.buffer);
            })
        );
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
    if (req.user.status == "inactive") {
        return res.status(500).send({
            status: "error",
            mensaje: "Unable to perform action. Inactive user"
        })
    }
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


const deleteEstate = (req, res) => {
    const id = req.params.idEstate
    if (req.user.status == "inactive") {
        return res.status(500).send({
            status: "error",
            mensaje: "Unable to perform action. Inactive user"
        })
    }
    Estate.find({ "realEstate": req.user.id, "_id": id }).exec(async (error, estates) => {
        if (error || estates.length < 1) {
            return res.status(500).send({
                status: "error",
                message: "Estate could not be deleted",
            })
        }
        for (const image of estates[0].images) {
            const bucket = gcs.bucket('my-home-storage');
            const filePathSplit = image.split("/")
            const fileName = filePathSplit[filePathSplit.length - 1]
            await bucket.file(`estateImages/${fileName}`).delete();
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
    if (req.user.status == "inactive") {
        return res.status(500).send({
            status: "error",
            mensaje: "Unable to perform action. Inactive user"
        })
    }
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
    const estateId = req.params.estateId;
    const userId = req.user.id;
    const estateToUpdate = req.body;
    if (req.user.status == "inactive") {
        return res.status(500).send({
            status: "error",
            mensaje: "Unable to perform action. Inactive user"
        })
    }
    try {
        Estate.findById(estateId).exec(async (error, estate) => {
            if (error || !estate) {
                return res.status(404).send({
                    status: "error",
                    message: "Estate not found",
                })
            }
            if (estate.realEstate != userId) {
                return res.status(400).send({
                    status: "error",
                    message: "Error updating estate. Unauthorized to modify estate",
                })
            }
            const filePromises = [];
            estateToUpdate.images = []
            //Verifica extension de los archivos y las sube a google cloud
            for (let file of req.files) {
                let image = file.originalname
                let imageSplit = image.split("\.")
                let extension = imageSplit[1]
                if (extension != "png" && extension != "jpg" && extension != "jpeg") {
                    return res.status(400).send({
                        status: "error",
                        message: "Image/s extension invalid",
                    })
                }
                const bucket = gcs.bucket('my-home-storage');
                const fileName = `estateImg-${Date.now()}-${file.originalname}`;
                estateToUpdate.images.push(`${bucketUrl}${fileName}`);
                const blob = bucket.file(`estateImages/${fileName}`);
                const blobStream = blob.createWriteStream();
                filePromises.push(
                    new Promise((resolve, reject) => {
                        blobStream.on('finish', () => {
                            resolve(`Archivo ${file.originalname} subido exitosamente.`);
                        });
                        blobStream.on('error', (err) => {
                            reject(`Error al subir ${file.originalname}: ${err}`);
                        });
                        blobStream.end(file.buffer);
                    })
                );
            }
            //Elimina las imagenes antiguas de google cloud
            try {
                for (const image of estate.images) {
                    const bucket = gcs.bucket('my-home-storage');
                    const filePathSplit = image.split("/")
                    const fileName = filePathSplit[filePathSplit.length - 1]
                    await bucket.file(`estateImages/${fileName}`).delete();
                }
            } catch (error) {
                console.error(error);
            }
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
        })
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error updating estate",
        })
    }


}

// Exportar acciones
module.exports = {
    pruebaEstate,
    newEstate,
    getEstate,
    deleteEstate,
    getEstatesfromUser,
    updateEstate
}