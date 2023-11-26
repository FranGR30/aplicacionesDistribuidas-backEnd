const {Schema, model} = require("mongoose")

const calificationSchema = Schema({
    realEstate: {
        type: Schema.ObjectId,
        ref: "Estate"
    },
    user:{
        type: Schema.ObjectId,
        ref: "User"
    },
    calification: {
        type: Number,
        max: 5,
        min: 1,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
})

module.exports = model("calification", calificationSchema)