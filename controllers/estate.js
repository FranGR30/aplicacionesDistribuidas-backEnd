// Prueba
const pruebaEstate = (req,res) => {
    return res.status(200).send({
        menaje:"Mensaje enviado desde el controller: controllers/estate.js"
    })
}

// Exportar acciones
module.exports = {
    pruebaEstate
}