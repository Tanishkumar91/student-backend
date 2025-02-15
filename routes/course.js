const express = require("express");
const Course = require("../models/course");
const User = require("../models/user");
const auth = require("../middlewares/auth"); // Protect routes with authentication

const router = express.Router();

// @route   POST /api/courses
// @desc    Create a new course
// @access  Private (Requires Authentication)
router.post("/", auth, async (req, res) => {
    try {
        const { coursename, description, brief, amount, courseImage } = req.body;

        if (!coursename || !description || !brief || !amount) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newCourse = new Course({
            coursename,
            description,
            brief,
            amount,
            courseImage
        });

        await newCourse.save();
        res.status(201).json({
            message: "Course created successfully",
            course: newCourse
        });

    } catch (error) {
        console.error("Error creating course:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// @route   GET /api/courses
// @desc    Get all courses
// @access  Public
router.get("/", async (req, res) => {
    try {
        const courses = await Course.find();
        res.json({
            message: "Courses fetched successfully",
            courses
        });
    } catch (error) {
        console.error("Error fetching courses:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

/**
 * @route   GET /api/courses/applied
 * @desc    Get all courses that the logged-in student has applied for
 * @access  Private (Requires Authentication)
 */
router.get("/applied", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("appliedCourses");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "Applied courses fetched successfully",
            courses: user.appliedCourses
        });
    } catch (error) {
        console.error("Error fetching applied courses:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
