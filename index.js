// Importar dependencias
const connectionDB = require("./connection")
const express = require("express")
const cors = require("cors")
const multer = require("multer")
const { Storage } = require("@google-cloud/storage");
const storageMulter = multer.memoryStorage();

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
app.use(express.urlencoded({ extended: true }))

// Cargar conf rutas
const userRoutes = require("./router/user")
const estateRoutes = require("./router/estate")
const contactRoutes = require("./router/contact")
const calificationRoutes = require("./router/calification")

app.use("/my-home/users", userRoutes)
app.use("/my-home/estates", estateRoutes)
app.use("/my-home/contacts", contactRoutes)
app.use("/my-home/califications", calificationRoutes)

const uploadMulter = multer({
    storage: storageMulter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
const gcs = new Storage({
    projectId: 'myhome-403923', // Reemplaza con el ID de tu proyecto en GCP
    keyFilename: 'myKey.json', // Reemplaza con la ubicación de tu archivo de credenciales de GCP
});
app.post("/upload", uploadMulter.single("imgfile"), async (req, res) => {
    console.log("Made it /upload");
    try {
        if (req.file) {
            console.log("File found, trying to upload...");
            const bucket = gcs.bucket('my-home-storage');
            const blob = bucket.file(req.file.originalname);
            await blob.save(req.file.buffer);
            const publicUrl = `https://storage.googleapis.com/my-home-storage/${req.file.originalname}`;
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
});
// Poner servidor a escuchar peticiones http
app.listen(port, () => {
    console.log("Node server running in port:", port);
})