const express = require('express');
const adminMiddleware = require('../middleware/adminMiddleware');
const {createProblem, updateProblem, deleteProblem, getProblemById, getAllProblems, getAllProblemsSolvedByUser, getSubmittedSolution} = require('../controllers/userProblemController');
const userMiddleware = require('../middleware/userMiddleware');


const problemRouter = express.Router();

problemRouter.post("/create", adminMiddleware, createProblem); // create
problemRouter.put("/update/:id", adminMiddleware, updateProblem); // update
problemRouter.delete("/delete/:id", adminMiddleware, deleteProblem); // delete :- these require admin access

problemRouter.get("/problemById/:id", userMiddleware, getProblemById); // read
problemRouter.get("/getAllProblems", userMiddleware, getAllProblems); // read

problemRouter.get("/getAllProblemsSolvedByUser", userMiddleware, getAllProblemsSolvedByUser); //read
problemRouter.get("/getSubmittedSolution/:pid", userMiddleware, getSubmittedSolution); // get all submitted solution (right or wrong) by the user for a given problem

module.exports = problemRouter;