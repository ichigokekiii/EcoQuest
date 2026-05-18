const { GoogleGenerativeAI } = require('@google/generative-ai');

const {
  getAiConfig,
  isGeminiClassificationEnabled,
  isQwenClassificationEnabled,
} = require('../config/aiConfig');

const CATEGORY_HINTS = {
  plastic: ['plastic', 'bottle', 'sachet', 'wrapper', 'straw', 'cup'],
  paper: ['paper', 'cardboard', 'newspaper', 'receipt'],
  metal: ['metal', 'can', 'tin', 'aluminum', 'foil'],
  glass: ['glass', 'jar'],
  organic: ['organic', 'leaf', 'leaves', 'food', 'peel'],
  'mixed-waste': ['mixed', 'container', 'packaging'],
};

const MAX_BASE64_LENGTH = 2 * 1024 * 1024;

function findCategoryByHint(categories, text) {
  const normalizedText = text.toLowerCase();

  for (const [categoryId, hints] of Object.entries(CATEGORY_HINTS)) {
    if (hints.some((hint) => normalizedText.includes(hint))) {
      return categories.find((category) => category.id === categoryId);
    }
  }

  return null;
}

function normalizeBase64(imageBase64) {
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return null;
  }

  const commaIndex = imageBase64.indexOf(',');
  const rawBase64 = commaIndex >= 0 ? imageBase64.slice(commaIndex + 1) : imageBase64;

  if (rawBase64.length > MAX_BASE64_LENGTH) {
    return null;
  }

  return rawBase64;
}

function buildCategoryContext(categories) {
  return categories
    .map((category) => {
      const examples = Array.isArray(category.examples) ? category.examples.join(', ') : '';
      const rules = Array.isArray(category.rules) ? category.rules.join(' ') : '';

      return [
        `- id: ${category.id}`,
        `  name: ${category.name}`,
        examples ? `  examples: ${examples}` : null,
        rules ? `  rules: ${rules}` : null,
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');
}

function buildCorrectionContext(correctionExamples = []) {
  if (!correctionExamples.length) {
    return 'No past user corrections are available yet.';
  }

  return correctionExamples
    .map((example) => {
      const aiLabel = example.aiSuggestedCategoryName || example.aiSuggestedCategoryId || 'unknown';
      const finalLabel = example.finalCategoryName || example.finalCategoryId || 'unknown';
      const objectLabel = example.detectedObject ? ` for "${example.detectedObject}"` : '';

      return `- AI suggested ${aiLabel}${objectLabel}, user corrected to ${finalLabel}.`;
    })
    .join('\n');
}

function buildVisionPrompt(categories, correctionExamples) {
  return [
    'You classify trash in photos for the Eco Quest cleanup app.',
    'Choose exactly one category from the allowed list below.',
    'Do not invent new category names or IDs.',
    'Return JSON only with this exact shape:',
    '{',
    '  "detectedObject": "short object label",',
    '  "detectedMaterial": "primary material",',
    '  "suggestedCategoryId": "one allowed category id",',
    '  "confidence": 0.0,',
    '  "reason": "one short sentence"',
    '}',
    '',
    'Allowed categories:',
    buildCategoryContext(categories),
    '',
    'Past user corrections:',
    buildCorrectionContext(correctionExamples),
  ].join('\n');
}

function extractJsonObject(text) {
  if (!text) {
    return null;
  }

  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    const match = trimmed.match(/\{[\s\S]*\}/);

    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]);
    } catch (nestedError) {
      return null;
    }
  }
}

function normalizeConfidence(value) {
  const confidence = Number(value);

  if (!Number.isFinite(confidence)) {
    return 0;
  }

  if (confidence > 1) {
    return Math.min(confidence / 100, 1);
  }

  return Math.max(0, Math.min(confidence, 1));
}

function buildSuggestionFromCategory(category, {
  confidence,
  reason,
  needsReview,
  detectedObject = null,
  detectedMaterial = null,
}) {
  return {
    suggestedCategoryId: category.id,
    suggestedCategoryName: category.name,
    detectedObject,
    detectedMaterial,
    confidence,
    reason,
    needsReview,
  };
}

function buildHeuristicSuggestion(categories, { imageUri, imageFileName }) {
  const sourceText = [imageFileName, imageUri].filter(Boolean).join(' ');
  const matchedCategory = sourceText ? findCategoryByHint(categories, sourceText) : null;
  const fallbackCategory =
    matchedCategory ||
    categories.find((category) => category.id === 'other') ||
    categories[0] ||
    null;

  if (!fallbackCategory) {
    return {
      suggestion: {
        suggestedCategoryId: null,
        suggestedCategoryName: null,
        detectedObject: null,
        detectedMaterial: null,
        confidence: 0,
        reason: 'No active trash categories are available for analysis.',
        needsReview: true,
      },
      analysisSource: 'none',
    };
  }

  return {
    suggestion: buildSuggestionFromCategory(fallbackCategory, {
      confidence: matchedCategory ? 0.72 : 0.45,
      reason: matchedCategory
        ? 'Matched the image file details against known category examples.'
        : 'Vision AI is unavailable, so this is a low-confidence fallback suggestion.',
      needsReview: !matchedCategory,
    }),
    analysisSource: 'heuristic',
  };
}

function mapVisionResult(parsed, categories) {
  const config = getAiConfig();
  const matchedCategory = categories.find((category) => category.id === parsed.suggestedCategoryId);

  if (!matchedCategory) {
    return null;
  }

  const confidence = normalizeConfidence(parsed.confidence);
  const needsReview = confidence < config.lowConfidenceThreshold;

  return buildSuggestionFromCategory(matchedCategory, {
    confidence,
    reason: parsed.reason || `The image appears to match the ${matchedCategory.name} category.`,
    needsReview,
    detectedObject: parsed.detectedObject || null,
    detectedMaterial: parsed.detectedMaterial || null,
  });
}

async function analyzeWithQwen({
  categories,
  imageBase64,
  imageMimeType,
  correctionExamples,
}) {
  const config = getAiConfig();
  const normalizedBase64 = normalizeBase64(imageBase64);

  if (!normalizedBase64) {
    return null;
  }

  const mimeType = imageMimeType || 'image/jpeg';
  const prompt = buildVisionPrompt(categories, correctionExamples);
  const baseUrl = config.baseUrl.replace(/\/$/, '');

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${normalizedBase64}`,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Qwen API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const responseText = data.choices?.[0]?.message?.content;
  const parsed = extractJsonObject(responseText);

  if (!parsed) {
    return null;
  }

  return mapVisionResult(parsed, categories);
}

async function analyzeWithGemini({
  categories,
  imageBase64,
  imageMimeType,
  correctionExamples,
}) {
  const config = getAiConfig();
  const normalizedBase64 = normalizeBase64(imageBase64);

  if (!normalizedBase64) {
    return null;
  }

  const genAI = new GoogleGenerativeAI(config.apiKey);
  const model = genAI.getGenerativeModel({ model: config.model });
  const prompt = buildVisionPrompt(categories, correctionExamples);

  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        mimeType: imageMimeType || 'image/jpeg',
        data: normalizedBase64,
      },
    },
  ]);

  const responseText = result.response.text();
  const parsed = extractJsonObject(responseText);

  if (!parsed) {
    return null;
  }

  return mapVisionResult(parsed, categories);
}

async function analyzeTrashImage({
  categories,
  imageUri,
  imageFileName,
  imageMimeType,
  imageBase64,
  correctionExamples = [],
}) {
  if (!categories.length) {
    return buildHeuristicSuggestion(categories, { imageUri, imageFileName });
  }

  if (isQwenClassificationEnabled() && imageBase64) {
    try {
      const qwenSuggestion = await analyzeWithQwen({
        categories,
        imageBase64,
        imageMimeType,
        correctionExamples,
      });

      if (qwenSuggestion) {
        return {
          suggestion: qwenSuggestion,
          analysisSource: 'qwen',
        };
      }

      console.warn('Qwen trash classification returned no valid suggestion; using heuristic fallback.');
    } catch (error) {
      console.error('Qwen trash classification failed:', error.message);
    }
  } else if (isGeminiClassificationEnabled() && imageBase64) {
    try {
      const geminiSuggestion = await analyzeWithGemini({
        categories,
        imageBase64,
        imageMimeType,
        correctionExamples,
      });

      if (geminiSuggestion) {
        return {
          suggestion: geminiSuggestion,
          analysisSource: 'gemini',
        };
      }

      console.warn('Gemini trash classification returned no valid suggestion; using heuristic fallback.');
    } catch (error) {
      console.error('Gemini trash classification failed:', error.message);
    }
  }

  return buildHeuristicSuggestion(categories, { imageUri, imageFileName });
}

module.exports = {
  analyzeTrashImage,
};
