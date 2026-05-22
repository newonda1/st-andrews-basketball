import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import AthleticsProgramShell from "../components/AthleticsProgramShell";
import {
  getSoftballPlayerGameRows,
  getSoftballPlayerTotals,
} from "../girls/softball/softballData";
import { buildVolleyballPlayerSeasonStatRows } from "../girls/volleyball/volleyballData";

const DATA_PATHS = {
  players: "/data/players.json",
  boysBasketballRosters: "/data/boys/basketball/seasonrosters.json",
  boysBasketballGames: "/data/boys/basketball/games.json",
  boysBasketballStats: "/data/boys/basketball/playergamestats.json",
  boysBasketballAdjustments: "/data/boys/basketball/adjustments.json",
  girlsBasketballRosters: "/data/girls/basketball/seasonrosters.json",
  girlsBasketballGames: "/data/girls/basketball/games.json",
  girlsBasketballStats: "/data/girls/basketball/playergamestats.json",
  girlsBasketballAdjustments: "/data/girls/basketball/adjustments.json",
  footballRosters: "/data/boys/football/seasonrosters.json",
  footballGameLogs: "/data/boys/football/playergamelogs.json",
  footballAdjustments: "/data/boys/football/playerseasonadjustments.json",
  boysSoccerRosters: "/data/boys/soccer/seasonrosters.json",
  boysSoccerGames: "/data/boys/soccer/games.json",
  boysSoccerAdjustments: "/data/boys/soccer/seasonstatadjustments.json",
  girlsSoccerRosters: "/data/girls/soccer/seasonrosters.json",
  girlsSoccerGames: "/data/girls/soccer/games.json",
  girlsSoccerAdjustments: "/data/girls/soccer/seasonstatadjustments.json",
  golfRosters: "/data/golf/seasonrosters.json",
  golfMatches: "/data/golf/matches.json",
  crossCountrySeasons: "/data/cross-country/seasons.json",
  crossCountryMeets: "/data/cross-country/meets.json",
  crossCountryStats: "/data/cross-country/playermeetstats.json",
  volleyballRosters: "/data/girls/volleyball/seasonrosters.json",
  volleyballGames: "/data/girls/volleyball/games.json",
  volleyballStats: "/data/girls/volleyball/playerseasonstats.json",
  volleyballGameStats: "/data/girls/volleyball/playergamestats.json",
  volleyballAdjustments: "/data/girls/volleyball/playerseasonadjustments.json",
};

const sportOrder = [
  "boys-basketball",
  "girls-basketball",
  "softball",
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

function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
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

function isRegionGame(game) {
  const type = String(game?.GameType || "").trim().toLowerCase();
  return type === "region";
}

function displayCellValue(value) {
  if (value == null || value === "") return "-";
  return value;
}

function decimalAverage(hits, attempts) {
  const denominator = numberOrZero(attempts);
  if (!denominator) return "-";
  return (numberOrZero(hits) / denominator).toFixed(3).replace(/^0(?=\.)/, "");
}

function formatSoftballResult(game) {
  const score =
    game?.teamScore == null || game?.opponentScore == null
      ? "-"
      : `${game.teamScore}-${game.opponentScore}`;
  const resultLabel =
    game?.result === "W" ? "Win" : game?.result === "L" ? "Loss" : game?.result === "T" ? "Tie" : "";
  return [score, resultLabel].filter(Boolean).join(" ");
}

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not load ${path}`);
  return response.json();
}

async function fetchJsonOptional(path) {
  try {
    return await fetchJson(path);
  } catch {
    return [];
  }
}

function playerSeasonEntry({ season, seasonId, sportLabel, basePath }) {
  return {
    sportLabel,
    season: formatSeasonLabel(season || seasonId),
    seasonId,
    jersey: "",
    grade: "",
    position: "",
    seasonPath: basePath && seasonId ? `${basePath}/seasons/${seasonId}` : "",
  };
}

function addMissingSeasonEntries(entries, seasonIds, sportLabel, basePath) {
  const seen = new Set(entries.map((entry) => String(seasonStartValue(entry.seasonId))));
  const missing = [...seasonIds]
    .filter((seasonId) => hasValue(seasonId) && !seen.has(String(seasonStartValue(seasonId))))
    .map((seasonId) =>
      playerSeasonEntry({
        season: seasonId,
        seasonId,
        sportLabel,
        basePath,
      })
    );

  return [...entries, ...missing].sort(
    (a, b) => seasonSortValue(a.seasonId || a.season) - seasonSortValue(b.seasonId || b.season)
  );
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

function basketballStatSeason(row, gameMap) {
  const directSeason = row?.SeasonID ?? row?.Season;
  if (directSeason != null && directSeason !== "") return String(directSeason);

  const game = gameMap.get(Number(row?.GameID));
  return game?.Season ?? game?.SeasonID ?? "";
}

function buildBasketballSection(
  { key, label, basePath, rosters, games, stats, adjustments },
  playerId
) {
  const baseRosterEntries = findRosterEntries(rosters, playerId, label, basePath);
  const gameMap = new Map((games || []).map((game) => [Number(game.GameID), game]));
  const statRows = (stats || []).filter((row) => samePlayer(row, playerId));
  const adjustmentRows = (adjustments || []).filter((row) => samePlayer(row, playerId));
  const rosterEntries = addMissingSeasonEntries(
    baseRosterEntries,
    new Set([
      ...statRows.map((row) => basketballStatSeason(row, gameMap)).filter(Boolean),
      ...adjustmentRows.map((row) => row.SeasonID ?? row.Season).filter(hasValue),
    ]),
    label,
    basePath
  );
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
      const rows = statRows.filter((row) => String(basketballStatSeason(row, gameMap)) === seasonKey);
      const seasonAdjustments = adjustmentRows.filter(
        (row) => String(row.SeasonID ?? row.Season ?? "") === seasonKey
      );
      const gamesPlayedAdjustment = seasonAdjustments.reduce(
        (total, row) => total + (hasValue(row.GamesPlayed) ? numberOrZero(row.GamesPlayed) : 0),
        0
      );
      return addBasketballRates({
        ...roster,
        games: new Set(rows.map((row) => row.GameID)).size + gamesPlayedAdjustment,
        ...sumRows([...rows, ...seasonAdjustments], totalKeys),
      });
    })
    .filter((row) => row.games || rosterEntries.length);

  if (!rosterEntries.length && !statRows.length && !adjustmentRows.length) return null;

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
          isRegionGame(game)
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

function emptySoftballTotals() {
  return {
    battingGames: 0,
    atBats: 0,
    hits: 0,
    doubles: 0,
    triples: 0,
    homeRuns: 0,
    rbi: 0,
    pitchingAppearances: 0,
    wins: 0,
    losses: 0,
    saves: 0,
  };
}

function addSoftballGameToTotals(total, game) {
  if (game.batting) {
    total.battingGames += 1;
    total.atBats += numberOrZero(game.batting.atBats);
    total.hits += numberOrZero(game.batting.hits);
    total.doubles += numberOrZero(game.batting.doubles);
    total.triples += numberOrZero(game.batting.triples);
    total.homeRuns += numberOrZero(game.batting.homeRuns);
    total.rbi += numberOrZero(game.batting.rbi);
  }

  if (game.pitching) {
    total.pitchingAppearances += numberOrZero(game.pitching.appearances);
    total.wins += numberOrZero(game.pitching.wins);
    total.losses += numberOrZero(game.pitching.losses);
    total.saves += numberOrZero(game.pitching.saves);
  }
}

function buildSoftballSection(playerId) {
  const playerGames = getSoftballPlayerGameRows(playerId);
  if (!playerGames.length) return null;

  const totalsBySeason = new Map();
  playerGames.forEach((game) => {
    const season = String(game.season);
    if (!totalsBySeason.has(season)) totalsBySeason.set(season, emptySoftballTotals());
    addSoftballGameToTotals(totalsBySeason.get(season), game);
  });

  const seasonRows = [...totalsBySeason.entries()]
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([season, totals]) => ({
      season,
      seasonPath: `/athletics/softball/seasons/${season}`,
      ...totals,
      average: decimalAverage(totals.hits, totals.atBats),
    }));

  const careerTotals = {
    season: "Career",
    isTotal: true,
    ...getSoftballPlayerTotals(playerId),
  };
  careerTotals.average = decimalAverage(careerTotals.hits, careerTotals.atBats);

  const battingRows = seasonRows.filter((row) => row.battingGames);
  const pitchingRows = seasonRows.filter((row) => row.pitchingAppearances);
  const battingCareerTotals = careerTotals.battingGames ? careerTotals : null;
  const pitchingCareerTotals = careerTotals.pitchingAppearances ? careerTotals : null;

  const gameRows = playerGames
    .map((game) => ({
      season: String(game.season),
      date: game.displayDate || formatDate(game.date),
      sortDate: game.date || dateFromGameId(game.id),
      opponent: game.opponent || "Unknown",
      gamePath: game.isPlaceholder ? "" : `/athletics/softball/games/${game.id}`,
      result: formatSoftballResult(game),
      atBats: game.batting?.atBats ?? "-",
      hits: game.batting?.hits ?? "-",
      doubles: game.batting?.doubles ?? "-",
      triples: game.batting?.triples ?? "-",
      homeRuns: game.batting?.homeRuns ?? "-",
      rbi: game.batting?.rbi ?? "-",
      average: game.batting ? decimalAverage(game.batting.hits, game.batting.atBats) : "-",
      appearances: game.pitching?.appearances ?? "-",
      wins: game.pitching?.wins ?? "-",
      losses: game.pitching?.losses ?? "-",
      saves: game.pitching?.saves ?? "-",
    }))
    .sort(
      (a, b) =>
        seasonSortValue(a.season) - seasonSortValue(b.season) ||
        String(a.sortDate).localeCompare(String(b.sortDate))
    );

  const battingColumns = [
    { key: "season", label: "Season", align: "left", link: "seasonPath" },
    { key: "battingGames", label: "G" },
    { key: "atBats", label: "AB" },
    { key: "hits", label: "H" },
    { key: "doubles", label: "2B" },
    { key: "triples", label: "3B" },
    { key: "homeRuns", label: "HR" },
    { key: "rbi", label: "RBI" },
    { key: "average", label: "AVG" },
  ];
  const pitchingColumns = [
    { key: "season", label: "Season", align: "left", link: "seasonPath" },
    { key: "pitchingAppearances", label: "APP" },
    { key: "wins", label: "W" },
    { key: "losses", label: "L" },
    { key: "saves", label: "SV" },
  ];
  const gameColumns = [
    { key: "date", label: "Date" },
    { key: "opponent", label: "Opponent", align: "left", link: "gamePath" },
    { key: "result", label: "Result" },
    { key: "atBats", label: "AB" },
    { key: "hits", label: "H" },
    { key: "doubles", label: "2B" },
    { key: "triples", label: "3B" },
    { key: "homeRuns", label: "HR" },
    { key: "rbi", label: "RBI" },
    { key: "average", label: "AVG" },
    { key: "appearances", label: "APP" },
    { key: "wins", label: "W" },
    { key: "losses", label: "L" },
    { key: "saves", label: "SV" },
  ];

  return {
    key: "softball",
    label: "Softball",
    basePath: "/athletics/softball",
    rosterEntries: seasonRows.map((row) => ({
      sportLabel: "Softball",
      season: row.season,
      seasonId: row.season,
      seasonPath: row.seasonPath,
    })),
    tables: [
      ...(battingRows.length && battingCareerTotals
        ? [{ title: "Batting Totals", rows: [...battingRows, battingCareerTotals], columns: battingColumns }]
        : []),
      ...(pitchingRows.length && pitchingCareerTotals
        ? [{ title: "Pitching Totals", rows: [...pitchingRows, pitchingCareerTotals], columns: pitchingColumns }]
        : []),
      {
        title: "Game Logs",
        rows: gameRows,
        columns: gameColumns,
        groupBy: "season",
      },
    ],
  };
}

function gameIsAfterDate(game, dateText) {
  const gameDate = String(game?.Date || dateFromGameId(game?.GameID)).replace(/-/g, "");
  const cutoff = String(dateText || "").replace(/-/g, "");
  return /^\d{8}$/.test(gameDate) && /^\d{8}$/.test(cutoff) && Number(gameDate) > Number(cutoff);
}

function calculateSoccerPlayerStats(games, playerId) {
  const total = {
    goals: 0,
    assists: 0,
    saves: 0,
    gameIds: new Set(),
  };

  (games || []).forEach((game) => {
    let appeared = false;

    (game.GoalScorers || []).filter((row) => samePlayer(row, playerId)).forEach((row) => {
      total.goals += numberOrZero(row.Goals);
      appeared = true;
    });
    (game.Assists || []).filter((row) => samePlayer(row, playerId)).forEach((row) => {
      total.assists += numberOrZero(row.Assists);
      appeared = true;
    });
    (game.Saves || []).filter((row) => samePlayer(row, playerId)).forEach((row) => {
      total.saves += numberOrZero(row.Saves);
      appeared = true;
    });

    if (appeared) total.gameIds.add(game.GameID);
  });

  return total;
}

function buildSoccerSection({ key, label, basePath, rosters, games, adjustments }, playerId) {
  const baseRosterEntries = findRosterEntries(rosters, playerId, label, basePath);
  const adjustmentRows = (adjustments || []).filter((row) => samePlayer(row, playerId));
  const rosterEntries = addMissingSeasonEntries(
    baseRosterEntries,
    new Set(adjustmentRows.map((row) => row.SeasonID ?? row.Season).filter(hasValue)),
    label,
    basePath
  );
  const gameRows = [];
  const adjustmentBySeason = new Map(
    adjustmentRows.map((row) => [String(row.SeasonID ?? row.Season), row])
  );
  const seasonRows = rosterEntries.map((roster) => {
    const seasonGames = (games || []).filter(
      (game) => Number(game.SeasonID ?? game.Season) === Number(roster.seasonId)
    );
    const calculated = calculateSoccerPlayerStats(seasonGames, playerId);
    const adjustment = adjustmentBySeason.get(String(roster.seasonId)) || {};
    const official = adjustment.OfficialTotals || {};
    const postAdjustmentStats = adjustment.ThroughDate
      ? calculateSoccerPlayerStats(
          seasonGames.filter((game) => gameIsAfterDate(game, adjustment.ThroughDate)),
          playerId
        )
      : null;
    const postGamesPlayed = postAdjustmentStats?.gameIds.size || 0;
    const goals = hasValue(official.Goals)
      ? numberOrZero(official.Goals) + numberOrZero(postAdjustmentStats?.goals)
      : calculated.goals + numberOrZero(adjustment.GoalsAdjustment);
    const assists = hasValue(official.Assists)
      ? numberOrZero(official.Assists) + numberOrZero(postAdjustmentStats?.assists)
      : calculated.assists + numberOrZero(adjustment.AssistsAdjustment);
    const saves = hasValue(official.Saves)
      ? numberOrZero(official.Saves) + numberOrZero(postAdjustmentStats?.saves)
      : calculated.saves + numberOrZero(adjustment.SavesAdjustment);
    const gamesPlayed = hasValue(official.GamesPlayed)
      ? numberOrZero(official.GamesPlayed) + postGamesPlayed
      : calculated.gameIds.size + numberOrZero(adjustment.GamesPlayedAdjustment);

    seasonGames.forEach((game) => {
      let appeared = false;
      let gameGoals = 0;
      let gameAssists = 0;
      let gameSaves = 0;
      (game.GoalScorers || []).filter((row) => samePlayer(row, playerId)).forEach((row) => {
        const value = numberOrZero(row.Goals);
        gameGoals += value;
        appeared = true;
      });
      (game.Assists || []).filter((row) => samePlayer(row, playerId)).forEach((row) => {
        const value = numberOrZero(row.Assists);
        gameAssists += value;
        appeared = true;
      });
      (game.Saves || []).filter((row) => samePlayer(row, playerId)).forEach((row) => {
        const value = numberOrZero(row.Saves);
        gameSaves += value;
        appeared = true;
      });
      if (appeared) {
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
      games: gamesPlayed || "-",
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

const FOOTBALL_META_KEYS = new Set([
  "Season",
  "SeasonID",
  "DisplaySeason",
  "SourceSeasonLabel",
  "SeasonLabel",
  "PlayerID",
  "PlayerName",
  "SourcePlayerName",
  "CanonicalUrl",
  "CareerID",
  "CareerKey",
  "Date",
  "GameID",
  "Result",
  "Score",
  "Opponent",
  "OpponentShortName",
  "OpponentUrl",
  "GameUrl",
  "SourceUrl",
  "GameType",
  "LocationType",
  "Venue",
  "Notes",
  "SourceDate",
  "SourcePublication",
  "SourceCitation",
  "SourceNote",
  "SeasonAdjustment",
  "TeamScore",
  "OpponentScore",
]);

function normalizeFootballStatKey(key) {
  if (key === "INTs") return "Ints";
  if (key === "INTYards") return "IntYards";
  return key;
}

function applyFootballSeasonAdjustments(summaryRows, adjustments, playerId) {
  const rowMap = new Map(
    summaryRows.map((row) => [String(row.seasonId ?? row.SeasonID ?? row.season), { ...row }])
  );

  (adjustments || [])
    .filter((row) => samePlayer(row, playerId))
    .forEach((adjustment) => {
      const seasonId = adjustment.SeasonID ?? adjustment.Season;
      if (!hasValue(seasonId)) return;

      const key = String(seasonId);
      const current =
        rowMap.get(key) ||
        playerSeasonEntry({
          season: adjustment.SourceSeasonLabel || adjustment.DisplaySeason || seasonId,
          seasonId,
          sportLabel: "Football",
          basePath: "/athletics/football",
        });

      Object.entries(adjustment || {}).forEach(([statKey, value]) => {
        if (FOOTBALL_META_KEYS.has(statKey)) return;
        if (!Number.isFinite(Number(value))) return;
        current[normalizeFootballStatKey(statKey)] = Number(value);
      });

      if (hasValue(adjustment.GamesTracked ?? adjustment.TrackedGames ?? adjustment.G)) {
        current.games = numberOrZero(adjustment.GamesTracked ?? adjustment.TrackedGames ?? adjustment.G);
      }
      current.season =
        adjustment.SourceSeasonLabel || adjustment.DisplaySeason || current.season || String(seasonId);
      current.seasonId = seasonId;
      rowMap.set(key, current);
    });

  return [...rowMap.values()].sort(
    (a, b) => seasonSortValue(a.seasonId || a.season) - seasonSortValue(b.seasonId || b.season)
  );
}

function buildFootballSection({ rosters, gameLogs, adjustments }, playerId) {
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

  const playerAdjustments = (adjustments || []).filter((row) => samePlayer(row, playerId));

  if (!rosterEntries.length && !rowsBySeason.size && !playerAdjustments.length) return null;

  const summary = rosterEntries.map((roster) => {
    const rows = rowsBySeason.get(String(roster.seasonId)) || [];
    const totals = sumRows(rows, [
      "PassingYards",
      "PassingTD",
      "RushingYards",
      "RushingTDNum",
      "ReceivingYards",
      "ReceivingTDNum",
      "Tackles",
      "Ints",
      "INTs",
      "TotalTDNum",
    ]);
    totals.Ints = numberOrZero(totals.Ints) + numberOrZero(totals.INTs);
    delete totals.INTs;

    return {
      ...roster,
      games: new Set(rows.map((row) => row.GameID)).size || "-",
      ...totals,
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
  const adjustedSummary = applyFootballSeasonAdjustments(summary, playerAdjustments, playerId);
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
    games: adjustedSummary.reduce((total, row) => total + numberOrZero(row.games), 0),
    ...sumRows(adjustedSummary, totalKeys),
  };
  const gameRows = playerLogs.map((row) => ({
    ...row,
    Ints: row.Ints ?? row.INTs,
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
        rows: [...adjustedSummary, careerTotals],
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
            course: match.Course || "-",
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
              { key: "course", label: "Course", align: "left" },
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
        event: row.Event || "-",
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
              { key: "event", label: "Event" },
              { key: "race", label: "Race", align: "left" },
              { key: "mark", label: "Mark" },
              { key: "place", label: "Place" },
            ]
          : [{ key: "season", label: "Season", align: "left", link: "seasonPath" }],
      },
    ],
  };
}

function buildVolleyballSection({ rosters, games, stats, gameStats, adjustments }, playerId) {
  const rosterEntries = findRosterEntries(
    rosters,
    playerId,
    "Volleyball",
    "/athletics/volleyball"
  );
  const gameMap = new Map((games || []).map((game) => [String(game.GameID), game]));
  const playerGameStats = (gameStats || []).filter((row) => samePlayer(row, playerId));
  const rows = buildVolleyballPlayerSeasonStatRows(gameStats, stats, adjustments)
    .filter((row) => samePlayer(row, playerId))
    .map((row) => ({
      season: String(row.Season),
      seasonPath: row.Season ? `/athletics/volleyball/seasons/${row.Season}` : "",
      games: row.Games || row.Matches || "-",
      setsPlayed: row.SetsPlayed || "-",
      kills: row.Kills || "-",
      aces: row.Aces || "-",
      blocks: row.TotalBlocks || "-",
      assists: row.Assists || "-",
      digs: row.Digs || "-",
    }))
    .sort((a, b) => seasonSortValue(a.season) - seasonSortValue(b.season));

  const gameRows = playerGameStats
    .map((row) => {
      const game = gameMap.get(String(row.GameID)) || {};
      const score =
        game.TeamScore == null || game.OpponentScore == null
          ? "-"
          : `${game.TeamScore}-${game.OpponentScore}`;
      const resultLabel =
        game.Result === "W" ? "Win" : game.Result === "L" ? "Loss" : game.Result || "";

      return {
        season: String(row.Season || game.Season || ""),
        date: formatDate(game.Date, dateFromGameId(row.GameID)),
        sortDate: game.Date || dateFromGameId(row.GameID),
        opponent: game.Opponent || "-",
        gamePath: row.GameID ? `/athletics/volleyball/games/${row.GameID}` : "",
        result: [score, resultLabel].filter(Boolean).join(" "),
        setsPlayed: row.SetsPlayed ?? "-",
        kills: row.Kills ?? "-",
        aces: row.Aces ?? "-",
        blocks: row.TotalBlocks ?? "-",
        assists: row.Assists ?? "-",
        digs: row.Digs ?? "-",
      };
    })
    .sort(
      (a, b) =>
        seasonSortValue(a.season) - seasonSortValue(b.season) ||
        String(a.sortDate).localeCompare(String(b.sortDate))
    );

  if (!rosterEntries.length && !rows.length) return null;

  return {
    key: "volleyball",
    label: "Volleyball",
    basePath: "/athletics/volleyball",
    jersey: rosterEntries.find((entry) => entry.jersey)?.jersey,
    rosterEntries,
    tables: [
      {
        title: rows.length ? "Season Totals" : "Seasons",
        rows: rows.length ? rows : rosterEntries,
        columns: rows.length
          ? [
              { key: "season", label: "Season", align: "left", link: "seasonPath" },
              { key: "games", label: "G" },
              { key: "setsPlayed", label: "SP" },
              { key: "kills", label: "Kills" },
              { key: "aces", label: "Aces" },
              { key: "blocks", label: "Blocks" },
              { key: "assists", label: "Ast" },
              { key: "digs", label: "Digs" },
            ]
          : [{ key: "season", label: "Season", align: "left" }],
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
                { key: "setsPlayed", label: "SP" },
                { key: "kills", label: "Kills" },
                { key: "aces", label: "Aces" },
                { key: "blocks", label: "Blocks" },
                { key: "assists", label: "Ast" },
                { key: "digs", label: "Digs" },
              ],
              groupBy: "season",
            },
          ]
        : []),
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
        adjustments: data.boysBasketballAdjustments,
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
        adjustments: data.girlsBasketballAdjustments,
      },
      playerId
    ),
    buildSoftballSection(playerId),
    buildFootballSection(
      {
        rosters: data.footballRosters,
        gameLogs: data.footballGameLogs,
        adjustments: data.footballAdjustments,
      },
      playerId
    ),
    buildSoccerSection(
      {
        key: "boys-soccer",
        label: "Boys Soccer",
        basePath: "/athletics/boys/soccer",
        rosters: data.boysSoccerRosters,
        games: data.boysSoccerGames,
        adjustments: data.boysSoccerAdjustments,
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
        adjustments: data.girlsSoccerAdjustments,
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
      {
        rosters: data.volleyballRosters,
        games: data.volleyballGames,
        stats: data.volleyballStats,
        gameStats: data.volleyballGameStats,
        adjustments: data.volleyballAdjustments,
      },
      playerId
    ),
  ].filter(Boolean);

  return sections.sort(
    (a, b) => sportOrder.indexOf(a.key) - sportOrder.indexOf(b.key)
  );
}

function buildAthletePhotoSources(playerId, sportKey, gender) {
  const sportImageBase = {
    "boys-baseball": "/images/boys/baseball/players",
    "boys-basketball": "/images/boys/basketball/players",
    football: "/images/boys/football/players",
    "girls-basketball": "/images/girls/basketball/players",
  }[sportKey];
  const fallbackBases =
    gender === "Girls"
      ? ["/images/girls/basketball/players"]
      : [
          "/images/boys/basketball/players",
          "/images/boys/football/players",
          "/images/boys/baseball/players",
        ];

  return [
    `/images/athletes/players/${playerId}.png`,
    sportImageBase ? `${sportImageBase}/${playerId}.jpg` : "",
    ...fallbackBases.map((base) => `${base}/${playerId}.jpg`),
  ].filter((value, index, values) => value && values.indexOf(value) === index);
}

function AthletePhoto({ playerId, sportKey, name, gender }) {
  const [imageIndex, setImageIndex] = useState(0);
  const sources = useMemo(
    () => buildAthletePhotoSources(playerId, sportKey, gender),
    [gender, playerId, sportKey]
  );
  const src = sources[imageIndex] || "";
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  useEffect(() => {
    setImageIndex(0);
  }, [sources]);

  const showFallback = imageIndex >= sources.length;

  return (
    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-slate-200 sm:h-24 sm:w-24">
      {!showFallback ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setImageIndex((index) => index + 1)}
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
  const location = useLocation();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("Loading athlete profile...");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const entries = await Promise.all(
          Object.entries(DATA_PATHS).map(async ([key, path]) => [
            key,
            key.toLowerCase().includes("adjustments")
              ? await fetchJsonOptional(path)
              : await fetchJson(path),
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
  const sportHint = useMemo(
    () => new URLSearchParams(location.search).get("sport") || "",
    [location.search]
  );
  const [selectedSport, setSelectedSport] = useState("");

  useEffect(() => {
    if (!sections.length) return;

    const hintedSection = sportHint
      ? sections.find((section) => section.key === sportHint)
      : null;

    if (hintedSection) {
      setSelectedSport(hintedSection.key);
      return;
    }

    if (!sections.some((section) => section.key === selectedSport)) {
      setSelectedSport(sections[0].key);
    }
  }, [sections, sportHint]);

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
                  gender={player?.Gender}
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
