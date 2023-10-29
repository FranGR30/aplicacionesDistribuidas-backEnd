// Importar dependencias
const connectionDB = require("./connection")
const express = require("express")
const cors = require("cors")

// Mensaje bienvenida
console.log("MyHome start");

// Coneccion a la bbdd
connectionDB();

// Crear servidor node
const app = express()
const port = 3900

// Configurar cors
app.use(cors())

// Convertir los datos del body a objetos js
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// Cargar conf rutas
const userRoutes = require("./router/user")
const estateRoutes = require("./router/estate")
const contactRoutes = require("./router/contact")
const calificationRoutes = require("./router/calification")

app.use("/my-home/users", userRoutes)
app.use("/my-home/estates", estateRoutes)
app.use("/my-home/contacts", contactRoutes)
app.use("/my-home/califications", calificationRoutes)

// Prueba
app.get("/ruta-prueba", (req, res) => {
    return res.status(200).json(
        {
            "mensaje": "holaMundo"
        }
    )
})

// Poner servidor a escuchar peticiones http
app.listen(port, () => {
    console.log("Node server running in port:", port);
})