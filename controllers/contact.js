const Contact = require("../models/contact")
// Prueba
const pruebaContact = (req, res) => {
    return res.status(200).send({
        mensaje: "Mensaje enviado desde el controller: controllers/contact.js"
    })
}

const createContact = async (req, res) => {
    if (req.user.status == "inactive") {
        return res.status(500).send({
            status: "error",
            mensaje: "Unable to perform action. Inactive user"
        })
    }
    if (req.body.realEstate == req.user.id) {
        return res.status(500).send({
            status: "error",
            mensaje: "Unable to perform action"
        })
    }
    const params = req.body
    let newContact = new Contact(params)
    newContact.user = req.user.id
    if (req.body.type == "visit") {
        if (newContact.date == undefined || !Date(req.body.date) || newContact.date < Date.now()) {
            return res.status(500).send({
                status: "error",
                mensaje: "Invalid date"
            })
        }
    }
    await Contact.find({
        $and: [
            { "estate": newContact.estate },
            { "realEstate": newContact.realEstate },
            { "user": newContact.user },
            { "visitShift": newContact.visitShift }
        ]
    }).exec(async (error, contacts) => {
        if (error) {
            return res.status(500).send({
                status: "error",
                mensaje: "Unable to perform action"
            })
        }
        if (req.body.type == "visit") {
            for (const element of contacts) {
                if (element.date.getDate() == newContact.date.getDate() && element.date.getMonth() == newContact.date.getMonth() && element.visitShift == newContact.visitShift) {
                    return res.status(500).send({
                        status: "error",
                        mensaje: "Visit already booked for the selected day and shift"
                    })
                }
            }
        }
        newContact.save((error, contactStored) => {
            if (error || !contactStored) {
                return res.status(500).send({
                    status: "error",
                    mensaje: "Unable to perform action"
                })
            }
            return res.status(200).json({
                status: "success",
                message: "Contact stored successfully",
                contact: contactStored
            })
        })
    })
}

const getContacts = async (req, res) => {
    if (req.user.status == "inactive") {
        return res.status(500).send({
            status: "error",
            mensaje: "Unable to perform action. Inactive user"
        })
    }
    const typeOfContact = req.params.typeOfContact
    if (req.user.role == "user") {
        await Contact.find({
            $and: [
                { "user": req.user.id },
                { "type": typeOfContact }
            ]
        }).exec((error, contacts) => {
            if (error || contacts.length <= 0) {
                return res.status(404).send({
                    status: "error",
                    mensaje: "Unable to perform action of contact not found"
                })
            }
            return res.status(200).json({
                status: "success",
                message: "Contacts found",
                contacts: contacts
            })
        })
    } else {
        await Contact.find({
            $and: [
                { "realEstate": req.user.id },
                { "type": typeOfContact }
            ]
        }).exec((error, contacts) => {
            if (error || contacts.length <= 0) {
                return res.status(404).send({
                    status: "error",
                    mensaje: "Unable to perform action of contact not found"
                })
            }
            return res.status(200).json({
                status: "success",
                message: "Contacts found",
                contacts: contacts
            })
        })
    }
}

const deleteContact = async (req, res) => {
    const contactId = req.params.contactId
    if (req.user.status == "inactive") {
        return res.status(500).send({
            status: "error",
            mensaje: "Unable to perform action. Inactive user"
        })
    }
    await Contact.findById(contactId).exec((error, contact) => {
        if (error || !contact) {
            return res.status(404).send({
                status: "error",
                mensaje: "Unable to perform action of contact not found"
            })
        }
        if (req.user.role == "user" && req.user.id != contact.user) {
            return res.status(500).send({
                status: "error",
                mensaje: "Unable to perform action"
            })
        }
        console.log(contact.realEstate);
        console.log(req.user.id);
        if (req.user.role == "realEstate" && req.user.id != contact.realEstate) {
            return res.status(500).send({
                status: "error",
                mensaje: "Unable to perform action"
            })
        }
        Contact.findByIdAndDelete(contactId).exec((error, contactDeleted) => {
            if (error) {
                return res.status(500).send({
                    status: "error",
                    mensaje: "Unable to perform action"
                })
            }
            return res.status(200).json({
                status: "success",
                message: "Contacts deleted",
                contactId: contactDeleted._id
            })
        })
    })
}

// Exportar acciones
module.exports = {
    pruebaContact,
    createContact,
    getContacts,
    deleteContact
}