const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");

const router = express.Router();

// @route   POST /api/register
// @desc    Register new user
// @access  Public
router.post(
    "/register",
    [
        body("name", "Name is required").notEmpty(),
        body("email", "Enter a valid email").isEmail(),
        body("password", "Password must be at least 6 characters").isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            // Check if user already exists
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ message: "User already exists" });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create new user
            user = new User({
                name,
                email,
                password: hashedPassword
            });

            await user.save();

            // Generate JWT Token
            const payload = {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            };
            
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
            
            res.json({
                message: "User registered successfully",
                payload,  // ✅ Send user data
                token     // ✅ Send generated JWT token
            });

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Server Error");
        }
    }
);

// @route   POST /api/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
    "/login",
    [
        body("email", "Enter a valid email").isEmail(),
        body("password", "Password is required").notEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // Check if user exists
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

            // Compare password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

            // Create JWT payload
            const payload = {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            };

            // Generate JWT Token
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

            res.json({
                message: "Login successful",
                payload,  // ✅ Send user details
                token     // ✅ Send JWT token
            });

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Server Error");
        }
    }
);

module.exports = router;
