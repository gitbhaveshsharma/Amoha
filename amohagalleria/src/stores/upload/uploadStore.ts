// stores/upload/uploadStore.ts
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

    openUploadModal: () => set({ isUploadModalOpen: true, error: null, success: false }),
    closeUploadModal: () => set({ isUploadModalOpen: false }),

    uploadArtwork: async (values, userId) => {
        set({ isSubmitting: true, error: null, success: false });

        const result = await uploadService.uploadArtwork(values, userId);

        if (result.success) {
            set({ success: true, isSubmitting: false });
        } else {
            set({ error: result.error || "Upload failed", isSubmitting: false });
        }
    },

    reset: () => set({ isSubmitting: false, error: null, success: false }),
}));