// schemas/artCategory.ts
import { z } from "zod";

export const artCategorySchema = z.object({
    slug: z.string()
        .min(1, "Slug is required")
        .regex(/^[a-z0-9_]+$/, "Slug must be lowercase with underscores"),
    label: z.string().min(1, "Label is required"),
    is_banned: z.boolean(),
    created_by: z.string().nullable().optional(),
});

export const artCategoryInsertSchema = z.object({
    label: z.string().min(1, "Label is required"),
    slug: z.string()
        .min(1, "Slug is required")
        .regex(/^[a-z0-9_]+$/, "Slug must be lowercase with underscores"),
    is_banned: z.boolean(),
    created_by: z.string().nullable(),
});

export const artCategoryUpdateSchema = artCategorySchema.partial();