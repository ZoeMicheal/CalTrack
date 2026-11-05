const express = require("express");
const {GoogleGenAI, Type} = require('@google/genai');

const router = express.Router();
const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY});

// post api/ai/extract
router.post("/extract", async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ error: 'Image base64 string is required' });
        }

        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    inlineData: { mimeType: 'image/jpeg', data: base64Data },
                },
                'You are a senior food nutritionist. Extract the approximate ingredients and their weights from the image. Do not return explanations, return only the list of ingredients and their weights in plain text.',
            ],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        quantity: { type: Type.NUMBER },
                        unit: { type: Type.STRING },
                    },
                    required: ['name', 'quantity', 'unit'],
                },
            },
        });

        const extractedData = JSON.parse(response.text);
        res.json({ success: true, data: extractedData });


    } catch (error) {
        console.error('Extraction error:', error);
        res.status(500).json({ error: 'Failed to extract data' });
    }
})

module.exports = router;