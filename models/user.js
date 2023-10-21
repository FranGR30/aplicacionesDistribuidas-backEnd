const { Schema, model } = require("mongoose")

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
        default: "user",
        enum: ['user', 'realEstate']
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    confirmationCode: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    nickName: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    status: {
        type: String,
        default: "inactive",
        enum: ["active", "inactive"]
    },
    passwordRecovery: {
        type: Boolean,
        default: false
    }

})

module.exports = model("user", UserSchema)