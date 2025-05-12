import * as tf from '@tensorflow/tfjs';
import * as nsfwjs from 'nsfwjs';

let model: nsfwjs.NSFWJS;

export const loadModel = async () => {
    if (!model) {
        tf.enableProdMode();
        model = await nsfwjs.load('/nsfwjs-model/');
    }
    return model;
};

export const analyzeImage = async (imageUrl: string) => {
    try {
        const model = await loadModel();

        // Create image element programmatically
        const img = document.createElement('img');
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;

        // Wait for image to load
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });

        // Create a canvas to resize the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 224;
        canvas.height = 224;
        ctx?.drawImage(img, 0, 0, 224, 224);

        // Use the resized image for classification
        const predictions = await model.classify(canvas);

        // Format results
        const scores = predictions.reduce((acc, p) => {
            const key = p.className.toLowerCase() as keyof typeof acc;
            return { ...acc, [key]: p.probability };
        }, { porn: 0, sexy: 0, hentai: 0, neutral: 0, drawing: 0 });

        // Determine verdict
        const rejectionThreshold = 0.7;
        const rejectionReasons = predictions
            .filter(p => p.probability > rejectionThreshold && p.className !== 'Neutral')
            .map(p => `${p.className} content detected (${(p.probability * 100).toFixed(1)}%)`);

        return {
            verdict: rejectionReasons.length > 0 ? 'rejected' : 'approved',
            scores,
            rejectionReasons
        };
    } catch (error) {
        console.error('Image analysis failed:', error);
        throw new Error('Failed to analyze image');
    }
};