export function absUrl(path) {
  return new URL(path, window.location.origin).toString();
}

export async function fetchJson(label, path) {
  const url = absUrl(path);
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();

  if (!res.ok) throw new Error(`${label} failed (HTTP ${res.status}) at ${path}`);

  const trimmed = text.trim();
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
    throw new Error(`${label} did not return JSON at ${path} (returned HTML).`);
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`${label} returned invalid JSON at ${path}: ${String(e?.message || e)}`);
  }
}

export function safeNum(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatSeasonLabel(seasonKey) {
  const season = Number(seasonKey);
  if (!Number.isFinite(season)) return "Unknown Season";
  return `${season}-${String(season + 1).slice(-2)}`;
}

export function tryParseGameDate(game) {
  const gid = String(game?.GameID ?? "");

  if (/^\d{8,}$/.test(gid)) {
    const y = Number(gid.slice(0, 4));
    const m = Number(gid.slice(4, 6));
    const d = Number(gid.slice(6, 8));
    const dt = new Date(Date.UTC(y, m - 1, d));
    if (!Number.isNaN(dt.getTime())) return dt;
  }

  return null;
}

export function formatDateFromGame(game) {
  const dt = tryParseGameDate(game);
  if (!dt) return "Unknown Date";

  return dt.toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getGameResult(game) {
  if (!game) return "—";

  const team = Number(game.TeamScore);
  const opp = Number(game.OpponentScore);
  if (Number.isFinite(team) && Number.isFinite(opp)) {
    let outcome = "Tie";
    if (team > opp) outcome = "Win";
    else if (team < opp) outcome = "Loss";
    return `${team}-${opp} ${outcome}`;
  }

  const result = String(game?.Result ?? "").trim().toUpperCase();
  if (result === "W" || result === "L" || result === "T") return result;
  return "—";
}

export function extractGameDateKey(gameId) {
  const text = String(gameId ?? "");
  const match = text.match(/^(\d{8})/);
  return match ? Number(match[1]) : NaN;
}

export function todayDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return Number(`${year}${month}${day}`);
}

export function isFutureGame(game, currentDateKey = todayDateKey()) {
  const gameDateKey = extractGameDateKey(game?.GameID);
  return Number.isFinite(gameDateKey) && gameDateKey > currentDateKey;
}

export function getSeasonKey(game) {
  if (game?.SeasonID != null && String(game.SeasonID).trim() !== "") {
    return String(game.SeasonID).trim();
  }

  if (game?.Season != null && String(game.Season).trim() !== "") {
    return String(game.Season).trim();
  }

  return "Unknown Season";
}

export const TEAM_BOX_FIELDS = [
  "Points",
  "Rebounds",
  "Assists",
  "Steals",
  "Blocks",
  "Turnovers",
  "TwoPM",
  "TwoPA",
  "ThreePM",
  "ThreePA",
  "FTM",
  "FTA",
];

function hasRecordedValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function createFieldMap(defaultValue) {
  return TEAM_BOX_FIELDS.reduce((acc, field) => {
    acc[field] = defaultValue;
    return acc;
  }, {});
}

export function createEmptyTeamGameTotals() {
  return {
    GamesPlayed: 1,
    Wins: 0,
    Losses: 0,
    Ties: 0,
    OpponentPoints: 0,
    ...createFieldMap(0),
    _has: {
      OpponentPoints: false,
      ...createFieldMap(false),
    },
  };
}

export function accumulateTeamGameStats(total, row) {
  for (const field of TEAM_BOX_FIELDS) {
    if (hasRecordedValue(row?.[field])) {
      total._has[field] = true;
    }
    total[field] += safeNum(row?.[field]);
  }
}

function applyOfficialGameFallbacks(total, game) {
  const teamScore = Number(game?.TeamScore);
  const opponentScore = Number(game?.OpponentScore);

  if (Number.isFinite(teamScore)) {
    total.Points = teamScore;
    total._has.Points = true;
  }

  if (Number.isFinite(opponentScore)) {
    total.OpponentPoints = opponentScore;
    total._has.OpponentPoints = true;
  }

  if (Number.isFinite(teamScore) && Number.isFinite(opponentScore)) {
    if (teamScore > opponentScore) total.Wins = 1;
    else if (teamScore < opponentScore) total.Losses = 1;
    else total.Ties = 1;
    return;
  }

  const result = String(game?.Result ?? "").trim().toUpperCase();
  if (result === "W") total.Wins = 1;
  else if (result === "L") total.Losses = 1;
  else if (result === "T") total.Ties = 1;
}

export function buildTeamGameTotals(gamesDataRaw, playerStatsDataRaw) {
  const gamesData = Array.isArray(gamesDataRaw) ? gamesDataRaw : [];
  const playerStatsData = Array.isArray(playerStatsDataRaw) ? playerStatsDataRaw : [];
  const currentDateKey = todayDateKey();

  const statsByGame = new Map();
  for (const row of playerStatsData) {
    if (!row || row.GameID == null) continue;
    const key = String(row.GameID);
    if (!statsByGame.has(key)) statsByGame.set(key, []);
    statsByGame.get(key).push(row);
  }

  return gamesData
    .filter((game) => game?.GameID != null && !isFutureGame(game, currentDateKey))
    .map((game) => {
      const totals = createEmptyTeamGameTotals();
      const gameRows = statsByGame.get(String(game.GameID)) || [];

      for (const row of gameRows) {
        accumulateTeamGameStats(totals, row);
      }

      applyOfficialGameFallbacks(totals, game);

      return {
        ...totals,
        GameID: String(game.GameID),
        SeasonKey: getSeasonKey(game),
        date: formatDateFromGame(game),
        opponent: game?.Opponent ?? "Unknown Opponent",
        gameResult: getGameResult(game),
      };
    });
}

function createEmptySeasonTotals(seasonKey, coach) {
  return {
    SeasonKey: String(seasonKey),
    SeasonLabel: formatSeasonLabel(seasonKey),
    Coach: coach || "—",
    GamesPlayed: 0,
    Wins: 0,
    Losses: 0,
    Ties: 0,
    OpponentPoints: 0,
    ...createFieldMap(0),
    _has: {
      OpponentPoints: false,
      ...createFieldMap(false),
    },
    Coverage: createFieldMap(0),
  };
}

export function buildTeamSeasonTotals(teamGames, seasonsDataRaw = []) {
  const seasonMeta = new Map(
    (Array.isArray(seasonsDataRaw) ? seasonsDataRaw : []).map((season) => [
      String(season.SeasonID),
      season,
    ])
  );

  const seasonTotalsMap = new Map();

  for (const gameRow of teamGames) {
    const seasonKey = String(gameRow.SeasonKey);
    if (!seasonTotalsMap.has(seasonKey)) {
      const seasonObj = seasonMeta.get(seasonKey);
      seasonTotalsMap.set(
        seasonKey,
        createEmptySeasonTotals(seasonKey, seasonObj?.HeadCoach)
      );
    }

    const totals = seasonTotalsMap.get(seasonKey);
    totals.GamesPlayed += 1;
    totals.Wins += safeNum(gameRow.Wins);
    totals.Losses += safeNum(gameRow.Losses);
    totals.Ties += safeNum(gameRow.Ties);
    totals.OpponentPoints += safeNum(gameRow.OpponentPoints);
    totals._has.OpponentPoints = totals._has.OpponentPoints || gameRow._has.OpponentPoints;

    for (const field of TEAM_BOX_FIELDS) {
      totals[field] += safeNum(gameRow[field]);
      if (gameRow._has[field]) {
        totals._has[field] = true;
        totals.Coverage[field] += 1;
      }
    }
  }

  return Array.from(seasonTotalsMap.values()).sort(
    (a, b) => safeNum(b.SeasonKey) - safeNum(a.SeasonKey)
  );
}

export function fieldGoalsMade(row) {
  return safeNum(row?.TwoPM) + safeNum(row?.ThreePM);
}

export function fieldGoalAttempts(row) {
  return safeNum(row?.TwoPA) + safeNum(row?.ThreePA);
}

export function fieldGoalPct(row) {
  const attempts = fieldGoalAttempts(row);
  return attempts > 0 ? (fieldGoalsMade(row) / attempts) * 100 : NaN;
}

export function twoPointPct(row) {
  const attempts = safeNum(row?.TwoPA);
  return attempts > 0 ? (safeNum(row?.TwoPM) / attempts) * 100 : NaN;
}

export function threePointPct(row) {
  const attempts = safeNum(row?.ThreePA);
  return attempts > 0 ? (safeNum(row?.ThreePM) / attempts) * 100 : NaN;
}

export function freeThrowPct(row) {
  const attempts = safeNum(row?.FTA);
  return attempts > 0 ? (safeNum(row?.FTM) / attempts) * 100 : NaN;
}

export function effectiveFieldGoalPct(row) {
  const attempts = fieldGoalAttempts(row);
  return attempts > 0
    ? ((fieldGoalsMade(row) + 0.5 * safeNum(row?.ThreePM)) / attempts) * 100
    : NaN;
}

export function winPct(row) {
  const games = safeNum(row?.GamesPlayed);
  return games > 0
    ? ((safeNum(row?.Wins) + 0.5 * safeNum(row?.Ties)) / games) * 100
    : NaN;
}

export function pointsPerGame(row) {
  const games = safeNum(row?.GamesPlayed);
  return games > 0 ? safeNum(row?.Points) / games : NaN;
}

export function opponentPointsPerGame(row) {
  const games = safeNum(row?.GamesPlayed);
  return games > 0 ? safeNum(row?.OpponentPoints) / games : NaN;
}

export function scoringMargin(row) {
  return safeNum(row?.Points) - safeNum(row?.OpponentPoints);
}

export function scoringMarginPerGame(row) {
  const games = safeNum(row?.GamesPlayed);
  return games > 0 ? scoringMargin(row) / games : NaN;
}

export function combinedPoints(row) {
  return safeNum(row?.Points) + safeNum(row?.OpponentPoints);
}

export function reboundsPerGame(row) {
  const games = safeNum(row?.GamesPlayed);
  return games > 0 ? safeNum(row?.Rebounds) / games : NaN;
}

export function assistsPerGame(row) {
  const games = safeNum(row?.GamesPlayed);
  return games > 0 ? safeNum(row?.Assists) / games : NaN;
}

export function stealsPerGame(row) {
  const games = safeNum(row?.GamesPlayed);
  return games > 0 ? safeNum(row?.Steals) / games : NaN;
}

export function blocksPerGame(row) {
  const games = safeNum(row?.GamesPlayed);
  return games > 0 ? safeNum(row?.Blocks) / games : NaN;
}

export function turnoversPerGame(row) {
  const games = safeNum(row?.GamesPlayed);
  return games > 0 ? safeNum(row?.Turnovers) / games : NaN;
}

export function assistTurnoverRatio(row) {
  const turnovers = safeNum(row?.Turnovers);
  return turnovers > 0 ? safeNum(row?.Assists) / turnovers : NaN;
}
