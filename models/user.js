const {Schema, model} = require("mongoose")
const EstateSchema = require("./estate")

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
    },
    nickName: {
        type: String,
        required: true
    },
    estates: [{
        street: {
            type: String,
            required: true
        },
        addressNumber: {
            type: Number,
            required: true
        },
        neighborhood: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        estateType: {
            type: String,
            required: true,
            enum: ['casa', 'ph', 'departamento', 'local', 'oficina', 'galpon', 'terreno']
        },
        coveredSquareMeters: {
            type: Number,
            required: true
        },
        semiUncoveredSquaremeters: {
            type: Number,
            required: true
        },
        uncoveredSquareMeters: {
            type: Number,
            required: true
        },
        roomsAmount: {
            type: Number,
            required: true
        },
        bathroomsAmount: {
            type: Number,
            required: true
        },
        bedroomsAmount: {
            type: Number,
            required: true
        },
        terrace: {
            type: Boolean,
            required: true
        },
        balcony: {
            type: Boolean,
            required: true
        },
        storage: {
            type: Boolean,
            required: true
        },
        garage: {
            type: Number,
            required: true
        },
        frontOrBack: {
            type: String,
            required: true,
            enum: ['frente', 'contrafrente']
        },
        antiquity: {
            type: Number,
            required: true
        },
        orientation: {
            type: String,
            required: true,
            enum: ['norte', 'sur', 'este', 'oeste']
        },
        amenites: [{
            type: String,
            required: true
        }],
        status: {
            type: String,
            required: true,
            enum: ['alquiler', 'venta', 'reservada', 'alquilada', 'vendida']
        },
        price: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            required: true,
            enum: ['dolar', 'peso']
        },
        latitude: {
            type: String,
            required: true,
        },
        longitude: {
            type: String,
            required: true,
        }
    }],
    califications: [{

    }],
    favorites:[{
        street: {
            type: String,
            required: true
        },
        addressNumber: {
            type: Number,
            required: true
        },
        neighborhood: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        estateType: {
            type: String,
            required: true,
            enum: ['casa', 'ph', 'departamento', 'local', 'oficina', 'galpon', 'terreno']
        },
        coveredSquareMeters: {
            type: Number,
            required: true
        },
        semiUncoveredSquaremeters: {
            type: Number,
            required: true
        },
        uncoveredSquareMeters: {
            type: Number,
            required: true
        },
        roomsAmount: {
            type: Number,
            required: true
        },
        bathroomsAmount: {
            type: Number,
            required: true
        },
        bedroomsAmount: {
            type: Number,
            required: true
        },
        terrace: {
            type: Boolean,
            required: true
        },
        balcony: {
            type: Boolean,
            required: true
        },
        storage: {
            type: Boolean,
            required: true
        },
        garage: {
            type: Number,
            required: true
        },
        frontOrBack: {
            type: String,
            required: true,
            enum: ['frente', 'contrafrente']
        },
        antiquity: {
            type: Number,
            required: true
        },
        orientation: {
            type: String,
            required: true,
            enum: ['norte', 'sur', 'este', 'oeste']
        },
        amenites: [{
            type: String,
            required: true
        }],
        status: {
            type: String,
            required: true,
            enum: ['alquiler', 'venta', 'reservada', 'alquilada', 'vendida']
        },
        price: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            required: true,
            enum: ['dolar', 'peso']
        },
        latitude: {
            type: String,
            required: true,
        },
        longitude: {
            type: String,
            required: true,
        }
    }]
})

module.exports = model("user", UserSchema)