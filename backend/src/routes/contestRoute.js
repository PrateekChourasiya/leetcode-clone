
const express = require('express');
const contestRouter =  express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require('../middleware/adminMiddleware');

const {createContest , getAllContests, getContestById, deleteContest , getContestProblems , enterContest, submitContestSolution, userContestSolvedProblems} = require('../controllers/contestController');

contestRouter.post('/create', adminMiddleware, createContest);
contestRouter.get("/", userMiddleware, getAllContests);
contestRouter.get("/:id", adminMiddleware, getContestById);
contestRouter.delete("/:id", adminMiddleware, deleteContest);
contestRouter.get("/:id/problems", userMiddleware, getContestProblems);
contestRouter.post("/:id/enter-contest", userMiddleware, enterContest);
contestRouter.post("/:contestId/submit-solution/:problemId", userMiddleware, submitContestSolution);
contestRouter.get("/:contestId/solved-problems", userMiddleware, userContestSolvedProblems);

module.exports = contestRouter; 