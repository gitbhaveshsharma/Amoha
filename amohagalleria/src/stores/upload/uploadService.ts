// stores/upload/uploadService.ts
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";

export type ArtworkUploadValues = {
    title: string;
    art_category: string;
    art_location: string;
    artist_price: string;
    description: string;
    medium: string;
    dimensions: string;
    date: string;
    image: FileList;
};

export const uploadService = {
    uploadArtwork: async (values: ArtworkUploadValues, userId: string) => {
        try {
            // 1. Upload image to Supabase Storage
            const imageFile = values.image[0];
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('artwork-uploads')
                .upload(filePath, imageFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // 2. Get public URL of the uploaded image
            const { data: { publicUrl } } = supabase
                .storage
                .from('artwork-uploads')
                .getPublicUrl(filePath);

            // 3. Save artwork data to database
            const { error: dbError } = await supabase
                .from('artworks')
                .insert([{
                    title: values.title,
                    art_category: values.art_category,
                    art_location: values.art_location,
                    artist_price: parseFloat(values.artist_price),
                    description: values.description,
                    medium: values.medium,
                    dimensions: values.dimensions,
                    date: values.date,
                    image_url: publicUrl,
                    user_id: userId,
                    status: 'pending_review',
                }]);

            if (dbError) throw dbError;

            return { success: true };
        } catch (error: unknown) {
            console.error("Error uploading artwork:", error);
            const errorMessage = error instanceof Error ? error.message : "Error uploading artwork. Please try again.";
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    }
};