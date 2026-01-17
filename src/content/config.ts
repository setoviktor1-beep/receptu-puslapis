import { defineCollection, z } from 'astro:content';

const recipes = defineCollection({
    schema: z.object({
        title: z.string(),
        date: z.string().transform((str) => new Date(str)), // or z.date() if using YAML date
        category: z.enum([
            'vegetariski',
            'mesa',
            'paukstiena',
            'zuvis',
            'sriubos',
            'desertai',
            'korejietiski',
            'lietuviski',
            'fusion'
        ]),
        tags: z.array(z.string()).default([]),
        time_minutes: z.number().min(1),
        difficulty: z.enum(['easy', 'medium', 'hard']),
        image: z.string().optional().default('/images/default-recipe.jpg'),
    }),
});

export const collections = { recipes };
