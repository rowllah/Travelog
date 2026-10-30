import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const PLACE_TYPES = ['stay', 'food', 'activity', 'experience', 'operator'] as const;
export const BUDGET_CATEGORIES = [
  'flights', 'visa', 'insurance', 'stay', 'food', 'transport', 'activities', 'shopping', 'package', 'other',
] as const;

const money = {
  amount: z.number(),
  currency: z.string().length(3).default('INR'),
};

const trips = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/trips' }),
  schema: z.object({
    title: z.string(),
    country: z.string(),
    flag: z.string().default('🌍'),
    region: z.string(),
    destinations: z.array(z.string()).default([]),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    /** Months ("YYYY-MM") of repeat visits when exact dates weren't recorded. */
    visits: z.array(z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)).default([]),
    company: z.string().optional(),
    travellers: z.number().int().positive().default(1),
    styles: z.array(z.string()).default([]),
    localCurrency: z.string().length(3).default('INR'),
    cover: z.string().optional(),
    coverCredit: z.string().optional(),
    summary: z.string(),
    highlights: z.array(z.string()).default([]),
    bestTime: z.string().optional(),
    rating: z.number().min(1).max(5).optional(),
    upcoming: z.boolean().default(false),
    budget: z
      .object({
        travellers: z.number().int().positive().default(1),
        note: z.string().optional(),
        items: z.array(
          z.object({
            label: z.string(),
            category: z.enum(BUDGET_CATEGORIES).default('other'),
            estimate: z.boolean().default(false),
            ...money,
          }).strict(),
        ),
      })
      .optional(),
    days: z
      .array(
        z.object({
          title: z.string(),
          base: z.string().optional(),
          stay: z.string().optional(),
          items: z.array(z.string()).default([]),
        }).strict(),
      )
      .default([]),
    places: z
      .array(
        z.object({
          name: z.string(),
          type: z.enum(PLACE_TYPES),
          location: z.string().optional(),
          notes: z.string().optional(),
          cost: z.number().optional(),
          costMax: z.number().optional(),
          currency: z.string().length(3).optional(),
          per: z.string().optional(),
          link: z.string().url().optional(),
          tried: z.boolean().default(true),
          favourite: z.boolean().default(false),
        }).strict(),
      )
      .default([]),
    tips: z.array(z.string()).default([]),
    checklist: z.array(z.string()).default([]),
    photos: z.array(z.object({ src: z.string(), caption: z.string().optional() })).default([]),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    trip: z.string().optional(),
    excerpt: z.string().optional(),
    cover: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { trips, blog };
