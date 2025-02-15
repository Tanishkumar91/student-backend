const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
    coursename: { type: String, required: true },
    description: { type: String, required: true },
    brief: { type: String, required: true },
    amount: { type: Number, required: true },
    courseImage: { type: String, default: "" } // URL or image path
});

module.exports = mongoose.model("Course", CourseSchema);
