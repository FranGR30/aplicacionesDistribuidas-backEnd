const libjwt = require("../services/jwt")
const secret = libjwt.secret
const jwt = require("jwt-simple")
const moment = require("moment")

const auth = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).send({
            status:"error",
            message:"Authentication failed"
        })
    }
    let token = req.headers.authorization.replace(/[´¨"]+/g, "")
    try {
        let payload = jwt.decode(token, secret)
        if (payload.exp <= moment().unix()) {
            return res.status(401).send({
                status:"error",
                message:"Token expired",
            })
        }
        req.user = payload
    } catch (error) {
        return res.status(404).send({
            status:"error",
            message:"Authentication failed",
        })
    }
    
    next()
}

module.exports = {
    auth
}