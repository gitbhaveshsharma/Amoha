"use client";
import React, { useEffect } from "react";
import { useArtCategoryStore } from "@/stores/ArtCategory/artCategoryStore";
import { Button } from "@/components/ui/Button";
import { Plus, Edit, Trash, MoreVertical } from "lucide-react";
import { toast } from "react-toastify";
import { AddArtCategoryForm } from "./AddArtCategoryForm";
import { EditArtCategoryForm } from "./EditArtCategoryForm";
import { ArtCategory } from "@/types/artCategory";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils"; // Assuming you have this utility for class name merging

export function ArtCategoryTable() {
    const {
        categories,
        isLoading,
        error,
        fetchCategories,
        deleteCategory,
    } = useArtCategoryStore();
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
    const [editingCategory, setEditingCategory] = React.useState<ArtCategory | null>(null);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleDelete = async (slug: string) => {
        try {
            await deleteCategory(slug);
            toast.success("Category deleted successfully");
        } catch (error) {
            toast.error("Failed to delete category");
            console.error("Error deleting category:", error);
        }
    };

    // Function to determine category status and styling
    const getCategoryStatusStyle = (category: ArtCategory) => {
        if (category.is_banned) {
            return {
                badgeVariant: "outline",
                borderColor: "border-red-400",
                textColor: "text-white",
                bgColor: "bg-red-500"
            };
        } else if (category.banned_at || category.banned_by) {
            // Assuming this means deactivated (has been banned before but not currently)
            return {
                badgeVariant: "outline",
                borderColor: "border-orange-300",
                textColor: "text-orange-700",
                bgColor: "bg-orange-50"
            };
        } else {
            // Active
            return {
                badgeVariant: "outline",
                borderColor: "border-green-300",
                textColor: "text-green-700",
                bgColor: "bg-green-50"
            };
        }
    };

    if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Artwork Categories</CardTitle>
                <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full" />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => {
                            const style = getCategoryStatusStyle(category);

                            return (
                                <div
                                    key={category.slug}
                                    className={cn(
                                        "flex items-center justify-between  rounded-lg w-full sm:w-auto",
                                        style.borderColor,
                                        "border-2", // Make the border more visible
                                        style.bgColor
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <Badge
                                            className={cn(
                                                "whitespace-nowrap",
                                                category.is_banned ? "bg-red-500 text-white" :
                                                    style.textColor,
                                                !category.is_banned && "bg-transparent" // Only for non-banned items
                                            )}
                                        >
                                            {category.label}
                                        </Badge>
                                    </div>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-48 p-2">
                                            <div className="flex flex-col space-y-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="justify-start"
                                                    onClick={() => setEditingCategory(category)}
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="justify-start text-destructive hover:text-destructive"
                                                    onClick={() => handleDelete(category.slug)}
                                                >
                                                    <Trash className="h-4 w-4 mr-2" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>

            <AddArtCategoryForm
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
            />

            {editingCategory && (
                <EditArtCategoryForm
                    category={editingCategory}
                    onOpenChange={() => setEditingCategory(null)}
                />
            )}
        </Card>
    );
}