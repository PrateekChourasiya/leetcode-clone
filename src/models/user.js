const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 20,
    },
    lastName: {
      type: String,
      minLength: 3,
      maxLength: 20,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      immutable: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      min: 5,
      max: 80,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    problemSolved: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "problem",
      },
    ],
  },
  { timestamps: true }
);

// await Submission.deleteMany({userId}); instead of this in userController deleteProfile controller, below command is written

userSchema.post("findOneAndDelete", async function (userInfo) {
  if (userInfo) {
    await mongoose.model("submission").deleteMany({ userId: userInfo._id });
  }
});

const User = mongoose.model("user", userSchema);

module.exports = User;
