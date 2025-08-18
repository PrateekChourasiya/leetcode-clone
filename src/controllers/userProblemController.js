const Problem = require("../models/problems");
const {getLanguageById, submitBatch, submitTokens} = require("../utils/problemUtility");

const createProblem = async (req, res) => {
    const {title, description, difficulty, tags, visibleTestCases, hiddenVisibleTestCases, startCode, problemCreator, referenceSolution} = req.body;

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



module.exports = createProblem;