const mongoose = require("mongoose")
const {DB_USER, DB_PASSWORD, DB_HOST, API_VERSION, IP_SERVER} = require("./constants")
const connectionDB = async() => {
    try{
        mongoose.connect(
            `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/`,
            (error) => {
                if (error) console.log(error)
                console.log("Connection successful")
            }
        )
    } catch(error){
        console.log(error)
        throw new Error("No se ha podido conectar a la base de datos")
    }
}
module.exports = connectionDB