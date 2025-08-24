const express = require('express');
const {register, login, logout, adminRegister, deleteProfile} = require('../controllers/userAuthController');
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', userMiddleware, logout);
authRouter.post('/admin/register', adminMiddleware, adminRegister);
authRouter.delete('/deleteProfile', userMiddleware, deleteProfile);
authRouter.get('/check', userMiddleware, (req,res) => {
    const reply = {
        firstName: req.result.firstName,
        emailId: req.result.emailId,
        _id: req.result._id
    }

    res.status(200).json({
        user: reply,
        message: "valid user"
    })
});

// authRouter.post('/profile', getProfile);

module.exports = authRouter;
