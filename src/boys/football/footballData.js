export const FOOTBALL_DATA_PATHS = {
  games: "/data/boys/football/games.json",
  seasons: "/data/boys/football/seasons.json",
  players: "/data/boys/football/players.json",
  rosters: "/data/boys/football/seasonrosters.json",
  stats: "/data/boys/football/seasonstats.json",
  playerGameLogs: "/data/boys/football/playergamelogs.json",
  playerSeasonAdjustments: "/data/boys/football/playerseasonadjustments.json",
  schools: "/data/schools.json",
};

export async function fetchJson(path, label) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Could not load ${label} (${response.status}).`);
  }
  return response.json();
}

export async function fetchJsonOptional(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export async function loadFootballResultsData() {
  const [games, seasons] = await Promise.all([
    fetchJson(FOOTBALL_DATA_PATHS.games, "football games"),
    fetchJson(FOOTBALL_DATA_PATHS.seasons, "football seasons"),
  ]);

  return {
    games: Array.isArray(games) ? games : [],
    seasons: Array.isArray(seasons) ? seasons : [],
  };
}

export async function loadFootballSeasonPageData() {
  const [games, seasons, players, rosters, stats, schools] = await Promise.all([
    fetchJson(FOOTBALL_DATA_PATHS.games, "football games"),
    fetchJson(FOOTBALL_DATA_PATHS.seasons, "football seasons"),
    fetchJson(FOOTBALL_DATA_PATHS.players, "football players"),
    fetchJson(FOOTBALL_DATA_PATHS.rosters, "football rosters"),
    fetchJson(FOOTBALL_DATA_PATHS.stats, "football stats"),
    fetchJson(FOOTBALL_DATA_PATHS.schools, "schools"),
  ]);

  return {
    games: Array.isArray(games) ? games : [],
    seasons: Array.isArray(seasons) ? seasons : [],
    players: Array.isArray(players) ? players : [],
    rosters: Array.isArray(rosters) ? rosters : [],
    seasonStats: Array.isArray(stats) ? stats : stats && typeof stats === "object" ? [stats] : [],
    schools: Array.isArray(schools) ? schools : [],
  };
}

export async function loadFootballRecordsData() {
  const [games, seasons, players, rosters, playerGameLogs, playerSeasonAdjustments] =
    await Promise.all([
      fetchJson(FOOTBALL_DATA_PATHS.games, "football games"),
      fetchJson(FOOTBALL_DATA_PATHS.seasons, "football seasons"),
      fetchJson(FOOTBALL_DATA_PATHS.players, "football players"),
      fetchJson(FOOTBALL_DATA_PATHS.rosters, "football rosters"),
      fetchJson(FOOTBALL_DATA_PATHS.playerGameLogs, "football player game logs"),
      fetchJsonOptional(FOOTBALL_DATA_PATHS.playerSeasonAdjustments),
    ]);

  return {
    games: Array.isArray(games) ? games : [],
    seasons: Array.isArray(seasons) ? seasons : [],
    players: Array.isArray(players) ? players : [],
    rosters: Array.isArray(rosters) ? rosters : [],
    playerGameLogs: Array.isArray(playerGameLogs) ? playerGameLogs : [],
    playerSeasonAdjustments: Array.isArray(playerSeasonAdjustments)
      ? playerSeasonAdjustments
      : [],
  };
}

function numericDateValue(game) {
  const dateText = String(game?.Date ?? "").replace(/-/g, "");
  if (/^\d{8}$/.test(dateText)) {
    return Number(dateText);
  }

  const gameId = Number(game?.GameID);
  return Number.isFinite(gameId) ? gameId : 0;
}

export function sortGamesChronologically(games) {
  return [...(games || [])].sort((a, b) => {
    const byDate = numericDateValue(a) - numericDateValue(b);
    if (byDate !== 0) return byDate;
    return Number(a?.GameID || 0) - Number(b?.GameID || 0);
  });
}

export function formatGameDate(game) {
  const numericDate = String(numericDateValue(game));
  if (numericDate.length !== 8) return "—";

  const year = Number(numericDate.slice(0, 4));
  const month = Number(numericDate.slice(4, 6));
  const day = Number(numericDate.slice(6, 8));
  const date = new Date(Date.UTC(year, month - 1, day));

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatSeasonLabel(season) {
  if (season?.SourceSeasonLabel) return String(season.SourceSeasonLabel);
  if (season?.DisplaySeason) return String(season.DisplaySeason);
  if (season?.SeasonID != null) return String(season.SeasonID);
  return "—";
}

export function formatRecord(wins, losses, ties = 0) {
  if (
    !Number.isFinite(Number(wins)) ||
    !Number.isFinite(Number(losses)) ||
    !Number.isFinite(Number(ties))
  ) {
    return "—";
  }

  const winValue = Number(wins);
  const lossValue = Number(losses);
  const tieValue = Number(ties);

  return tieValue > 0
    ? `${winValue}–${lossValue}–${tieValue}`
    : `${winValue}–${lossValue}`;
}

export function buildRecord(games, filterFn = () => true) {
  const filteredGames = (games || []).filter(filterFn);
  let wins = 0;
  let losses = 0;
  let ties = 0;

  filteredGames.forEach((game) => {
    if (game?.Result === "W") wins += 1;
    else if (game?.Result === "L") losses += 1;
    else if (game?.Result === "T") ties += 1;
  });

  return {
    wins,
    losses,
    ties,
    text: formatRecord(wins, losses, ties),
  };
}

export function formatWinningPct(wins, losses, ties = 0) {
  const totalGames = Number(wins || 0) + Number(losses || 0) + Number(ties || 0);
  if (!totalGames) return "—";
  return `${((Number(wins || 0) / totalGames) * 100).toFixed(1)}%`;
}

export function toNumber(value) {
  const text = String(value ?? "").trim().replace(/,/g, "");
  if (!text || text === "—" || text === "-" || text === "N/A") {
    return null;
  }

  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

export function formatNumber(value, options = {}) {
  const number = toNumber(value);
  if (number === null) return "—";
  return number.toLocaleString("en-US", options);
}

export function getSeasonStatSections(seasonStats) {
  return Array.isArray(seasonStats?.Sections) ? seasonStats.Sections : [];
}

export function getSeasonStatsForSeason(allSeasonStats, seasonId) {
  return (
    (allSeasonStats || []).find(
      (entry) => Number(entry?.SeasonID) === Number(seasonId)
    ) || null
  );
}

export function getSeasonStatTable(seasonStats, title) {
  const normalizedTitle = String(title ?? "").trim().toLowerCase();
  const sections = getSeasonStatSections(seasonStats);

  for (const section of sections) {
    const tables = Array.isArray(section?.Tables) ? section.Tables : [];
    const match = tables.find(
      (table) => String(table?.Title ?? "").trim().toLowerCase() === normalizedTitle
    );
    if (match) return match;
  }

  return null;
}
