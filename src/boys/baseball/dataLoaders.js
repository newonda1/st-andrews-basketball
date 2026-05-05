const BASEBALL_DATA_BASE = "/data/boys/baseball";
const PLAYER_GAME_STATS_BASE = `${BASEBALL_DATA_BASE}/playergamestats`;
const SCHOOLS_PATH = "/data/schools.json";

export function absUrl(path) {
  return new URL(path, window.location.origin).toString();
}

export async function fetchJson(label, path) {
  const res = await fetch(absUrl(path), { cache: "no-store" });
  const text = await res.text();

  if (!res.ok) throw new Error(`${label} failed (HTTP ${res.status}) at ${path}`);

  const trimmed = text.trim();
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
    throw new Error(`${label} did not return JSON at ${path} (returned HTML).`);
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} returned invalid JSON at ${path}: ${String(error?.message || error)}`);
  }
}

export async function loadSchools() {
  const data = await fetchJson("schools.json", SCHOOLS_PATH);
  return Array.isArray(data) ? data : [];
}

function normalizeSchoolName(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function buildSchoolLookup(schools) {
  const byId = new Map();
  const byName = new Map();

  (Array.isArray(schools) ? schools : []).forEach((school) => {
    const id = String(school?.SchoolID ?? "").trim();
    if (id) byId.set(id, school);

    [school?.Name, school?.ShortName].forEach((name) => {
      const key = normalizeSchoolName(name);
      if (key && !byName.has(key)) byName.set(key, school);
    });
  });

  return { byId, byName };
}

export function resolveSchoolForGame(game, schoolLookup) {
  const id = String(game?.OpponentID ?? "").trim();
  if (id && schoolLookup?.byId?.has(id)) return schoolLookup.byId.get(id);

  const nameKey = normalizeSchoolName(game?.Opponent);
  if (nameKey && schoolLookup?.byName?.has(nameKey)) return schoolLookup.byName.get(nameKey);

  return null;
}

export function getSchoolDisplayName(school, fallback = "") {
  return school?.Name || fallback;
}

export function getSchoolLogoPath(school) {
  return school?.LogoPath || school?.BracketLogoPath || null;
}

async function loadLegacyPlayerGameStats() {
  const data = await fetchJson(
    "playergamestats.json",
    `${BASEBALL_DATA_BASE}/playergamestats.json`
  );
  return Array.isArray(data) ? data : [];
}

export async function loadBaseballPlayerGameStatsIndex() {
  const data = await fetchJson("playergamestats index", `${PLAYER_GAME_STATS_BASE}/index.json`);
  return Array.isArray(data) ? data : [];
}

export async function loadBaseballPlayerGameStatsForSeason(season) {
  const seasonKey = String(season ?? "").trim();
  if (!seasonKey) return [];

  try {
    const data = await fetchJson(
      `playergamestats ${seasonKey}`,
      `${PLAYER_GAME_STATS_BASE}/${seasonKey}.json`
    );
    return Array.isArray(data) ? data : [];
  } catch (error) {
    const allStats = await loadLegacyPlayerGameStats();
    return allStats.filter((row) => String(row.GameID || "").startsWith(seasonKey));
  }
}

export async function loadAllBaseballPlayerGameStats() {
  try {
    const index = await loadBaseballPlayerGameStatsIndex();
    const files = index
      .map((entry) => entry.Path)
      .filter(Boolean);

    if (!files.length) return [];

    const chunks = await Promise.all(
      files.map((filePath) => fetchJson(`playergamestats ${filePath}`, filePath))
    );

    return chunks.flatMap((chunk) => (Array.isArray(chunk) ? chunk : []));
  } catch (error) {
    return loadLegacyPlayerGameStats();
  }
}
