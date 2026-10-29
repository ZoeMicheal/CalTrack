const express = require("express");
const { getAuth } = require("@clerk/express");
const User = require("../models/User");

const router = express.Router();

// Require Clerk authentication
router.use((req, res, next) => {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({
        error: "Please sign in to access your settings.",
        });
    }

    req.clerkUserId = userId;
    next();
    });

    // GET: Retrieve user settings
    router.get("/", async (req, res) => {
    try {
        const user = await User.findOne({
        clerkUserId: req.clerkUserId,
        });

        return res.status(200).json(user);
    } catch (error) {
        console.error("GET user error:", error.message);

        return res.status(500).json({
        error: "Failed to retrieve user settings.",
        });
    }
    });

    // PUT: Create or update user settings
    router.put("/", async (req, res) => {
    try {
        const allowedFields = [
        "displayName",
        "hiddenNutrients",
        ];

        const updates = {};

        for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
        }

        if (Object.keys(updates).length === 0) {
        return res.status(400).json({
            error: "No settings provided.",
        });
        }

        // Basic input validation
        if (
        updates.displayName !== undefined &&
        (typeof updates.displayName !== "string" ||
            updates.displayName.length > 100)
        ) {
        return res.status(400).json({
            error: "Display name must be a string of at most 100 characters.",
        });
        }

        if (
        updates.hiddenNutrients !== undefined &&
        (!Array.isArray(updates.hiddenNutrients) ||
            !updates.hiddenNutrients.every(
            (item) => typeof item === "string"
            ))
        ) {
        return res.status(400).json({
            error: "Hidden nutrients must be an array of strings.",
        });
        }

        const user = await User.findOneAndUpdate(
        { clerkUserId: req.clerkUserId },
        {
            $set: updates,
            $setOnInsert: {
            clerkUserId: req.clerkUserId,
            },
        },
        {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
        }
        );

        return res.status(200).json(user);
    } catch (error) {
        console.error("PUT user error:", error.message);

        if (error.name === "ValidationError") {
        return res.status(400).json({
            error: error.message,
        });
        }

        return res.status(500).json({
        error: "Failed to save user settings.",
        });
    }
});

module.exports = router;
