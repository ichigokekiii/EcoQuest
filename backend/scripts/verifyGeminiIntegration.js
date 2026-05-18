require('../src/config/env');

const { getAiStartupStatusMessage, isGeminiClassificationEnabled } = require('../src/config/aiConfig');
const { analyzeTrashImage } = require('../src/services/trashClassificationService');

const TEST_CATEGORIES = [
  {
    id: 'plastic',
    name: 'Plastic',
    examples: ['plastic bottle', 'wrapper'],
    rules: ['Classify as Plastic if mostly plastic.'],
    status: 'active',
  },
  {
    id: 'paper',
    name: 'Paper',
    examples: ['cardboard', 'newspaper'],
    rules: ['Classify as Paper if mostly paper.'],
    status: 'active',
  },
  {
    id: 'other',
    name: 'Other',
    examples: ['unidentified waste'],
    rules: ['Use Other when unclear.'],
    status: 'active',
  },
];

// 1x1 red JPEG
const TEST_IMAGE_BASE64 =
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUQEhIVFhUVFRUVFRUVFRUWFxUXFhUYHSggGBolGxUVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGxAQGy0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAQMBIgACEQEDEQH/xAAXAAEBAQEAAAAAAAAAAAAAAAAAAQID/8QAFhEBAQEAAAAAAAAAAAAAAAAAAAER/9oADAMBAAIQAxAAAAGqg//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEABj8Cf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8hf//Z';

async function main() {
  console.log(getAiStartupStatusMessage());
  console.log(`Gemini configured: ${isGeminiClassificationEnabled()}`);

  const analysis = await analyzeTrashImage({
    categories: TEST_CATEGORIES,
    imageUri: 'verify-gemini.jpg',
    imageFileName: 'verify-gemini.jpg',
    imageMimeType: 'image/jpeg',
    imageBase64: TEST_IMAGE_BASE64,
    correctionExamples: [
      {
        aiSuggestedCategoryId: 'plastic',
        aiSuggestedCategoryName: 'Plastic',
        finalCategoryId: 'mixed-waste',
        finalCategoryName: 'Mixed Waste',
        detectedObject: 'food container',
      },
    ],
  });

  console.log('\nAnalyze result:');
  console.log(JSON.stringify(analysis, null, 2));

  if (analysis.analysisSource === 'gemini') {
    console.log('\nPASS: Gemini vision path is working.');
    process.exit(0);
  }

  if (isGeminiClassificationEnabled()) {
    console.log('\nWARN: Gemini is enabled but analyze used heuristic fallback.');
    console.log('Check logs above for Gemini errors. Try AI_MODEL=gemini-2.0-flash-001 or gemini-1.5-flash.');
    process.exit(1);
  }

  console.log('\nINFO: Gemini disabled — heuristic fallback is expected.');
  process.exit(0);
}

main().catch((error) => {
  console.error('Verification failed:', error.message);
  process.exit(1);
});
