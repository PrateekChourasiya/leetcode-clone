const { default: mongoose } = require("mongoose");
const Contest = require("../models/contest");
const contestSchema = require("../utils/schemas/contestSchema.zod");

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

module.exports = {
  createContest,
    getAllContests,
    getContestById,
    deleteContest,
    getContestProblems
};