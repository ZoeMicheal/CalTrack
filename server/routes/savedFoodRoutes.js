const express = require("express");
const mongoose = require("mongoose");
const { getAuth } = require("@clerk/express");
const SavedFood = require("../models/SavedFood");

const router = express.Router();

const allowedFields = [
    "foodName",
    "calories",
    "protein",
    "carbs",
    "fat",
    "servingSize",
    "recipeNotes",
    "recipeUrl",
    ];

    // Require authentication
    router.use((req, res, next) => {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({
        error: "Please sign in to access saved foods.",
        });
    }

    req.clerkUserId = userId;
    next();
    });

    // GET: Retrieve all saved foods
    router.get("/", async (req, res) => {
    try {
        const foods = await SavedFood.find({
        clerkUserId: req.clerkUserId,
        }).sort({ createdAt: -1 });

        return res.json(foods);
    } catch (error) {
        console.error("GET saved foods error:", error.message);
        return res.status(500).json({
        error: "Failed to retrieve saved foods.",
        });
    }
    });

    // POST: Save a new favorite food
    router.post("/", async (req, res) => {
    try {
        const foodData = {};

        for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            foodData[field] = req.body[field];
        }
        }

        const food = await SavedFood.create({
        ...foodData,
        clerkUserId: req.clerkUserId,
        });

        return res.status(201).json(food);
    } catch (error) {
        console.error("POST saved food error:", error.message);

        if (
        error.name === "ValidationError" ||
        error.name === "CastError"
        ) {
        return res.status(400).json({
            error: error.message,
        });
        }

        return res.status(500).json({
        error: "Failed to save food.",
        });
    }
    });

    // PUT: Update a saved food
    router.put("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
            error: "Invalid food ID.",
        });
        }

        const updates = {};

        for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
        }

        const food = await SavedFood.findOneAndUpdate(
        {
            _id: req.params.id,
            clerkUserId: req.clerkUserId,
        },
        { $set: updates },
        {
            new: true,
            runValidators: true,
        }
        );

        if (!food) {
        return res.status(404).json({
            error: "Saved food not found.",
        });
        }

        return res.json(food);
    } catch (error) {
        console.error("PUT saved food error:", error.message);

        if (
        error.name === "ValidationError" ||
        error.name === "CastError"
        ) {
        return res.status(400).json({
            error: error.message,
        });
        }

        return res.status(500).json({
        error: "Failed to update saved food.",
        });
    }
    });

    // DELETE: Remove a saved food
    router.delete("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
            error: "Invalid food ID.",
        });
        }

        const food = await SavedFood.findOneAndDelete({
        _id: req.params.id,
        clerkUserId: req.clerkUserId,
        });

        if (!food) {
        return res.status(404).json({
            error: "Saved food not found.",
        });
        }

        return res.json({
        message: "Saved food deleted successfully.",
        });
    } catch (error) {
        console.error("DELETE saved food error:", error.message);
        return res.status(500).json({
        error: "Failed to delete saved food.",
        });
    }
});

module.exports = router;
