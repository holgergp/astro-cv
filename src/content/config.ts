import { SITE } from "@config";
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image()
        .refine(img => img.width >= 1200 && img.height >= 630, {
          message: "OpenGraph image must be at least 1200 X 630 pixels!",
        })
        .or(z.string())
        .optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
    }),
});

const frontpage = defineCollection({
  type: "data",
  schema: () =>
    z.object({
      name: z.string().default(SITE.author),
      phone: z.string(),
      email: z.string(),
      title: z.string(),
      street: z.string(),
      city: z.string(),
      zip: z.string(),
      country: z.string(),
      nationality: z.string(),
    }),
});

const careerItemSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime().optional(),
  company: z.string(),
  role: z.string(),
  description: z.string(),
  link: z.string().url().optional(),
  logoUrl: z.string().optional(),
});
const career = defineCollection({
  type: "data",
  schema: () => z.array(careerItemSchema),
});

const buzzwordsSchema = z.object({
  name: z.string(),
  buzzwords: z.array(z.string()),
});

const buzzwords = defineCollection({
  type: "data",
  schema: () => z.array(buzzwordsSchema),
});

const publicationSchema = z.object({
  date: z.string().datetime().optional(),
  source: z.string().optional(),
  coauthor: z.string().optional(),
  title: z.string(),
  link: z.string().url().optional(),
});
const publications = defineCollection({
  type: "data",
  schema: () => z.array(publicationSchema),
});

export const collections = { blog, frontpage, career, buzzwords, publications };
