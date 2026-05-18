const CATEGORY_HINTS = {
  plastic: ['plastic', 'bottle', 'sachet', 'wrapper', 'straw', 'cup'],
  paper: ['paper', 'cardboard', 'newspaper', 'receipt'],
  metal: ['metal', 'can', 'tin', 'aluminum', 'foil'],
  glass: ['glass', 'jar'],
  organic: ['organic', 'leaf', 'leaves', 'food', 'peel'],
  'mixed-waste': ['mixed', 'container', 'packaging'],
};

function findCategoryByHint(categories, text) {
  const normalizedText = text.toLowerCase();

  for (const [categoryId, hints] of Object.entries(CATEGORY_HINTS)) {
    if (hints.some((hint) => normalizedText.includes(hint))) {
      return categories.find((category) => category.id === categoryId);
    }
  }

  return null;
}

async function analyzeTrashImage({ categories, imageUri, imageFileName }) {
  const sourceText = [imageFileName, imageUri].filter(Boolean).join(' ');
  const matchedCategory = sourceText ? findCategoryByHint(categories, sourceText) : null;
  const fallbackCategory =
    matchedCategory ||
    categories.find((category) => category.id === 'other') ||
    categories[0] ||
    null;

  if (!fallbackCategory) {
    return {
      suggestedCategoryId: null,
      suggestedCategoryName: null,
      confidence: 0,
      reason: 'No active trash categories are available for analysis.',
      needsReview: true,
    };
  }

  return {
    suggestedCategoryId: fallbackCategory.id,
    suggestedCategoryName: fallbackCategory.name,
    confidence: matchedCategory ? 0.72 : 0.45,
    reason: matchedCategory
      ? 'Matched the image file details against known category examples.'
      : 'No clear visual AI provider is configured yet, so this is a low-confidence fallback suggestion.',
    needsReview: !matchedCategory,
  };
}

module.exports = {
  analyzeTrashImage,
};
