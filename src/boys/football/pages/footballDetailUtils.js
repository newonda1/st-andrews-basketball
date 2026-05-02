import {
  allPurposeYards,
  completionPct,
  defensiveTouchdowns,
  fgPct,
  formatDecimal,
  formatPercent,
  formatWhole,
  patPct,
  puntAverage,
  returnTouchdowns,
  stat,
  totalKickingPoints,
  totalPoints,
  totalReturnYards,
  totalTouchdowns,
  totalYards,
  trackedGames,
  yardsPerCarry,
  yardsPerCatch,
} from "../footballRecordsData";

export const FOOTBALL_PLAYER_ROUTE_BASE = "/athletics/football/players";
export const FOOTBALL_GAME_ROUTE_BASE = "/athletics/football/games";

const whole = (value) => formatWhole(value);
const oneDecimal = (value) => formatDecimal(value, 1);
const twoDecimals = (value) => formatDecimal(value, 2);
const pct = (value) => formatPercent(value, 1);

function column(key, label, valueFn, displayFn = whole) {
  return {
    key,
    label,
    valueFn,
    render: (row) => displayFn(valueFn(row)),
  };
}

export const trackedGamesColumn = column("GamesTracked", "G", trackedGames);

export const FOOTBALL_DETAIL_VIEWS = {
  offense: {
    label: "Offense",
    columns: [
      column("PassingComp", "Comp", (row) => stat(row, "PassingComp")),
      column("PassingAtt", "Att", (row) => stat(row, "PassingAtt")),
      column("CompletionPct", "Comp%", completionPct, pct),
      column("PassingYards", "Pass Yds", (row) => stat(row, "PassingYards")),
      column("PassingTD", "Pass TD", (row) => stat(row, "PassingTD")),
      column("PassingInt", "INT", (row) => stat(row, "PassingInt")),
      column("RushingNum", "Car", (row) => stat(row, "RushingNum")),
      column("RushingYards", "Rush Yds", (row) => stat(row, "RushingYards")),
      column("YardsPerCarry", "Y/C", yardsPerCarry, oneDecimal),
      column("RushingTDNum", "Rush TD", (row) => stat(row, "RushingTDNum")),
      column("ReceivingNum", "Rec", (row) => stat(row, "ReceivingNum")),
      column("ReceivingYards", "Rec Yds", (row) => stat(row, "ReceivingYards")),
      column("YardsPerCatch", "Y/R", yardsPerCatch, oneDecimal),
      column("ReceivingTDNum", "Rec TD", (row) => stat(row, "ReceivingTDNum")),
      column("AllPurposeYards", "APY", allPurposeYards),
      column("TotalYards", "Tot Yds", totalYards),
    ],
  },
  defense: {
    label: "Defense",
    columns: [
      column("Tackles", "Tck", (row) => stat(row, "Tackles")),
      column("Assists", "Ast", (row) => stat(row, "Assists")),
      column("TotalTackles", "Tot Tck", (row) => stat(row, "TotalTackles")),
      column("TacklesForLoss", "TFL", (row) => stat(row, "TacklesForLoss"), oneDecimal),
      column("Sacks", "Sacks", (row) => stat(row, "Sacks"), oneDecimal),
      column("QBHurries", "QBH", (row) => stat(row, "QBHurries")),
      column("Ints", "Int", (row) => stat(row, "Ints")),
      column("IntYards", "Int Yds", (row) => stat(row, "IntYards")),
      column("PassesDefensed", "PD", (row) => stat(row, "PassesDefensed")),
      column("CausedFumbles", "CF", (row) => stat(row, "CausedFumbles")),
      column("FumbleRecoveries", "FR", (row) => stat(row, "FumbleRecoveries")),
      column("DefensiveTD", "Def TD", defensiveTouchdowns),
    ],
  },
  specialTeams: {
    label: "Special Teams",
    columns: [
      column("KickoffReturnNum", "KO Ret", (row) => stat(row, "KickoffReturnNum")),
      column("KickoffReturnYards", "KO Ret Yds", (row) => stat(row, "KickoffReturnYards")),
      column("PuntReturnNum", "PR", (row) => stat(row, "PuntReturnNum")),
      column("PuntReturnYards", "PR Yds", (row) => stat(row, "PuntReturnYards")),
      column("TotalReturnYards", "Ret Yds", totalReturnYards),
      column("ReturnTD", "Ret TD", returnTouchdowns),
      column("PuntNum", "Punts", (row) => stat(row, "PuntNum")),
      column("PuntYards", "Punt Yds", (row) => stat(row, "PuntYards")),
      column("PuntAverage", "Punt Avg", puntAverage, twoDecimals),
      column("PuntInside20", "I20", (row) => stat(row, "PuntInside20")),
      column("KickoffNum", "KO", (row) => stat(row, "KickoffNum")),
      column("KickoffTouchbacks", "TB", (row) => stat(row, "KickoffTouchbacks")),
    ],
  },
  scoring: {
    label: "Scoring",
    columns: [
      column("TotalPoints", "Pts", totalPoints),
      column("TotalTD", "TD", totalTouchdowns),
      column("RushingTDNum", "Rush TD", (row) => stat(row, "RushingTDNum")),
      column("ReceivingTDNum", "Rec TD", (row) => stat(row, "ReceivingTDNum")),
      column("ReturnTD", "Ret TD", returnTouchdowns),
      column("DefensiveTD", "Def TD", defensiveTouchdowns),
      column("TotalKickingPoints", "Kick Pts", totalKickingPoints),
      column("PatKickingMade", "PAT", (row) => stat(row, "PatKickingMade")),
      column("PatPct", "PAT%", patPct, pct),
      column("FGMade", "FG", (row) => stat(row, "FGMade")),
      column("FGPct", "FG%", fgPct, pct),
      column("TotalConversionPoints", "2PT", (row) => stat(row, "TotalConversionPoints")),
      column("Safeties", "Safety", (row) => stat(row, "Safeties")),
    ],
  },
};

export const FOOTBALL_DETAIL_VIEW_ENTRIES = Object.entries(FOOTBALL_DETAIL_VIEWS);

export function footballPlayerPath(playerId) {
  return `${FOOTBALL_PLAYER_ROUTE_BASE}/${encodeURIComponent(String(playerId || ""))}`;
}

export function footballGamePath(gameId) {
  return `${FOOTBALL_GAME_ROUTE_BASE}/${encodeURIComponent(String(gameId || ""))}`;
}

export function careerIdFromCanonicalUrl(canonicalUrl) {
  const match = String(canonicalUrl || "").match(/[?&]careerid=([^&#]+)/i);
  return match ? decodeURIComponent(match[1]) : "";
}

export function getPlayerDisplayName(player) {
  return (
    String(player?.PlayerName || "").trim() ||
    [player?.FirstName, player?.LastName].map((part) => String(part || "").trim()).filter(Boolean).join(" ") ||
    "Unknown Player"
  );
}

export function getPlayerCareerKey(player) {
  const careerId = String(player?.CareerID || "").trim() || careerIdFromCanonicalUrl(player?.CanonicalUrl);
  const playerId = String(player?.PlayerID || "").trim();
  return careerId || (playerId ? `player:${playerId}` : "");
}

export function hasColumnValue(row, statColumn) {
  const value = statColumn?.valueFn?.(row);
  return Number.isFinite(Number(value)) && Number(value) !== 0;
}

export function getVisibleColumns(rows, columns, { includeAllWhenEmpty = false } = {}) {
  const rowList = Array.isArray(rows) ? rows : [rows].filter(Boolean);
  const visibleColumns = (columns || []).filter((statColumn) =>
    rowList.some((row) => hasColumnValue(row, statColumn))
  );

  if (visibleColumns.length > 0 || !includeAllWhenEmpty) return visibleColumns;
  return columns || [];
}

export function getVisibleRowsForColumns(rows, columns) {
  return (rows || []).filter((row) => (columns || []).some((statColumn) => hasColumnValue(row, statColumn)));
}

export function resolvePlayerCareerKey(data, playerId) {
  const id = String(playerId || "");
  const player = (data?.players || []).find((entry) => String(entry?.PlayerID || "") === id);
  const playerCareerKey = getPlayerCareerKey(player);
  if (playerCareerKey) return playerCareerKey;

  const gameRow = (data?.playerGameRows || []).find((row) => String(row?.PlayerID || "") === id);
  if (gameRow?.CareerKey) return String(gameRow.CareerKey);

  const seasonRow = (data?.playerSeasons || []).find((row) => String(row?.PlayerID || "") === id);
  if (seasonRow?.CareerKey) return String(seasonRow.CareerKey);

  const careerRow = (data?.playerCareers || []).find((row) => String(row?.PlayerID || "") === id);
  return String(careerRow?.CareerKey || "");
}

export function getRelatedPlayersForCareer(data, careerKey) {
  const relatedIds = new Set(
    [...(data?.playerGameRows || []), ...(data?.playerSeasons || []), ...(data?.playerCareers || [])]
      .filter((row) => String(row?.CareerKey || "") === String(careerKey || ""))
      .map((row) => String(row?.PlayerID || ""))
      .filter(Boolean)
  );

  return (data?.players || [])
    .filter((player) => {
      const playerId = String(player?.PlayerID || "");
      return relatedIds.has(playerId) || getPlayerCareerKey(player) === careerKey;
    })
    .sort((a, b) => getPlayerDisplayName(a).localeCompare(getPlayerDisplayName(b)));
}

export function getLatestRosterEntryForCareer(data, careerKey) {
  const relatedPlayerIds = new Set(
    getRelatedPlayersForCareer(data, careerKey).map((player) => String(player?.PlayerID || ""))
  );
  const playersById = new Map(
    (data?.players || []).map((player) => [String(player?.PlayerID || ""), player])
  );

  let latest = null;

  (data?.rosters || []).forEach((roster) => {
    const seasonId = Number(roster?.SeasonID);
    (roster?.Players || []).forEach((entry) => {
      const playerId = String(entry?.PlayerID || "");
      const player = playersById.get(playerId) || {};
      const merged = {
        ...player,
        ...entry,
        SeasonID: seasonId || roster?.SeasonID,
        SeasonLabel: roster?.DisplaySeason || roster?.SourceSeasonLabel || String(roster?.SeasonID || ""),
      };

      if (getPlayerCareerKey(merged) !== careerKey && !relatedPlayerIds.has(playerId)) return;

      if (!latest || Number(seasonId || 0) > Number(latest.SeasonID || 0)) {
        latest = merged;
      }
    });
  });

  return latest;
}

export function summarizePlayerProfile(data, playerId) {
  const requestedId = String(playerId || "");
  const careerKey = resolvePlayerCareerKey(data, requestedId);
  const exactPlayer = (data?.players || []).find(
    (player) => String(player?.PlayerID || "") === requestedId
  );
  const relatedPlayers = careerKey ? getRelatedPlayersForCareer(data, careerKey) : [];
  const latestRosterEntry = careerKey ? getLatestRosterEntryForCareer(data, careerKey) : null;
  const player = latestRosterEntry || exactPlayer || relatedPlayers[relatedPlayers.length - 1] || null;

  if (!player && !careerKey) return null;

  const seasonTotals = (data?.playerSeasons || [])
    .filter((row) => String(row?.CareerKey || "") === String(careerKey || ""))
    .sort((a, b) => Number(b?.SeasonID || 0) - Number(a?.SeasonID || 0));
  const gameRows = (data?.playerGameRows || [])
    .filter((row) => String(row?.CareerKey || "") === String(careerKey || ""))
    .sort((a, b) => Number(b?.GameID || 0) - Number(a?.GameID || 0));
  const careerTotal =
    (data?.playerCareers || []).find((row) => String(row?.CareerKey || "") === String(careerKey || "")) ||
    null;

  return {
    careerKey,
    player,
    exactPlayer,
    relatedPlayers,
    latestRosterEntry,
    seasonTotals,
    gameRows,
    careerTotal,
  };
}

export function formatPlayerWeight(value) {
  return Number.isFinite(Number(value)) ? `${Number(value)} lbs` : "—";
}

export function formatPositions(positions) {
  return Array.isArray(positions) && positions.length ? positions.join(", ") : "—";
}

export function formatTeamScore(game) {
  const teamScore = Number(game?.TeamScore);
  const opponentScore = Number(game?.OpponentScore);
  if (!Number.isFinite(teamScore) || !Number.isFinite(opponentScore)) return "—";
  return `${teamScore}-${opponentScore}`;
}
