"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ImageIcon, X, Loader2 } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArtCategorySelect } from "@/components/ArtCategorySelect";
import { Textarea } from "@/components/ui/textarea";
import { artworkFormSchema } from "@/schemas/artwork";
import { CurrencySelect } from "@/components/CurrencySelect";
import { CurrencyCode } from "@/types/currency";
import { useCurrencyStore } from "@/stores/currency/currencyStore";
import { ArtworkFormValues } from "@/schemas/artwork";
import { useArtworkStore } from "@/stores/artwork/artworkStore";
import { toast } from "react-toastify";
import { Artwork } from "@/types";

interface EditArtworkModalProps {
    artwork: Artwork;
    isOpen: boolean;
    onClose: () => void;
    onArtworkUpdated: () => void;
}

export const EditArtworkModal = ({
    artwork,
    isOpen,
    onClose,
    onArtworkUpdated,
}: EditArtworkModalProps) => {
    const { session } = useSession();
    const { updateArtwork } = useArtworkStore();
    const [previewUrl, setPreviewUrl] = useState<string | null>(artwork.image_url || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const { currencies, fetchCurrencies } = useCurrencyStore();

    const form = useForm<ArtworkFormValues>({
        resolver: zodResolver(artworkFormSchema),
        mode: "onChange",
        defaultValues: {
            title: artwork.title,
            art_category: artwork.art_category,
            art_location: artwork.art_location,
            artist_price: artwork.artist_price?.toString() || "",
            description: artwork.description,
            medium: artwork.medium,
            dimensions: artwork.dimensions,
            date: artwork.date ? new Date(artwork.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            currency: artwork.currency || "USD",
            image: undefined as unknown as FileList,
        },
    }) as unknown as ReturnType<typeof useForm<ArtworkFormValues>>;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleClose();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (currencies.length === 0) {
            fetchCurrencies();
        }
    }, [currencies.length, fetchCurrencies]);

    useEffect(() => {
        if (isOpen && artwork) {
            // First reset the form to clear any previous state
            form.reset();

            // Then set the new values after a small delay to ensure clean state
            const timer = setTimeout(() => {
                form.reset({
                    title: artwork.title,
                    art_category: artwork.art_category,
                    art_location: artwork.art_location,
                    artist_price: artwork.artist_price?.toString() || "",
                    description: artwork.description,
                    medium: artwork.medium,
                    dimensions: artwork.dimensions,
                    date: artwork.date ? new Date(artwork.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    currency: artwork.currency || "USD",
                    image: undefined as unknown as FileList,
                });
            }, 50);

            return () => clearTimeout(timer);
        }
    }, [artwork, isOpen, form]);
    // Debug useEffect
    useEffect(() => {
        console.log("Current artwork category:", artwork?.art_category);
        console.log("Form art_category value:", form.watch("art_category"));
        console.log("Is form dirty?", form.formState.isDirty);
    }, [artwork, form]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            setNewImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            form.setValue("image", files, { shouldValidate: true });
            form.clearErrors("image");
        }
    };

    const handleClose = () => {
        setPreviewUrl(artwork.image_url || null);
        setNewImageFile(null);
        form.reset();
        onClose();
    };

    const onSubmit = async (values: ArtworkFormValues) => {
        if (!session?.user?.id) return;

        setIsSubmitting(true);
        try {
            const updateData = {
                title: values.title,
                art_category: values.art_category,
                art_location: values.art_location,
                artist_price: parseFloat(values.artist_price),
                description: values.description,
                medium: values.medium,
                dimensions: values.dimensions,
                date: values.date,
                currency: values.currency,
                ...(newImageFile && { image: newImageFile }), // Include image only if changed
            };

            await updateArtwork(artwork.id, updateData);
            // toast.success("Artwork updated successfully!");
            onArtworkUpdated();
            handleClose();
        } catch (error) {
            console.error("Update failed:", error);
            toast.error("Failed to update artwork. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            key={artwork.id} // Ensure React reinitializes the modal when artwork changes
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 overflow-y-auto"
        >
            <div className="fixed inset-0 dark:bg-gray-800 bg-opacity-90 transition-opacity" onClick={handleClose}></div>

            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl h-[95vh] max-h-[95vh] overflow-hidden">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 z-50 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="h-6 w-6 text-gray-500" />
                    </button>

                    <div className="h-full flex flex-col">
                        <CardHeader className="space-y-1 sticky top-0 bg-white z-10 border-b p-6">
                            <CardTitle className="text-2xl md:text-3xl font-bold text-center">
                                Edit Artwork
                            </CardTitle>
                            <CardDescription className="text-center">
                                Update the details of your artwork
                            </CardDescription>
                        </CardHeader>

                        <div className="flex-1 overflow-y-auto p-6">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
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
                                                                            <Image
                                                                                src={previewUrl}
                                                                                alt="Preview"
                                                                                className="max-h-[50vh] max-w-full object-contain rounded-md"
                                                                                width={500}
                                                                                height={500}
                                                                                onLoad={() => {
                                                                                    if (newImageFile) {
                                                                                        URL.revokeObjectURL(previewUrl);
                                                                                    }
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <>
                                                                                <ImageIcon className="w-10 h-10 mb-3 text-muted-foreground" />
                                                                                <p className="mb-2 text-sm text-muted-foreground text-center">
                                                                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                                                                </p>
                                                                                <p className="text-xs text-muted-foreground text-center">
                                                                                    SVG, PNG, JPG or GIF (MAX. 10MB)
                                                                                </p>
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
                                                            {!newImageFile && (
                                                                <p className="text-sm text-muted-foreground text-center">
                                                                    Current image will be kept if no new image is selected
                                                                </p>
                                                            )}
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Button
                                            type="submit"
                                            className="w-full mt-auto"
                                            disabled={isSubmitting || !form.formState.isValid}
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center">
                                                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                                    Updating...
                                                </span>
                                            ) : (
                                                <span className="flex items-center">
                                                    Save Changes
                                                </span>
                                            )}
                                        </Button>
                                    </div>

                                    <div className="space-y-4 h-full overflow-y-auto">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="title"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Title*</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Artwork title"
                                                                {...field}
                                                            />
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
                                                        <FormLabel>Category*</FormLabel>
                                                        <FormControl>
                                                            <ArtCategorySelect
                                                                key={`category-select-${artwork.id}`}
                                                                field={field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="art_location"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Location*</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Artwork location"
                                                                {...field}
                                                                onChange={(e) => {
                                                                    field.onChange(e);
                                                                    form.trigger("art_location");
                                                                }}
                                                            />
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
                                                        <FormLabel>Medium*</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Oil on canvas, Bronze, etc."
                                                                {...field}
                                                                onChange={(e) => {
                                                                    field.onChange(e);
                                                                    form.trigger("medium");
                                                                }}
                                                            />
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
                                                        <FormLabel>Dimensions*</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="e.g. 24 x 36 inches"
                                                                {...field}
                                                                onChange={(e) => {
                                                                    field.onChange(e);
                                                                    form.trigger("dimensions");
                                                                }}
                                                            />
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
                                                        <FormLabel>Date*</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="date"
                                                                {...field}
                                                                onChange={(e) => {
                                                                    field.onChange(e);
                                                                    form.trigger("date");
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="currency"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Currency*</FormLabel>
                                                        <FormControl>
                                                            <CurrencySelect
                                                                field={field}
                                                                artworkId={artwork.id}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="artist_price"
                                                render={({ field }) => {
                                                    const currencyCode = form.watch("currency") as CurrencyCode;
                                                    const currency = currencies.find(c => c.code === currencyCode);
                                                    const symbol = currency?.symbol || "$"; // Fallback to dollar sign

                                                    return (
                                                        <FormItem>
                                                            <FormLabel>Price*</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="0.00"
                                                                        className="pl-8"
                                                                        min="0"
                                                                        step="0.01"
                                                                        {...field}
                                                                        onChange={(e) => {
                                                                            field.onChange(e);
                                                                            form.trigger("artist_price");
                                                                        }}
                                                                    />
                                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                                                                        {symbol}
                                                                    </span>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    );
                                                }}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description*</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Describe your artwork..."
                                                            className="resize-none min-h-[150px]"
                                                            {...field}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                                form.trigger("description");
                                                            }}
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
                            Changes may take a few minutes to appear
                        </CardFooter>
                    </div>
                </div>
            </div>
        </div>
    );
};