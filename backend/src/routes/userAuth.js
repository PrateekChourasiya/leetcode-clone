const express = require('express');
const { register, login, logout, adminRegister, deleteProfile } = require('../controllers/userAuthController');
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', userMiddleware, logout);
authRouter.post('/admin/register', adminMiddleware, adminRegister);
authRouter.delete('/deleteProfile', userMiddleware, deleteProfile);
authRouter.get('/check', userMiddleware, (req, res) => {
    const reply = {
        firstName: req.result.firstName,
        emailId: req.result.emailId,
        _id: req.result._id,
        role: req.result.role,
    }

    res.status(200).json({
        user: reply,
        message: "valid user"
    })
});

authRouter.get('/leaderboard', userMiddleware, async (req, res) => {
    try {
        const User = require('../models/user');
        const users = await User.find({}, 'firstName emailId problemSolved')
            .lean();

        const leaderboard = users
            .map(u => ({
                firstName: u.firstName,
                emailId: u.emailId,
                score: u.problemSolved ? u.problemSolved.length : 0,
            }))
            .sort((a, b) => b.score - a.score)
            .map((u, i) => ({ ...u, rank: i + 1 }));

        res.status(200).json(leaderboard);
    } catch (err) {
        res.status(500).send("Error: " + err);
    }
});

// authRouter.post('/profile', getProfile);

module.exports = authRouter;
