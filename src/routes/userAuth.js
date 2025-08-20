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

// authRouter.post('/profile', getProfile);

module.exports = authRouter;
