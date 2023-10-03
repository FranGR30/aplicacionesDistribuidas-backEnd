// Prueba
const pruebaContact = (req,res) => {
    return res.status(200).send({
        menaje:"Mensaje enviado desde el controller: controllers/contact.js"
    })
}

// Exportar acciones
module.exports = {
    pruebaContact
}