const {Schema, model} = require("mongoose")

const FavoriteSchema = Schema({
    user: {
        type: Schema.ObjectId,
        ref: "User"
    },
    estate: {
        type: Schema.ObjectId,
        ref: "Estate"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
})

module.exports = model("favorite", FavoriteSchema)