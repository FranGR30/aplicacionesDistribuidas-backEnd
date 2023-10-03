const {Schema, model} = require("mongoose")

const UserSchema = Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    telephone: {
        type: String,
        required: true
    },
    telephone2: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    email2: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: "role_user"
    },
    created_at:{
        type: Date,
        default: Date.now
    },
    confirmationCode: {
        type: String
    },
    password: {
        type: String,
        required: true
    }
})

module.exports = model("user", UserSchema)