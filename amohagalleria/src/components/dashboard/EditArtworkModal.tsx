// src/components/EditArtworkModal.tsx
"use client";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ImageIcon, UploadCloud } from "lucide-react";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { artworkFormSchema, ArtworkFormValues } from "@/schemas/artwork";

interface EditArtworkModalProps {
    artwork: {
        id: string;
        title: string;
        art_category: string;
        art_location: string;
        artist_price: number;
        description: string;
        medium: string;
        dimensions: string;
        date: string;
        image_url: string;
    };
    isOpen: boolean;
    onClose: () => void;
    onArtworkUpdated: () => void;
}

export const EditArtworkModal = ({ artwork, isOpen, onClose, onArtworkUpdated }: EditArtworkModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(artwork?.image_url || null);
    const [isImageChanged, setIsImageChanged] = useState(false);

    const form = useForm<ArtworkFormValues>({
        resolver: zodResolver(artworkFormSchema),
        defaultValues: {
            title: artwork.title,
            art_category: artwork.art_category,
            art_location: artwork.art_location,
            artist_price: artwork.artist_price.toString(),
            description: artwork.description,
            medium: artwork.medium,
            dimensions: artwork.dimensions,
            date: artwork.date,
            image: undefined, // Initialize image as undefined
        },
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            form.setValue("image", e.target.files);
            setIsImageChanged(true);
        }
    };

    const onSubmit = async (values: ArtworkFormValues) => {
        setIsSubmitting(true);

        try {
            // 1. Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            let imageUrl = artwork.image_url;

            // 2. Only handle image if it was changed
            if (isImageChanged && values.image) {
                // Upload new image
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

                // Get public URL of the uploaded image
                const { data: { publicUrl } } = supabase
                    .storage
                    .from('artwork-uploads')
                    .getPublicUrl(filePath);

                imageUrl = publicUrl;

                // Delete old image only after new image is successfully uploaded
                if (artwork.image_url) {
                    const oldFileName = artwork.image_url.split('/').pop();
                    if (oldFileName) {
                        await supabase.storage
                            .from('artwork-uploads')
                            .remove([oldFileName]);
                    }
                }
            }

            // 3. Update artwork data in database
            const updateData: {
                title: string;
                art_category: string;
                art_location: string;
                artist_price: number;
                description: string;
                medium: string;
                dimensions: string;
                date: string;
                status: string;
                image_url?: string; // Add optional image_url property
            } = {
                title: values.title,
                art_category: values.art_category,
                art_location: values.art_location,
                artist_price: parseFloat(values.artist_price),
                description: values.description,
                medium: values.medium,
                dimensions: values.dimensions,
                date: values.date,
                status: 'pending_review', // Set back to pending review after edit
            };

            // Only include image_url in update if it was changed
            if (isImageChanged) {
                updateData.image_url = imageUrl;
            }

            const { error: dbError } = await supabase
                .from('artworks')
                .update(updateData)
                .eq('id', artwork.id);

            if (dbError) throw dbError;

            // 4. Show success and close modal
            toast.success("Artwork updated successfully!");
            onArtworkUpdated();
            onClose();

        } catch (error: any) {
            console.error("Error updating artwork:", error);
            toast.error(error.message || "Error updating artwork. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!artwork) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Edit Artwork</DialogTitle>
                    {/* <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button> */}
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column - Image Upload */}
                        <div className="space-y-6">
                            <FormField
                                control={form.control}
                                name="image"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Artwork Image</FormLabel>
                                        <FormControl>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-center w-full">
                                                    <label
                                                        htmlFor="dropzone-file"
                                                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                                                    >
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                            {previewUrl ? (
                                                                <img
                                                                    src={previewUrl}
                                                                    alt="Preview"
                                                                    className="max-h-52 max-w-full object-contain rounded-md"
                                                                />
                                                            ) : (
                                                                <>
                                                                    <ImageIcon className="w-10 h-10 mb-3 text-muted-foreground" />
                                                                    <p className="mb-2 text-sm text-muted-foreground">
                                                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 5MB)</p>
                                                                </>
                                                            )}
                                                        </div>
                                                        <Input
                                                            id="dropzone-file"
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={handleImageChange}
                                                        />
                                                    </label>
                                                </div>
                                                {!isImageChanged && previewUrl && (
                                                    <p className="text-sm text-muted-foreground text-center">
                                                        Current image will be kept unless you upload a new one
                                                    </p>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Right Column - Artwork Details */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Artwork title" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="art_category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="painting">Painting</SelectItem>
                                                    <SelectItem value="sculpture">Sculpture</SelectItem>
                                                    <SelectItem value="photography">Photography</SelectItem>
                                                    <SelectItem value="digital">Digital Art</SelectItem>
                                                    <SelectItem value="mixed_media">Mixed Media</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="art_location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Artwork location" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="artist_price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price ($)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Price" type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="medium"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Medium</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Oil on canvas, Bronze, etc." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dimensions"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Dimensions</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. 24 x 36 inches" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Description of your artwork"
                                                className="resize-none min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <span className="flex items-center">
                                        <UploadCloud className="animate-pulse mr-2 h-5 w-5" />
                                        Updating...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <UploadCloud className="mr-2 h-5 w-5" />
                                        Update Artwork
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};