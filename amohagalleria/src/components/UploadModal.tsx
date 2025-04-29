// components/UploadModal.tsx
"use client";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ImageIcon, UploadCloud, X } from "lucide-react";
import { useUploadStore } from "@/stores/upload/uploadStore";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/Button";
import { CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { artworkFormSchema, ArtworkFormValues } from "@/schemas/artwork";

export const UploadModal = () => {
    const { isUploadModalOpen, closeUploadModal, isSubmitting, uploadArtwork } = useUploadStore();
    const { session } = useSession();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Close modal on Escape key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isUploadModalOpen) {
                closeUploadModal();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isUploadModalOpen, closeUploadModal]);

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
        if (!session?.user?.id) return;

        if (!values.image) {
            console.error("Image is required to upload artwork.");
            return;
        }

        await uploadArtwork(values as Required<ArtworkFormValues>, session.user.id);

        if (form.formState.isSubmitSuccessful) {
            form.reset();
            setPreviewUrl(null);
            closeUploadModal();
        }
    };

    if (!isUploadModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 overflow-y-auto">
            {/* Background overlay */}
            <div
                className="fixed inset-0 dark:bg-gray-800 bg-opacity-90 transition-opacity"
                onClick={closeUploadModal}
            ></div>

            {/* Modal container */}
            <div className="flex items-center justify-center min-h-screen p-4">
                {/* Modal content */}
                <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl h-[95vh] max-h-[95vh] overflow-hidden">
                    {/* Close button */}
                    <button
                        onClick={closeUploadModal}
                        className="absolute top-4 right-4 z-50 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-6 w-6 text-gray-500" />
                    </button>

                    {/* Card content */}
                    <div className="h-full flex flex-col">
                        <CardHeader className="space-y-1 sticky top-0 bg-white z-10 border-b p-6">
                            <CardTitle className="text-2xl md:text-3xl font-bold text-center">
                                Upload Artwork
                            </CardTitle>
                            <CardDescription className="text-center">
                                Fill in the details below to upload your artwork
                            </CardDescription>
                        </CardHeader>

                        <div className="flex-1 overflow-y-auto p-6">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                                    {/* Left Column - Image Upload */}
                                    <div className="space-y-6 h-full flex flex-col">
                                        <FormField
                                            control={form.control}
                                            name="image"
                                            render={() => (
                                                <FormItem className="flex-1 flex flex-col">
                                                    <FormLabel>Artwork Image</FormLabel>
                                                    <FormControl>
                                                        <div className="space-y-4 flex-1 flex flex-col">
                                                            <div className="flex-1 flex items-center justify-center">
                                                                <label
                                                                    htmlFor="dropzone-file"
                                                                    className="flex flex-col items-center justify-center w-full h-full min-h-[300px] border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                                                                >
                                                                    <div className="flex flex-col items-center justify-center p-5">
                                                                        {previewUrl ? (
                                                                            <img
                                                                                src={previewUrl}
                                                                                alt="Preview"
                                                                                className="max-h-[50vh] max-w-full object-contain rounded-md"
                                                                            />
                                                                        ) : (
                                                                            <>
                                                                                <ImageIcon className="w-10 h-10 mb-3 text-muted-foreground" />
                                                                                <p className="mb-2 text-sm text-muted-foreground text-center">
                                                                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                                                                </p>
                                                                                <p className="text-xs text-muted-foreground text-center">SVG, PNG, JPG or GIF (MAX. 5MB)</p>
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

                                        <Button type="submit" className="w-full mt-auto" disabled={isSubmitting}>
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
                                    <div className="space-y-4 h-full overflow-y-auto">                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                            className="resize-none min-h-[150px]"
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
                        </div>

                        <CardFooter className="flex justify-center text-sm text-muted-foreground border-t sticky bottom-0 bg-white p-4">
                            All artwork submissions are reviewed before being listed
                        </CardFooter>
                    </div>
                </div>
            </div>
        </div>
    );
};