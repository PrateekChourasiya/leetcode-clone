const Problem = require("../models/problem");
const Submission = require("../models/submission");
const User = require("../models/user");
const {getLanguageById, submitBatch, submitTokens} = require("../utils/problemUtility");

const createProblem = async (req, res) => {
    const {title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, problemCreator, referenceSolution} = req.body;

    try{
        for(const ele of referenceSolution){
            const {language, completeCode} = ele;

            // source_code;
            // language_id;
            // stdin;
            // expecteOutput;

            const languageId = getLanguageById(language);

            // creating batch submissions
            const submissions = visibleTestCases.map((testcase)=> ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));

            
            
            // this will give an array of objects of token, each token correspond to each submission in a batch
            // a token is an exchange for the suubmission of our code, by using this token, we can get the status of the submitted code 
            const submitResult = await submitBatch(submissions);
            
            // converting an array of actual token
            const resultTokens = submitResult.map((value) => value.token);

            console.log("Hello");

            // getting the result of our submitted code
            const testResult = await submitTokens(resultTokens);

            for(const test of testResult){
                if(test.status_id != 3){
                    return res.status(400).send(test.description);
                }
            }
        }

        // we have verified the solutions sent by admin that its correct, now we can store it in db

        const userProblem = await Problem.create({
            ...req.body,
            problemCreator: req.result._id, // we stored id in result when we verified its the admin or not
        });

        res.status(201).send("Problem Saved Successfully");
    }
    catch(err){
        res.status(400).send("Error here: "+err);
    }

}

const updateProblem = async (req, res) => {
    const {id} = req.params;

    const {title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, problemCreator, referenceSolution} = req.body;

    try{
        if(!id){
            return res.status(400).send("Missing ID field");
        }

        const dsaProblem = await Problem.findById(id);
        
        if(!dsaProblem){
            return res.status(404).send("ID is not present");
        }

        for(const ele of referenceSolution){
            const {language, completeCode} = ele;

            // source_code;
            // language_id;
            // stdin;
            // expected_output;

            const languageId = getLanguageById(language);

            // creating batch submissions
            const submissions = visibleTestCases.map((testcase)=> ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));
            
            // this will give an array of objects of token, each token correspond to each submission in a batch
            // a token is an exchange for the suubmission of our code, by using this token, we can get the status of the submitted code 
            const submitResult = await submitBatch(submissions);
            
            // converting an array of actual token
            const resultTokens = submitResult.map((value) => value.token);

            // getting the result of our submitted code
            const testResult = await submitTokens(resultTokens);

            for(const test of testResult){
                if(test.status_id != 3){
                    return res.status(400).send(test.description);
                }
            }
        }

        const newProblem = await Problem.findByIdAndUpdate(id, {...req.body}, {runValidators: true, new: true});

        res.status(200).send(newProblem);
    }
    catch(err){
        res.status(500).send("Error here: "+err);
    }
}

const deleteProblem = async (req, res) => {
    const {id} = req.params;
    
    try{
        if(!id){
            return res.status(400).send("ID is Missing");
        }

        const deletedProblem = await Problem.findByIdAndDelete(id);

        if(!deletedProblem){
            return res.status(404).send("Problem is Missing");
        }

        res.status(200).send("Successfully Deleted");
    }
    catch(err){
        res.status(500).send("Error here: "+err);
    }
}

const getProblemById = async (req, res) => {
    const {id} = req.params;
    
    try{
        if(!id){
            return res.status(400).send("ID is Missing");
        }

        const getProblem = await Problem.findById(id).select("_id title difficulty description tags visibleTestCases hiddenTestCases startCode referenceSolution"); // .select(" ") is used to select only those fields from the document ehich we want to show on frontend, we can also exclude some fields which we dont want to show by a - that is .select("-hiddenTestCases"), rest will be listed, but either inclusion or exclusion can be done at a time

        if(!getProblem){
            return res.status(404).send("Problem is Missing");
        }

        res.status(200).send(getProblem);
    }
    catch(err){
        res.status(500).send("Error here: "+err);
    }
}

const getAllProblems = async (req, res) => {
     try{
        const getProblems = await Problem.find({}).select("_id title difficulty description tags");

        if(getProblems.length == 0){
            return res.status(404).send("Problems are Missing");
        }

        res.status(200).send(getProblems);
    }
    catch(err){
        res.status(500).send("Error here: "+err);
    }
}

const getAllProblemsSolvedByUser = async (req, res) => {
    try{
        const userId = await req.result._id;

        const user = await User.findById(userId).populate({
            path: 'problemSolved',
            select: '_id title difficulty tags'
        });

        res.status(200).send(user.problemSolved);
    }
    catch(err){
        res.status(400).send("Error: "+err);
    }
}

const getSubmittedSolution = async (req, res) => {
    try{
        const userId = req.result._id;
        const problemId = req.params.pid;

        const solutions = await Submission.find({userId, problemId});

        if(solutions.length == 0){
            res.status(200).send("No Submissions by the user for this Problem.");
        }
        
        res.status(200).send(solutions);
    }
    catch(err){
       res.status(500).send("Error: "+err); 
    }
}

module.exports = { createProblem, updateProblem, deleteProblem, getProblemById, getAllProblems, getAllProblemsSolvedByUser, getSubmittedSolution};