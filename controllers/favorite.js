const Favorite = require("../models/favorite")
const User = require("../models/user")
const Estate = require("../models/estate")

const addFavorite = (req,res) => {
    const userId = req.user.id
    const idEstate = req.params.estateId
    const newFavorite = new Favorite()
    newFavorite.user = userId
    newFavorite.estate = idEstate
    if (req.user.role == "realEstate") {
        return res.status(500).send({
            status: "error",
            message: "Unable to perform action. Type of user should be user",
        })
    }
    Estate.findById(idEstate).exec((error, estate) => {
        if (error || !estate) {
            return res.status(500).send({
                status: "error",
                message: "Error at saving favorite. Estate not found",
            })
        }
        Favorite.find({
            $and: [
            {user: userId},
            {estate: idEstate}
            ]
        }).exec(async (error, favorites) => {
            if(error || favorites.length >= 1) {
                return res.status(500).send({
                    status: "error",
                    message: "Error at saving favorite or favorite already exists",
                })
            }
            await newFavorite.save((error, favoriteStored) => {
                if (error || !favoriteStored) {
                    return res.status(500).send({
                        status: "error",
                        message: "Error at saving favorite",
                    })
                }
                if (favoriteStored) {
                    return res.status(200).json({
                        status: "success",
                        message: "Favorite created successfully",
                        favorite: favoriteStored
                    })
                }
            })
        })
    })
    
}

const unFavorite = (req,res) => {
    const userId = req.user.id
    const idEstate = req.params.estateId
    Favorite.find({
        $and: [
        {user: userId},
        {estate: idEstate}
        ]
    }).exec(async (error, favorites) => {
        if (error || favorites.length == 0) {
            return res.status(500).send({
                status: "error",
                message: "Error removing favorite",
            })
        }
        await Favorite.findByIdAndDelete(favorites[0].id).exec((error, favoriteRemoved) => {
            if (error || !favoriteRemoved) {
                return res.status(500).send({
                    status: "error",
                    message: "Error removing favorite",
                })
            }
            return res.status(200).json({
                status: "success",
                message: "Favorite removed successfully",
                favorite: favoriteRemoved
            })
        })
    })
}

const viewFavorites = (req,res) => {
    Favorite.find(
        {user: req.user.id}
    ).exec(async (error, favorites) => {
        if (error || favorites.length < 0) {
            return res.status(500).send({
                status: "error",
                message: "Error finding favorites or favorites not found",
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Favorites found",
            favorites: favorites
        })
    })
}

module.exports = {
    addFavorite,
    unFavorite,
    viewFavorites
}