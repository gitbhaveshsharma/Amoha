// 'use client';
// import { useState } from 'react';
// import { analyzeImage } from '@/lib/nsfwjs/classifier';

// export function TestImageClassifier() {
//     const [image, setImage] = useState<string | null>(null);
//     const [results, setResults] = useState<any>(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onload = (event) => {
//                 setImage(event.target?.result as string);
//             };
//             reader.readAsDataURL(file);
//         }
//     };

//     const testImage = async () => {
//         if (!image) return;

//         setLoading(true);
//         setError(null);

//         try {
//             const result = await analyzeImage(image);
//             setResults(result);
//         } catch (err) {
//             console.error('Test failed:', err);
//             setError('Failed to analyze image');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="max-w-md p-6 mx-auto bg-white rounded-lg shadow-md">
//             <h2 className="text-xl font-bold mb-4">NSFW Image Classifier Test</h2>

//             <div className="mb-4">
//                 <label className="block mb-2 text-sm font-medium">
//                     Upload Test Image:
//                 </label>
//                 <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleImageUpload}
//                     className="block w-full text-sm text-gray-500
//             file:mr-4 file:py-2 file:px-4
//             file:rounded-md file:border-0
//             file:text-sm file:font-semibold
//             file:bg-blue-50 file:text-blue-700
//             hover:file:bg-blue-100"
//                 />
//             </div>

//             {image && (
//                 <div className="mb-4">
//                     <h3 className="text-sm font-medium mb-2">Preview:</h3>
//                     <img
//                         src={image}
//                         alt="Preview"
//                         className="max-h-60 rounded-md border"
//                     />
//                 </div>
//             )}

//             <button
//                 onClick={testImage}
//                 disabled={!image || loading}
//                 className={`px-4 py-2 rounded-md text-white ${!image || loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
//             >
//                 {loading ? 'Analyzing...' : 'Test Image'}
//             </button>

//             {error && (
//                 <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
//                     {error}
//                 </div>
//             )}

//             {results && (
//                 <div className="mt-6 p-4 bg-gray-50 rounded-md">
//                     <h3 className="font-medium mb-2">Results:</h3>
//                     <div className="mb-3">
//                         <span className="font-medium">Verdict: </span>
//                         <span className={`font-bold ${results.verdict === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
//                             {results.verdict.toUpperCase()}
//                         </span>
//                     </div>

//                     <h4 className="font-medium mb-1">Probabilities:</h4>
//                     <div className="space-y-1">
//                         {Object.entries(results.scores).map(([key, value]) => (
//                             <div key={key} className="flex items-center">
//                                 <span className="w-24 capitalize">{key}:</span>
//                                 <div className="flex-1 bg-gray-200 rounded-full h-4">
//                                     <div
//                                         className="bg-blue-500 h-4 rounded-full"
//                                         style={{ width: `${(value as number) * 100}%` }}
//                                     />
//                                 </div>
//                                 <span className="ml-2 w-12 text-right">
//                                     {((value as number) * 100).toFixed(1)}%
//                                 </span>
//                             </div>
//                         ))}
//                     </div>

//                     {results.rejectionReasons.length > 0 && (
//                         <div className="mt-3">
//                             <h4 className="font-medium text-red-600">Rejection Reasons:</h4>
//                             <ul className="list-disc pl-5">
//                                 {results.rejectionReasons.map((reason: string, i: number) => (
//                                     <li key={i}>{reason}</li>
//                                 ))}
//                             </ul>
//                         </div>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// }