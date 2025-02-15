const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  skills: { type: String, default: "" },
  image: { type: String },
  dob: { type: Date },
  education: [
    {
      degree: { type: String, required: true },
      institution: { type: String, required: true },
      year: { type: Number },
    },
  ],
  appliedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }], // New Field to Track Applied Courses
});

module.exports = mongoose.model("user", UserSchema);