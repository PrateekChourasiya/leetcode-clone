const { default: mongoose } = require("mongoose");
const Contest = require("../models/contest");
const ContestSolution = require("../models/contestSolution");
const contestSchema = require("../utils/schemas/contestSchema.zod");
const Problem = require("../models/problem");
const Submission = require("../models/submission");
const { getLanguageById, submitBatch, submitTokens } = require("../utils/problemUtility");

const createContest = async (req, res) => {
  try {
    const data = contestSchema.parse(req.body);

    if (new Date(data.endTime) <= new Date(data.startTime)) {
      return res.status(400).json({ error: "endTime must be later than startTime." });
    }

    const contest = await Contest.create(data);

    res.status(201).json({
      message: "Contest created successfully",
      contest
    });

  } catch (err) {
    console.error(err);

    if (err.errors) {
      return res.status(400).json({
        error: "Validation failed",
        details: err.errors.map(e => e.message)
      });
    }

    return res.status(500).json({ error: "Server error" });
  }
};

const getAllContests = async (req, res) => {
  try {
    const contests = await Contest.find()
      .populate("problems", "title difficulty") // feel free to modify population
      .lean({ virtuals: true });

    return res.status(200).json({
      success: true,
      count: contests.length,
      contests,
    });
  } catch (err) {
    console.error("Error fetching contests:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

const getContestById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid contest ID",
    });
  }

  try {
    const contest = await Contest.findById(id)
      .populate("problems", "title difficulty tags")
      .lean({ virtuals: true });
    // .exec();

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: "Contest not found",
      });
    }

    return res.status(200).json(contest);
  } catch (err) {
    console.error("Error fetching contest:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }

}

const deleteContest = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid contest ID",
    });
  }

  try {
    const deletedContest = await Contest.findByIdAndDelete(id);

    if (!deletedContest) {
      return res.status(404).json({
        success: false,
        message: "Contest not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contest deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting contest:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

const getContestProblems = async (req, res) => {
  const { id } = req.params;

  // console.log("route hit");


  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid contest ID",
    });
  }

  try {
    const contest = await Contest.findById(id).populate("problems", "title difficulty tags").lean({ virtuals: true });;

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: "Contest not found",
      });
    }

    return res.status(200).json({ problems: contest.problems });
  } catch (err) {
    console.error("Error fetching contest problems:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}


const submitContestSolution = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.problemId;
    const contestId = req.params.contestId;

    const contestDoc = await Contest.findById(contestId).lean({virtuals: true});
    if (!contestDoc) {
      return res.status(404).send("Contest not found");
      
    }

    if(contestDoc.status !== 'running') {
      return res.status(400).send("Contest is not running currently");
    }

    let { code, language } = req.body;

    if (!userId || !code || !problemId || !language || !contestId) {
      return res.status(400).send("Some fields are missing");
    }

    if (language === 'cpp') language = 'c++'; // for frontend code editor i.e monaco, as it accepts cpp and our problemSchma hai c++

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


    for (const test of testResult) {
      if (test.status_id == 3) {
        casesPassed++;
        runtime += parseFloat(test.time);
        memory = Math.max(memory, test.memory);
      }
      else {
        if (test.status_id == 4) {
          status = 'error';
          errorMessage = test.stderr;
        }
        else {
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

    if (!req.result.problemSolved.includes(problemId)) {
      req.result.problemSolved.push(problemId);
      await req.result.save();
    }

    const accepted = (status == 'accepted');

    //--------------------- change here  ----------------

    //add entry to the contest solution model.

    if (accepted) {
      // find contest solution entry for this user and contest
      const existingRecord = await ContestSolution.findOne({ contestId, userId });

      if (!existingRecord) {
        // if not found → create one with the current submission
        await ContestSolution.create({
          contestId,
          userId,
          solutions: [{ problemId, submissionId: solutionSubmitResult._id }]
        });
      } else {
        // if exists → check if problem already submitted for this contest
        const existingIndex = existingRecord.solutions.findIndex(
          (sol) => sol.problemId.toString() === problemId.toString()
        );

        if (existingIndex !== -1) {
          // replace previous submission with the new one
          existingRecord.solutions[existingIndex].submissionId = solutionSubmitResult._id;
        } else {
          // push new problem entry
          existingRecord.solutions.push({
            problemId,
            submissionId: solutionSubmitResult._id
          });
        }

        await existingRecord.save();
      }
    }
    //--------------------- change here  ----------------

    res.status(201).json({
      accepted,
      totalTestCases: solutionSubmitResult.testCasesTotal,
      passedTestCases: casesPassed,
      runtime,
      memory
    });

  }
  catch (err) {
    res.status(500).send("Error: " + err);
  }
}

const enterContest = async (req, res) => {
  try {
    const { contestId, userId } = req.body;

    // ---- Basic validation ----
    if (!contestId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Both contestId and userId are required.",
      });
    }

    // ---- Validate objectId format ----
    if (![contestId, userId].every(id => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid contestId or userId format.",
      });
    }

    // ---- Check if document already exists ----
    const existing = await ContestSolution.findOne({ contestId, userId });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Contest solution entry already exists for this user.",
        data: existing,
      });
    }

    // ---- Create new record ----
    const newRecord = await ContestSolution.create({
      contestId,
      userId,
      solutions: [],
    });

    return res.status(201).json({
      success: true,
      message: "Contest solution record created successfully.",
      data: newRecord,
    });

  } catch (error) {
    console.error("Error creating contest solution:", error);
    return res.status(500).json({
      success: false,
      message: "Server error, please try again.",
    });
  }
};

const userContestSolvedProblems = async (req, res) => {
  try {
    const userId = req.result._id;
    const contestId = req.params.contestId;

    if (!mongoose.Types.ObjectId.isValid(contestId)) {
      return res.status(400).json({ error: "Invalid contest ID" });
    }

    const contestSolution = await ContestSolution.findOne({ contestId, userId }).populate('solutions.problemId', '_id title difficulty tags').lean();

    if (!contestSolution) {
      return res.status(200).json([]);
    }

    const solvedProblems = contestSolution.solutions.map(sol => sol.problemId);

    return res.status(200).json( solvedProblems );
  }
  catch (err) {
    console.error("Error fetching solved problems:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  createContest,
  getAllContests,
  getContestById,
  deleteContest,
  getContestProblems,
  enterContest,
  submitContestSolution,
  userContestSolvedProblems
};