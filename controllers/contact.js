const { EqualizerTwoTone } = require("@mui/icons-material")
const Contact = require("../models/contact")
// Prueba
const pruebaContact = (req,res) => {
    return res.status(200).send({
        menaje:"Mensaje enviado desde el controller: controllers/contact.js"
    })
}

const createContact = async (req, res) => {
    if(req.user.status == "inactive") {
        return res.status(500).send({
            status: "error",
            mensaje:"Unable to perform action. Inactive user"
        })
    }
    if (req.body.realEstate == req.user.id) {
        return res.status(500).send({
            status: "error",
            mensaje:"Unable to perform action"
        })
    }
    if (!Date(req.body.date)) {
        return res.status(500).send({
            status: "error",
            mensaje:"Invalid date"
        })
    }
    const params = req.body
    let newContact = new Contact(params)
    newContact.user = req.user.id
    if (newContact.date == undefined) {
        return res.status(500).send({
            status: "error",
            mensaje:"Invalid date"
        })
    }
    if (newContact.date < Date.now()) {
        return res.status(500).send({
            status: "error",
            mensaje:"Unable to perform action"
        })
    }
    console.log(newContact.date);
    await Contact.find({
        $and:[
            {"realEstate":newContact.realEstate},
            {"user": newContact.user},
            {"visitShift": newContact.visitShift}
        ]
    }).exec(async (error, contacts) => {
        if (error) {
            return res.status(500).send({
                status: "error",
                mensaje:"Unable to perform action"
            })
        }
        for (let i = 0; i < contacts.length; i++) {
            if (contacts[i].date.getDate() == newContact.date.getDate() && contacts[i].date.getMonth() == newContact.date.getMonth()) {
                return res.status(500).send({
                    status: "error",
                    mensaje:"Visit already booked for the selected day and shift"
                })
            }
        }
        newContact.save((error, contactStored) => {
            if (error || !contactStored) {
                return res.status(500).send({
                    status: "error",
                    mensaje:"Unable to perform action"
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

const getContacts = async (req,res) => {
    if(req.user.status == "inactive") {
        return res.status(500).send({
            status: "error",
            mensaje:"Unable to perform action. Inactive user"
        })
    }
    const typeOfContact = req.params.typeOfContact
    console.log(req.user);
    if (req.user.role == "user") {
        await Contact.find({
            $and: [
                {"user": req.user.id},
                {"type": typeOfContact}
            ]
        }).exec((error, contacts) => {
            if (error || contacts.length <= 0) {
                return res.status(404).send({
                    status: "error",
                    mensaje:"Unable to perform action of contact not found"
                })
            }
            return res.status(200).json({
                status: "success",
                message: "Contacts found",
                contacts: contacts
            })
        })
    }else {
        console.log(req.user.id);
        console.log(typeOfContact);
        await Contact.find({
            $and: [
                {"realEstate": req.user.id},
                {"type": typeOfContact}
            ]
        }).exec((error, contacts) => {
            if (error || contacts.length <= 0) {
                return res.status(404).send({
                    status: "error",
                    mensaje:"Unable to perform action of contact not found"
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

// Exportar acciones
module.exports = {
    pruebaContact,
    createContact,
    getContacts
}