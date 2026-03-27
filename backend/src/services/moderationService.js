const abusiveWords = [
  "abuse",
  "hate",
  "idiot",
  "slur",
  "threat",
  "violence"
];

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ");
}

function analyzeMessage(content) {
  const normalized = normalizeText(content);
  const flaggedWords = abusiveWords.filter((word) => normalized.includes(word));

  return {
    flaggedWords,
    isFlagged: flaggedWords.length > 0
  };
}

module.exports = {
  analyzeMessage
};

