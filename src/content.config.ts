import { SITE } from "@config";
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const frontpage = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/frontpage" }),
  schema: () =>
    z.object({
      name: z.string().default(SITE.author),
      phone: z.string(),
      email: z.string(),
      title: z.string(),
      tags: z.array(z.string()),
      street: z.string(),
      city: z.string(),
      zip: z.string(),
      country: z.string(),
      nationality: z.string(),
    }),
});

const careerItemSchema = z.object({
  from: z.iso.datetime(),
  to: z.iso.datetime().optional(),
  company: z.string(),
  role: z.string(),
  description: z.string(),
  link: z.url().optional(),
  logoUrl: z.string().optional(),
});
const career = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/career" }),
  schema: () => z.array(careerItemSchema),
});

const buzzwordsSchema = z.object({
  name: z.string(),
  buzzwords: z.array(z.string()),
});

const buzzwords = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/buzzwords" }),
  schema: () => z.array(buzzwordsSchema),
});

const publicationSchema = z.object({
  date: z.iso.datetime().optional(),
  source: z.string().optional(),
  coauthor: z.string().optional(),
  title: z.string(),
  link: z.url().optional(),
  featured: z.boolean().optional(),
});
const publications = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/publications" }),
  schema: () => z.array(publicationSchema),
});

const certificationSchema = z.object({
  date: z.iso.datetime().optional(),
  source: z.string().optional(),
  title: z.string(),
});
const certifications = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/certifications" }),
  schema: () => z.array(certificationSchema),
});

const projectSchema = z.object({
  from: z.iso.datetime(),
  to: z.iso.datetime().optional(),
  forCompany: z.string().optional(),
  branch: z.string(),
  description: z.string(),
  roles: z.array(z.string()),
  buzzwords: z.array(z.string()),
});
const projects = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/projects" }),
  schema: () => z.array(projectSchema),
});

export const collections = {
  frontpage,
  career,
  buzzwords,
  publications,
  certifications,
  projects,
};
