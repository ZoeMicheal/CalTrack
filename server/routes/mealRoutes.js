const express = require("express");
const mongoose = require("mongoose");
const { getAuth } = require("@clerk/express");
const MealLog = require("../models/MealLog");

const router = express.Router();

// Require Clerk authentication for all meal routes
router.use((req, res, next) => {
  const auth = getAuth(req);
  const userId = auth.userId;

  if (!userId) {
    return res.status(401).json({
      error: "Please sign in to access your meals.",
    });
  }

  // Use the verified Clerk user ID for database operations
  req.clerkUserId = userId;
  next();
});

// GET: Retrieve all meals for the signed-in user
router.get("/", async (req, res) => {
  try {
    const meals = await MealLog.find({
      clerkUserId: req.clerkUserId,
    }).sort({ consumedAt: -1 });

    return res.status(200).json(meals);
  } catch (error) {
    console.error("GET meals error:", error.message);

    return res.status(500).json({
      error: "Failed to retrieve meals.",
    });
  }
});

// POST: Save a new meal
router.post("/", async (req, res) => {
  try {
    const allowedFields = [
      "foodName",
      "mealType",
      "calories",
      "protein",
      "carbs",
      "fat",
      "ingredients",
      "servingSize",
      "weightGrams",
      "consumedAt",
      "source",
    ];

    const mealData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        mealData[field] = req.body[field];
      }
    }

    const meal = await MealLog.create({
      ...mealData,
      clerkUserId: req.clerkUserId,
    });

    return res.status(201).json(meal);
  } catch (error) {
    console.error("POST meals error:", error.message);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(500).json({
      error: "Failed to save meal.",
    });
  }
});

// PUT: Update an existing meal
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: "Invalid meal ID.",
      });
    }

    const allowedFields = [
      "foodName",
      "mealType",
      "calories",
      "protein",
      "carbs",
      "fat",
      "ingredients",
      "servingSize",
      "weightGrams",
      "consumedAt",
      "source",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const meal = await MealLog.findOneAndUpdate(
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

    if (!meal) {
      return res.status(404).json({
        error: "Meal not found.",
      });
    }

    return res.status(200).json(meal);
  } catch (error) {
    console.error("PUT meals error:", error.message);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(500).json({
      error: "Failed to update meal.",
    });
  }
});

// DELETE: Remove a meal belonging to the signed-in user
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: "Invalid meal ID.",
      });
    }

    const meal = await MealLog.findOneAndDelete({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!meal) {
      return res.status(404).json({
        error: "Meal not found.",
      });
    }

    return res.status(200).json({
      message: "Meal deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE meals error:", error.message);

    return res.status(500).json({
      error: "Failed to delete meal.",
    });
  }
});

module.exports = router;
