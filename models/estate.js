const {Schema, model} = require("mongoose")
const user = require("./user")

const EstateSchema = Schema({
    street: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    floor: {
        type: String
    },
    expenseCurrency: {
        type: String,
        enum: ['dolar', 'peso']
    },
    expenses: {
        type: String,
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
    }],
    rentOrSale: {
        type: String,
        required: true,
        enum: ['alquiler', 'venta']
    },
    status: {
        type: String,
        required: true,
        enum: ['alquiler - venta', 'reservada', 'alquilada - vendida']
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
    videoUrl: {
        type: String,
        required: false,
    },
    images: [{
        type: String,
        required: false
    }],
    realEstate: {
        type: Schema.ObjectId,
        ref: "user"
    },
    location: {
        type: {type: String, default: "Point"},
        coordinates:[Number]
    },
    reservedBy: {
        type: Schema.ObjectId,
        ref: "user"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
})

module.exports = model("estate", EstateSchema)