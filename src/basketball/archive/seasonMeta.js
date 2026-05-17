import { athleteProfilePath, isPre2015Season } from "../../athletes/archiveEra";

export function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}

export function formatSeasonRecord(seasonInfo, fallbackSummary = null) {
  if (hasValue(seasonInfo?.OverallWins) && hasValue(seasonInfo?.OverallLosses)) {
    return `${seasonInfo.OverallWins}-${seasonInfo.OverallLosses}`;
  }

  if (fallbackSummary) {
    return `${fallbackSummary.wins || 0}-${fallbackSummary.losses || 0}`;
  }

  return "";
}

export function formatSeasonFinish(seasonInfo) {
  if (seasonInfo?.FinishLabel) return seasonInfo.FinishLabel;

  const parts = [seasonInfo?.RegionFinish, seasonInfo?.StateFinish]
    .map((part) => String(part || "").trim())
    .filter(Boolean);

  return parts.join(" / ");
}

export function resolveSeasonBriefs({ seasonInfo, seasonSummary, seasonBriefs = [] }) {
  const extras = (Array.isArray(seasonBriefs) ? seasonBriefs : []).filter((item) => {
    const label = String(item?.label || "").trim().toLowerCase();
    return label && !["record", "coach", "finish"].includes(label);
  });

  const record = formatSeasonRecord(seasonInfo, seasonSummary);
  const coach = seasonInfo?.HeadCoach || "";
  const finish = formatSeasonFinish(seasonInfo);

  return [
    record ? { label: "Record", value: record } : null,
    coach ? { label: "Coach", value: coach } : null,
    finish ? { label: "Finish", value: finish } : null,
    ...extras,
  ].filter(Boolean);
}

export function buildSourceCitation(game) {
  const direct = String(game?.SourceCitation || game?.RecapSource || "").trim();
  if (direct) return direct;

  const parts = [
    game?.SourcePublication,
    game?.SourceAuthor || game?.SourceByline ? `By ${game.SourceAuthor || game.SourceByline}` : "",
    game?.SourceDate,
    game?.SourcePage ? `Page ${game.SourcePage}` : "",
    game?.SourceSection,
  ].filter((part) => part && String(part).trim());

  return parts.join(" • ");
}

export async function fetchBasketballStats(dataBase, seasonId) {
  const seasonStatsUrl = `${dataBase}playergamestats/${seasonId}.json`;

  try {
    const seasonStatsRes = await fetch(seasonStatsUrl);
    if (seasonStatsRes.ok) return seasonStatsRes.json();
  } catch {
    // Fall through to the legacy all-seasons stats file.
  }

  const statsRes = await fetch(`${dataBase}playergamestats.json`);
  if (!statsRes.ok) {
    throw new Error(`Fetch failed: playergamestats(${statsRes.status})`);
  }

  return statsRes.json();
}

export function basketballPlayerPath({ playerId, seasonId, basePath, sportKey }) {
  if (isPre2015Season(seasonId)) {
    return athleteProfilePath(playerId, sportKey);
  }

  return `${basePath}/players/${playerId}`;
}
