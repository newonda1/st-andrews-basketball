const SEARCH_SPACE_REGEX = /\s+/g;
const SEARCH_PUNCTUATION_REGEX = /[^a-z0-9]+/gi;

export const SEARCH_RESULT_TYPE_ORDER = ["athlete", "team", "page"];

export function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, " and ")
    .replace(SEARCH_PUNCTUATION_REGEX, " ")
    .trim()
    .replace(SEARCH_SPACE_REGEX, " ");
}

export function tokenizeSearchText(value) {
  const normalized = normalizeSearchText(value);
  return normalized ? normalized.split(" ") : [];
}

function getSearchTypeBoost(type) {
  if (type === "athlete") return 42;
  if (type === "team") return 28;
  return 0;
}

function matchesTerm(words, fullText, term) {
  return words.some((word) => word.startsWith(term)) || fullText.includes(term);
}

export function getSearchResultScore(entry, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return entry?.featured ? 1 : 0;
  }

  const titleText = normalizeSearchText(entry?.title);
  const subtitleText = normalizeSearchText(entry?.subtitle);
  const keywordsText = normalizeSearchText((entry?.keywords || []).join(" "));
  const fullText = [titleText, subtitleText, keywordsText].filter(Boolean).join(" ");
  const queryTerms = tokenizeSearchText(normalizedQuery);

  if (!fullText || queryTerms.length === 0) {
    return 0;
  }

  const titleWords = titleText ? titleText.split(" ") : [];
  const fullWords = fullText.split(" ");

  if (queryTerms.some((term) => !matchesTerm(fullWords, fullText, term))) {
    return 0;
  }

  let score = 100 + getSearchTypeBoost(entry?.type);

  if (titleText === normalizedQuery) {
    score += 420;
  } else if (titleText.startsWith(normalizedQuery)) {
    score += 250;
  } else if (titleText.includes(normalizedQuery)) {
    score += 165;
  } else if (fullText.includes(normalizedQuery)) {
    score += 70;
  }

  if (queryTerms.every((term) => titleWords.some((word) => word.startsWith(term)))) {
    score += 140;
  } else if (
    queryTerms.every((term) => titleWords.some((word) => word.includes(term)))
  ) {
    score += 65;
  }

  if (subtitleText.includes(normalizedQuery)) {
    score += 30;
  }

  if (entry?.featured) {
    score += 10;
  }

  return score;
}

export function searchSearchEntries(entries, query, limit = 36) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return (Array.isArray(entries) ? entries : [])
      .filter((entry) => entry?.featured)
      .slice(0, limit);
  }

  return (Array.isArray(entries) ? entries : [])
    .map((entry) => ({ entry, score: getSearchResultScore(entry, normalizedQuery) }))
    .filter((result) => result.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      const typeOrderDelta =
        SEARCH_RESULT_TYPE_ORDER.indexOf(a.entry.type) -
        SEARCH_RESULT_TYPE_ORDER.indexOf(b.entry.type);

      if (typeOrderDelta !== 0) {
        return typeOrderDelta;
      }

      return a.entry.title.localeCompare(b.entry.title);
    })
    .slice(0, limit)
    .map((result) => result.entry);
}
