// components/BrowseItem.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useFilterStore } from "@/stores/filter/filterStore";
import { ChevronRight } from "lucide-react";

export const BrowseItem = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { availableCategories, availableMediums, fetchFilterOptions } = useFilterStore();

    useEffect(() => {
        // Fetch filter options if not already loaded
        if (availableCategories.length === 0 || availableMediums.length === 0) {
            fetchFilterOptions();
        }
    }, [availableCategories.length, availableMediums.length, fetchFilterOptions]);

    return (
        <div className="relative">
            <button
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                className="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-50 hover:text-primary"
            >
                Browse
            </button>

            {isOpen && (
                <div
                    className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                    onMouseEnter={() => setIsOpen(true)}
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <div className="p-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Categories
                        </h3>
                        <ul className="space-y-1">
                            {availableCategories.slice(0, 6).map((category) => (
                                <li key={category}>
                                    <Link
                                        href={`/browse?category=${encodeURIComponent(category)}`}
                                        className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        {category}
                                        <ChevronRight size={16} className="text-gray-400" />
                                    </Link>
                                </li>
                            ))}
                            {availableCategories.length > 6 && (
                                <li>
                                    <Link
                                        href="/browse"
                                        className="flex items-center justify-between px-3 py-2 text-sm text-primary hover:bg-gray-50 rounded-lg transition-colors font-medium"
                                    >
                                        View all categories
                                        <ChevronRight size={16} />
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="border-t border-gray-200 p-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Mediums
                        </h3>
                        <ul className="space-y-1">
                            {availableMediums.slice(0, 6).map((medium) => (
                                <li key={medium}>
                                    <Link
                                        href={`/browse?medium=${encodeURIComponent(medium)}`}
                                        className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        {medium}
                                        <ChevronRight size={16} className="text-gray-400" />
                                    </Link>
                                </li>
                            ))}
                            {availableMediums.length > 6 && (
                                <li>
                                    <Link
                                        href="/browse"
                                        className="flex items-center justify-between px-3 py-2 text-sm text-primary hover:bg-gray-50 rounded-lg transition-colors font-medium"
                                    >
                                        View all mediums
                                        <ChevronRight size={16} />
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};