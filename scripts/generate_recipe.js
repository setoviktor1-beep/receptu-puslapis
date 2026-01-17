import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import OpenAI from 'openai';
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
    const apiKey = process.env.OPENAI_API_KEY;
    let recipeData;
    let imagePath = "/images/recipes/default.svg";

    if (apiKey) {
        console.log("Using OpenAI API to generate recipe...");
        const openai = new OpenAI({ apiKey });

        const prompt = `
      Generuok receptą šiam blogui: "Receptų blogas: LT x Korea Fusion".
      Kategorijos: ${CATEGORIES.join(', ')}.
      
      Grąžink tik JSON formatu be jokių papildomų tekstų (Markdown blocks ir pan.):
      {
        "title": "Pavadinimas",
        "category": "viena iš kategorijų",
        "ingredients": ["ing1", "ing2"],
        "instructions": ["1 žingsnis", "2 žingsnis"],
        "time_minutes": skaičius,
        "difficulty": "easy" | "medium" | "hard",
        "tags": ["tag1", "tag2"]
      }
      
      Stenkis sukurti įdomų, unikalų receptą.
    `;

        try {
            const completion = await openai.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "gpt-4-turbo-preview", // or gpt-3.5-turbo
                response_format: { type: "json_object" },
            });

            recipeData = JSON.parse(completion.choices[0].message.content);

            // Generate Image
            console.log("Generating image...");
            try {
                const imagePrompt = `Professional food photography of ${recipeData.title}, high resolution, delicious, appetizing, 4k`;
                const imageResponse = await openai.images.generate({
                    model: "dall-e-3",
                    prompt: imagePrompt,
                    n: 1,
                    size: "1024x1024",
                });

                const imageUrl = imageResponse.data[0].url;
                if (imageUrl) {
                    const imageSlug = slugify(recipeData.title, { lower: true, strict: true });
                    const imageFileName = `${imageSlug}-${Date.now()}.jpg`;
                    const localImagePath = path.join(IMAGES_DIR, imageFileName);
                    const publicPath = `/images/recipes/${imageFileName}`;

                    // Ensure dir exists
                    if (!fs.existsSync(IMAGES_DIR)) {
                        fs.mkdirSync(IMAGES_DIR, { recursive: true });
                    }

                    // Download image
                    const imgRes = await fetch(imageUrl);
                    const buffer = await imgRes.arrayBuffer();
                    fs.writeFileSync(localImagePath, Buffer.from(buffer));
                    console.log(`Image saved to ${localImagePath}`);

                    imagePath = publicPath;
                }
            } catch (imgError) {
                console.error("Error generating/saving image:", imgError);
                // Fallback to default
            }

        } catch (error) {
            console.error("Error calling OpenAI:", error);
            console.log("Falling back to mock data.");
            recipeData = getRandomMock();
        }
    } else {
        console.log("No OpenAI Key found. Using mock data.");
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
