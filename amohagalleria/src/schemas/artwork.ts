// schemas/artwork.ts
import { z } from "zod";
import { useCurrencyStore } from "@/stores/currency/currencyStore";
import { useArtCategoryStore } from "@/stores/ArtCategory/artCategoryStore";

// Helper function to get category slugs
const getCategorySlugs = () => {
    const { categories } = useArtCategoryStore.getState();
    return categories
        .filter(cat => !cat.is_banned)
        .map(cat => cat.slug);
};

// Helper function to get currency codes
const getCurrencyCodes = () => {
    const { currencies } = useCurrencyStore.getState();
    return currencies.map(currency => currency.code);
};

// Reusable validators (unchanged)
const nonEmptyString = (fieldName: string) =>
    z.string().min(1, { message: `${fieldName} is required` });

const textField = (fieldName: string, min: number = 2, max: number = 255) =>
    nonEmptyString(fieldName)
        .min(min, { message: `${fieldName} must be at least ${min} characters` })
        .max(max, { message: `${fieldName} must be at most ${max} characters` })
        .refine(val => !/^\s+$/.test(val), {
            message: `${fieldName} cannot be only whitespace`
        })
        .transform(val => val.trim());

const priceValidator = z.string()
    .min(1, { message: "Price is required" })
    .refine(val => /^\d+(\.\d{1,2})?$/.test(val), {
        message: "Price must be a valid number with up to 2 decimal places"
    })
    .refine(val => parseFloat(val) > 0, {
        message: "Price must be greater than 0"
    })
    .refine(val => parseFloat(val) <= 10_000_000, {
        message: "Price must be less than 10,000,000"
    });

const dateValidator = z.string()
    .min(1, { message: "Date is required" })
    .refine(val => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date <= new Date();
    }, {
        message: "Must be a valid date not in the future"
    });

const dimensionsValidator = z.string()
    .min(1, { message: "Dimensions are required" })
    .refine(val => /^[\d\s×x,.]+(cm|in|mm|m|ft|")?$/i.test(val), {
        message: "Enter valid dimensions (e.g., '24×36 in' or '60x90 cm')"
    })
    .transform(val => val.replace(/\s+/g, ' ').trim());

const imageValidator = z.custom<FileList>()
    .optional() // Allow optional image during updates
    .refine(files => !files || files?.length >= 1, "Image is required")
    .refine(files => !files || files?.[0]?.size <= 10 * 1024 * 1024, "Max file size is 10MB")
    .refine(files => !files || [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/heic",
        "image/heif",
        "image/gif"
    ].includes(files?.[0]?.type), {
        message: "Only .jpg, .jpeg, .png, .webp, .heic, .gif formats are supported"
    })
    .refine(files => {
        const img = files?.[0];
        if (!img) return true;
        return new Promise(resolve => {
            const imgEl = new Image();
            imgEl.onload = () => resolve(imgEl.width >= 500 && imgEl.height >= 500);
            imgEl.onerror = () => resolve(false);
            imgEl.src = URL.createObjectURL(img);
        });
    }, {
        message: "Image must be at least 500x500 pixels"
    });

// Dynamic category validator
const categoryValidator = z.string()
    .min(1, "Category is required")
    .refine(
        (val) => {
            const slugs = getCategorySlugs();
            return slugs.includes(val);
        },
        {
            message: "Please select a valid category",
        }
    );

export const artworkFormSchema = z.object({
    title: textField("Title", 2, 100)
        .refine(val => !/[<>]/.test(val), {
            message: "Title cannot contain HTML tags"
        }),

    art_category: categoryValidator,

    art_location: textField("Location", 2, 100)
        .refine(val => /^[a-zA-Z\s,'-]+$/.test(val), {
            message: "Location contains invalid characters"
        }),

    artist_price: priceValidator,

    description: textField("Description", 10, 2000)
        .refine(val => val.split(/\s+/).length >= 10, {
            message: "Description must contain at least 10 words"
        }),

    medium: textField("Medium", 2, 100)
        .refine(val => /^[a-zA-Z\s,&-]+$/.test(val), {
            message: "Medium contains invalid characters"
        }),

    dimensions: dimensionsValidator,

    date: dateValidator,

    image: imageValidator,


    currency: z.string()
        .min(1, { message: "Currency is required" })
        .refine(val => {
            const codes = getCurrencyCodes();
            return codes.includes(val);
        }, {
            message: "Please select a valid currency",
        }),

})

export type ArtworkFormValues = z.infer<typeof artworkFormSchema>;