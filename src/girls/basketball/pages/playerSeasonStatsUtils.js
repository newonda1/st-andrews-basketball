import { countsAsPlayerGame } from "../dataUtils";

export const BASKETBALL_TOTAL_FIELDS = [
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

const BASKETBALL_MILESTONE_FIELDS = [
  "DoubleDoubles",
  "TripleDoubles",
  "TwentyPointGames",
  "ThirtyPointGames",
  "FortyPointGames",
  "TenReboundGames",
  "TenAssistGames",
  "FiveStealGames",
  "FiveBlockGames",
];

function safeNum(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function createHasMap() {
  return BASKETBALL_TOTAL_FIELDS.reduce((acc, field) => {
    acc[field] = false;
    return acc;
  }, {});
}

function createEmptyPlayerSeasonTotal(playerId, season) {
  return {
    PlayerID: String(playerId),
    Season: String(season),
    GamesPlayed: 0,
    Points: 0,
    Rebounds: 0,
    Assists: 0,
    Steals: 0,
    Blocks: 0,
    Turnovers: 0,
    TwoPM: 0,
    TwoPA: 0,
    ThreePM: 0,
    ThreePA: 0,
    FTM: 0,
    FTA: 0,
    DoubleDoubles: 0,
    TripleDoubles: 0,
    TwentyPointGames: 0,
    ThirtyPointGames: 0,
    FortyPointGames: 0,
    TenReboundGames: 0,
    TenAssistGames: 0,
    FiveStealGames: 0,
    FiveBlockGames: 0,
    _has: createHasMap(),
  };
}

function ensureSeasonTotal(map, playerId, season) {
  const key = `${playerId}-${season}`;
  if (!map[key]) map[key] = createEmptyPlayerSeasonTotal(playerId, season);
  return map[key];
}

function seasonKeyFromRosterId(seasonId) {
  const text = String(seasonId ?? "").trim();
  const labelMatch = text.match(/^(\d{4})(?:-\d{2,4})?$/);
  if (labelMatch) return labelMatch[1];

  const number = Number(text);
  return Number.isFinite(number) ? String(number) : null;
}

function statSeason(row, gameToSeasonMap) {
  const season = row?.SeasonID ?? row?.Season ?? gameToSeasonMap.get(String(row?.GameID));
  return season == null ? null : String(season);
}

function addField(total, row, field) {
  if (!hasValue(row?.[field])) return;
  total[field] += safeNum(row[field]);
  total._has[field] = true;
}

function setField(total, row, field) {
  if (!hasValue(row?.[field])) return;
  total[field] = safeNum(row[field]);
  total._has[field] = true;
}

function addMilestoneFields(total, row) {
  BASKETBALL_MILESTONE_FIELDS.forEach((field) => {
    if (hasValue(row?.[field])) total[field] += safeNum(row[field]);
  });
}

function addGameMilestones(total, row) {
  const points = safeNum(row.Points);
  const rebounds = safeNum(row.Rebounds);
  const assists = safeNum(row.Assists);
  const steals = safeNum(row.Steals);
  const blocks = safeNum(row.Blocks);

  if (points >= 20) total.TwentyPointGames += 1;
  if (points >= 30) total.ThirtyPointGames += 1;
  if (points >= 40) total.FortyPointGames += 1;
  if (rebounds >= 10) total.TenReboundGames += 1;
  if (assists >= 10) total.TenAssistGames += 1;
  if (steals >= 5) total.FiveStealGames += 1;
  if (blocks >= 5) total.FiveBlockGames += 1;

  const doubleDigitCategories = [points, rebounds, assists, steals, blocks].filter(
    (value) => value >= 10
  ).length;
  if (doubleDigitCategories >= 2) total.DoubleDoubles += 1;
  if (doubleDigitCategories >= 3) total.TripleDoubles += 1;
}

function addGameStat(total, row) {
  const played = countsAsPlayerGame(row);
  if (played) total.GamesPlayed += 1;

  BASKETBALL_TOTAL_FIELDS.forEach((field) => addField(total, row, field));
  if (played) addGameMilestones(total, row);
}

function overlayRosterSeasonTotal(total, rosterPlayer) {
  if (hasValue(rosterPlayer?.GamesPlayed)) {
    total.GamesPlayed = safeNum(rosterPlayer.GamesPlayed);
  }

  const seasonTotals = rosterPlayer?.SeasonTotals || {};
  BASKETBALL_TOTAL_FIELDS.forEach((field) => setField(total, seasonTotals, field));
}

function addSeasonAdjustment(total, row) {
  if (hasValue(row?.GamesPlayed)) total.GamesPlayed += safeNum(row.GamesPlayed);
  BASKETBALL_TOTAL_FIELDS.forEach((field) => addField(total, row, field));
  addMilestoneFields(total, row);
}

export function buildBasketballPlayerSeasonTotals({
  playerGameStats = [],
  games = [],
  seasonRosters = [],
  adjustments = [],
} = {}) {
  const gameToSeasonMap = new Map(
    (Array.isArray(games) ? games : [])
      .filter((game) => game?.GameID != null && (game.SeasonID != null || game.Season != null))
      .map((game) => [String(game.GameID), String(game.SeasonID ?? game.Season)])
  );
  const seasonMap = {};

  for (const gameStat of Array.isArray(playerGameStats) ? playerGameStats : []) {
    if (!gameStat || gameStat.PlayerID == null) continue;

    const season = statSeason(gameStat, gameToSeasonMap);
    if (season == null) continue;

    const total = ensureSeasonTotal(seasonMap, String(gameStat.PlayerID), season);
    addGameStat(total, gameStat);
  }

  for (const seasonRoster of Array.isArray(seasonRosters) ? seasonRosters : []) {
    const season = seasonKeyFromRosterId(seasonRoster?.SeasonID);
    if (!season) continue;

    for (const rosterPlayer of seasonRoster?.Players || []) {
      if (!rosterPlayer?.PlayerID || !rosterPlayer.SeasonTotals) continue;
      const total = ensureSeasonTotal(seasonMap, String(rosterPlayer.PlayerID), season);
      overlayRosterSeasonTotal(total, rosterPlayer);
    }
  }

  for (const adjustment of Array.isArray(adjustments) ? adjustments : []) {
    if (!adjustment || adjustment.PlayerID == null || adjustment.SeasonID == null) continue;

    const total = ensureSeasonTotal(
      seasonMap,
      String(adjustment.PlayerID),
      String(adjustment.SeasonID)
    );
    addSeasonAdjustment(total, adjustment);
  }

  return Object.values(seasonMap);
}

export function buildBasketballCareerTotals(playerSeasonTotals = [], careerAdjustments = []) {
  const totalsMap = new Map();

  function ensureCareerTotal(playerId) {
    const key = String(playerId);
    if (!totalsMap.has(key)) {
      totalsMap.set(key, createEmptyPlayerSeasonTotal(key, "career"));
    }
    return totalsMap.get(key);
  }

  for (const seasonTotal of Array.isArray(playerSeasonTotals) ? playerSeasonTotals : []) {
    if (!seasonTotal?.PlayerID) continue;

    const total = ensureCareerTotal(seasonTotal.PlayerID);
    total.GamesPlayed += safeNum(seasonTotal.GamesPlayed);

    BASKETBALL_TOTAL_FIELDS.forEach((field) => {
      if (!seasonTotal._has?.[field]) return;
      total[field] += safeNum(seasonTotal[field]);
      total._has[field] = true;
    });

    BASKETBALL_MILESTONE_FIELDS.forEach((field) => {
      total[field] += safeNum(seasonTotal[field]);
    });
  }

  for (const adjustment of Array.isArray(careerAdjustments) ? careerAdjustments : []) {
    if (!adjustment?.PlayerID) continue;
    const total = ensureCareerTotal(adjustment.PlayerID);
    addSeasonAdjustment(total, adjustment);
  }

  return Array.from(totalsMap.values());
}
