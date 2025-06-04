// components/search/ArtworkSearchInput.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSearchStore } from '@/stores/search/searchStore';
import { cn } from '@/lib/utils';

interface ArtworkSearchInputProps {
    placeholder?: string;
    className?: string;
    onSelect?: (suggestion: string) => void;
    autoFocus?: boolean;
}

interface Suggestion {
    suggestion: string;
    artwork_count: number;
}

const SuggestionSkeleton: React.FC = () => (
    <div className="px-4 py-2 animate-pulse">
        <div className="flex items-center space-x-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-100 rounded w-8"></div>
        </div>
    </div>
);

export const ArtworkSearchInput: React.FC<ArtworkSearchInputProps> = ({
    placeholder = "Search artworks, artists, categories...",
    className,
    onSelect,
    autoFocus = false
}) => {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const {
        suggestions,
        isLoadingSuggestions,
        showSuggestions,
        fetchSuggestions,
        clearSuggestions,
        setShowSuggestions,
        setQuery
    } = useSearchStore();

    // Debounced search function
    const debouncedSearch = useCallback((value: string) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            if (value.trim().length >= 2) {
                fetchSuggestions(value);
                setShowSuggestions(true);
            } else {
                clearSuggestions();
            }
        }, 300);
    }, [fetchSuggestions, clearSuggestions, setShowSuggestions]);

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setQuery(value);
        debouncedSearch(value);

        if (value.length === 0) {
            clearSuggestions();
            setShowSuggestions(false);
        }
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion: Suggestion) => {
        setInputValue(suggestion.suggestion);
        setQuery(suggestion.suggestion);
        setShowSuggestions(false);
        inputRef.current?.focus();

        if (onSelect) {
            onSelect(suggestion.suggestion);
        } else {
            router.push(`/search?q=${encodeURIComponent(suggestion.suggestion)}`);
        }
    };

    // Handle form submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedValue = inputValue.trim();
        if (trimmedValue) {
            setShowSuggestions(false);
            router.push(`/search?q=${encodeURIComponent(trimmedValue)}`);
        }
    };

    // Handle clear input
    const handleClear = () => {
        setInputValue('');
        setQuery('');
        clearSuggestions();
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setShowSuggestions(false);
            inputRef.current?.blur();
        }
    };

    // Handle focus
    const handleFocus = () => {
        setIsFocused(true);
        if (inputValue.trim().length >= 2 && suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    // Handle blur
    const handleBlur = () => {
        setIsFocused(false);
        // Delay hiding suggestions to allow click events to process
        setTimeout(() => {
            if (!isFocused) {
                setShowSuggestions(false);
            }
        }, 200);
    };

    // Click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setShowSuggestions]);

    // Cleanup debounce timer
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    />
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        autoFocus={autoFocus}
                        className={cn(
                            "w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg",
                            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                            "bg-white text-gray-900 placeholder-gray-500",
                            "transition-all duration-200 text-sm",
                            "h-10"
                        )}
                    />
                    {inputValue && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {isLoadingSuggestions ? (
                        <>
                            <SuggestionSkeleton />
                            <SuggestionSkeleton />
                            <SuggestionSkeleton />
                        </>
                    ) : suggestions.length > 0 ? (
                        suggestions.map((suggestion, index) => (
                            <button
                                key={`${suggestion.suggestion}-${index}`}
                                type="button"
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0 text-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-900 font-medium">
                                        {suggestion.suggestion}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-2">
                                        {suggestion.artwork_count} {suggestion.artwork_count === 1 ? 'artwork' : 'artworks'}
                                    </span>
                                </div>
                            </button>
                        ))
                    ) : inputValue.trim().length >= 2 ? (
                        <div className="px-3 py-2 text-gray-500 text-sm">
                            No suggestions found for &quot;{inputValue}&quot;
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};