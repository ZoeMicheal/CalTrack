const express = require("express");
const {GoogleGenAI, Type} = require('@google/genai');
const router = express.Router();

const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY});

// post api/ai/extract
router.post("/extract-food", async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ error: 'Image is required' });
        }

        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    inlineData: { mimeType: 'image/jpeg', data: base64Data },
                },
                'You are a senior food nutritionist. Analyze this meal photo. Output the food name, total macros, estimated meal type, and a breakdown of visible ingredients with estimated quantities and units.',
            ],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        foodName: { type: Type.STRING },
                        mealType: {
                            type: Type.STRING,
                            enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Drinks']
                        },
                        calories: { type: Type.NUMBER },
                        protein: { type: Type.NUMBER },
                        carbs: { type: Type.NUMBER },
                        fat: { type: Type.NUMBER },
                        servingSize: { type: Type.STRING },
                        weightGrams: { type: Type.NUMBER },
                        ingredients: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    quantity: { type: Type.NUMBER },
                                    unit: { type: Type.STRING },
                                },
                                required: ['name', 'quantity', 'unit'],
                            },
                        },
                    },
                    required: ['foodName', 'calories', 'mealType', 'ingredients'],
                },
            },
        });

        const extractedData = JSON.parse(response.text);
        res.json({ success: true, data: extractedData });


    } catch (error) {
        console.error('AI Extraction error:', error);
        res.status(500).json({ error: 'Failed to extract data' });
    }
});

module.exports = router;