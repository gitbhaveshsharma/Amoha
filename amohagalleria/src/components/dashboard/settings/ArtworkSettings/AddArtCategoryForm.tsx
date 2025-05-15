"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArtCategoryInsert } from "@/types/artCategory";
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
import { artCategoryInsertSchema } from "@/schemas/artCategory";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AddArtCategoryFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddArtCategoryForm({ open, onOpenChange }: AddArtCategoryFormProps) {
    const { addCategory } = useArtCategoryStore();
    const form = useForm<ArtCategoryInsert>({
        resolver: zodResolver(artCategoryInsertSchema),
        defaultValues: {
            label: "",
            slug: "",
            is_banned: false,
            created_by: null,
        },
    });

    const onSubmit = async (values: ArtCategoryInsert) => {
        try {
            await addCategory(values);
            toast.success("Category added successfully");
            onOpenChange(false);
            form.reset();
        } catch (error) {
            toast.error("Failed to add category");
            console.error("Error adding category:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Art Category</DialogTitle>
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
                                        <Input placeholder="Enter label" {...field} />
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
                                        <Input placeholder="Enter slug" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}