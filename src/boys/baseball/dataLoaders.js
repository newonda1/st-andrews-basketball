const BASEBALL_DATA_BASE = "/data/boys/baseball";
const PLAYER_GAME_STATS_BASE = `${BASEBALL_DATA_BASE}/playergamestats`;

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
