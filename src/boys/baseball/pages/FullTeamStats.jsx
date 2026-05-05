import React, { useEffect, useMemo, useState } from "react";
import { recordTableStyles } from "./recordTableStyles";
import { loadAllBaseballPlayerGameStats } from "../dataLoaders";

function absUrl(path) {
  return new URL(path, window.location.origin).toString();
}

async function fetchJson(label, path) {
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

function safeNum(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function baseballInningsToOuts(value) {
  const innings = safeNum(value);
  const whole = Math.trunc(innings);
  const decimal = Math.round((innings - whole) * 10);
  return whole * 3 + decimal;
}

function outsToBaseballInnings(outs) {
  const safeOuts = safeNum(outs);
  const whole = Math.floor(safeOuts / 3);
  const remainder = safeOuts % 3;
  return Number(`${whole}.${remainder}`);
}

const FIELDING_INNING_KEYS = [
  "P_Innings",
  "C_Innings",
  "1B_Innings",
  "2B_Innings",
  "3B_Innings",
  "SS_Innings",
  "LF_Innings",
  "CF_Innings",
  "RF_Innings",
];

function baseballInningOuts(stats, key) {
  const outsKey = `${key}Outs`;
  return stats?.[outsKey] != null ? safeNum(stats[outsKey]) : baseballInningsToOuts(stats?.[key]);
}

function baseballInningValue(stats, key) {
  return outsToBaseballInnings(baseballInningOuts(stats, key));
}

function addBaseballInnings(total, row, key) {
  const outsKey = `${key}Outs`;
  total[outsKey] = safeNum(total[outsKey]) + baseballInningsToOuts(row?.[key]);
  total[key] = outsToBaseballInnings(total[outsKey]);
}

function formatValue(value, decimals = 0) {
  if (!Number.isFinite(value)) return "—";
  if (decimals === 0) return String(Math.round(value));
  return value.toFixed(decimals);
}

function formatPct(value) {
  if (!Number.isFinite(value)) return "—";
  return value.toFixed(3).replace(/^0(?=\.)/, "");
}

function formatEraWhip(value) {
  if (!Number.isFinite(value)) return "—";
  return value.toFixed(2);
}

function battingAverage(stats) {
  return stats.AB > 0 ? stats.H / stats.AB : NaN;
}

function onBasePercentage(stats) {
  const denom = stats.AB + stats.BB + stats.HBP + stats.SF;
  return denom > 0 ? (stats.H + stats.BB + stats.HBP) / denom : NaN;
}

function sluggingPercentage(stats) {
  return stats.AB > 0 ? stats.TB / stats.AB : NaN;
}

function ops(stats) {
  const obp = onBasePercentage(stats);
  const slg = sluggingPercentage(stats);
  return Number.isFinite(obp) && Number.isFinite(slg) ? obp + slg : NaN;
}

function fieldingPct(stats) {
  const chances = stats.PO + stats.A + stats.E;
  return chances > 0 ? (stats.PO + stats.A) / chances : NaN;
}

function pitchingEra(stats) {
  return stats.IPOuts > 0 ? (stats.ER * 21) / stats.IPOuts : NaN;
}

function pitchingWhip(stats) {
  return stats.IPOuts > 0 ? ((stats.H_Allowed + stats.BB_Allowed) * 3) / stats.IPOuts : NaN;
}

function totalFieldingOuts(stats) {
  return FIELDING_INNING_KEYS.reduce((sum, key) => sum + baseballInningOuts(stats, key), 0);
}

function totalFieldingInnings(stats) {
  return outsToBaseballInnings(totalFieldingOuts(stats));
}

function winPct(stats) {
  const decisions = stats.Wins + stats.Losses + stats.Ties;
  return decisions > 0 ? (stats.Wins + stats.Ties * 0.5) / decisions : NaN;
}

function extractGameDateKey(gameId) {
  const text = String(gameId ?? "");
  const match = text.match(/^(\d{8})/);
  return match ? Number(match[1]) : NaN;
}

function todayDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return Number(`${year}${month}${day}`);
}

function isFutureGame(game, currentDateKey) {
  const gameDateKey = extractGameDateKey(game?.GameID);
  return Number.isFinite(gameDateKey) && gameDateKey > currentDateKey;
}

function getSeasonKey(game) {
  if (game?.SeasonID != null && String(game.SeasonID).trim() !== "") {
    return String(game.SeasonID).trim();
  }

  if (game?.Season != null && String(game.Season).trim() !== "") {
    return String(game.Season).trim();
  }

  return "Unknown";
}

function createEmptySeasonTotals(season) {
  return {
    Season: season,
    Games: 0,
    Wins: 0,
    Losses: 0,
    Ties: 0,
    RunsScored: 0,
    RunsAllowed: 0,
    DetailedGames: 0,
    HitGames: 0,
    ErrorGames: 0,
    OpponentHitGames: 0,
    PA: 0,
    AB: 0,
    R: 0,
    H: 0,
    "1B": 0,
    "2B": 0,
    "3B": 0,
    HR: 0,
    RBI: 0,
    BB: 0,
    SO: 0,
    HBP: 0,
    SAC: 0,
    SF: 0,
    ROE: 0,
    FC: 0,
    SB: 0,
    CS: 0,
    TB: 0,
    IPOuts: 0,
    BF: 0,
    Pitches: 0,
    W: 0,
    L: 0,
    SV: 0,
    SVO: 0,
    BS: 0,
    H_Allowed: 0,
    R_Allowed: 0,
    ER: 0,
    BB_Allowed: 0,
    SO_Pitching: 0,
    HBP_Pitching: 0,
    BK: 0,
    PIK_Allowed: 0,
    CS_Pitching: 0,
    SB_Allowed: 0,
    WP: 0,
    A: 0,
    PO: 0,
    E: 0,
    DP: 0,
    TP: 0,
    PB: 0,
    PIK_Fielding: 0,
    CI: 0,
    P_Innings: 0,
    C_Innings: 0,
    "1B_Innings": 0,
    "2B_Innings": 0,
    "3B_Innings": 0,
    SS_Innings: 0,
    LF_Innings: 0,
    CF_Innings: 0,
    RF_Innings: 0,
  };
}

function accumulateStats(total, row) {
  total.PA += safeNum(row.PA);
  total.AB += safeNum(row.AB);
  total.R += safeNum(row.R);
  total.H += safeNum(row.H);
  total["1B"] += safeNum(row["1B"]);
  total["2B"] += safeNum(row["2B"]);
  total["3B"] += safeNum(row["3B"]);
  total.HR += safeNum(row.HR);
  total.RBI += safeNum(row.RBI);
  total.BB += safeNum(row.BB);
  total.SO += safeNum(row.SO);
  total.HBP += safeNum(row.HBP);
  total.SAC += safeNum(row.SAC);
  total.SF += safeNum(row.SF);
  total.ROE += safeNum(row.ROE);
  total.FC += safeNum(row.FC);
  total.SB += safeNum(row.SB);
  total.CS += safeNum(row.CS);
  total.TB += safeNum(row.TB);
  total.IPOuts += baseballInningsToOuts(row.IP);
  total.BF += safeNum(row.BF);
  total.Pitches += safeNum(row.Pitches);
  total.W += safeNum(row.W);
  total.L += safeNum(row.L);
  total.SV += safeNum(row.SV);
  total.SVO += safeNum(row.SVO);
  total.BS += safeNum(row.BS);
  total.H_Allowed += safeNum(row.H_Allowed);
  total.R_Allowed += safeNum(row.R_Allowed);
  total.ER += safeNum(row.ER);
  total.BB_Allowed += safeNum(row.BB_Allowed);
  total.SO_Pitching += safeNum(row.SO_Pitching);
  total.HBP_Pitching += safeNum(row.HBP_Pitching);
  total.BK += safeNum(row.BK);
  total.PIK_Allowed += safeNum(row.PIK_Allowed);
  total.CS_Pitching += safeNum(row.CS_Pitching);
  total.SB_Allowed += safeNum(row.SB_Allowed);
  total.WP += safeNum(row.WP);
  total.A += safeNum(row.A);
  total.PO += safeNum(row.PO);
  total.E += safeNum(row.E);
  total.DP += safeNum(row.DP);
  total.TP += safeNum(row.TP);
  total.PB += safeNum(row.PB);
  total.PIK_Fielding += safeNum(row.PIK_Fielding);
  total.CI += safeNum(row.CI);
  FIELDING_INNING_KEYS.forEach((key) => addBaseballInnings(total, row, key));
}

function numericSortValue(value) {
  return Number.isFinite(value) ? value : Number.NEGATIVE_INFINITY;
}

function renderAvailable(value, available, decimals = 0) {
  if (!available) return "—";
  return formatValue(value, decimals);
}

function renderPctAvailable(value, available) {
  if (!available) return "—";
  return formatPct(value);
}

function renderEraWhipAvailable(value, available) {
  if (!available) return "—";
  return formatEraWhip(value);
}

const VIEW_CONFIG = {
  overview: {
    label: "Overview",
    defaultSort: "Season",
    columns: [
      { key: "Season", label: "Season", sortValue: (row) => safeNum(row.Season), render: (row) => row.Season },
      { key: "Games", label: "G", sortValue: (row) => row.Games, render: (row) => formatValue(row.Games) },
      { key: "Wins", label: "W", sortValue: (row) => row.Wins, render: (row) => formatValue(row.Wins) },
      { key: "Losses", label: "L", sortValue: (row) => row.Losses, render: (row) => formatValue(row.Losses) },
      { key: "Ties", label: "T", sortValue: (row) => row.Ties, render: (row) => formatValue(row.Ties) },
      { key: "WinPct", label: "WIN%", sortValue: (row) => winPct(row), render: (row) => formatPct(winPct(row)) },
      { key: "RunsScored", label: "RS", sortValue: (row) => row.RunsScored, render: (row) => formatValue(row.RunsScored) },
      { key: "RunsAllowed", label: "RA", sortValue: (row) => row.RunsAllowed, render: (row) => formatValue(row.RunsAllowed) },
      { key: "RunDiff", label: "DIFF", sortValue: (row) => row.RunsScored - row.RunsAllowed, render: (row) => formatValue(row.RunsScored - row.RunsAllowed) },
    ],
  },
  batting: {
    label: "Batting",
    defaultSort: "Season",
    columns: [
      { key: "Season", label: "Season", sortValue: (row) => safeNum(row.Season), render: (row) => row.Season },
      { key: "Games", label: "G", sortValue: (row) => row.Games, render: (row) => formatValue(row.Games) },
      { key: "PA", label: "PA", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.PA : NaN), render: (row) => renderAvailable(row.PA, row.DetailedGames > 0) },
      { key: "AB", label: "AB", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.AB : NaN), render: (row) => renderAvailable(row.AB, row.DetailedGames > 0) },
      { key: "R", label: "R", sortValue: (row) => row.RunsScored, render: (row) => formatValue(row.RunsScored) },
      { key: "H", label: "H", sortValue: (row) => numericSortValue(row.HitGames > 0 ? row.H : NaN), render: (row) => renderAvailable(row.H, row.HitGames > 0) },
      { key: "1B", label: "1B", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row["1B"] : NaN), render: (row) => renderAvailable(row["1B"], row.DetailedGames > 0) },
      { key: "2B", label: "2B", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row["2B"] : NaN), render: (row) => renderAvailable(row["2B"], row.DetailedGames > 0) },
      { key: "3B", label: "3B", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row["3B"] : NaN), render: (row) => renderAvailable(row["3B"], row.DetailedGames > 0) },
      { key: "HR", label: "HR", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.HR : NaN), render: (row) => renderAvailable(row.HR, row.DetailedGames > 0) },
      { key: "RBI", label: "RBI", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.RBI : NaN), render: (row) => renderAvailable(row.RBI, row.DetailedGames > 0) },
      { key: "BB", label: "BB", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.BB : NaN), render: (row) => renderAvailable(row.BB, row.DetailedGames > 0) },
      { key: "SO", label: "SO", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.SO : NaN), render: (row) => renderAvailable(row.SO, row.DetailedGames > 0) },
      { key: "HBP", label: "HBP", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.HBP : NaN), render: (row) => renderAvailable(row.HBP, row.DetailedGames > 0) },
      { key: "SAC", label: "SAC", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.SAC : NaN), render: (row) => renderAvailable(row.SAC, row.DetailedGames > 0) },
      { key: "SF", label: "SF", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.SF : NaN), render: (row) => renderAvailable(row.SF, row.DetailedGames > 0) },
      { key: "ROE", label: "ROE", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.ROE : NaN), render: (row) => renderAvailable(row.ROE, row.DetailedGames > 0) },
      { key: "FC", label: "FC", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.FC : NaN), render: (row) => renderAvailable(row.FC, row.DetailedGames > 0) },
      { key: "SB", label: "SB", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.SB : NaN), render: (row) => renderAvailable(row.SB, row.DetailedGames > 0) },
      { key: "CS", label: "CS", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.CS : NaN), render: (row) => renderAvailable(row.CS, row.DetailedGames > 0) },
      { key: "TB", label: "TB", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.TB : NaN), render: (row) => renderAvailable(row.TB, row.DetailedGames > 0) },
      { key: "AVG", label: "AVG", sortValue: (row) => numericSortValue(row.fullDetailCoverage ? battingAverage(row) : NaN), render: (row) => renderPctAvailable(battingAverage(row), row.fullDetailCoverage) },
      { key: "OBP", label: "OBP", sortValue: (row) => numericSortValue(row.fullDetailCoverage ? onBasePercentage(row) : NaN), render: (row) => renderPctAvailable(onBasePercentage(row), row.fullDetailCoverage) },
      { key: "SLG", label: "SLG", sortValue: (row) => numericSortValue(row.fullDetailCoverage ? sluggingPercentage(row) : NaN), render: (row) => renderPctAvailable(sluggingPercentage(row), row.fullDetailCoverage) },
      { key: "OPS", label: "OPS", sortValue: (row) => numericSortValue(row.fullDetailCoverage ? ops(row) : NaN), render: (row) => renderPctAvailable(ops(row), row.fullDetailCoverage) },
    ],
  },
  pitching: {
    label: "Pitching",
    defaultSort: "Season",
    columns: [
      { key: "Season", label: "Season", sortValue: (row) => safeNum(row.Season), render: (row) => row.Season },
      { key: "Games", label: "G", sortValue: (row) => row.Games, render: (row) => formatValue(row.Games) },
      { key: "IP", label: "IP", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.IPOuts : NaN), render: (row) => renderAvailable(outsToBaseballInnings(row.IPOuts), row.DetailedGames > 0, 1) },
      { key: "BF", label: "BF", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.BF : NaN), render: (row) => renderAvailable(row.BF, row.DetailedGames > 0) },
      { key: "Pitches", label: "P", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.Pitches : NaN), render: (row) => renderAvailable(row.Pitches, row.DetailedGames > 0) },
      { key: "Wins", label: "W", sortValue: (row) => row.Wins, render: (row) => formatValue(row.Wins) },
      { key: "Losses", label: "L", sortValue: (row) => row.Losses, render: (row) => formatValue(row.Losses) },
      { key: "SV", label: "SV", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.SV : NaN), render: (row) => renderAvailable(row.SV, row.DetailedGames > 0) },
      { key: "SVO", label: "SVO", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.SVO : NaN), render: (row) => renderAvailable(row.SVO, row.DetailedGames > 0) },
      { key: "BS", label: "BS", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.BS : NaN), render: (row) => renderAvailable(row.BS, row.DetailedGames > 0) },
      { key: "H_Allowed", label: "H", sortValue: (row) => numericSortValue(row.OpponentHitGames > 0 ? row.H_Allowed : NaN), render: (row) => renderAvailable(row.H_Allowed, row.OpponentHitGames > 0) },
      { key: "RunsAllowed", label: "R", sortValue: (row) => row.RunsAllowed, render: (row) => formatValue(row.RunsAllowed) },
      { key: "ER", label: "ER", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.ER : NaN), render: (row) => renderAvailable(row.ER, row.DetailedGames > 0) },
      { key: "BB_Allowed", label: "BB", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.BB_Allowed : NaN), render: (row) => renderAvailable(row.BB_Allowed, row.DetailedGames > 0) },
      { key: "SO_Pitching", label: "SO", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.SO_Pitching : NaN), render: (row) => renderAvailable(row.SO_Pitching, row.DetailedGames > 0) },
      { key: "HBP_Pitching", label: "HBP", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.HBP_Pitching : NaN), render: (row) => renderAvailable(row.HBP_Pitching, row.DetailedGames > 0) },
      { key: "BK", label: "BK", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.BK : NaN), render: (row) => renderAvailable(row.BK, row.DetailedGames > 0) },
      { key: "PIK_Allowed", label: "PIK", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.PIK_Allowed : NaN), render: (row) => renderAvailable(row.PIK_Allowed, row.DetailedGames > 0) },
      { key: "CS_Pitching", label: "CS", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.CS_Pitching : NaN), render: (row) => renderAvailable(row.CS_Pitching, row.DetailedGames > 0) },
      { key: "SB_Allowed", label: "SB", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.SB_Allowed : NaN), render: (row) => renderAvailable(row.SB_Allowed, row.DetailedGames > 0) },
      { key: "WP", label: "WP", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.WP : NaN), render: (row) => renderAvailable(row.WP, row.DetailedGames > 0) },
      { key: "ERA", label: "ERA", sortValue: (row) => numericSortValue(row.fullDetailCoverage ? pitchingEra(row) : NaN), render: (row) => renderEraWhipAvailable(pitchingEra(row), row.fullDetailCoverage) },
      { key: "WHIP", label: "WHIP", sortValue: (row) => numericSortValue(row.fullDetailCoverage ? pitchingWhip(row) : NaN), render: (row) => renderEraWhipAvailable(pitchingWhip(row), row.fullDetailCoverage) },
    ],
  },
  fielding: {
    label: "Fielding",
    defaultSort: "Season",
    columns: [
      { key: "Season", label: "Season", sortValue: (row) => safeNum(row.Season), render: (row) => row.Season },
      { key: "Games", label: "G", sortValue: (row) => row.Games, render: (row) => formatValue(row.Games) },
      { key: "INN", label: "INN", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? totalFieldingOuts(row) : NaN), render: (row) => renderAvailable(totalFieldingInnings(row), row.DetailedGames > 0, 1) },
      { key: "PO", label: "PO", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.PO : NaN), render: (row) => renderAvailable(row.PO, row.DetailedGames > 0) },
      { key: "A", label: "A", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.A : NaN), render: (row) => renderAvailable(row.A, row.DetailedGames > 0) },
      { key: "E", label: "E", sortValue: (row) => numericSortValue(row.ErrorGames > 0 ? row.E : NaN), render: (row) => renderAvailable(row.E, row.ErrorGames > 0) },
      { key: "TC", label: "TC", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.PO + row.A + row.E : NaN), render: (row) => renderAvailable(row.PO + row.A + row.E, row.DetailedGames > 0) },
      { key: "DP", label: "DP", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.DP : NaN), render: (row) => renderAvailable(row.DP, row.DetailedGames > 0) },
      { key: "TP", label: "TP", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.TP : NaN), render: (row) => renderAvailable(row.TP, row.DetailedGames > 0) },
      { key: "PB", label: "PB", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.PB : NaN), render: (row) => renderAvailable(row.PB, row.DetailedGames > 0) },
      { key: "PIK_Fielding", label: "PIK", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.PIK_Fielding : NaN), render: (row) => renderAvailable(row.PIK_Fielding, row.DetailedGames > 0) },
      { key: "CI", label: "CI", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? row.CI : NaN), render: (row) => renderAvailable(row.CI, row.DetailedGames > 0) },
      { key: "FLDPCT", label: "FLD%", sortValue: (row) => numericSortValue(row.fullDetailCoverage ? fieldingPct(row) : NaN), render: (row) => renderPctAvailable(fieldingPct(row), row.fullDetailCoverage) },
      { key: "P_Innings", label: "P INN", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? baseballInningOuts(row, "P_Innings") : NaN), render: (row) => renderAvailable(baseballInningValue(row, "P_Innings"), row.DetailedGames > 0, 1) },
      { key: "C_Innings", label: "C INN", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? baseballInningOuts(row, "C_Innings") : NaN), render: (row) => renderAvailable(baseballInningValue(row, "C_Innings"), row.DetailedGames > 0, 1) },
      { key: "1B_Innings", label: "1B INN", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? baseballInningOuts(row, "1B_Innings") : NaN), render: (row) => renderAvailable(baseballInningValue(row, "1B_Innings"), row.DetailedGames > 0, 1) },
      { key: "2B_Innings", label: "2B INN", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? baseballInningOuts(row, "2B_Innings") : NaN), render: (row) => renderAvailable(baseballInningValue(row, "2B_Innings"), row.DetailedGames > 0, 1) },
      { key: "3B_Innings", label: "3B INN", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? baseballInningOuts(row, "3B_Innings") : NaN), render: (row) => renderAvailable(baseballInningValue(row, "3B_Innings"), row.DetailedGames > 0, 1) },
      { key: "SS_Innings", label: "SS INN", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? baseballInningOuts(row, "SS_Innings") : NaN), render: (row) => renderAvailable(baseballInningValue(row, "SS_Innings"), row.DetailedGames > 0, 1) },
      { key: "LF_Innings", label: "LF INN", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? baseballInningOuts(row, "LF_Innings") : NaN), render: (row) => renderAvailable(baseballInningValue(row, "LF_Innings"), row.DetailedGames > 0, 1) },
      { key: "CF_Innings", label: "CF INN", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? baseballInningOuts(row, "CF_Innings") : NaN), render: (row) => renderAvailable(baseballInningValue(row, "CF_Innings"), row.DetailedGames > 0, 1) },
      { key: "RF_Innings", label: "RF INN", sortValue: (row) => numericSortValue(row.DetailedGames > 0 ? baseballInningOuts(row, "RF_Innings") : NaN), render: (row) => renderAvailable(baseballInningValue(row, "RF_Innings"), row.DetailedGames > 0, 1) },
    ],
  },
};

export default function FullTeamStats() {
  const [seasonRows, setSeasonRows] = useState([]);
  const [selectedView, setSelectedView] = useState("overview");
  const [sortField, setSortField] = useState(VIEW_CONFIG.overview.defaultSort);
  const [sortDirection, setSortDirection] = useState("desc");
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setError("");

        const [gamesDataRaw, playerStatsDataRaw] = await Promise.all([
          fetchJson("games.json", "/data/boys/baseball/games.json"),
          loadAllBaseballPlayerGameStats(),
        ]);

        const gamesData = Array.isArray(gamesDataRaw) ? gamesDataRaw : [];
        const playerStatsData = Array.isArray(playerStatsDataRaw) ? playerStatsDataRaw : [];

        const statsByGame = new Map();
        for (const row of playerStatsData) {
          if (!row?.GameID) continue;
          const key = String(row.GameID);
          if (!statsByGame.has(key)) statsByGame.set(key, []);
          statsByGame.get(key).push(row);
        }

        const totalsBySeason = new Map();
        const currentDateKey = todayDateKey();

        for (const game of gamesData) {
          if (!game?.GameID) continue;
          if (isFutureGame(game, currentDateKey)) continue;

          const seasonKey = getSeasonKey(game);
          if (!totalsBySeason.has(seasonKey)) {
            totalsBySeason.set(seasonKey, createEmptySeasonTotals(seasonKey));
          }

          const totals = totalsBySeason.get(seasonKey);
          const gameRows = statsByGame.get(String(game.GameID)) || [];

          totals.Games += 1;
          totals.RunsScored += safeNum(game.TeamScore);
          totals.RunsAllowed += safeNum(game.OpponentScore);

          const teamScore = Number(game.TeamScore);
          const opponentScore = Number(game.OpponentScore);
          if (Number.isFinite(teamScore) && Number.isFinite(opponentScore)) {
            if (teamScore > opponentScore) totals.Wins += 1;
            else if (teamScore < opponentScore) totals.Losses += 1;
            else totals.Ties += 1;
          } else if (String(game.Result).toUpperCase() === "W") {
            totals.Wins += 1;
          } else if (String(game.Result).toUpperCase() === "L") {
            totals.Losses += 1;
          } else if (String(game.Result).toUpperCase() === "T") {
            totals.Ties += 1;
          }

          if (gameRows.length > 0) {
            totals.DetailedGames += 1;
            totals.HitGames += 1;
            totals.ErrorGames += 1;
            totals.OpponentHitGames += 1;

            for (const row of gameRows) {
              accumulateStats(totals, row);
            }
            continue;
          }

          const lineScore = game?.LineScore;
          const teamHits = Number(lineScore?.StAndrewsTotals?.H);
          const teamErrors = Number(lineScore?.StAndrewsTotals?.E);
          const opponentHits = Number(lineScore?.OpponentTotals?.H);

          if (Number.isFinite(teamHits)) {
            totals.H += teamHits;
            totals.HitGames += 1;
          }

          if (Number.isFinite(teamErrors)) {
            totals.E += teamErrors;
            totals.ErrorGames += 1;
          }

          if (Number.isFinite(opponentHits)) {
            totals.H_Allowed += opponentHits;
            totals.OpponentHitGames += 1;
          }
        }

        const rows = Array.from(totalsBySeason.values())
          .map((row) => ({
            ...row,
            detailCoverage: `${row.DetailedGames}/${row.Games}`,
            fullDetailCoverage: row.Games > 0 && row.DetailedGames === row.Games,
          }))
          .sort((a, b) => safeNum(b.Season) - safeNum(a.Season));

        setSeasonRows(rows);
      } catch (e) {
        setError(String(e?.message || e));
        console.error(e);
      }
    };

    run();
  }, []);

  useEffect(() => {
    setSortField(VIEW_CONFIG[selectedView].defaultSort);
    setSortDirection("desc");
  }, [selectedView]);

  const activeView = VIEW_CONFIG[selectedView];

  const sortedRows = useMemo(() => {
    const activeColumn = activeView.columns.find((column) => column.key === sortField);
    if (!activeColumn) return seasonRows;

    return [...seasonRows].sort((a, b) => {
      const av = activeColumn.sortValue(a);
      const bv = activeColumn.sortValue(b);
      const aNum = numericSortValue(av);
      const bNum = numericSortValue(bv);

      if (aNum !== bNum) {
        return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
      }

      return safeNum(b.Season) - safeNum(a.Season);
    });
  }, [activeView, seasonRows, sortDirection, sortField]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("desc");
  };

  return (
    <div className="pt-2 pb-10 lg:pb-40 space-y-6 px-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-center">Full Team Stats</h1>
      <p className="-mt-1.5 text-center text-sm italic text-gray-600">
        View season-by-season totals for the St. Andrew&apos;s baseball team across every stat that can be derived from the available game and box-score data
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        {Object.entries(VIEW_CONFIG).map(([key, view]) => {
          const isActive = selectedView === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedView(key)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                isActive
                  ? "border-blue-900 bg-blue-900 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
              }`}
            >
              {view.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 whitespace-pre-wrap text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className={recordTableStyles.outerTable}>
          <thead className="bg-gray-200 font-bold">
            <tr>
              {activeView.columns.map((column) => (
                <th
                  key={column.key}
                  className={`${recordTableStyles.headerCell} cursor-pointer select-none hover:bg-gray-300 whitespace-nowrap`}
                  onClick={() => handleSort(column.key)}
                >
                  {column.label}
                  {sortField === column.key ? (sortDirection === "asc" ? " ▲" : " ▼") : ""}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sortedRows.map((row, index) => (
              <tr
                key={row.Season}
                className={`border-t ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
              >
                {activeView.columns.map((column) => (
                  <td key={column.key} className={`${recordTableStyles.bodyCell} whitespace-nowrap`}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mx-auto max-w-4xl text-center text-xs italic text-gray-500">
        Totals are calculated from all available season statistics. Some seasons may not include every stat category for every game, so certain totals or rate stats may be based on the available data for that season.
      </p>
    </div>
  );
}
