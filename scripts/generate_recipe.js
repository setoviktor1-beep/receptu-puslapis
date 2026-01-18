import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ...
import slugify from 'slugify';

const RECIPES_DIR = path.join(process.cwd(), 'src/content/recipes');
const IMAGES_DIR = path.join(process.cwd(), 'public/images/recipes');

const CATEGORIES = [
    'vegetariski', 'mesa', 'paukstiena', 'zuvis', 'sriubos',
    'desertai', 'korejietiski', 'lietuviski', 'fusion'
];

const DIFFICULTIES = ['easy', 'medium', 'hard'];

// Fallback data for testing/no-key scenarios
const MOCK_RECIPES = [
    {
        title: "Greitasis Ramen",
        category: "korejietiski",
        tags: ["greita", "sriuba", "ramen"],
        time_minutes: 15,
        difficulty: "easy",
        ingredients: ["Ramen makaronai", "Kiaušinis", "Svogūnų laiškai"],
        instructions: ["Išvirkite makaronus.", "Įmuškite kiaušinį.", "Pabarstykite svogūnais."]
    },
    {
        title: "Lietuviški Cepelinai",
        category: "lietuviski",
        tags: ["klasika", "sotis", "bulves"],
        time_minutes: 120,
        difficulty: "hard",
        ingredients: ["Bulvės", "Mėsa", "Grietinė"],
        instructions: ["Nuskuskite bulves.", "Sutarkuokite.", "Formuokite cepelinus.", "Virkite."]
    },
    {
        title: "Fusion Tacos",
        category: "fusion",
        tags: ["meksika", "koreja", "greita"],
        time_minutes: 30,
        difficulty: "medium",
        ingredients: ["Tortilijos", "Bulgogi jautiena", "Cheddar sūris", "Kimchi"],
        instructions: ["Iškepkite mėsą.", "Sušildykite tortilijas.", "Sudėkite ingredientus."]
    }
];

async function generateRecipe() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    let recipeData;
    let imagePath = "/images/recipes/default.svg";

    if (apiKey) {
        console.log("Using Gemini API to generate recipe...");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
      Generuok receptą šiam blogui: "Receptų blogas: LT x Korea Fusion".
      Kategorijos: ${CATEGORIES.join(', ')}.
      
      Grąžink tik JSON formatu be jokių papildomų tekstų (Markdown blocks ir pan.).
      
      JSON schema:
      {
        "title": "Pavadinimas",
        "category": "viena iš kategorijų",
        "ingredients": ["ing1", "ing2"],
        "instructions": ["1 žingsnis", "2 žingsnis"],
        "time_minutes": skaičius,
        "difficulty": "easy" | "medium" | "hard",
        "tags": ["tag1", "tag2"]
      }
      
      Stenkis sukurti įdomų, unikalų receptą. Nenaudok md code blocku, tik raw JSON.
    `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up if Gemini wraps in markdown code block
            const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

            recipeData = JSON.parse(cleanedText);
        } catch (error) {
            console.error("Error calling Gemini:", error);
            console.log("Falling back to mock data.");
            recipeData = getRandomMock();
        }
    } else {
        console.log("No Gemini Key found. Using mock data.");
        recipeData = getRandomMock();
    }

    // Generate unique slug
    let baseSlug = slugify(recipeData.title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    while (fs.existsSync(path.join(RECIPES_DIR, `${slug}.md`))) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    // Create Markdown content
    const frontmatter = `---
title: "${recipeData.title.replace(/"/g, '\\"')}"
date: "${new Date().toISOString()}"
category: "${recipeData.category}"
tags: ${JSON.stringify(recipeData.tags)}
time_minutes: ${recipeData.time_minutes}
difficulty: "${recipeData.difficulty}"
image: "${imagePath}"
---`;

    const body = `
# ${recipeData.title}

## Ingredientai
${recipeData.ingredients.map(i => `- ${i}`).join('\n')}

## Gaminimas
${recipeData.instructions.map((step, index) => `${index + 1}. ${step}`).join('\n')}
`;

    const fileContent = `${frontmatter}\n${body}`;
    const filePath = path.join(RECIPES_DIR, `${slug}.md`);

    // Ensure dir exists
    if (!fs.existsSync(RECIPES_DIR)) {
        fs.mkdirSync(RECIPES_DIR, { recursive: true });
    }

    fs.writeFileSync(filePath, fileContent);
    console.log(`Recipe created: ${filePath}`);
}

function getRandomMock() {
    const recipe = MOCK_RECIPES[Math.floor(Math.random() * MOCK_RECIPES.length)];
    // Add random variation to title to ensure uniqueness if run multiple times quickly with mocks
    const uniqueId = Math.floor(Math.random() * 1000);
    return {
        ...recipe,
        title: `${recipe.title} ${uniqueId}` // quick hack for uniqueness during testing
    };
}

generateRecipe();
