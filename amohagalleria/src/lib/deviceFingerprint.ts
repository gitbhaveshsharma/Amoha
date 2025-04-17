import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { getOrCreateDeviceId } from '@/utils/device';

export const getDeviceId = async (): Promise<string> => {
    if (typeof window === 'undefined') return '';

    try {
        // Check if we already have a device ID in localStorage
        const storedId = localStorage.getItem('fp_device_id');
        if (storedId) return storedId;

        // If no device ID is found, generate a new one using FingerprintJS
        const fp = await FingerprintJS.load();
        const result = await fp.get();

        // Store the visitor ID in localStorage for future use
        localStorage.setItem('fp_device_id', result.visitorId);

        return result.visitorId;
    } catch (error) {
        console.error('Error retrieving or generating device ID:', error);

        // Fallback to generating a random device ID
        const fallbackDeviceId = getOrCreateDeviceId();
        console.warn('Using fallback device ID:', fallbackDeviceId);
        return fallbackDeviceId;
    }
};