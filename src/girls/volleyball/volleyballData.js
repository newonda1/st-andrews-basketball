export const VOLLEYBALL_DATA_PATHS = {
  seasons: "/data/girls/volleyball/seasons.json",
  games: "/data/girls/volleyball/games.json",
  rosters: "/data/girls/volleyball/seasonrosters.json",
  playerSeasonStats: "/data/girls/volleyball/playerseasonstats.json",
  playerSeasonAdjustments: "/data/girls/volleyball/playerseasonadjustments.json",
  teamSeasonStats: "/data/girls/volleyball/teamseasonstats.json",
  playerGameStats: "/data/girls/volleyball/playergamestats.json",
  teamMatchStats: "/data/girls/volleyball/teammatchstats.json",
  players: "/data/players.json",
};

export const VOLLEYBALL_STAT_SECTIONS = [
  {
    title: "Attacking",
    columns: [
      { key: "SetsPlayed", label: "SP" },
      { key: "Kills", label: "K" },
      { key: "KillsPerSet", label: "K/S", format: "one" },
      { key: "KillPct", label: "Kill %" },
      { key: "AttackAttempts", label: "Att" },
      { key: "AttackErrors", label: "E" },
      { key: "HittingPct", label: "Hit %", format: "three" },
    ],
  },
  {
    title: "Serving",
    columns: [
      { key: "SetsPlayed", label: "SP" },
      { key: "Aces", label: "A" },
      { key: "AcesPerSet", label: "A/S", format: "one" },
      { key: "AcePct", label: "Ace %" },
      { key: "ServeAttempts", label: "SA" },
      { key: "ServeErrors", label: "SE" },
      { key: "ServePct", label: "Serv %" },
      { key: "ServingPoints", label: "PTS" },
    ],
  },
  {
    title: "Blocking",
    columns: [
      { key: "SetsPlayed", label: "SP" },
      { key: "SoloBlocks", label: "BS" },
      { key: "BlockAssists", label: "BA" },
      { key: "TotalBlocks", label: "TB" },
      { key: "BlocksPerSet", label: "B/S", format: "one" },
      { key: "BlocksPerMatch", label: "B/M", format: "one" },
      { key: "BlockErrors", label: "BE" },
    ],
  },
  {
    title: "Digging",
    columns: [
      { key: "SetsPlayed", label: "SP" },
      { key: "Digs", label: "D" },
      { key: "DigErrors", label: "DE" },
      { key: "DigsPerSet", label: "D/S", format: "one" },
      { key: "DigsPerMatch", label: "D/M", format: "one" },
    ],
  },
  {
    title: "Ball Handling",
    columns: [
      { key: "SetsPlayed", label: "SP" },
      { key: "Assists", label: "Ast" },
      { key: "AssistsPerSet", label: "Ast/S", format: "one" },
      { key: "BallHandlingAttempts", label: "BHA" },
      { key: "BallHandlingErrors", label: "BHE" },
    ],
  },
  {
    title: "Serve Receiving",
    columns: [
      { key: "SetsPlayed", label: "SP" },
      { key: "Receptions", label: "R" },
      { key: "ReceptionErrors", label: "RE" },
      { key: "ReceptionsPerSet", label: "R/S", format: "one" },
      { key: "ReceptionsPerMatch", label: "R/M", format: "one" },
    ],
  },
];

export async function fetchJson(path, label) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Could not load ${label} (${response.status}).`);
  }
  return response.json();
}

export async function loadVolleyballData() {
  const [
    seasons,
    games,
    rosters,
    players,
    playerSeasonStats,
    playerSeasonAdjustments,
    teamSeasonStats,
    playerGameStats,
    teamMatchStats,
  ] = await Promise.all([
    fetchJson(VOLLEYBALL_DATA_PATHS.seasons, "volleyball seasons"),
    fetchJson(VOLLEYBALL_DATA_PATHS.games, "volleyball games"),
    fetchJson(VOLLEYBALL_DATA_PATHS.rosters, "volleyball rosters"),
    fetchJson(VOLLEYBALL_DATA_PATHS.players, "players"),
    fetchJson(VOLLEYBALL_DATA_PATHS.playerSeasonStats, "volleyball player season stats"),
    fetchJson(
      VOLLEYBALL_DATA_PATHS.playerSeasonAdjustments,
      "volleyball player season adjustments"
    ),
    fetchJson(VOLLEYBALL_DATA_PATHS.teamSeasonStats, "volleyball team season stats"),
    fetchJson(VOLLEYBALL_DATA_PATHS.playerGameStats, "volleyball player game stats"),
    fetchJson(VOLLEYBALL_DATA_PATHS.teamMatchStats, "volleyball team match stats"),
  ]);

  return {
    seasons: Array.isArray(seasons) ? seasons : [],
    games: Array.isArray(games) ? games : [],
    rosters: Array.isArray(rosters) ? rosters : [],
    players: Array.isArray(players) ? players : [],
    playerSeasonStats: Array.isArray(playerSeasonStats) ? playerSeasonStats : [],
    playerSeasonAdjustments: Array.isArray(playerSeasonAdjustments)
      ? playerSeasonAdjustments
      : [],
    teamSeasonStats: Array.isArray(teamSeasonStats) ? teamSeasonStats : [],
    playerGameStats: Array.isArray(playerGameStats) ? playerGameStats : [],
    teamMatchStats: Array.isArray(teamMatchStats) ? teamMatchStats : [],
  };
}

export function getSeasonLabel(season) {
  if (season?.SourceSeasonLabel) return season.SourceSeasonLabel;
  if (season?.DisplaySeason) return season.DisplaySeason;
  if (season?.SeasonID != null) return String(season.SeasonID);
  return "—";
}

export function formatDate(dateValue) {
  if (!dateValue) return "—";
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return String(dateValue);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRecord(wins, losses, ties = 0) {
  const winValue = Number(wins || 0);
  const lossValue = Number(losses || 0);
  const tieValue = Number(ties || 0);
  return tieValue > 0
    ? `${winValue}-${lossValue}-${tieValue}`
    : `${winValue}-${lossValue}`;
}

export function formatStat(value, column = {}) {
  if (value === null || value === undefined || value === "") return "—";
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);

  if (column.format === "three") {
    return number.toFixed(3).replace(/^(-?)0\./, "$1.");
  }

  if (column.format === "one") {
    return number.toFixed(1);
  }

  return Number.isInteger(number) ? String(number) : String(number);
}

export function getPlayerName(player) {
  if (!player) return "Unknown Player";
  return [player.FirstName, player.LastName].filter(Boolean).join(" ").trim();
}

export function buildPlayerMap(players = []) {
  return new Map(players.map((player) => [String(player.PlayerID), player]));
}

export function sortGames(games = []) {
  return [...games].sort((a, b) => {
    const dateDiff = String(a.Date || "").localeCompare(String(b.Date || ""));
    if (dateDiff !== 0) return dateDiff;

    const suffixA = Number(String(a.GameID || "").split("-")[1] || 0);
    const suffixB = Number(String(b.GameID || "").split("-")[1] || 0);
    return suffixA - suffixB;
  });
}

export function getSeasonGames(games = [], seasonId) {
  return sortGames(
    games.filter((game) => Number(game.SeasonID ?? game.Season) === Number(seasonId))
  );
}

export function getRosterForSeason(rosters = [], seasonId) {
  return (
    rosters.find((roster) => Number(roster.SeasonID) === Number(seasonId)) || {
      Players: [],
    }
  );
}

export function hydrateRosterPlayers(roster, playerMap) {
  return (roster?.Players || [])
    .map((entry) => ({
      ...entry,
      ...(playerMap.get(String(entry.PlayerID)) || {}),
    }))
    .sort((a, b) => {
      const jerseyDiff = Number(a.JerseyNumber || 999) - Number(b.JerseyNumber || 999);
      if (jerseyDiff !== 0) return jerseyDiff;
      return getPlayerName(a).localeCompare(getPlayerName(b));
    });
}

export function buildGameRecord(games = []) {
  return games.reduce(
    (record, game) => {
      if (game.Result === "W") record.wins += 1;
      if (game.Result === "L") record.losses += 1;
      if (game.Result === "T") record.ties += 1;
      record.setsWon += Number(game.TeamScore || 0);
      record.setsLost += Number(game.OpponentScore || 0);
      return record;
    },
    { wins: 0, losses: 0, ties: 0, setsWon: 0, setsLost: 0 }
  );
}

export function getTeamStatCategory(teamStatsEntry, title) {
  return teamStatsEntry?.Categories?.[title] || {};
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function roundTo(value, places) {
  if (!Number.isFinite(value)) return null;
  return Number(value.toFixed(places));
}

function perSet(value, setsPlayed) {
  const sets = toNumber(setsPlayed);
  return sets > 0 ? roundTo(toNumber(value) / sets, 1) : null;
}

function perMatch(value, matchesPlayed) {
  const matches = toNumber(matchesPlayed);
  return matches > 0 ? roundTo(toNumber(value) / matches, 1) : null;
}

function percentage(numerator, denominator) {
  const divisor = toNumber(denominator);
  return divisor > 0 ? roundTo((toNumber(numerator) / divisor) * 100, 1) : null;
}

function hittingPercentage(kills, errors, attempts) {
  const attemptCount = toNumber(attempts);
  return attemptCount > 0
    ? roundTo((toNumber(kills) - toNumber(errors)) / attemptCount, 3)
    : null;
}

const ADJUSTABLE_STAT_KEYS = [
  "Games",
  "SetsPlayed",
  "Kills",
  "AttackAttempts",
  "AttackErrors",
  "Aces",
  "ServeAttempts",
  "ServeErrors",
  "ServingPoints",
  "SoloBlocks",
  "BlockAssists",
  "TotalBlocks",
  "BlockErrors",
  "Digs",
  "DigErrors",
  "Assists",
  "BallHandlingAttempts",
  "BallHandlingErrors",
  "Receptions",
  "ReceptionErrors",
];

function addCountingStats(target, row) {
  target.SetsPlayed += toNumber(row.SetsPlayed);
  target.Kills += toNumber(row.Kills);
  target.AttackAttempts += toNumber(row.AttackAttempts);
  target.AttackErrors += toNumber(row.AttackErrors);
  target.Aces += toNumber(row.Aces);
  target.ServeAttempts += toNumber(row.ServeAttempts);
  target.ServeErrors += toNumber(row.ServeErrors);
  target.ServingPoints += toNumber(row.ServingPoints);
  target.SoloBlocks += toNumber(row.SoloBlocks);
  target.BlockAssists += toNumber(row.BlockAssists);
  target.TotalBlocks += Number.isFinite(Number(row.TotalBlocks))
    ? Number(row.TotalBlocks)
    : toNumber(row.SoloBlocks) + toNumber(row.BlockAssists) / 2;
  target.BlockErrors += toNumber(row.BlockErrors);
  target.Digs += toNumber(row.Digs);
  target.DigErrors += toNumber(row.DigErrors);
  target.Assists += toNumber(row.Assists);
  target.BallHandlingAttempts += toNumber(row.BallHandlingAttempts);
  target.BallHandlingErrors += toNumber(row.BallHandlingErrors);
  target.Receptions += toNumber(row.Receptions);
  target.ReceptionErrors += toNumber(row.ReceptionErrors);
}

function applyDerivedStats(target, matchesPlayed) {
  target.KillsPerSet = perSet(target.Kills, target.SetsPlayed);
  target.KillPct = percentage(target.Kills, target.AttackAttempts);
  target.HittingPct = hittingPercentage(
    target.Kills,
    target.AttackErrors,
    target.AttackAttempts
  );
  target.AcesPerSet = perSet(target.Aces, target.SetsPlayed);
  target.AcePct = percentage(target.Aces, target.ServeAttempts);
  target.ServePct = percentage(
    target.ServeAttempts - target.ServeErrors,
    target.ServeAttempts
  );
  target.BlocksPerSet = perSet(target.TotalBlocks, target.SetsPlayed);
  target.BlocksPerMatch = perMatch(target.TotalBlocks, matchesPlayed);
  target.DigsPerSet = perSet(target.Digs, target.SetsPlayed);
  target.DigsPerMatch = perMatch(target.Digs, matchesPlayed);
  target.AssistsPerSet = perSet(target.Assists, target.SetsPlayed);
  target.ReceptionsPerSet = perSet(target.Receptions, target.SetsPlayed);
  target.ReceptionsPerMatch = perMatch(target.Receptions, matchesPlayed);

  return target;
}

function createEmptyStatRow(seed = {}) {
  return {
    ...seed,
    Games: 0,
    SetsPlayed: 0,
    Kills: 0,
    KillsPerSet: null,
    KillPct: null,
    AttackAttempts: 0,
    AttackErrors: 0,
    HittingPct: null,
    Aces: 0,
    AcesPerSet: null,
    AcePct: null,
    ServeAttempts: 0,
    ServeErrors: 0,
    ServePct: null,
    ServingPoints: 0,
    SoloBlocks: 0,
    BlockAssists: 0,
    TotalBlocks: 0,
    BlocksPerSet: null,
    BlocksPerMatch: null,
    BlockErrors: 0,
    Digs: 0,
    DigErrors: 0,
    DigsPerSet: null,
    DigsPerMatch: null,
    Assists: 0,
    AssistsPerSet: null,
    BallHandlingAttempts: 0,
    BallHandlingErrors: 0,
    Receptions: 0,
    ReceptionErrors: 0,
    ReceptionsPerSet: null,
    ReceptionsPerMatch: null,
  };
}

export function aggregateVolleyballStatRows(rows = [], seed = {}) {
  const aggregate = createEmptyStatRow(seed);
  const games = new Set();

  rows.forEach((row) => {
    games.add(String(row.GameID));
    if (aggregate.JerseyNumber == null && row.JerseyNumber != null) {
      aggregate.JerseyNumber = row.JerseyNumber;
    }
    if (!aggregate.PlayerName && row.PlayerName) {
      aggregate.PlayerName = row.PlayerName;
    }
    addCountingStats(aggregate, row);
  });

  aggregate.Games = games.size;
  return applyDerivedStats(aggregate, games.size);
}

export function aggregateVolleyballSeasonStatRows(rows = [], seed = {}) {
  const aggregate = createEmptyStatRow(seed);

  rows.forEach((row) => {
    if (aggregate.JerseyNumber == null && row.JerseyNumber != null) {
      aggregate.JerseyNumber = row.JerseyNumber;
    }
    if (!aggregate.PlayerName && row.PlayerName) {
      aggregate.PlayerName = row.PlayerName;
    }
    aggregate.Games += toNumber(row.Games);
    addCountingStats(aggregate, row);
  });

  return applyDerivedStats(aggregate, aggregate.Games);
}

function adjustmentSeason(adjustment) {
  return Number(adjustment?.Season ?? adjustment?.SeasonID);
}

function adjustmentKey(adjustment) {
  return `${adjustmentSeason(adjustment)}|${adjustment?.PlayerID}`;
}

function adjustmentOverrides(adjustment) {
  return adjustment?.Overrides && typeof adjustment.Overrides === "object"
    ? adjustment.Overrides
    : adjustment || {};
}

export function applyVolleyballSeasonAdjustment(row, adjustment) {
  const adjusted = { ...row };
  const overrides = adjustmentOverrides(adjustment);

  if (adjusted.Season == null) adjusted.Season = adjustmentSeason(adjustment);
  if (adjusted.PlayerID == null) adjusted.PlayerID = adjustment.PlayerID;
  if (adjusted.JerseyNumber == null && adjustment.JerseyNumber != null) {
    adjusted.JerseyNumber = adjustment.JerseyNumber;
  }
  if (!adjusted.PlayerName && adjustment.PlayerName) adjusted.PlayerName = adjustment.PlayerName;

  ADJUSTABLE_STAT_KEYS.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(overrides, key)) {
      adjusted[key] = overrides[key];
    }
  });

  return applyDerivedStats(adjusted, adjusted.Games);
}

export function mergePlayerSeasonAdjustments(rows = [], adjustments = [], seasonId = null) {
  const byPlayerSeason = new Map();

  rows.forEach((row) => {
    byPlayerSeason.set(`${Number(row.Season)}|${row.PlayerID}`, { ...row });
  });

  adjustments
    .filter((adjustment) => {
      if (seasonId == null) return true;
      return Number(adjustmentSeason(adjustment)) === Number(seasonId);
    })
    .forEach((adjustment) => {
      const season = adjustmentSeason(adjustment);
      const playerId = Number(adjustment.PlayerID);
      if (!Number.isFinite(season) || !Number.isFinite(playerId)) return;

      const key = adjustmentKey(adjustment);
      const current =
        byPlayerSeason.get(key) ||
        createEmptyStatRow({
          Season: season,
          PlayerID: playerId,
          JerseyNumber: adjustment.JerseyNumber,
          PlayerName: adjustment.PlayerName,
        });

      byPlayerSeason.set(key, applyVolleyballSeasonAdjustment(current, adjustment));
    });

  return Array.from(byPlayerSeason.values()).sort((a, b) => {
    const seasonDiff = Number(a.Season || 0) - Number(b.Season || 0);
    if (seasonDiff !== 0) return seasonDiff;
    const jerseyDiff = Number(a.JerseyNumber || 999) - Number(b.JerseyNumber || 999);
    if (jerseyDiff !== 0) return jerseyDiff;
    return String(a.PlayerName || "").localeCompare(String(b.PlayerName || ""));
  });
}

function aggregatePlayerSeasonRowsFromGames(playerGameStats = [], seasonId = null) {
  const playerRows = new Map();

  playerGameStats
    .filter((row) => seasonId == null || Number(row.Season) === Number(seasonId))
    .forEach((row) => {
      const key = `${Number(row.Season)}|${row.PlayerID}`;
      if (!playerRows.has(key)) playerRows.set(key, []);
      playerRows.get(key).push(row);
    });

  return Array.from(playerRows.entries())
    .map(([, rows]) =>
      aggregateVolleyballStatRows(rows, {
        Season: Number(rows[0]?.Season),
        PlayerID: rows[0]?.PlayerID,
        JerseyNumber: rows[0]?.JerseyNumber,
        PlayerName: rows[0]?.PlayerName,
      })
    )
    .sort((a, b) => {
      const jerseyDiff = Number(a.JerseyNumber || 999) - Number(b.JerseyNumber || 999);
      if (jerseyDiff !== 0) return jerseyDiff;
      return String(a.PlayerName || "").localeCompare(String(b.PlayerName || ""));
    });
}

export function aggregatePlayerSeasonStatsFromGames(
  playerGameStats = [],
  seasonId,
  playerSeasonAdjustments = []
) {
  const rows = aggregatePlayerSeasonRowsFromGames(playerGameStats, seasonId);
  return mergePlayerSeasonAdjustments(rows, playerSeasonAdjustments, seasonId);
}

export function aggregateAllPlayerSeasonStatsFromGames(
  playerGameStats = [],
  playerSeasonAdjustments = []
) {
  const rows = aggregatePlayerSeasonRowsFromGames(playerGameStats);
  return mergePlayerSeasonAdjustments(rows, playerSeasonAdjustments);
}

export function aggregateTeamSeasonStatsFromMatches(teamMatchStats = [], seasonId) {
  const rows = teamMatchStats.filter((row) => Number(row.Season) === Number(seasonId));
  if (rows.length === 0) return null;

  const categories = {};

  VOLLEYBALL_STAT_SECTIONS.forEach((section) => {
    const aggregate = createEmptyStatRow();
    rows.forEach((row) => {
      addCountingStats(aggregate, getTeamStatCategory(row, section.title));
    });
    categories[section.title] = applyDerivedStats(aggregate, rows.length);
  });

  return {
    SeasonID: Number(seasonId),
    Categories: categories,
  };
}
