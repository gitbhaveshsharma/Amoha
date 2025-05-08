//lib/constants/roles.ts
export const ROLE_VALUES = ["bidder", "artist"] as const;
export type Role = (typeof ROLE_VALUES)[number];

export const ROLE_OPTIONS = ROLE_VALUES.map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
})) satisfies ReadonlyArray<{ value: Role; label: string }>;