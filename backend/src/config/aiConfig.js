const DEFAULT_QWEN_BASE_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';

function isTruthy(value) {
  return value === true || value === 'true' || value === '1';
}

function getDefaultModel(provider) {
  if (provider === 'google') {
    return 'gemini-2.0-flash';
  }

  return 'qwen3-vl-flash';
}

function getAiConfig() {
  const provider = process.env.AI_PROVIDER || 'qwen';
  const lowConfidenceThreshold = Number.parseFloat(process.env.AI_LOW_CONFIDENCE_THRESHOLD);

  return {
    provider,
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || getDefaultModel(provider),
    baseUrl: process.env.AI_BASE_URL || DEFAULT_QWEN_BASE_URL,
    enabled: isTruthy(process.env.AI_CLASSIFICATION_ENABLED),
    lowConfidenceThreshold: Number.isFinite(lowConfidenceThreshold) ? lowConfidenceThreshold : 0.7,
  };
}

function isQwenClassificationEnabled() {
  const config = getAiConfig();

  return config.enabled && config.provider === 'qwen' && Boolean(config.apiKey);
}

function isGeminiClassificationEnabled() {
  const config = getAiConfig();

  return config.enabled && config.provider === 'google' && Boolean(config.apiKey);
}

function isVisionClassificationEnabled() {
  return isQwenClassificationEnabled() || isGeminiClassificationEnabled();
}

function getAiStartupStatusMessage() {
  const config = getAiConfig();

  if (isQwenClassificationEnabled()) {
    return `AI classification: Qwen enabled (model=${config.model})`;
  }

  if (isGeminiClassificationEnabled()) {
    return `AI classification: Gemini enabled (model=${config.model})`;
  }

  if (config.enabled && !config.apiKey) {
    return 'AI classification: enabled but AI_API_KEY is missing (heuristic fallback only)';
  }

  if (config.enabled && config.provider !== 'qwen' && config.provider !== 'google') {
    return `AI classification: unsupported provider "${config.provider}" (heuristic fallback only)`;
  }

  return 'AI classification: disabled (heuristic fallback only)';
}

module.exports = {
  getAiConfig,
  getAiStartupStatusMessage,
  isGeminiClassificationEnabled,
  isQwenClassificationEnabled,
  isVisionClassificationEnabled,
};
