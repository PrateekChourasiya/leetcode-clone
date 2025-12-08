const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");
const Schema = mongoose.Schema;

const contestSchema = new Schema(
  {
    name: { type: String, required: true },
    problems: [{ type: Schema.Types.ObjectId, ref: "problem", required: true }],
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

contestSchema.virtual("durationMinutes").get(function () {
  if (!this.startTime || !this.endTime) return null;
  return Math.round((this.endTime - this.startTime) / (1000 * 60));
});

contestSchema.virtual("status").get(function () {
  const now = new Date();
  if (now < this.startTime) return "upcoming";
  if (now >= this.startTime && now <= this.endTime) return "running";
  return "finished";
});

contestSchema.plugin(mongooseLeanVirtuals);

module.exports = mongoose.model("contest", contestSchema);
