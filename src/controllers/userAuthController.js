const redisClient = require('../config/redis');
const Submission = require('../models/submission');
const User = require('../models/user');
const validate = require('../utils/validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const register = async (req, res) => {
    try{
        // validate the user data first,
        validate(req.body);

        const {firstName, emailId, password} = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = 'user';

        const user = await User.create(req.body);

        const token = jwt.sign({_id: user._id, emailId: emailId, role:'user'}, process.env.JWT_KEY, {expiresIn: 60*60}); // expiresIn takes time in seconds, so we gave 1 hr
        res.cookie('token', token, {maxAge: 60*60*100}); // here maxAge takes time in miliseconds, so we gave time accordingly
        res.status(201).json("User Registered Successfully");

    }catch(err){
        res.status(400).send("Error: "+err);
    }
}

const login = async (req, res) => {
    try{
        const {emailId, password} = req.body;

        if(!emailId){
            throw new Error("Invalid Credentials");
        }
        if(!password){
            throw new Error("Invalid Credentials");
        }

        const user = await User.findOne({emailId});

        const match = bcrypt.compare(password, user.password);

        if(!match){
            throw new Error("Invalid Credentials");
        }

        const token = jwt.sign({_id: user._id, emailId: emailId, role:user.role}, process.env.JWT_KEY, {expiresIn: 60*60});
        res.cookie('token', token, {maxAge: 60*60*100});

        res.status(200).send("User Logged in Successfully");
    }
    catch(err){
        res.status(401).send("Error: "+err);
    }
}

const logout = async (req, res) => {
    try{
        // validate the token, done using userMiddleware
        const {token} = req.cookies;

        const payload = jwt.decode(token);

        // add the token into redis blocklist to avoid logging in again with that token
        await redisClient.set(`token:${token}`, 'BLOCKED');
        await redisClient.expireAt(`token:${token}`, payload.exp);
        
        // delete the cookies
        res.cookie("token", null, {expires: new Date(Date.now())});
        res.send("Logged out successfully");
    }
    catch(err){
        res.status(503).send("Error: "+err);
    }
}

// if admin has to register someone as user or admin, he has to mention is specifically with all the requireds
const adminRegister = async (req, res) => {
    try{
        // validate the user data first,
        validate(req.body);

        const {firstName, emailId, password} = req.body;

        req.body.password = await bcrypt.hash(password, 10);

        const user = await User.create(req.body);

        const token = jwt.sign({_id: user._id, emailId: emailId, role:user.role}, process.env.JWT_KEY, {expiresIn: 60*60}); // expiresIn takes time in seconds, so we gave 1 hr
        res.cookie('token', token, {maxAge: 60*60*100}); // here maxAge takes time in miliseconds, so we gave time accordingly
        res.status(201).json("User Registered Successfully");

    }catch(err){
        res.status(400).send("Error: "+err);
    }
}

const deleteProfile = async (req, res) => {
    try{
        const userId = req.result._id;

        // delete user from the user schema
        await User.findByIdAndDelete(userId);

        // delete all submissions of the user in submission schema
        // await Submission.deleteMany({userId}); -: this same this can be done using userSchema.post method written in userSchema whnever findByIdAndDelete is exexuted, and findByIdAndDelete is a mongoose command which relate to findOneAndDelete in mongodb

        res.status(200).send("User Deleted Successfully");

    }
    catch(err){
        res.status(500).send("Error: "+err);
    }
    
}


module.exports = {register, login, logout, adminRegister, deleteProfile};