const axios = require('axios');
const User = require('../models/User');

const NINJA_API_URL = 'https://api.api-ninjas.com/v1/nutrition';

/**
 * GET /api/nutrition?query=200g chicken breast
 * Proxies the query to Gemini API or CalorieNinjas and returns nutrition data.
 */
exports.searchNutrition = async (req, res) => {
  const { query } = req.query;
  if (!query || !query.trim()) {
    return res.status(400).json({ message: 'Query parameter is required.' });
  }

  // 1. Resolve API Keys (Env vars first, then database user document)
  let geminiKey = process.env.GEMINI_API_KEY || '';
  let ninjaKey = process.env.NINJA_API_KEY || '';

  if (!geminiKey || !ninjaKey) {
    try {
      const user = await User.findById(req.user.id);
      if (user) {
        if (!geminiKey && user.geminiApiKey) geminiKey = user.geminiApiKey;
        if (!ninjaKey && user.ninjaApiKey) ninjaKey = user.ninjaApiKey;
      }
    } catch (dbErr) {
      console.error('Error fetching user for API keys:', dbErr.message);
    }
  }

  // 2. Try Google Gemini API (Free tier AI Agent)
  if (geminiKey) {
    try {
      const prompt = `You are a nutrition database. Analyze this query: "${query.trim()}".
Suggest a list of matching food items. For each food item, estimate the nutritional values.
Provide ONLY a valid JSON array of objects. Do not include markdown code block markers (like \`\`\`json), do not include any text, greetings, explanations, or backticks. Return the raw JSON array string exactly.

Each object in the array MUST have exactly these keys:
- name: string (e.g., "Egg (boiled)" or "Oatmeal cooked")
- calories: number (kcal)
- protein: number (g)
- carbs: number (g)
- fat: number (g)
- defaultUnit: string (use "Grams", "Piece", "ml", "Cup", "Bowl", "Slice", "Scoop", "Tbsp", "Tsp")
- unitValue: number (the weight/size of 1 defaultUnit, e.g. 100 for Grams, or 1 for Piece)

Example query: "3 eggs"
Output:
[
  {"name": "Whole Egg (boiled)", "calories": 155, "protein": 13, "carbs": 1.1, "fat": 11, "defaultUnit": "Piece", "unitValue": 1},
  {"name": "Egg White (boiled)", "calories": 52, "protein": 11, "carbs": 0.7, "fat": 0.2, "defaultUnit": "Piece", "unitValue": 1}
]`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }]
        },
        { timeout: 8000 }
      );

      let textResult = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      textResult = textResult.trim();

      // Clean up in case Gemini output code blocks despite responseMimeType
      if (textResult.startsWith('```')) {
        textResult = textResult.replace(/^```(json)?/, '').replace(/```$/, '').trim();
      }

      const parsed = JSON.parse(textResult);
      if (Array.isArray(parsed)) {
        const results = parsed.map(item => ({
          name: item.name || query,
          calories: Math.round(item.calories || 0),
          protein: Number((item.protein || 0).toFixed(1)),
          carbs: Number((item.carbs || 0).toFixed(1)),
          fat: Number((item.fat || 0).toFixed(1)),
          defaultUnit: item.defaultUnit || 'Grams',
          unitValue: Number(item.unitValue) || 100,
          source: 'ai'
        }));
        return res.json(results);
      }
    } catch (geminiErr) {
      console.error('Gemini nutrition parser failed:', geminiErr.response?.data || geminiErr.message);
      const errMsg = geminiErr.response?.data?.error?.message || geminiErr.message || 'Unknown error';
      return res.status(400).json({
        message: `Gemini API Error: ${errMsg}. Please verify your API Key in Settings.`
      });
    }
  }

  // 3. Try CalorieNinjas API
  if (ninjaKey) {
    try {
      const response = await axios.get(NINJA_API_URL, {
        params: { query: query.trim() },
        headers: { 'X-Api-Key': ninjaKey },
        timeout: 8000
      });

      const results = (response.data || []).map(item => ({
        name: item.name || query,
        calories: Math.round(item.calories || 0),
        protein: Number((item.protein_g || 0).toFixed(1)),
        carbs: Number((item.carbohydrates_total_g || 0).toFixed(1)),
        fat: Number((item.fat_total_g || 0).toFixed(1)),
        defaultUnit: 'Grams',
        unitValue: Number((item.serving_size_g || 100).toFixed(0)),
        source: 'ai'
      }));

      return res.json(results);
    } catch (ninjaErr) {
      console.error('CalorieNinjas nutrition failed:', ninjaErr.message);
      if (ninjaErr.response?.status === 401) {
        return res.status(401).json({ message: 'Invalid CalorieNinjas API key.' });
      }
    }
  }

  // 4. Return instructions if no key is configured
  if (!geminiKey && !ninjaKey) {
    return res.json({
      needs_key: true,
      message: 'Configure a free Gemini API key in Settings to activate the AI Food Tracker.'
    });
  }

  res.status(500).json({ message: 'AI Nutrition lookup failed. Try again.' });
};
