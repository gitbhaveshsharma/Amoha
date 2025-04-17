// src/components/UploadSection.tsx
"use client";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import { ImageIcon, UploadCloud } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";;
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { artworkFormSchema, ArtworkFormValues } from "@/schemas/artwork";

export const UploadSection = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const form = useForm<ArtworkFormValues>({
        resolver: zodResolver(artworkFormSchema),
        defaultValues: {
            title: "",
            art_location: "",
            artist_price: "",
            description: "",
            medium: "",
            dimensions: "",
            date: new Date().toISOString().split('T')[0],
        },
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            form.setValue("image", e.target.files);
        }
    };

    const onSubmit = async (values: ArtworkFormValues) => {
        setIsSubmitting(true);

        try {
            // 1. Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            // 2. Upload image to Supabase Storage
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

            if (uploadError) {
                console.error("Upload Error:", uploadError);
                throw uploadError;
            }

            // 3. Get public URL of the uploaded image
            const { data: { publicUrl } } = supabase
                .storage
                .from('artwork-uploads')
                .getPublicUrl(filePath);

            // 4. Save artwork data to database
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
                    user_id: user.id,
                    status: 'pending_review',
                }]);

            if (dbError) throw dbError;

            // 5. Reset form after successful submission
            form.reset();
            setPreviewUrl(null);
            toast.success("Artwork uploaded successfully!");

        } catch (error: any) {
            console.error("Error uploading artwork:", error);
            toast.error(error.message || "Error uploading artwork. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <Card className="max-w-5xl mx-auto">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl md:text-3xl font-bold text-center">Upload Artwork</CardTitle>
                    <CardDescription className="text-center">
                        Fill in the details below to upload your artwork
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <span className="flex items-center">
                                            <UploadCloud className="animate-pulse mr-2 h-5 w-5" />
                                            Uploading...
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <UploadCloud className="mr-2 h-5 w-5" />
                                            Upload Artwork
                                        </span>
                                    )}
                                </Button>
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
                            </div>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center text-sm text-muted-foreground">
                    All artwork submissions are reviewed before being listed
                </CardFooter>
            </Card>
        </div>
    );
};