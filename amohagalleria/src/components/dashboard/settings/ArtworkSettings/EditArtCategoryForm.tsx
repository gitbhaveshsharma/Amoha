"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArtCategory, ArtCategoryUpdate } from "@/types/artCategory";
import { useArtCategoryStore } from "@/stores/ArtCategory/artCategoryStore";
import { toast } from "react-toastify";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { DialogFooter } from "@/components/ui/dialog";
import { artCategoryUpdateSchema } from "@/schemas/artCategory";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface EditArtCategoryFormProps {
    category: ArtCategory;
    onOpenChange: (open: boolean) => void;
}

export function EditArtCategoryForm({
    category,
    onOpenChange,
}: EditArtCategoryFormProps) {
    const { updateCategory } = useArtCategoryStore();
    const form = useForm<ArtCategoryUpdate>({
        resolver: zodResolver(artCategoryUpdateSchema),
        defaultValues: {
            label: category.label,
            slug: category.slug,
            is_banned: category.is_banned,
        },
    });

    const onSubmit = async (values: ArtCategoryUpdate) => {
        try {
            await updateCategory(category.slug, values);
            toast.success("Category updated successfully");
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to update category");
            console.error("Error updating category:", error);
        }
    };

    return (
        <Dialog open={!!category} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Art Category</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="label"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Label</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Slug</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="is_banned"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Banned</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}