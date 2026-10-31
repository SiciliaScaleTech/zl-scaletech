import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const offres = defineCollection({
	loader: glob({ base: './src/content/offres', pattern: '**/*.md' }),
	schema: z.object({ title: z.string(), description: z.string(), category: z.enum(['vitrine', 'e-commerce']) }),
});

const faq = defineCollection({
	loader: glob({ base: './src/content/faq', pattern: '**/*.md' }),
	schema: z.object({ question: z.string(), order: z.number().int().nonnegative() }),
});

const realisations = defineCollection({
	loader: glob({ base: './src/content/realisations', pattern: '**/*.md' }),
	schema: z.object({ title: z.string(), summary: z.string(), tags: z.array(z.string()) }),
});

// Pages légales : un fichier Markdown par page, sommaire généré depuis les titres de niveau 2.
const legal = defineCollection({
	loader: glob({ base: './src/content/legal', pattern: '**/*.md' }),
	schema: z.object({ title: z.string(), description: z.string(), updated: z.string() }),
});

export const collections = { offres, faq, realisations, legal };
