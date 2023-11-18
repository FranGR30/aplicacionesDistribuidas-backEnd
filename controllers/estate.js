const Estate = require("../models/estate")
const fs = require("fs")
const path = require("path")
const { Storage } = require("@google-cloud/storage");
const { error } = require("console")
const bucketUrl = "https://storage.googleapis.com/my-home-storage/estateImages/"
const MaxDistance = 2000;

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
        || !params.frontOrBack || !params.antiquity || !params.orientation || !params.price
        || !params.currency || !params.latitude || !req.files || !params.title || !params.description || !params.rentOrSale
    ) {
        return res.status(400).json({
            status: "error",
            message: "Required fields missing",
        })
    }
    let newEstate = new Estate(params);
    newEstate.location.coordinates.push(req.body.latitude);
    newEstate.location.coordinates.push(req.body.longitude);
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
    newEstate.realEstate = req.user.id;
    newEstate.status = "alquiler - venta";
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

const getEstatesFiltered = async (req, res) => {
    try {
        const filter = {};
        if (req.query.rentOrSale) {
            filter.rentOrSale = req.query.rentOrSale;
        }
        if (req.query.estateType) {
            filter.estateType = req.query.estateType;
        }
        if (req.query.neighborhood) {
            filter.neighborhood = req.query.neighborhood;
        }
        if (req.query.currency) {
            filter.currency = req.query.currency;
        }
        if (req.query.priceMin) {
            filter.price = { $gte: req.query.priceMin };
        }
        if (req.query.priceMax) {
            filter.price = { ...filter.price, $lte: req.query.priceMax };
        }
        if (req.query.roomsAmount) {
            filter.roomsAmount = req.query.roomsAmount;
        }
        if (req.query.bedroomsAmount) {
            filter.bedroomsAmount = req.query.bedroomsAmount;
        }
        if (req.query.bathroomsAmount) {
            filter.bathroomsAmount = req.query.bathroomsAmount;
        }
        if (req.query.state) {
            filter.state = req.query.state;
        }
        if (req.query.amenities) {
            filter.amenites = { $in: req.query.amenities.split(',') };
        }
        const filteredEstates = await Estate.find(filter);

        return res.status(200).json({
            status: 'success',
            message: 'Estates filtered successfully',
            estates: filteredEstates,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error filtering estates',
        });
    }
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

const getNearEstates = async (req, res) => {
    try {
        if (!req.query.latitude || !req.query.longitude) {
            return res.status(400).send({
                status: "error",
                message: "Error. Latitude or longitude missing in parameters",
            })
        }
        const { latitude, longitude } = req.query

        const estatesCercanas = await Estate.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(latitude), parseFloat(longitude)]
                    },
                    $maxDistance: MaxDistance,
                },
            },
            status: "alquiler - venta",
        });
        return res.status(200).json({
            status: "success",
            message: "Estates found",
            estates: estatesCercanas
        })
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error fetching near estates",
        })
    }
}

const bookEstate = async (req, res) => {
    try{
        const estateToBook = await Estate.findById(req.params.estateId);
        if (estateToBook.status != "alquiler - venta") {
            return res.status(400).send({
                status: "error",
                message: "Unable to book estate. Already booked or sold",
            })
        }
        estateToBook.status = "reservada";
        await estateToBook.save();

    } catch (error){
        return res.status(500).send({
            status: "error",
            message: "Error updating estate status",
        })
    }
}

const sellOrRentEstate = async (req, res) => {
    try{
        const estateToSellOrRent = await Estate.findById(req.params.estateId);
        if (estateToBook.status != "reservada") {
            return res.status(400).send({
                status: "error",
                message: "Unable to sell or rent estate. Estate is not in booked status",
            })
        }
        estateToSellOrRent.status = "alquilada - vendida";
        await estateToBook.save();

    } catch (error){
        return res.status(500).send({
            status: "error",
            message: "Error updating estate status",
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
    updateEstate,
    getNearEstates,
    bookEstate,
    sellOrRentEstate,
    getEstatesFiltered
}