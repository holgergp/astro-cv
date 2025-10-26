import { SITE } from "@config";
import { defineCollection, z } from "astro:content";

const frontpage = defineCollection({
  type: "data",
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
  featured: z.boolean().optional(),
});
const publications = defineCollection({
  type: "data",
  schema: () => z.array(publicationSchema),
});

const certificationSchema = z.object({
  date: z.string().datetime().optional(),
  source: z.string().optional(),
  title: z.string(),
});
const certifications = defineCollection({
  type: "data",
  schema: () => z.array(certificationSchema),
});

const projectSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime().optional(),
  forCompany: z.string().optional(),
  branch: z.string(),
  description: z.string(),
  roles: z.array(z.string()),
  buzzwords: z.array(z.string()),
});
const projects = defineCollection({
  type: "data",
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
