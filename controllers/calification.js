// Prueba
const pruebaCalification = (req,res) => {
    return res.status(200).send({
        menaje:"Mensaje enviado desde el controller: controllers/user.js"
    })
}

// Exportar acciones
module.exports = {
    pruebaCalification
}