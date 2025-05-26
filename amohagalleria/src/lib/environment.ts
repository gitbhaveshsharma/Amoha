//lib/environment.ts
/**
 * Check if code is running in browser environment
 */
export const isBrowser = () => typeof window !== 'undefined';
/**
 * Check if code is running in Node.js environment
 */
export const isNode = (): boolean => {
    return typeof process !== 'undefined' &&
        process.versions != null &&
        process.versions.node != null;
};