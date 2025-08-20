const Problem = require("../models/problem");
const Submission = require("../models/submission");
const { getLanguageById, submitBatch, submitTokens } = require("../utils/problemUtility");

const submitCode = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.id;

        const { code, language } = req.body;

        if (!userId || !code || !problemId || !language) {
            return res.status(400).send("Some fields are missing");
        }

        // fetch the problem db

        const problem = await Problem.findById(problemId);

        // now we will submit this code sent by user in our database and mark the status as pending, so that if our judge0 fails to give any response, we would still have the data for further ask

        const solutionSubmitResult = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status: "pending",
            testCasesTotal: problem.hiddenTestCases.length,
        });

        // submit the code to jugde0

        const languageId = getLanguageById(language);

        const submissions = problem.hiddenTestCases.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output,
        }));

        const submitResult = await submitBatch(submissions);

        const resultTokens = submitResult.map((value) => value.token);

        const testResult = await submitTokens(resultTokens);

        // upadte the solutionSubmittedResult now
        let casesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = 'accepted';
        let errorMessage = null;


        for(const test of testResult){
            if(test.status_id == 3){
                casesPassed++;
                runtime += parseFloat(test.time);
                memory = Math.max(memory, test.memory);
            }
            else{
                if(test.status_id == 4){
                    status = 'error';
                    errorMessage = test.stderr;
                }
                else{
                    status = 'wrong';
                    errorMessage = test.stderr;
                }
            }
        }

        solutionSubmitResult.status = status;
        solutionSubmitResult.testCasesPassed = casesPassed;
        solutionSubmitResult.errorMessage = errorMessage;
        solutionSubmitResult.runtime = runtime;
        solutionSubmitResult.memory = memory;

        await solutionSubmitResult.save();

        //now add the problem id to problem solved field of user so that we can have a track of all the solved problems by the user

        if(!req.result.problemSolved.includes(problemId)){
            req.result.problemSolved.push(problemId);
            await req.result.save();
        }

        res.status(200).send(solutionSubmitResult);

    } 
    catch (err) { 
        res.status(500).send("Error: "+err);
    }
};

const runCode = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.id;

        const { code, language } = req.body;

        if (!userId || !code || !problemId || !language) {
            return res.status(400).send("Some fields are missing");
        }

        // fetch the problem db

        const problem = await Problem.findById(problemId);

        // submit the code to jugde0

        const languageId = getLanguageById(language);

        const submissions = problem.visibleTestCases.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output,
        }));

        const submitResult = await submitBatch(submissions);

        const resultTokens = submitResult.map((value) => value.token);

        const testResult = await submitTokens(resultTokens);

        res.status(200).send(testResult);
    }
    catch(err){
        res.status(500).send("Error: "+err);
    }    
}

module.exports = { submitCode, runCode };
