const express = require('express');

const problemRouter = express.Router();

problemRouter.post("/create", problemCreate); // craate
problemRouter.patch("/:id", problemUpdate); // update
problemRouter.delete("/:id", problemDelete); // delete :- these require admin access

problemRouter.get("/:id", problemFetch); // read
problemRouter.get("/", problemFetchAll); // read

problemRouter.get("/user", solvedProblem); //read