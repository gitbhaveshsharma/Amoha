import { create } from 'zustand';
import { uploadService } from './uploadService';
import { ArtworkUploadValues } from './uploadService';

type UploadState = {
    isUploadModalOpen: boolean;
    isSubmitting: boolean;
    error: string | null;
    success: boolean;
    openUploadModal: () => void;
    closeUploadModal: () => void;
    uploadArtwork: (values: ArtworkUploadValues, userId: string) => Promise<void>;
    reset: () => void;
};

export const useUploadStore = create<UploadState>((set) => ({
    isUploadModalOpen: false,
    isSubmitting: false,
    error: null,
    success: false,

    openUploadModal: () => set({
        isUploadModalOpen: true,
        error: null,
        success: false,
        isSubmitting: false
    }),

    closeUploadModal: () => set({
        isUploadModalOpen: false
    }),

    uploadArtwork: async (values, userId) => {
        set({ isSubmitting: true, error: null, success: false });

        try {
            const result = await uploadService.uploadArtwork(values, userId);

            if (result.success) {
                set({ success: true, isSubmitting: false });
            } else {
                throw new Error(result.error || "Upload failed");
            }
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Upload failed",
                isSubmitting: false
            });
            throw error;
        }
    },

    reset: () => set({
        isSubmitting: false,
        error: null,
        success: false
    }),
}));