const {schema, model} = require("mongoose")

const calificationSchema = schema({
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
    }
})

module.exports = model("calification", calificationSchema)