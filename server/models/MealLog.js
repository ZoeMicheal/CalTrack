const mongoose = require('mongoose');

// INGREDIENTS STRUCTURE
const ingredientSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
    },
    quantity: {
        type: Number,
        min: 0,
        default: 0,
    },
    unit: {
        type: String,
        trim: true,
        default: "g"
    },
});

//MEAL LOG STRUCTURE.
const mealLogSchema = new mongoose.Schema(
    {
        clerkUserId: {
            type: String,
            required: true,
            index: true,
        },
        foodName: {
            type: String,
            required: true,
            trim: true,
        },
        mealType: {
            type: String,
            enum: ["Breakfast", "Lunch", "Dinner", "Snack"],
            required: true,
        },
        calories: {
            type: Number,
            required: true,
            min: 0,
        },
        protein: {
            type: Number,
            default: 0,
            min: 0,
        },
        carbs: {
            type: Number,
            default: 0,
            min: 0,
        },
        fat: {
          type: Number,
          default: 0,
          min: 0,
        },
        //INGREDIENTS LIST
        ingredients: {
            type: [ingredientSchema],
            default: [],
        },
        servingSize: {
            type: String,
            default: "",
        },
        weightGrams: {
            type: Number,
            min: 0,
        },
        consumedAt: {
            type: Date,
            default: Date.now,
        },
        source: {
            type: String,
            enum: ["manual", "ai", "saved"],
            default: "manual",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('MealLog', mealLogSchema);
