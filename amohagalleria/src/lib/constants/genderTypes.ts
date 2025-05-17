// lib/constants/genderTypes.ts

export const GENDER_VALUES = [
    'male',
    'female',
    'non_binary',
    'genderqueer',
    'genderfluid',
    'agender',
    'bigender',
    'two_spirit',
    'transgender_male',
    'transgender_female',
    'intersex',
    'prefer_not_to_say',
    'other'
] as const;

export type Gender = (typeof GENDER_VALUES)[number];

export const GENDER_OPTIONS = GENDER_VALUES.map((value) => {
    // Custom formatting for display labels
    let label = value
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    // Special cases
    if (value === 'non_binary') label = 'Non-Binary';
    if (value === 'two_spirit') label = 'Two-Spirit';
    if (value === 'prefer_not_to_say') label = 'Prefer not to say';

    return {
        value,
        label
    };
}) satisfies ReadonlyArray<{ value: Gender; label: string }>;

// Utility type for type safety
export type GenderOption = (typeof GENDER_OPTIONS)[number];

// Validation function
export function isValidGender(value: string): value is Gender {
    return GENDER_VALUES.includes(value as Gender);
}