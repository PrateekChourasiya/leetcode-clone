
const express = require('express');
const contestRouter =  express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require('../middleware/adminMiddleware');

const {createContest , getAllContests, getContestById, deleteContest , getContestProblems} = require('../controllers/contestController');

contestRouter.post('/create', adminMiddleware, createContest);
contestRouter.get("/", userMiddleware, getAllContests);
contestRouter.get("/:id", adminMiddleware, getContestById);
contestRouter.delete("/:id", adminMiddleware, deleteContest);
contestRouter.get("/:id/problems", userMiddleware, getContestProblems);


module.exports = contestRouter; 