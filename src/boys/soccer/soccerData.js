export const BOYS_SOCCER_DATA_PATHS = {
  games: "/data/boys/soccer/games.json",
  seasons: "/data/boys/soccer/seasons.json",
  rosters: "/data/boys/soccer/seasonrosters.json",
  statAdjustments: "/data/boys/soccer/seasonstatadjustments.json",
  players: "/data/players.json",
  schools: "/data/schools.json",
};

export async function fetchJson(path, label) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Could not load ${label} (${response.status}).`);
  }
  return response.json();
}

export async function loadBoysSoccerData() {
  const [games, seasons, rosters, statAdjustments, players, schools] = await Promise.all([
    fetchJson(BOYS_SOCCER_DATA_PATHS.games, "boys soccer games"),
    fetchJson(BOYS_SOCCER_DATA_PATHS.seasons, "boys soccer seasons"),
    fetchJson(BOYS_SOCCER_DATA_PATHS.rosters, "boys soccer rosters"),
    fetchJson(BOYS_SOCCER_DATA_PATHS.statAdjustments, "boys soccer stat adjustments"),
    fetchJson(BOYS_SOCCER_DATA_PATHS.players, "players"),
    fetchJson(BOYS_SOCCER_DATA_PATHS.schools, "schools"),
  ]);

  const schoolMap = new Map(
    (Array.isArray(schools) ? schools : [])
      .filter((school) => school?.SchoolID)
      .map((school) => [String(school.SchoolID), school])
  );

  const hydratedGames = (Array.isArray(games) ? games : []).map((game) => {
    const school = schoolMap.get(String(game?.OpponentID ?? ""));
    if (!school) return game;

    const opponentLocation = [school.City, school.State]
      .map((part) => String(part || "").trim())
      .filter(Boolean)
      .join(", ");

    return {
      ...game,
      Opponent: school.Name || game.Opponent,
      OpponentLocation: opponentLocation || game.OpponentLocation,
      OpponentSchool: school,
    };
  });

  return {
    games: hydratedGames,
    seasons: Array.isArray(seasons) ? seasons : [],
    rosters: Array.isArray(rosters) ? rosters : [],
    statAdjustments: Array.isArray(statAdjustments) ? statAdjustments : [],
    players: Array.isArray(players) ? players : [],
    schools: Array.isArray(schools) ? schools : [],
  };
}

function numericDateValue(game) {
  const dateText = String(game?.Date ?? "").replace(/-/g, "");
  if (/^\d{8}$/.test(dateText)) return Number(dateText);

  const gameId = Number(game?.GameID);
  return Number.isFinite(gameId) ? gameId : 0;
}

export function sortSoccerGames(games) {
  return [...(games || [])].sort((a, b) => {
    const byDate = numericDateValue(a) - numericDateValue(b);
    if (byDate !== 0) return byDate;
    return Number(a?.GameID || 0) - Number(b?.GameID || 0);
  });
}

export function formatSoccerDate(gameOrDate) {
  if (typeof gameOrDate === "object" && gameOrDate !== null) {
    const displayDate = gameOrDate.DisplayDate || gameOrDate.DateLabel;
    if (displayDate) return String(displayDate);
  }

  const rawDate =
    typeof gameOrDate === "string" ? gameOrDate : String(gameOrDate?.Date ?? "");
  const normalized = rawDate.replace(/-/g, "");
  if (!/^\d{8}$/.test(normalized)) return "TBA";

  const year = Number(normalized.slice(0, 4));
  const month = Number(normalized.slice(4, 6));
  const day = Number(normalized.slice(6, 8));
  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime())) return "TBA";

  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getSoccerSeasonLabel(season) {
  if (season?.DisplaySeason) return String(season.DisplaySeason);
  if (season?.SourceSeasonLabel) return String(season.SourceSeasonLabel);
  if (season?.SeasonID != null) return String(season.SeasonID);
  return "Season";
}

export function formatRecord(wins, losses, ties = 0) {
  const winValue = Number(wins);
  const lossValue = Number(losses);
  const tieValue = Number(ties || 0);

  if (!Number.isFinite(winValue) || !Number.isFinite(lossValue)) return "—";
  return tieValue > 0
    ? `${winValue}-${lossValue}-${tieValue}`
    : `${winValue}-${lossValue}`;
}

export function buildGameRecord(games, filterFn = () => true) {
  let wins = 0;
  let losses = 0;
  let ties = 0;

  (games || []).filter(filterFn).forEach((game) => {
    const result = String(game?.Result || "").toUpperCase();
    if (result === "W") wins += 1;
    else if (result === "L") losses += 1;
    else if (result === "T") ties += 1;
  });

  return {
    wins,
    losses,
    ties,
    text: formatRecord(wins, losses, ties),
  };
}

export function getSeasonRecord(season, games) {
  if (
    Number.isFinite(Number(season?.OverallWins)) &&
    Number.isFinite(Number(season?.OverallLosses))
  ) {
    return formatRecord(
      season.OverallWins,
      season.OverallLosses,
      season.OverallTies
    );
  }

  return buildGameRecord(games).text;
}

export function getPlayerName(player) {
  return (
    String(player?.PlayerName || "").trim() ||
    [player?.FirstName, player?.LastName]
      .map((part) => String(part || "").trim())
      .filter(Boolean)
      .join(" ") ||
    "Unknown Player"
  );
}

export function buildPlayerMap(players = []) {
  return new Map(players.map((player) => [String(player?.PlayerID), player]));
}

function firstMeaningfulValue(...values) {
  return values.find(
    (value) =>
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
  );
}

function gradeLabelForGrade(grade) {
  const value = Number(grade);
  if (value === 7) return "7th";
  if (value === 8) return "8th";
  if (value === 9) return "Freshman";
  if (value === 10) return "Sophomore";
  if (value === 11) return "Junior";
  if (value === 12) return "Senior";
  return null;
}

export function deriveRosterGradeFromGradYear(player, seasonId) {
  const gradYear = Number(player?.GradYear);
  const seasonYear = Number(seasonId);
  if (!Number.isFinite(gradYear) || !Number.isFinite(seasonYear)) return null;

  const grade = 12 + seasonYear - gradYear;
  return grade >= 7 && grade <= 12 ? grade : null;
}

export function hydrateRosterPlayers(roster, players = []) {
  const playerMap = buildPlayerMap(players);
  const entries = Array.isArray(roster?.Players) ? roster.Players : [];

  return entries
    .map((entry) => {
      const masterPlayer = playerMap.get(String(entry?.PlayerID));
      const derivedGrade = deriveRosterGradeFromGradYear(
        masterPlayer,
        roster?.SeasonID
      );
      const grade = firstMeaningfulValue(
        derivedGrade,
        entry?.Grade,
        entry?.ClassYear,
        masterPlayer?.Grade
      );
      const gradeLabel = firstMeaningfulValue(
        gradeLabelForGrade(derivedGrade),
        entry?.GradeLabel,
        masterPlayer?.GradeLabel,
        gradeLabelForGrade(grade)
      );

      return {
        ...entry,
        ...masterPlayer,
        Grade: grade ?? null,
        GradeLabel: gradeLabel ?? null,
        PlayerName: masterPlayer ? getPlayerName(masterPlayer) : entry?.PlayerName,
      };
    })
    .sort((a, b) => {
      const jerseyA = Number(a.JerseyNumber || 999);
      const jerseyB = Number(b.JerseyNumber || 999);
      if (jerseyA !== jerseyB) return jerseyA - jerseyB;
      return getPlayerName(a).localeCompare(getPlayerName(b));
    });
}

export function soccerGamePath(gameId) {
  return `/athletics/boys/soccer/games/${encodeURIComponent(String(gameId || ""))}`;
}

export function soccerSeasonPath(seasonId) {
  return `/athletics/boys/soccer/seasons/${encodeURIComponent(String(seasonId || ""))}`;
}
