const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis');

const adminMiddleware = async (req, res, next) => {

    try {
        const {token} = req.cookies;
        if(!token) {
            throw new Error("Token is absent");
        }

        const payload = jwt.verify(token, process.env.JWT_KEY);

        const {_id} = payload;

        if(!_id){
            throw new Error("Invalid Token");
        }

        const result = await User.findById(_id);

        // check if the user is admin or not
        if(payload.role != 'admin'){
            throw new Error("Invalid Token");
        }

        if(!result){
            throw new Error("User does not exists");
        }

        // whether the user is present in redis blocklist or not

        const isBlocked = await redisClient.exists(`token:${token}`);

        if(isBlocked){
            throw new Error("Invalid Token");
        }

        req.result = result;

        next();

    }
    catch(err){
        res.status(401).send("Error: "+err);
    }
}

module.exports = adminMiddleware;