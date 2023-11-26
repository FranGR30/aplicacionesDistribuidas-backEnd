const {Schema, model} = require("mongoose")

const contactSchema = Schema({
    realEstate: {
        type: Schema.ObjectId,
        ref: "User"
    },
    user: {
        type: Schema.ObjectId,
        ref: "User"
    },
    estate:{
        type:Schema.ObjectId,
        ref: "Estate"
    },
    type: {
        type: String,
        enum: ["question", "visit"]
    },
    date: {
        type: Date,
    },
    comment: {
        type: String,
    },
    visitShift: {
        type: String,
        enum: ["morning", "afternoon"],
    }
})

module.exports = model("contact", contactSchema)