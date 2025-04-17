// src/schemas/artwork.ts
import { z } from "zod";

export const artworkFormSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
    art_category: z.string({
        required_error: "Please select a category.",
    }),
    art_location: z.string().min(2, {
        message: "Location must be at least 2 characters.",
    }),
    artist_price: z.string().min(1, {
        message: "Please enter a price.",
    }),
    description: z.string().min(10, {
        message: "Description must be at least 10 characters.",
    }),
    medium: z.string().min(2, {
        message: "Medium must be at least 2 characters.",
    }),
    dimensions: z.string().min(2, {
        message: "Dimensions must be at least 2 characters.",
    }),
    date: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: "Please enter a valid date",
    }),
    image: z
        .any()
        .refine((files) => files?.length >= 1, "Image is required.")
        .refine((files) => files?.[0]?.size <= 5 * 1024 * 1024, "Max file size is 5MB.")
        .refine(
            (files) => ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(files?.[0]?.type),
            "Only .jpg, .jpeg, .png, .gif, and .webp formats are supported."
        ),
});

export type ArtworkFormValues = z.infer<typeof artworkFormSchema>;