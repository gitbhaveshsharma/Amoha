// components/UploadSection.tsx
"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ImageIcon, UploadCloud } from "lucide-react";
import { useUploadStore } from "@/stores/upload/uploadStore";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArtCategorySelect } from "@/components/ArtCategorySelect";
import { CurrencySelect } from "@/components/CurrencySelect"
import { Textarea } from "@/components/ui/textarea";
import { artworkFormSchema } from "@/schemas/artwork";
import { DEFAULT_CURRENCY } from "@/types/currency";
import { CurrencyCode } from "@/types/currency";
import { useCurrencyStore } from "@/stores/currency/currencyStore";
import { ArtworkFormValues } from "@/schemas/artwork";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const UploadSection = () => {
    const {
        isSubmitting,
        uploadArtwork,
        success,
        reset: resetStore,
    } = useUploadStore();

    const { session } = useSession();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadedTitle, setUploadedTitle] = useState("");
    const { currencies, fetchCurrencies } = useCurrencyStore();

    const form = useForm<ArtworkFormValues>({
        resolver: zodResolver(artworkFormSchema),
        mode: "onChange",
        defaultValues: {
            title: "",
            art_category: undefined,
            art_location: "",
            artist_price: "",
            description: "",
            medium: "",
            dimensions: "",
            date: new Date().toISOString().split('T')[0],
            currency: DEFAULT_CURRENCY,
            image: undefined as unknown as FileList,
        },
    }) as unknown as ReturnType<typeof useForm<ArtworkFormValues>>;

    useEffect(() => {
        if (currencies.length === 0) {
            fetchCurrencies();
        }
    }, [currencies.length, fetchCurrencies]);

    useEffect(() => {
        if (success) {
            toast.success(`"${uploadedTitle}" uploaded successfully!`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            resetStore();
            form.reset();
            setPreviewUrl(null);
        }
    }, [success, uploadedTitle, form, resetStore]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            setPreviewUrl(URL.createObjectURL(file));
            form.setValue("image", files, { shouldValidate: true });
            form.clearErrors("image");
        }
    };

    const onSubmit = async (values: ArtworkFormValues) => {
        if (!session?.user?.id) return;
        if (!values.image) {
            form.setError("image", { message: "Image is required" });
            return;
        }

        try {
            setUploadedTitle(values.title);
            await uploadArtwork(values, session.user.id);
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error("Upload failed. Please try again.", {
                position: "top-right",
            });
        }
    };

    return (
        <Card className="max-w-5xl mx-auto">
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <FormField
                                control={form.control}
                                name="image"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Artwork Image</FormLabel>
                                        <FormControl>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-center">
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
                                                                    onLoad={() => URL.revokeObjectURL(previewUrl)}
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
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4">
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
                                                <ArtCategorySelect field={field} />
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
                                        const symbol = currency?.symbol || "$";

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

                            <Button
                                type="submit"
                                className="w-full mt-6"
                                disabled={isSubmitting || !form.formState.isValid}
                            >
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
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-center text-sm text-muted-foreground">
                All artwork submissions are reviewed before being listed
            </CardFooter>
        </Card>
    );
};