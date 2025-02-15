const express = require("express");
const User = require("../models/user");
const Course = require("../models/course");
const auth = require("../middlewares/auth"); // Middleware for JWT authentication

const router = express.Router();

// @route   GET /api/profile.
// @desc    Get the logged-in user's profile
// @access  Private (Requires Authentication)
router.get("/", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "Profile fetched successfully",
            profile: {
                id: user.id,
                name: user.name,
                email: user.email, // Email is returned but not updatable
                phone: user.phone || "",
                address: user.address || "",
                skills: user.skills || "",
                image: user.image || "",
                dob: user.dob || "",
                education: user.education || []
            }
        });
    } catch (error) {
        console.error("Error fetching profile:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// @route   PUT /api/profile/:id
// @desc    Update a specific student's profile (Email cannot be changed)
// @access  Private (Requires Authentication)
router.put("/:id", auth, async (req, res) => {
    try {
        const { name, phone, address, skills, image, dob, education } = req.body;
        const studentId = req.params.id;

        let user = await User.findById(studentId);

        if (!user) {
            return res.status(404).json({ message: "Student not found" });
        }

        if (req.body.email && req.body.email !== user.email) {
            return res.status(400).json({ message: "Email cannot be changed" });
        }

        user.name = name || user.name;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.skills = skills || user.skills;
        user.image = image || user.image;
        user.dob = dob || user.dob;
        user.education = Array.isArray(education) ? education : user.education;

        await user.save();

        res.json({
            message: "Profile updated successfully",
            profile: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                skills: user.skills,
                image: user.image,
                dob: user.dob,
                education: user.education
            }
        });

    } catch (error) {
        console.error("Error updating profile:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

/**
 * @route   POST /api/profile/apply/:courseId
 * @desc    Apply for a course
 * @access  Private (Requires Authentication)
 */
router.post("/apply/:courseId", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const courseId = req.params.courseId;

        const user = await User.findById(userId);
        const course = await Course.findById(courseId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (user.appliedCourses.includes(courseId)) {
            return res.status(400).json({ message: "You have already applied for this course" });
        }

        user.appliedCourses.push(courseId);
        await user.save();

        res.json({ message: "Successfully applied for the course", appliedCourses: user.appliedCourses });
    } catch (error) {
        console.error("Error applying for course:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
