const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");
const Schema = mongoose.Schema;

const contestSolution = new Schema(
  {
    contestId: { type: Schema.Types.ObjectId, ref: "Contest", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    solutions : [
      {
        problemId: { type: Schema.Types.ObjectId, ref: "problem", required: true },
        submissionId: { type: Schema.Types.ObjectId, ref: "submissions", required: true}
      }
    ]

  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);


module.exports = mongoose.model("contestSolution", contestSolution);
