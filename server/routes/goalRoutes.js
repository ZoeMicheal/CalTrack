const express = require("express");
const { getAuth } = require("@clerk/express");
const Goal = require("../models/Goal");

const router = express.Router();

// Require a signed-in Clerk user
router.use((req, res, next) => {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({
            error: "Please sign in to access your goals.",
        });
    }

    req.clerkUserId = userId;
    next();
});

// GET: Retrieve the signed-in user's goals
router.get("/", async (req, res) => {
    try {
    const goal = await Goal.findOne({
        clerkUserId: req.clerkUserId,
    });

    return res.json(goal);
    } catch (error) {
    console.error("GET goal error:", error.message);
    return res.status(500).json({
        error: "Failed to retrieve goals.",
    });
    }
});

// PUT: Create or update the user's goals
router.put("/", async (req, res) => {
    try {
        const allowedFields = [
        "calorieMin",
        "calorieMax",
        "proteinTarget",
        "carbsTarget",
        "fatTarget",
        "stickerColor",
        ];

        const updates = {};

        for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
        }

        if (Object.keys(updates).length === 0) {
        return res.status(400).json({
            error: "No goal fields provided.",
        });
        }

        const goal = await Goal.findOneAndUpdate(
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

        return res.json(goal);
    } catch (error) {
        console.error("PUT goal error:", error.message);

        if (error.name === "ValidationError") {
        return res.status(400).json({
            error: error.message,
        });
        }

        return res.status(500).json({
        error: "Failed to save goals.",
        });
    }
});

module.exports = router;