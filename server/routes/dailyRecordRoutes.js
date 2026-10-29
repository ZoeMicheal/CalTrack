const express = require("express");
const { getAuth } = require("@clerk/express");
const DailyRecord = require("../models/DailyRecord");

const router = express.Router();

router.use((req, res, next) => {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({
        error: "Please sign in to access daily records.",
        });
    }

    req.clerkUserId = userId;
    next();
    });

    function isValidDate(date) {
    if (typeof date !== "string") return false;

    const match = /^\d{4}-\d{2}-\d{2}$/.test(date);
    if (!match) return false;

    const parsed = new Date(`${date}T00:00:00Z`);

    return (
        !Number.isNaN(parsed.getTime()) &&
        parsed.toISOString().slice(0, 10) === date
    );
    }

    // GET: Retrieve all daily records
    router.get("/", async (req, res) => {
    try {
        const records = await DailyRecord.find({
        clerkUserId: req.clerkUserId,
        }).sort({ date: -1 });

        return res.json(records);
    } catch (error) {
        console.error("GET daily records error:", error.message);

        return res.status(500).json({
        error: "Failed to retrieve daily records.",
        });
    }
    });

    // GET: Retrieve a record for a specific date
    router.get("/:date", async (req, res) => {
    try {
        const { date } = req.params;

        if (!isValidDate(date)) {
        return res.status(400).json({
            error: "Date must be a valid YYYY-MM-DD date.",
        });
        }

        const record = await DailyRecord.findOne({
        clerkUserId: req.clerkUserId,
        date,
        });

        return res.json(record);
    } catch (error) {
        console.error("GET daily record error:", error.message);

        return res.status(500).json({
        error: "Failed to retrieve daily record.",
        });
    }
    });

    // PUT: Create or update a daily record
    router.put("/:date", async (req, res) => {
    try {
        const { date } = req.params;

        if (!isValidDate(date)) {
        return res.status(400).json({
            error: "Date must be a valid YYYY-MM-DD date.",
        });
        }

        const updates = {};
        const allowedFields = [
        "isComplete",
        "goalAchieved",
        "stickerColor",
        ];

        for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
        }

        if (Object.keys(updates).length === 0) {
        return res.status(400).json({
            error: "No daily record fields provided.",
        });
        }

        if (
        updates.isComplete !== undefined &&
        typeof updates.isComplete !== "boolean"
        ) {
        return res.status(400).json({
            error: "isComplete must be true or false.",
        });
        }

        if (
        updates.goalAchieved !== undefined &&
        typeof updates.goalAchieved !== "boolean"
        ) {
        return res.status(400).json({
            error: "goalAchieved must be true or false.",
        });
        }

        const record = await DailyRecord.findOneAndUpdate(
        {
            clerkUserId: req.clerkUserId,
            date,
        },
        {
            $set: updates,
            $setOnInsert: {
            clerkUserId: req.clerkUserId,
            date,
            },
        },
        {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
        }
        );

        return res.json(record);
    } catch (error) {
        console.error("PUT daily record error:", error.message);

        if (
        error.name === "ValidationError" ||
        error.name === "CastError"
        ) {
        return res.status(400).json({
            error: error.message,
        });
        }

        return res.status(500).json({
        error: "Failed to save daily record.",
        });
    }
    });

    // DELETE: Remove a daily record
    router.delete("/:date", async (req, res) => {
    try {
        const { date } = req.params;

        if (!isValidDate(date)) {
        return res.status(400).json({
            error: "Date must be a valid YYYY-MM-DD date.",
        });
        }

        const record = await DailyRecord.findOneAndDelete({
        clerkUserId: req.clerkUserId,
        date,
        });

        if (!record) {
        return res.status(404).json({
            error: "Daily record not found.",
        });
        }

        return res.json({
        message: "Daily record deleted successfully.",
        });
    } catch (error) {
        console.error("DELETE daily record error:", error.message);

        return res.status(500).json({
        error: "Failed to delete daily record.",
        });
    }
});

module.exports = router;
