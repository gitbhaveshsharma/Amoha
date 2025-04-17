"use client"
import React, { useState, useEffect } from "react";

interface SearchInputProps {
    placeholderTexts: string[];
    inputClassName?: string;
    containerClassName?: string;
    icon?: React.ReactNode;
    iconPosition?: "left" | "right";
}

const SearchInput: React.FC<SearchInputProps> = ({
    placeholderTexts,
    inputClassName = "",
    containerClassName = "",
    icon = null,
    iconPosition = "left",
}) => {
    const [placeholder, setPlaceholder] = useState("");
    const [index, setIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentText = placeholderTexts[index];
        const timeout = setTimeout(() => {
            if (isDeleting) {
                setPlaceholder((prev) => prev.slice(0, -1));
                if (placeholder === "") {
                    setIsDeleting(false);
                    setIndex((prev) => (prev + 1) % placeholderTexts.length);
                }
            } else {
                setPlaceholder((prev) => currentText.slice(0, prev.length + 1));
                if (placeholder === currentText) {
                    setIsDeleting(true);
                }
            }
        }, isDeleting ? 100 : 250);

        return () => clearTimeout(timeout);
    }, [placeholder, isDeleting, index, placeholderTexts]);

    return (
        <div className={`relative w-full ${containerClassName}`}>
            {icon && iconPosition === "left" && (
                <div className="absolute top-1/2 left-3 transform -translate-y-1/2">
                    {icon}
                </div>
            )}
            <input
                type="text"
                placeholder={"Search " + placeholder}
                aria-label={placeholder || "Search input"}
                role="searchbox"
                className={`w-full px-4 py-2 ${icon ? (iconPosition === "left" ? "pl-10" : "pr-10") : ""} text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[--primary-button-color] ${inputClassName}`}
            />
            {icon && iconPosition === "right" && (
                <div className="absolute top-1/2 right-3 transform -translate-y-1/2">
                    {icon}
                </div>
            )}
        </div>
    );
};

export default SearchInput;
