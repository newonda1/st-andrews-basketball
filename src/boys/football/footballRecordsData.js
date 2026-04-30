import { useEffect, useState } from "react";

import {
  formatRecord,
  formatSeasonLabel,
  loadFootballRecordsData,
  toNumber,
} from "./footballData";

const META_KEYS = new Set([
  "SeasonID",
  "DisplaySeason",
  "SourceSeasonLabel",
  "PlayerID",
  "PlayerName",
  "CanonicalUrl",
  "CareerID",
  "CareerKey",
  "Date",
  "GameID",
  "Stamp",
  "Result",
  "Score",
  "OpponentShortName",
  "Opponent",
  "OpponentUrl",
  "GameUrl",
  "SourceUrl",
  "SeasonLabel",
  "GameType",
  "LocationType",
  "Venue",
  "Notes",
  "GameResultText",
  "TeamScore",
  "OpponentScore",
  "TrackedGames",
  "GamesTracked",
  "SeasonsTracked",
  "TrackedStatGames",
  "OverallWins",
  "OverallLosses",
  "OverallTies",
  "PointsFor",
  "PointsAgainst",
  "HeadCoach",
  "League",
  "Division",
  "OverallRecord",
  "RegionRecord",
  "ConferencePlacement",
]);

let preparedFootballRecordsPromise = null;

const STAT_ALIASES = {
  Ints: "INTs",
  IntYards: "INTYards",
  PatKickingAtt: "PATKickingAtt",
  PatKickingMade: "PATKickingMade",
  PatKickingPercentage: "PATKickingPercentage",
  PatReceivingNum: "PATReceivingNum",
  PatRushingNum: "PATRushingNum",
};

function gameIdFromDate(dateText) {
  const text = String(dateText || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? Number(text.replace(/-/g, "")) || 0 : 0;
}

function careerIdFromCanonicalUrl(canonicalUrl) {
  const match = String(canonicalUrl || "").match(/[?&]careerid=([^&#]+)/i);
  return match ? decodeURIComponent(match[1]) : "";
}

function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

function statOrNull(row, key) {
  const actualKey = STAT_ALIASES[key] || key;
  const value = Number(row?.[actualKey]);
  return Number.isFinite(value) ? value : null;
}

export function stat(row, key) {
  const value = statOrNull(row, key);
  return value === null ? 0 : value;
}

function hasAnyStat(row, keys) {
  return keys.some((key) => statOrNull(row, key) !== null);
}

function sumAvailable(row, keys) {
  let sum = 0;
  let found = false;

  keys.forEach((key) => {
    const value = statOrNull(row, key);
    if (value === null) return;
    sum += value;
    found = true;
  });

  return found ? sum : null;
}

function ratioOrNull(numerator, denominator) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return null;
  }

  return numerator / denominator;
}

function totalGamesFromRecord(row) {
  return stat(row, "OverallWins") + stat(row, "OverallLosses") + stat(row, "OverallTies");
}

function seasonLabelForRow(row, seasonMap) {
  const season = seasonMap.get(Number(row?.SeasonID));
  if (season) return formatSeasonLabel(season);
  if (row?.SourceSeasonLabel) return String(row.SourceSeasonLabel);
  return formatSeasonLabel(row);
}

function formatGameResultText(gameLike) {
  const teamScore = toNumber(gameLike?.TeamScore);
  const opponentScore = toNumber(gameLike?.OpponentScore);

  if (teamScore !== null && opponentScore !== null) {
    let outcome = "Tie";
    if (teamScore > opponentScore) outcome = "Win";
    else if (teamScore < opponentScore) outcome = "Loss";
    return `${teamScore}-${opponentScore} ${outcome}`;
  }

  const score = String(gameLike?.Score || "").trim();
  const result = String(gameLike?.Result || "").trim().toUpperCase();

  if (!score) return "—";
  if (result === "W") return `${score} Win`;
  if (result === "L") return `${score} Loss`;
  if (result === "T") return `${score} Tie`;
  return score;
}

function normalizePlayerGameRow(rawRow, playersById, seasonMap, gamesById) {
  const playerId = String(rawRow?.PlayerID || "");
  const player = playersById.get(playerId) || {};
  const careerId =
    String(rawRow?.CareerID || "") ||
    careerIdFromCanonicalUrl(rawRow?.CanonicalUrl) ||
    careerIdFromCanonicalUrl(player?.CanonicalUrl);
  const careerKey = careerId || `player:${playerId}`;
  const playerName =
    String(rawRow?.PlayerName || "").trim() ||
    String(player?.PlayerName || "").trim() ||
    `${String(player?.FirstName || "").trim()} ${String(player?.LastName || "").trim()}`.trim() ||
    "Unknown";
  const seasonId = Number(rawRow?.SeasonID) || null;
  const dateText = String(rawRow?.Date || "").trim();
  const gameId = Number(rawRow?.GameID) || gameIdFromDate(dateText);
  const matchedGame = gamesById.get(gameId) || null;
  const numericStats = {};

  Object.entries(rawRow || {}).forEach(([key, value]) => {
    if (META_KEYS.has(key)) return;
    if (!isFiniteNumber(value)) return;
    numericStats[key] = Number(value);
  });

  return {
    ...numericStats,
    SeasonID: seasonId,
    SeasonLabel: seasonLabelForRow(rawRow, seasonMap),
    DisplaySeason: String(rawRow?.DisplaySeason || seasonId || ""),
    SourceSeasonLabel: String(rawRow?.SourceSeasonLabel || ""),
    PlayerID: playerId,
    PlayerName: playerName,
    CanonicalUrl: String(rawRow?.CanonicalUrl || player?.CanonicalUrl || ""),
    CareerID: careerId,
    CareerKey: careerKey,
    Date: matchedGame?.Date || dateText,
    GameID: matchedGame?.GameID || gameId,
    Opponent: String(rawRow?.Opponent || matchedGame?.Opponent || "").trim(),
    OpponentUrl: String(rawRow?.OpponentUrl || matchedGame?.OpponentUrl || "").trim(),
    GameUrl: String(rawRow?.GameUrl || matchedGame?.GameUrl || "").trim(),
    GameType: String(rawRow?.GameType || matchedGame?.GameType || "").trim(),
    LocationType: String(rawRow?.LocationType || matchedGame?.LocationType || "").trim(),
    Venue: String(rawRow?.Venue || matchedGame?.Venue || "").trim(),
    Notes: String(rawRow?.Notes || matchedGame?.Notes || "").trim(),
    Result: String(rawRow?.Result || matchedGame?.Result || "").trim(),
    Score: String(rawRow?.Score || "").trim(),
    TeamScore: toNumber(matchedGame?.TeamScore),
    OpponentScore: toNumber(matchedGame?.OpponentScore),
    GameResultText: formatGameResultText(matchedGame || rawRow),
  };
}

function mergeStatValues(target, source) {
  Object.entries(source || {}).forEach(([key, value]) => {
    if (META_KEYS.has(key)) return;
    if (!isFiniteNumber(value)) return;
    target[key] = (target[key] || 0) + Number(value);
  });
}

function applyMilestones(target, row) {
  if (stat(row, "PassingYards") >= 200) target.Passing200Games += 1;
  if (stat(row, "RushingYards") >= 100) target.Rushing100Games += 1;
  if (stat(row, "ReceivingYards") >= 100) target.Receiving100Games += 1;
  if (stat(row, "Ints") >= 2) target.TwoInterceptionGames += 1;
  if (stat(row, "TotalTackles") >= 10) target.TenTackleGames += 1;
  if (stat(row, "Sacks") >= 2) target.TwoSackGames += 1;
}

function createAggregateBase(meta = {}) {
  return {
    ...meta,
    GamesTracked: 0,
    Passing200Games: 0,
    Rushing100Games: 0,
    Receiving100Games: 0,
    TwoInterceptionGames: 0,
    TenTackleGames: 0,
    TwoSackGames: 0,
  };
}

function aggregatePlayerSeasons(playerGameRows) {
  const seasonMap = new Map();

  playerGameRows.forEach((row) => {
    const seasonId = Number(row?.SeasonID);
    if (!seasonId) return;

    const key = `${row.CareerKey}::${seasonId}`;

    if (!seasonMap.has(key)) {
      seasonMap.set(
        key,
        createAggregateBase({
          CareerKey: row.CareerKey,
          CareerID: row.CareerID,
          PlayerID: row.PlayerID,
          PlayerName: row.PlayerName,
          CanonicalUrl: row.CanonicalUrl,
          SeasonID: seasonId,
          SeasonLabel: row.SeasonLabel,
        })
      );
    }

    const total = seasonMap.get(key);
    total.GamesTracked += 1;
    mergeStatValues(total, row);
    applyMilestones(total, row);
  });

  return Array.from(seasonMap.values()).sort((a, b) => {
    if (Number(a.SeasonID) !== Number(b.SeasonID)) {
      return Number(a.SeasonID) - Number(b.SeasonID);
    }
    return String(a.PlayerName || "").localeCompare(String(b.PlayerName || ""));
  });
}

function aggregatePlayerCareers(playerGameRows) {
  const careerMap = new Map();

  playerGameRows.forEach((row) => {
    const key = row.CareerKey;
    if (!careerMap.has(key)) {
      careerMap.set(
        key,
        createAggregateBase({
          CareerKey: row.CareerKey,
          CareerID: row.CareerID,
          PlayerID: row.PlayerID,
          PlayerName: row.PlayerName,
          CanonicalUrl: row.CanonicalUrl,
          SeasonsTracked: 0,
        })
      );
      careerMap.get(key)._seasonIds = new Set();
    }

    const total = careerMap.get(key);
    total.GamesTracked += 1;
    total._seasonIds.add(row.SeasonID);
    mergeStatValues(total, row);
    applyMilestones(total, row);
  });

  return Array.from(careerMap.values())
    .map((row) => ({
      ...row,
      SeasonsTracked: row._seasonIds.size,
    }))
    .sort((a, b) => String(a.PlayerName || "").localeCompare(String(b.PlayerName || "")));
}

function aggregateTeamGames(games, playerGameRows, seasonMap) {
  const gameMap = new Map();

  (games || []).forEach((game) => {
    const gameId = Number(game?.GameID);
    if (!gameId) return;

    gameMap.set(gameId, {
      GameID: gameId,
      SeasonID: Number(game?.SeasonID || game?.Season) || null,
      SeasonLabel: seasonLabelForRow(game, seasonMap),
      Date: String(game?.Date || ""),
      Opponent: String(game?.Opponent || ""),
      OpponentUrl: String(game?.OpponentUrl || ""),
      GameUrl: String(game?.GameUrl || ""),
      GameType: String(game?.GameType || ""),
      LocationType: String(game?.LocationType || ""),
      Venue: String(game?.Venue || ""),
      Notes: String(game?.Notes || ""),
      Result: String(game?.Result || ""),
      TeamScore: toNumber(game?.TeamScore),
      OpponentScore: toNumber(game?.OpponentScore),
      GameResultText: formatGameResultText(game),
      TrackedStatGames: 0,
    });
  });

  playerGameRows.forEach((row) => {
    const key = Number(row?.GameID);
    if (!key) return;

    if (!gameMap.has(key)) {
      gameMap.set(key, {
        GameID: key,
        SeasonID: Number(row?.SeasonID) || null,
        SeasonLabel: String(row?.SeasonLabel || ""),
        Date: String(row?.Date || ""),
        Opponent: String(row?.Opponent || ""),
        OpponentUrl: String(row?.OpponentUrl || ""),
        GameUrl: String(row?.GameUrl || ""),
        GameType: String(row?.GameType || ""),
        LocationType: String(row?.LocationType || ""),
        Venue: String(row?.Venue || ""),
        Notes: String(row?.Notes || ""),
        Result: String(row?.Result || ""),
        TeamScore: null,
        OpponentScore: null,
        GameResultText: formatGameResultText(row),
        TrackedStatGames: 0,
      });
    }

    const total = gameMap.get(key);
    total.TrackedStatGames = 1;
    mergeStatValues(total, row);
  });

  return Array.from(gameMap.values()).sort((a, b) => Number(a.GameID) - Number(b.GameID));
}

function aggregateTeamSeasons(seasons, teamGames, seasonMap) {
  const totalsMap = new Map();

  (seasons || []).forEach((season) => {
    const seasonId = Number(season?.SeasonID);
    if (!seasonId) return;

    totalsMap.set(seasonId, {
      SeasonID: seasonId,
      SeasonLabel: seasonLabelForRow(season, seasonMap),
      OverallWins: stat(season, "OverallWins"),
      OverallLosses: stat(season, "OverallLosses"),
      OverallTies: stat(season, "OverallTies"),
      PointsFor: stat(season, "PointsFor"),
      PointsAgainst: stat(season, "PointsAgainst"),
      HeadCoach: String(season?.HeadCoach || ""),
      League: String(season?.League || ""),
      Division: String(season?.Division || ""),
      OverallRecord: String(season?.OverallRecord || ""),
      RegionRecord: String(season?.RegionRecord || ""),
      TrackedGames: 0,
    });
  });

  (teamGames || []).forEach((game) => {
    const seasonId = Number(game?.SeasonID);
    if (!seasonId || !totalsMap.has(seasonId)) return;

    const total = totalsMap.get(seasonId);

    if (game?.TrackedStatGames) {
      total.TrackedGames += 1;
      mergeStatValues(total, game);
    }
  });

  return Array.from(totalsMap.values()).sort((a, b) => Number(a.SeasonID) - Number(b.SeasonID));
}

async function loadRawFootballRecordsData() {
  return loadFootballRecordsData();
}

function prepareFootballRecordsData(raw) {
  const seasonMap = new Map(
    (raw.seasons || []).map((season) => [Number(season?.SeasonID), season])
  );
  const playersById = new Map(
    (raw.players || []).map((player) => [String(player?.PlayerID || ""), player])
  );
  const gamesById = new Map(
    (raw.games || []).map((game) => [Number(game?.GameID), game])
  );

  const playerGameRows = (raw.playerGameLogs || [])
    .map((row) => normalizePlayerGameRow(row, playersById, seasonMap, gamesById))
    .filter((row) => row.PlayerID && row.GameID)
    .sort((a, b) => {
      if (Number(a.SeasonID) !== Number(b.SeasonID)) {
        return Number(a.SeasonID) - Number(b.SeasonID);
      }
      if (Number(a.GameID) !== Number(b.GameID)) {
        return Number(a.GameID) - Number(b.GameID);
      }
      return String(a.PlayerName || "").localeCompare(String(b.PlayerName || ""));
    });

  const playerSeasons = aggregatePlayerSeasons(playerGameRows);
  const playerCareers = aggregatePlayerCareers(playerGameRows);
  const teamGames = aggregateTeamGames(raw.games, playerGameRows, seasonMap);
  const teamSeasons = aggregateTeamSeasons(raw.seasons, teamGames, seasonMap);

  return {
    games: raw.games || [],
    seasons: raw.seasons || [],
    players: raw.players || [],
    rosters: raw.rosters || [],
    playerGameRows,
    playerSeasons,
    playerCareers,
    teamGames,
    teamSeasons,
  };
}

export async function loadPreparedFootballRecordsData() {
  if (!preparedFootballRecordsPromise) {
    preparedFootballRecordsPromise = loadRawFootballRecordsData().then(prepareFootballRecordsData);
  }

  return preparedFootballRecordsPromise;
}

export function usePreparedFootballRecordsData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    loadPreparedFootballRecordsData()
      .then((value) => {
        if (!cancelled) {
          setData(value);
          setError("");
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setData(null);
          setError(loadError?.message || "Failed to load football records.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, error };
}

export function compareLeaderboardRows(a, b, sortDirection = "desc") {
  if (a.sortValue !== b.sortValue) {
    return sortDirection === "asc" ? a.sortValue - b.sortValue : b.sortValue - a.sortValue;
  }

  return String(b.sortKey || "").localeCompare(String(a.sortKey || ""));
}

export function buildLeaderboardMap(items, sectionDefs, mapRow) {
  const leaderboards = {};

  sectionDefs.flatMap((section) => section.records).forEach((def) => {
    const qualifyFn = def.qualifyFn || (() => true);
    const sortDirection = def.sortDirection || "desc";
    const list = (items || [])
      .filter((item) => qualifyFn(item))
      .map((item) => {
        const rawValue = def.valueFn(item);
        const hasNumericValue =
          rawValue !== null && rawValue !== undefined && Number.isFinite(Number(rawValue));
        const sortValue = hasNumericValue ? Number(rawValue) : Number.NaN;
        const mapped = mapRow(item, def, sortValue);
        return {
          ...mapped,
          hasNumericValue,
          sortValue,
          displayValue: Number.isFinite(sortValue) ? def.displayFn(sortValue) : "—",
        };
      })
      .filter(
        (row) =>
          row.hasNumericValue &&
          (def.includeZero ? row.sortValue >= 0 : row.sortValue > 0)
      )
      .sort((a, b) => compareLeaderboardRows(a, b, sortDirection))
      .slice(0, 20);

    while (list.length < 20) {
      list.push({
        sortValue: Number.NaN,
        displayValue: "—",
        _placeholder: true,
      });
    }

    leaderboards[def.key] = list;
  });

  return leaderboards;
}

export function trackedGames(row) {
  return stat(row, "GamesTracked") || stat(row, "TrackedGames");
}

export function gamesPlayed(row) {
  return totalGamesFromRecord(row);
}

export function teamWinPct(row) {
  return ratioOrNull(stat(row, "OverallWins"), totalGamesFromRecord(row));
}

export function teamPointsPerGame(row) {
  return ratioOrNull(stat(row, "PointsFor"), totalGamesFromRecord(row));
}

export function opponentPointsPerGame(row) {
  return ratioOrNull(stat(row, "PointsAgainst"), totalGamesFromRecord(row));
}

export function scoringMarginPerGame(row) {
  const games = totalGamesFromRecord(row);
  return games > 0 ? (stat(row, "PointsFor") - stat(row, "PointsAgainst")) / games : null;
}

export function gameScoringMargin(row) {
  const teamScore = toNumber(row?.TeamScore);
  const opponentScore = toNumber(row?.OpponentScore);
  if (teamScore === null || opponentScore === null) return null;
  return teamScore - opponentScore;
}

export function combinedPoints(row) {
  const teamScore = toNumber(row?.TeamScore);
  const opponentScore = toNumber(row?.OpponentScore);
  if (teamScore === null || opponentScore === null) return null;
  return teamScore + opponentScore;
}

export function completionPct(row) {
  const completions = statOrNull(row, "PassingComp");
  const attempts = statOrNull(row, "PassingAtt");
  if (completions !== null && attempts !== null) {
    return ratioOrNull(completions, attempts);
  }
  return statOrNull(row, "CompletionPercentage");
}

export function yardsPerCompletion(row) {
  const yards = statOrNull(row, "PassingYards");
  const completions = statOrNull(row, "PassingComp");
  if (yards !== null && completions !== null) {
    return ratioOrNull(yards, completions);
  }
  return statOrNull(row, "YdsPerCompletion");
}

export function yardsPerCarry(row) {
  const yards = statOrNull(row, "RushingYards");
  const carries = statOrNull(row, "RushingNum");
  if (yards !== null && carries !== null) {
    return ratioOrNull(yards, carries);
  }
  return statOrNull(row, "YardsPerCarry");
}

export function yardsPerCatch(row) {
  const yards = statOrNull(row, "ReceivingYards");
  const catches = statOrNull(row, "ReceivingNum");
  if (yards !== null && catches !== null) {
    return ratioOrNull(yards, catches);
  }
  return statOrNull(row, "YardsPerCatch");
}

export function puntAverage(row) {
  const yards = statOrNull(row, "PuntYards");
  const punts = statOrNull(row, "PuntNum");
  if (yards !== null && punts !== null) {
    return ratioOrNull(yards, punts);
  }
  return statOrNull(row, "PuntAverage");
}

export function fgPct(row) {
  const made = statOrNull(row, "FGMade");
  const attempted = statOrNull(row, "FGAttempted");
  if (made !== null && attempted !== null) {
    return ratioOrNull(made, attempted);
  }
  return statOrNull(row, "FGPercentage");
}

export function patPct(row) {
  const made = statOrNull(row, "PatKickingMade");
  const attempted = statOrNull(row, "PatKickingAtt");
  if (made !== null && attempted !== null) {
    return ratioOrNull(made, attempted);
  }
  return statOrNull(row, "PatKickingPercentage");
}

export function totalReturnYards(row) {
  const directValue = statOrNull(row, "TotalReturnYards");
  if (directValue !== null) return directValue;
  return sumAvailable(row, ["KickoffReturnYards", "PuntReturnYards"]);
}

export function returnTouchdowns(row) {
  return sumAvailable(row, ["KickoffReturnedTDNum", "PuntReturnedTDNum"]);
}

export function defensiveTouchdowns(row) {
  return sumAvailable(row, ["IntReturnedTDNum", "FumbleReturnedTDNum"]);
}

export function totalKickingPoints(row) {
  const directValue = statOrNull(row, "TotalKickingPoints");
  if (directValue !== null) return directValue;

  const pat = statOrNull(row, "PatKickingMade");
  const fieldGoals = statOrNull(row, "FGMade");
  if (pat === null && fieldGoals === null) return null;
  return (pat || 0) + (fieldGoals || 0) * 3;
}

export function totalTouchdowns(row) {
  const directValue = statOrNull(row, "TotalTDNum");
  if (directValue !== null) return directValue;

  return sumAvailable(row, [
    "RushingTDNum",
    "ReceivingTDNum",
    "KickoffReturnedTDNum",
    "PuntReturnedTDNum",
    "IntReturnedTDNum",
    "FumbleReturnedTDNum",
  ]);
}

export function totalPoints(row) {
  const directValue = statOrNull(row, "TotalPoints");
  if (directValue !== null) return directValue;

  const touchdowns = totalTouchdowns(row);
  const kickingPoints = totalKickingPoints(row);
  const conversionPoints = statOrNull(row, "TotalConversionPoints");
  const safeties = statOrNull(row, "Safeties");

  if (
    touchdowns === null &&
    kickingPoints === null &&
    conversionPoints === null &&
    safeties === null
  ) {
    return null;
  }

  return (
    (touchdowns || 0) * 6 +
    (kickingPoints || 0) +
    (conversionPoints || 0) +
    (safeties || 0) * 2
  );
}

export function totalOffenseYards(row) {
  return sumAvailable(row, ["PassingYards", "RushingYards"]);
}

export function totalYards(row) {
  const directValue = statOrNull(row, "TotalYards");
  if (directValue !== null) return directValue;
  return sumAvailable(row, ["PassingYards", "RushingYards", "ReceivingYards"]);
}

export function allPurposeYards(row) {
  const directValue = statOrNull(row, "AllPurposeYards");
  if (directValue !== null) return directValue;
  return sumAvailable(row, [
    "RushingYards",
    "ReceivingYards",
    "KickoffReturnYards",
    "PuntReturnYards",
  ]);
}

export function playerPointsPerGame(row) {
  return ratioOrNull(totalPoints(row), trackedGames(row));
}

export function playerPassingYardsPerGame(row) {
  return ratioOrNull(statOrNull(row, "PassingYards"), trackedGames(row));
}

export function playerRushingYardsPerGame(row) {
  return ratioOrNull(statOrNull(row, "RushingYards"), trackedGames(row));
}

export function playerReceivingYardsPerGame(row) {
  return ratioOrNull(statOrNull(row, "ReceivingYards"), trackedGames(row));
}

export function playerTotalTacklesPerGame(row) {
  return ratioOrNull(statOrNull(row, "TotalTackles"), trackedGames(row));
}

export function playerInterceptionsPerGame(row) {
  return ratioOrNull(statOrNull(row, "Ints"), trackedGames(row));
}

export function playerSacksPerGame(row) {
  return ratioOrNull(statOrNull(row, "Sacks"), trackedGames(row));
}

export function playerReturnYardsPerGame(row) {
  return ratioOrNull(totalReturnYards(row), trackedGames(row));
}

export function playerTotalYardsPerGame(row) {
  return ratioOrNull(totalYards(row), trackedGames(row));
}

export function hasPassingData(row) {
  return hasAnyStat(row, ["PassingComp", "PassingAtt", "PassingYards", "PassingTD"]);
}

export function hasRushingData(row) {
  return hasAnyStat(row, ["RushingNum", "RushingYards", "RushingTDNum"]);
}

export function hasReceivingData(row) {
  return hasAnyStat(row, ["ReceivingNum", "ReceivingYards", "ReceivingTDNum"]);
}

export function hasDefenseData(row) {
  return hasAnyStat(row, [
    "Tackles",
    "Assists",
    "TotalTackles",
    "TacklesForLoss",
    "Sacks",
    "Ints",
  ]);
}

export function hasSpecialTeamsData(row) {
  return hasAnyStat(row, [
    "KickoffReturnYards",
    "PuntReturnYards",
    "PuntNum",
    "KickoffNum",
    "PatKickingMade",
    "FGMade",
  ]);
}

export function formatWhole(value) {
  return Number.isFinite(value) ? Math.round(value).toLocaleString("en-US") : "—";
}

export function formatDecimal(value, decimals = 1) {
  return Number.isFinite(value) ? value.toFixed(decimals) : "—";
}

export function formatPercent(value, decimals = 1) {
  return Number.isFinite(value) ? `${(value * 100).toFixed(decimals)}%` : "—";
}

export function formatRecordText(row) {
  return formatRecord(stat(row, "OverallWins"), stat(row, "OverallLosses"), stat(row, "OverallTies"));
}
