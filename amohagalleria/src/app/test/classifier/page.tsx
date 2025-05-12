import { TestImageClassifier } from '@/components/TestImageClassifier';

export default function TestPage() {
    return (
        <main className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Image Classifier Test</h1>
            <TestImageClassifier />
        </main>
    );
}