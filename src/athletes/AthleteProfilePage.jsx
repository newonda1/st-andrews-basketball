import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AthleticsProgramShell from "../components/AthleticsProgramShell";

const DATA_PATHS = {
  players: "/data/players.json",
  boysBasketballRosters: "/data/boys/basketball/seasonrosters.json",
  boysBasketballGames: "/data/boys/basketball/games.json",
  boysBasketballStats: "/data/boys/basketball/playergamestats.json",
  girlsBasketballRosters: "/data/girls/basketball/seasonrosters.json",
  girlsBasketballGames: "/data/girls/basketball/games.json",
  girlsBasketballStats: "/data/girls/basketball/playergamestats.json",
  footballRosters: "/data/boys/football/seasonrosters.json",
  footballGameLogs: "/data/boys/football/playergamelogs.json",
  boysSoccerRosters: "/data/boys/soccer/seasonrosters.json",
  boysSoccerGames: "/data/boys/soccer/games.json",
  girlsSoccerRosters: "/data/girls/soccer/seasonrosters.json",
  girlsSoccerGames: "/data/girls/soccer/games.json",
  golfRosters: "/data/golf/seasonrosters.json",
  golfMatches: "/data/golf/matches.json",
  crossCountrySeasons: "/data/cross-country/seasons.json",
  crossCountryMeets: "/data/cross-country/meets.json",
  crossCountryStats: "/data/cross-country/playermeetstats.json",
  volleyballStats: "/data/girls/volleyball/playerseasonstats.json",
  volleyballAdjustments: "/data/girls/volleyball/playerseasonadjustments.json",
};

const sportOrder = [
  "boys-basketball",
  "girls-basketball",
  "football",
  "boys-soccer",
  "girls-soccer",
  "golf",
  "cross-country",
  "volleyball",
];

const tableFrameClassName =
  "overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm";
const tableClassName = "w-max min-w-full border-collapse text-sm";
const thClassName =
  "whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3 py-2 text-center text-xs uppercase tracking-wide text-slate-600";
const tdClassName = "whitespace-nowrap border-b border-slate-200 px-3 py-2 text-center text-slate-700";

function samePlayer(row, playerId) {
  return String(row?.PlayerID || "") === String(playerId);
}

function playerName(player) {
  return (
    player?.PlayerName ||
    [player?.FirstName, player?.LastName].filter(Boolean).join(" ").trim() ||
    "St. Andrew's athlete"
  );
}

function gradeLabel(value) {
  const number = Number(value);
  if (Number.isFinite(number)) {
    if (number === 8) return "8th";
    if (number === 9) return "Fr.";
    if (number === 10) return "So.";
    if (number === 11) return "Jr.";
    if (number === 12) return "Sr.";
  }
  return value || "-";
}

function formatSeasonLabel(value) {
  if (value == null || value === "") return "Season";
  const text = String(value);
  if (/^\d{4}$/.test(text)) return text;
  return text;
}

function dateFromGameId(gameId) {
  const raw = String(gameId || "");
  if (!/^\d{8}/.test(raw)) return "";
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

function formatDate(value, fallback = "") {
  const raw = value || fallback;
  if (!raw) return "-";
  const date =
    typeof raw === "number"
      ? new Date(raw)
      : new Date(`${String(raw).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return String(raw);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function numberOrZero(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function sumRows(rows, keys) {
  return rows.reduce((total, row) => {
    keys.forEach((key) => {
      total[key] = numberOrZero(total[key]) + numberOrZero(row[key]);
    });
    return total;
  }, {});
}

function seasonStartValue(value) {
  const text = String(value || "");
  const match = text.match(/\d{4}/);
  return match ? match[0] : text;
}

function seasonSortValue(value) {
  const match = String(value || "").match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

function percentage(made, attempted) {
  const attempts = numberOrZero(attempted);
  if (!attempts) return "-";
  return ((numberOrZero(made) / attempts) * 100).toFixed(1);
}

function effectiveFieldGoalPct(row) {
  const twoMade = numberOrZero(row.TwoPM);
  const threeMade = numberOrZero(row.ThreePM);
  const attempts = numberOrZero(row.TwoPA) + numberOrZero(row.ThreePA);
  if (!attempts) return "-";
  return (((twoMade + threeMade + 0.5 * threeMade) / attempts) * 100).toFixed(1);
}

function addBasketballRates(row) {
  return {
    ...row,
    ThreePct: percentage(row.ThreePM, row.ThreePA),
    TwoPct: percentage(row.TwoPM, row.TwoPA),
    EFGPct: effectiveFieldGoalPct(row),
    FTPct: percentage(row.FTM, row.FTA),
  };
}

function displayCellValue(value) {
  if (value == null || value === "") return "-";
  return value;
}

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not load ${path}`);
  return response.json();
}

function findRosterEntries(rosters, playerId, sportLabel, basePath) {
  return (rosters || [])
    .flatMap((roster) =>
      (roster.Players || [])
        .filter((entry) => samePlayer(entry, playerId))
        .map((entry) => ({
          sportLabel,
          season: roster.DisplaySeason || roster.SourceSeasonLabel || roster.SeasonLabel || roster.SeasonID,
          seasonId: roster.SeasonID || roster.Season,
          jersey: entry.JerseyNumber,
          grade: gradeLabel(entry.GradeLabel || entry.Grade),
          position: Array.isArray(entry.Positions) ? entry.Positions.join(", ") : entry.Position || "",
          seasonPath: basePath ? `${basePath}/seasons/${roster.SeasonID || roster.Season}` : "",
        }))
    )
    .sort((a, b) => String(a.season).localeCompare(String(b.season)));
}

function buildBasketballSection({ key, label, basePath, rosters, games, stats }, playerId) {
  const rosterEntries = findRosterEntries(rosters, playerId, label, basePath);
  const gameMap = new Map((games || []).map((game) => [Number(game.GameID), game]));
  const statRows = (stats || []).filter((row) => samePlayer(row, playerId));
  const totalKeys = [
    "Points",
    "Rebounds",
    "Assists",
    "Turnovers",
    "Steals",
    "Blocks",
    "ThreePM",
    "ThreePA",
    "TwoPM",
    "TwoPA",
    "FTM",
    "FTA",
  ];
  const seasonRows = rosterEntries
    .map((roster) => {
      const seasonKey = seasonStartValue(roster.seasonId);
      const rows = statRows.filter((row) => {
        const game = gameMap.get(Number(row.GameID));
        return String(game?.Season ?? game?.SeasonID ?? "") === seasonKey;
      });
      return addBasketballRates({
        ...roster,
        games: new Set(rows.map((row) => row.GameID)).size,
        ...sumRows(rows, totalKeys),
      });
    })
    .filter((row) => row.games || rosterEntries.length);

  if (!rosterEntries.length && !statRows.length) return null;

  const careerTotals = addBasketballRates({
    season: "Career",
    isTotal: true,
    games: seasonRows.reduce((total, row) => total + numberOrZero(row.games), 0),
    ...sumRows(seasonRows, totalKeys),
  });

  const gameRows = statRows
    .map((row) => {
      const game = gameMap.get(Number(row.GameID)) || {};
      const season = rosterEntries.find(
        (entry) => seasonStartValue(entry.seasonId) === String(game.Season ?? game.SeasonID ?? "")
      );
      return addBasketballRates({
        ...row,
        season: season?.season || game.DisplaySeason || game.Season || "",
        date: formatDate(game.Date, dateFromGameId(row.GameID)),
        sortDate: game.Date || dateFromGameId(row.GameID),
        opponent: game.Opponent || "-",
        gamePath: `${basePath}/games/${row.GameID}`,
        result: game.Result || "-",
      });
    })
    .sort((a, b) => String(a.sortDate).localeCompare(String(b.sortDate)));

  const regionRows = rosterEntries
    .map((roster) => {
      const seasonKey = seasonStartValue(roster.seasonId);
      const rows = statRows.filter((row) => {
        const game = gameMap.get(Number(row.GameID));
        return (
          String(game?.Season ?? game?.SeasonID ?? "") === seasonKey &&
          String(game?.GameType || "").toLowerCase().includes("region")
        );
      });
      return addBasketballRates({
        ...roster,
        games: new Set(rows.map((row) => row.GameID)).size,
        ...sumRows(rows, totalKeys),
      });
    })
    .filter((row) => row.games);

  const regionCareerTotals = regionRows.length
    ? addBasketballRates({
        season: "Region Career",
        isTotal: true,
        games: regionRows.reduce((total, row) => total + numberOrZero(row.games), 0),
        ...sumRows(regionRows, totalKeys),
      })
    : null;

  const totalColumns = [
    { key: "season", label: "Season", align: "left", link: "seasonPath" },
    { key: "games", label: "GP" },
    { key: "Points", label: "PTS" },
    { key: "Rebounds", label: "REB" },
    { key: "Assists", label: "AST" },
    { key: "Turnovers", label: "TO" },
    { key: "Steals", label: "STL" },
    { key: "Blocks", label: "BLK" },
    { key: "ThreePM", label: "3PM" },
    { key: "ThreePA", label: "3PA" },
    { key: "ThreePct", label: "3P%" },
    { key: "TwoPM", label: "2PM" },
    { key: "TwoPA", label: "2PA" },
    { key: "TwoPct", label: "2P%" },
    { key: "EFGPct", label: "eFG%" },
    { key: "FTM", label: "FTM" },
    { key: "FTA", label: "FTA" },
    { key: "FTPct", label: "FT%" },
  ];
  const logColumns = [
    { key: "date", label: "Date" },
    { key: "opponent", label: "Opponent", align: "left", link: "gamePath" },
    { key: "result", label: "Result" },
    ...totalColumns.filter((column) => column.key !== "season" && column.key !== "games"),
  ];

  return {
    key,
    label,
    basePath,
    jersey: rosterEntries.find((entry) => entry.jersey)?.jersey,
    rosterEntries,
    tables: [
      {
        title: "Career Totals",
        rows: [...seasonRows, careerTotals],
        columns: totalColumns,
      },
      ...(regionRows.length
        ? [
            {
              title: "Region Game Totals",
              rows: [...regionRows, regionCareerTotals],
              columns: totalColumns,
            },
          ]
        : []),
      ...(gameRows.length
        ? [
            {
              title: "Game Logs",
              rows: gameRows,
              columns: logColumns,
              groupBy: "season",
            },
          ]
        : []),
    ],
  };
}

function buildSoccerSection({ key, label, basePath, rosters, games }, playerId) {
  const rosterEntries = findRosterEntries(rosters, playerId, label, basePath);
  const gameRows = [];
  const seasonRows = rosterEntries.map((roster) => {
    const seasonGames = (games || []).filter(
      (game) => Number(game.SeasonID ?? game.Season) === Number(roster.seasonId)
    );
    let goals = 0;
    let assists = 0;
    let saves = 0;
    const gameIds = new Set();

    seasonGames.forEach((game) => {
      let appeared = false;
      let gameGoals = 0;
      let gameAssists = 0;
      let gameSaves = 0;
      (game.GoalScorers || []).filter((row) => samePlayer(row, playerId)).forEach((row) => {
        const value = numberOrZero(row.Goals);
        goals += value;
        gameGoals += value;
        appeared = true;
      });
      (game.Assists || []).filter((row) => samePlayer(row, playerId)).forEach((row) => {
        const value = numberOrZero(row.Assists);
        assists += value;
        gameAssists += value;
        appeared = true;
      });
      (game.Saves || []).filter((row) => samePlayer(row, playerId)).forEach((row) => {
        const value = numberOrZero(row.Saves);
        saves += value;
        gameSaves += value;
        appeared = true;
      });
      if (appeared) {
        gameIds.add(game.GameID);
        gameRows.push({
          season: roster.season,
          date: formatDate(game.Date, dateFromGameId(game.GameID)),
          sortDate: game.Date || dateFromGameId(game.GameID),
          opponent: game.Opponent || "-",
          gamePath: `${basePath}/games/${game.GameID}`,
          result: game.Result || "-",
          goals: gameGoals,
          assists: gameAssists,
          saves: gameSaves,
        });
      }
    });

    return {
      ...roster,
      games: gameIds.size || "-",
      goals,
      assists,
      saves,
    };
  });

  if (!rosterEntries.length) return null;

  const totalRow = {
    season: "Career",
    isTotal: true,
    games: seasonRows.reduce((total, row) => total + numberOrZero(row.games), 0),
    ...sumRows(seasonRows, ["goals", "assists", "saves"]),
  };
  const seasonColumns = [
    { key: "season", label: "Season", align: "left", link: "seasonPath" },
    { key: "games", label: "GP" },
    { key: "goals", label: "G" },
    { key: "assists", label: "A" },
    { key: "saves", label: "Saves" },
  ];

  return {
    key,
    label,
    basePath,
    jersey: rosterEntries.find((entry) => entry.jersey)?.jersey,
    rosterEntries,
    tables: [
      {
        title: "Career Totals",
        rows: [...seasonRows, totalRow],
        columns: seasonColumns,
      },
      ...(gameRows.length
        ? [
            {
              title: "Game Logs",
              rows: gameRows.sort(
                (a, b) =>
                  seasonSortValue(a.season) - seasonSortValue(b.season) ||
                  String(a.sortDate).localeCompare(String(b.sortDate))
              ),
              columns: [
                { key: "date", label: "Date" },
                { key: "opponent", label: "Opponent", align: "left", link: "gamePath" },
                { key: "result", label: "Result" },
                { key: "goals", label: "G" },
                { key: "assists", label: "A" },
                { key: "saves", label: "Saves" },
              ],
              groupBy: "season",
            },
          ]
        : []),
    ],
  };
}

function buildFootballSection({ rosters, gameLogs }, playerId) {
  const rosterEntries = findRosterEntries(rosters, playerId, "Football", "/athletics/football");
  const rowsBySeason = new Map();
  const playerLogs = (gameLogs || [])
    .filter((row) => samePlayer(row, playerId))
    .sort((a, b) => String(a.Date || a.GameID).localeCompare(String(b.Date || b.GameID)));
  playerLogs.forEach((row) => {
    const key = String(row.SeasonID || row.DisplaySeason || "Football");
    if (!rowsBySeason.has(key)) rowsBySeason.set(key, []);
    rowsBySeason.get(key).push(row);
  });

  if (!rosterEntries.length && !rowsBySeason.size) return null;

  const summary = rosterEntries.map((roster) => {
    const rows = rowsBySeason.get(String(roster.seasonId)) || [];
    return {
      ...roster,
      games: new Set(rows.map((row) => row.GameID)).size || "-",
      ...sumRows(rows, [
        "PassingYards",
        "PassingTD",
        "RushingYards",
        "RushingTDNum",
        "ReceivingYards",
        "ReceivingTDNum",
        "Tackles",
        "Ints",
        "TotalTDNum",
      ]),
    };
  });

  const totalKeys = [
    "PassingYards",
    "PassingTD",
    "RushingYards",
    "RushingTDNum",
    "ReceivingYards",
    "ReceivingTDNum",
    "Tackles",
    "Ints",
    "TotalTDNum",
  ];
  const seasonColumns = [
    { key: "season", label: "Season", align: "left", link: "seasonPath" },
    { key: "games", label: "G" },
    { key: "PassingYards", label: "Pass Yds" },
    { key: "PassingTD", label: "Pass TD" },
    { key: "RushingYards", label: "Rush Yds" },
    { key: "RushingTDNum", label: "Rush TD" },
    { key: "ReceivingYards", label: "Rec Yds" },
    { key: "ReceivingTDNum", label: "Rec TD" },
    { key: "Tackles", label: "Tck" },
    { key: "Ints", label: "Int" },
  ];
  const careerTotals = {
    season: "Career",
    isTotal: true,
    games: summary.reduce((total, row) => total + numberOrZero(row.games), 0),
    ...sumRows(summary, totalKeys),
  };
  const gameRows = playerLogs.map((row) => ({
    ...row,
    season: row.SourceSeasonLabel || row.DisplaySeason || row.SeasonID,
    date: formatDate(row.Date, dateFromGameId(row.GameID)),
    opponent: row.Opponent || "-",
    gamePath: `/athletics/football/games/${row.GameID}`,
    result: row.Result || "-",
  }));

  return {
    key: "football",
    label: "Football",
    basePath: "/athletics/football",
    jersey: rosterEntries.find((entry) => entry.jersey)?.jersey,
    rosterEntries,
    tables: [
      {
        title: "Career Totals",
        rows: [...summary, careerTotals],
        columns: seasonColumns,
      },
      ...(gameRows.length
        ? [
            {
              title: "Game Logs",
              rows: gameRows,
              columns: [
                { key: "date", label: "Date" },
                { key: "opponent", label: "Opponent", align: "left", link: "gamePath" },
                { key: "result", label: "Result" },
                ...seasonColumns.filter((column) => column.key !== "season" && column.key !== "games"),
              ],
              groupBy: "season",
            },
          ]
        : []),
    ],
  };
}

function buildGolfSection({ rosters, matches }, playerId) {
  const rosterEntries = findRosterEntries(rosters, playerId, "Golf", "/athletics/golf");
  const results = (matches || [])
    .flatMap((match) =>
      (match.Divisions || []).flatMap((division) =>
        (division.Results || [])
          .filter((row) => samePlayer(row, playerId))
          .map((row) => ({
            date: formatDate(match.Date),
            match: match.Name,
            matchPath: `/athletics/golf/matches/${match.MatchID}`,
            division: division.Division,
            place: row.Place || "-",
            rounds: Array.isArray(row.RoundScores) && row.RoundScores.length ? row.RoundScores.join("-") : "-",
            score: row.Score || "-",
          }))
      )
    );

  if (!rosterEntries.length && !results.length) return null;

  return {
    key: "golf",
    label: "Golf",
    basePath: "/athletics/golf",
    rosterEntries,
    tables: [
      {
        title: results.length ? "Match Results" : "Seasons",
        rows: results.length ? results : rosterEntries,
        columns: results.length
          ? [
              { key: "date", label: "Date" },
              { key: "match", label: "Match", align: "left", link: "matchPath" },
              { key: "division", label: "Division" },
              { key: "place", label: "Place" },
              { key: "rounds", label: "Rounds" },
              { key: "score", label: "Score" },
            ]
          : [{ key: "season", label: "Season", align: "left", link: "seasonPath" }],
      },
    ],
  };
}

function buildCrossCountrySection({ seasons, meets, stats }, playerId) {
  const rosterEntries = (seasons || [])
    .flatMap((season) =>
      (season.Roster || [])
        .filter((entry) => samePlayer(entry, playerId))
        .map((entry) => ({
          season: season.SeasonLabel || `${Number(season.SeasonID) - 1}-${String(season.SeasonID).slice(-2)}`,
          seasonId: season.SeasonID,
          grade: gradeLabel(entry.Grade),
          seasonPath: `/athletics/cross-country/seasons/${season.SeasonID}`,
        }))
    );
  const meetMap = new Map((meets || []).map((meet) => [Number(meet.MeetID), meet]));
  const results = (stats || [])
    .filter((row) => samePlayer(row, playerId))
    .map((row) => {
      const meet = meetMap.get(Number(row.MeetID)) || {};
      return {
        date: formatDate(meet.Date),
        meet: meet.Name || "Meet",
        meetPath: `/athletics/cross-country/seasons/${meet.Season}`,
        race: row.Race || row.Event || "-",
        mark: row.Mark || "-",
        place: row.Place || "-",
      };
    });

  if (!rosterEntries.length && !results.length) return null;

  return {
    key: "cross-country",
    label: "Cross Country",
    basePath: "/athletics/cross-country",
    rosterEntries,
    tables: [
      {
        title: results.length ? "Meet Results" : "Seasons",
        rows: results.length ? results : rosterEntries,
        columns: results.length
          ? [
              { key: "date", label: "Date" },
              { key: "meet", label: "Meet", align: "left", link: "meetPath" },
              { key: "race", label: "Race", align: "left" },
              { key: "mark", label: "Mark" },
              { key: "place", label: "Place" },
            ]
          : [{ key: "season", label: "Season", align: "left", link: "seasonPath" }],
      },
    ],
  };
}

function buildVolleyballSection({ stats, adjustments }, playerId) {
  const rows = [...(stats || []), ...(adjustments || [])]
    .filter((row) => samePlayer(row, playerId))
    .map((row) => ({
      season: row.Season,
      seasonPath: `/athletics/volleyball/seasons/${row.Season}`,
      games: row.Games || row.Matches || "-",
      kills: row.Kills || "-",
      aces: row.Aces || "-",
      blocks: row.TotalBlocks || "-",
      assists: row.Assists || "-",
      digs: row.Digs || "-",
    }));

  if (!rows.length) return null;

  return {
    key: "volleyball",
    label: "Volleyball",
    basePath: "/athletics/volleyball",
    rosterEntries: [],
    tables: [
      {
        title: "Season Totals",
        rows,
        columns: [
          { key: "season", label: "Season", align: "left", link: "seasonPath" },
          { key: "games", label: "G" },
          { key: "kills", label: "Kills" },
          { key: "aces", label: "Aces" },
          { key: "blocks", label: "Blocks" },
          { key: "assists", label: "Ast" },
          { key: "digs", label: "Digs" },
        ],
      },
    ],
  };
}

function buildSections(data, playerId) {
  const sections = [
    buildBasketballSection(
      {
        key: "boys-basketball",
        label: "Boys Basketball",
        basePath: "/athletics/boys/basketball",
        rosters: data.boysBasketballRosters,
        games: data.boysBasketballGames,
        stats: data.boysBasketballStats,
      },
      playerId
    ),
    buildBasketballSection(
      {
        key: "girls-basketball",
        label: "Girls Basketball",
        basePath: "/athletics/girls/basketball",
        rosters: data.girlsBasketballRosters,
        games: data.girlsBasketballGames,
        stats: data.girlsBasketballStats,
      },
      playerId
    ),
    buildFootballSection(
      { rosters: data.footballRosters, gameLogs: data.footballGameLogs },
      playerId
    ),
    buildSoccerSection(
      {
        key: "boys-soccer",
        label: "Boys Soccer",
        basePath: "/athletics/boys/soccer",
        rosters: data.boysSoccerRosters,
        games: data.boysSoccerGames,
      },
      playerId
    ),
    buildSoccerSection(
      {
        key: "girls-soccer",
        label: "Girls Soccer",
        basePath: "/athletics/girls/soccer",
        rosters: data.girlsSoccerRosters,
        games: data.girlsSoccerGames,
      },
      playerId
    ),
    buildGolfSection(
      { rosters: data.golfRosters, matches: data.golfMatches },
      playerId
    ),
    buildCrossCountrySection(
      {
        seasons: data.crossCountrySeasons,
        meets: data.crossCountryMeets,
        stats: data.crossCountryStats,
      },
      playerId
    ),
    buildVolleyballSection(
      { stats: data.volleyballStats, adjustments: data.volleyballAdjustments },
      playerId
    ),
  ].filter(Boolean);

  return sections.sort(
    (a, b) => sportOrder.indexOf(a.key) - sportOrder.indexOf(b.key)
  );
}

function AthletePhoto({ playerId, sportKey, name }) {
  const [failed, setFailed] = useState(false);
  const imageBase =
    sportKey === "girls-basketball"
      ? "/images/girls/basketball/players"
      : sportKey === "football"
        ? "/images/boys/football/players"
        : "/images/boys/basketball/players";
  const src = `${imageBase}/${playerId}.jpg`;
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-slate-200 sm:h-24 sm:w-24">
      {!failed ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-slate-900 text-2xl text-white">
          {initials}
        </div>
      )}
    </div>
  );
}

function DataTable({ columns, rows }) {
  const visibleColumns = columns;

  return (
    <div className={tableFrameClassName}>
      <table className={tableClassName}>
        <thead>
          <tr>
            {visibleColumns.map((column) => (
              <th
                key={column.key}
                className={`${thClassName} ${column.align === "left" ? "text-left" : ""}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${row.season || row.date || "row"}-${index}`}
              className={row.isTotal ? "bg-slate-100" : index % 2 ? "bg-slate-50/70" : "bg-white"}
            >
              {visibleColumns.map((column) => {
                const value = displayCellValue(row[column.key]);
                const path = column.link ? row[column.link] : "";
                return (
                  <td
                    key={column.key}
                    className={`${tdClassName} ${column.align === "left" ? "text-left text-slate-900" : ""}`}
                  >
                    {path ? (
                      <Link to={path} className="text-blue-700 hover:text-blue-900">
                        {value}
                      </Link>
                    ) : (
                      value
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SportTableSection({ table }) {
  if (!table?.rows?.length) return null;

  if (table.groupBy) {
    const groups = table.rows.reduce((items, row) => {
      const label = row[table.groupBy] || "Season";
      const existing = items.find((item) => item.label === label);
      if (existing) existing.rows.push(row);
      else items.push({ label, rows: [row] });
      return items;
    }, []);

    return (
      <section className="space-y-4">
        <h3 className="text-2xl text-slate-700">{table.title}</h3>
        {groups.map((group) => (
          <div key={group.label} className="space-y-2">
            <h4 className="text-lg text-slate-700">
              {formatSeasonLabel(group.label)}
            </h4>
            <DataTable columns={table.columns} rows={group.rows} />
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h3 className="text-2xl text-slate-700">{table.title}</h3>
      <DataTable columns={table.columns} rows={table.rows} />
    </section>
  );
}

export default function AthleteProfilePage() {
  const { playerId } = useParams();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("Loading athlete profile...");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const entries = await Promise.all(
          Object.entries(DATA_PATHS).map(async ([key, path]) => [
            key,
            await fetchJson(path),
          ])
        );
        if (!cancelled) {
          setData(Object.fromEntries(entries));
          setStatus("");
        }
      } catch (error) {
        if (!cancelled) setStatus(error?.message || "Failed to load athlete profile.");
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const player = useMemo(() => {
    return (data?.players || []).find((entry) => samePlayer(entry, playerId)) || null;
  }, [data, playerId]);

  const sections = useMemo(
    () => (data ? buildSections(data, playerId) : []),
    [data, playerId]
  );
  const [selectedSport, setSelectedSport] = useState("");

  useEffect(() => {
    if (sections.length && !sections.some((section) => section.key === selectedSport)) {
      setSelectedSport(sections[0].key);
    }
  }, [sections, selectedSport]);

  const activeSection =
    sections.find((section) => section.key === selectedSport) || sections[0] || null;
  const displayName = playerName(player);
  const classLabel = player?.GradYear ? `Class of ${player.GradYear}` : "";

  return (
    <AthleticsProgramShell
      title="Athlete Profile"
      menuTitle="Athlete Profile"
      athleticsHomePath="/athletics"
      headerHomePath="/athletics"
      homeLabel="Athletics"
    >
      <div className="mx-auto max-w-6xl space-y-8 px-4 pb-24 pt-8 sm:px-6">
        {status ? (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm text-slate-600 shadow-sm">
            {status}
          </div>
        ) : null}

        {!status && !player && !sections.length ? (
          <section className="rounded-lg border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
            <h1 className="text-2xl text-slate-900">Athlete Not Found</h1>
            <p className="mt-3 text-sm text-slate-600">
              This athlete is not available in the archive yet.
            </p>
          </section>
        ) : null}

        {player || sections.length ? (
          <>
            <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <AthletePhoto
                  playerId={playerId}
                  sportKey={activeSection?.key}
                  name={displayName}
                />
                <div>
                  <h1 className="text-3xl tracking-normal text-slate-700 sm:text-4xl">
                    {displayName}
                  </h1>
                  {classLabel ? (
                    <p className="mt-2 text-base text-slate-600 sm:text-lg">
                      {classLabel}
                    </p>
                  ) : null}
                </div>
              </div>

              {sections.length > 1 ? (
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {sections.map((section) => (
                    <button
                      key={section.key}
                      type="button"
                      onClick={() => setSelectedSport(section.key)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        activeSection?.key === section.key
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-slate-900"
                      }`}
                    >
                      {section.label}
                      {section.jersey ? ` #${section.jersey}` : ""}
                    </button>
                  ))}
                </div>
              ) : null}
            </header>

            {activeSection ? (
              <section>
                <div className="space-y-8">
                  {(activeSection.tables || [
                    { title: "Career Summary", columns: activeSection.columns, rows: activeSection.summary },
                  ]).map((table) => (
                    <SportTableSection key={table.title} table={table} />
                  ))}
                </div>
              </section>
            ) : (
              <section className="rounded-lg border border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-600 shadow-sm">
                No sport participation is available for this athlete yet.
              </section>
            )}
          </>
        ) : null}
      </div>
    </AthleticsProgramShell>
  );
}
