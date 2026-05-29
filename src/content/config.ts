import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    pinned: z.boolean().default(false),
    image: z.string().optional(),
    dir: z.string().optional(),
    draft: z.boolean().default(false),
    hide: z.boolean().default(false),
  }),
});

export const collections = { posts };
