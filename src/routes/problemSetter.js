const express = require('express');
const adminMiddleware = require('../middleware/adminMiddleware');
const createProblem = require('../controllers/userProblemController');
const userMiddleware = require('../middleware/userMiddleware');

const problemRouter = express.Router();

problemRouter.post("/create", adminMiddleware, createProblem); // create
// problemRouter.patch("/update/:id", adminMiddleware, updateProblem); // update
// problemRouter.delete("/delete/:id", adminMiddleware, deleteProblem); // delete :- these require admin access

// problemRouter.get("/problemById/:id", userMiddleware, getProblemById); // read
// problemRouter.get("/getAllProblems", userMiddleware, getAllProblems); // read

// problemRouter.get("/getAllProblemsSolvedByUser", userMiddleware, getAllProblemsSolvedByUser); //read

module.exports = problemRouter;