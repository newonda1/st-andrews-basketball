import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { countsAsPlayerGame } from "../dataUtils";
import { recordTableStyles } from "./recordTableStyles";

function absUrl(path) {
  return new URL(path, window.location.origin).toString();
}

async function fetchJson(label, path) {
  const url = absUrl(path);
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`${label} failed (HTTP ${res.status}) at ${path}`);
  }

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

async function fetchJsonOptional(label, path) {
  try {
    const url = absUrl(path);
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];

    const text = await res.text();
    const trimmed = text.trim();
    if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) return [];

    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function safeNum(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

function hasValue(x) {
  return x !== null && x !== undefined;
}

function displayStat(value, hasData, formatter = null) {
  if (!hasData) return "—";
  if (formatter) return formatter(value);
  return value;
}

function formatValue(value, decimals = 0) {
  if (!Number.isFinite(value)) return "—";
  if (decimals === 0) return String(Math.round(value));
  return value.toFixed(decimals);
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(1)}%`;
}

function formatRatio(value) {
  if (!Number.isFinite(value)) return "—";
  return value.toFixed(2);
}

function createEmptyTotals(playerId) {
  return {
    PlayerID: playerId,
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
    TwentyPointGames: 0,
    ThirtyPointGames: 0,
    FortyPointGames: 0,
    TenReboundGames: 0,
    TenAssistGames: 0,
    FiveStealGames: 0,
    FiveBlockGames: 0,
    DoubleDoubles: 0,
    TripleDoubles: 0,
    _has: {
      Points: false,
      Rebounds: false,
      Assists: false,
      Steals: false,
      Blocks: false,
      Turnovers: false,
      TwoPM: false,
      TwoPA: false,
      ThreePM: false,
      ThreePA: false,
      FTM: false,
      FTA: false,
    },
  };
}

function markHas(total, key) {
  total._has[key] = true;
}

function buildDerivedStats(row) {
  const fgm = row.TwoPM + row.ThreePM;
  const fga = row.TwoPA + row.ThreePA;

  return {
    ...row,
    FGM: fgm,
    FGA: fga,
    FGPercentage: row._has.TwoPA || row._has.ThreePA ? (fga > 0 ? (fgm / fga) * 100 : NaN) : NaN,
    TwoPPercentage: row._has.TwoPA ? (row.TwoPA > 0 ? (row.TwoPM / row.TwoPA) * 100 : NaN) : NaN,
    ThreePPercentage: row._has.ThreePA ? (row.ThreePA > 0 ? (row.ThreePM / row.ThreePA) * 100 : NaN) : NaN,
    FTPercentage: row._has.FTA ? (row.FTA > 0 ? (row.FTM / row.FTA) * 100 : NaN) : NaN,
    EffectiveFGPercentage:
      row._has.TwoPA || row._has.ThreePA ? (fga > 0 ? ((fgm + 0.5 * row.ThreePM) / fga) * 100 : NaN) : NaN,
    PointsPerGame: row.GamesPlayed > 0 ? row.Points / row.GamesPlayed : NaN,
    ReboundsPerGame: row.GamesPlayed > 0 ? row.Rebounds / row.GamesPlayed : NaN,
    AssistsPerGame: row.GamesPlayed > 0 ? row.Assists / row.GamesPlayed : NaN,
    StealsPerGame: row.GamesPlayed > 0 ? row.Steals / row.GamesPlayed : NaN,
    BlocksPerGame: row.GamesPlayed > 0 ? row.Blocks / row.GamesPlayed : NaN,
    TurnoversPerGame:
      row._has.Turnovers && row.GamesPlayed > 0 ? row.Turnovers / row.GamesPlayed : NaN,
    AssistTurnoverRatio:
      row._has.Assists && row._has.Turnovers && row.Turnovers > 0 ? row.Assists / row.Turnovers : NaN,
  };
}

const FALLBACK_HEADSHOT = "/images/common/logo.png";

const VIEW_CONFIG = {
  scoring: {
    label: "Scoring",
    defaultSort: "Points",
    columns: [
      { key: "GamesPlayed", label: "G", sortValue: (row) => row.GamesPlayed, render: (row) => formatValue(row.GamesPlayed) },
      { key: "Points", label: "PTS", sortValue: (row) => row.Points, render: (row) => displayStat(row.Points, row._has.Points, formatValue) },
      {
        key: "PointsPerGame",
        label: "PPG",
        sortValue: (row) => row.PointsPerGame,
        render: (row) => (row.GamesPlayed > 0 && row._has.Points ? formatValue(row.PointsPerGame, 1) : "—"),
      },
      { key: "FGM", label: "FGM", sortValue: (row) => row.FGM, render: (row) => displayStat(row.FGM, row._has.TwoPM || row._has.ThreePM, formatValue) },
      { key: "FGA", label: "FGA", sortValue: (row) => row.FGA, render: (row) => displayStat(row.FGA, row._has.TwoPA || row._has.ThreePA, formatValue) },
      { key: "FTM", label: "FTM", sortValue: (row) => row.FTM, render: (row) => displayStat(row.FTM, row._has.FTM, formatValue) },
      { key: "FTA", label: "FTA", sortValue: (row) => row.FTA, render: (row) => displayStat(row.FTA, row._has.FTA, formatValue) },
      { key: "TwentyPointGames", label: "20P G", sortValue: (row) => row.TwentyPointGames, render: (row) => formatValue(row.TwentyPointGames) },
      { key: "ThirtyPointGames", label: "30P G", sortValue: (row) => row.ThirtyPointGames, render: (row) => formatValue(row.ThirtyPointGames) },
      { key: "FortyPointGames", label: "40P G", sortValue: (row) => row.FortyPointGames, render: (row) => formatValue(row.FortyPointGames) },
    ],
  },
  shooting: {
    label: "Shooting",
    defaultSort: "FGM",
    columns: [
      { key: "GamesPlayed", label: "G", sortValue: (row) => row.GamesPlayed, render: (row) => formatValue(row.GamesPlayed) },
      { key: "FGM", label: "FGM", sortValue: (row) => row.FGM, render: (row) => displayStat(row.FGM, row._has.TwoPM || row._has.ThreePM, formatValue) },
      { key: "FGA", label: "FGA", sortValue: (row) => row.FGA, render: (row) => displayStat(row.FGA, row._has.TwoPA || row._has.ThreePA, formatValue) },
      { key: "FGPercentage", label: "FG%", sortValue: (row) => row.FGPercentage, render: (row) => displayStat(row.FGPercentage, row._has.TwoPA || row._has.ThreePA, formatPercent) },
      { key: "EffectiveFGPercentage", label: "EFG%", sortValue: (row) => row.EffectiveFGPercentage, render: (row) => displayStat(row.EffectiveFGPercentage, row._has.TwoPA || row._has.ThreePA, formatPercent) },
      { key: "TwoPM", label: "2PM", sortValue: (row) => row.TwoPM, render: (row) => displayStat(row.TwoPM, row._has.TwoPM, formatValue) },
      { key: "TwoPA", label: "2PA", sortValue: (row) => row.TwoPA, render: (row) => displayStat(row.TwoPA, row._has.TwoPA, formatValue) },
      { key: "TwoPPercentage", label: "2P%", sortValue: (row) => row.TwoPPercentage, render: (row) => displayStat(row.TwoPPercentage, row._has.TwoPA, formatPercent) },
      { key: "ThreePM", label: "3PM", sortValue: (row) => row.ThreePM, render: (row) => displayStat(row.ThreePM, row._has.ThreePM, formatValue) },
      { key: "ThreePA", label: "3PA", sortValue: (row) => row.ThreePA, render: (row) => displayStat(row.ThreePA, row._has.ThreePA, formatValue) },
      { key: "ThreePPercentage", label: "3P%", sortValue: (row) => row.ThreePPercentage, render: (row) => displayStat(row.ThreePPercentage, row._has.ThreePA, formatPercent) },
      { key: "FTM", label: "FTM", sortValue: (row) => row.FTM, render: (row) => displayStat(row.FTM, row._has.FTM, formatValue) },
      { key: "FTA", label: "FTA", sortValue: (row) => row.FTA, render: (row) => displayStat(row.FTA, row._has.FTA, formatValue) },
      { key: "FTPercentage", label: "FT%", sortValue: (row) => row.FTPercentage, render: (row) => displayStat(row.FTPercentage, row._has.FTA, formatPercent) },
    ],
  },
  playmaking: {
    label: "Playmaking",
    defaultSort: "Assists",
    columns: [
      { key: "GamesPlayed", label: "G", sortValue: (row) => row.GamesPlayed, render: (row) => formatValue(row.GamesPlayed) },
      { key: "Assists", label: "AST", sortValue: (row) => row.Assists, render: (row) => displayStat(row.Assists, row._has.Assists, formatValue) },
      {
        key: "AssistsPerGame",
        label: "APG",
        sortValue: (row) => row.AssistsPerGame,
        render: (row) => (row.GamesPlayed > 0 && row._has.Assists ? formatValue(row.AssistsPerGame, 1) : "—"),
      },
      { key: "Turnovers", label: "TO", sortValue: (row) => row.Turnovers, render: (row) => displayStat(row.Turnovers, row._has.Turnovers, formatValue) },
      {
        key: "TurnoversPerGame",
        label: "TOPG",
        sortValue: (row) => row.TurnoversPerGame,
        render: (row) => (row.GamesPlayed > 0 && row._has.Turnovers ? formatValue(row.TurnoversPerGame, 1) : "—"),
      },
      {
        key: "AssistTurnoverRatio",
        label: "A/TO",
        sortValue: (row) => row.AssistTurnoverRatio,
        render: (row) =>
          row._has.Assists && row._has.Turnovers && row.Turnovers > 0
            ? formatRatio(row.AssistTurnoverRatio)
            : "—",
      },
      { key: "TenAssistGames", label: "10A G", sortValue: (row) => row.TenAssistGames, render: (row) => formatValue(row.TenAssistGames) },
    ],
  },
  defense: {
    label: "Rebounding & Defense",
    defaultSort: "Rebounds",
    columns: [
      { key: "GamesPlayed", label: "G", sortValue: (row) => row.GamesPlayed, render: (row) => formatValue(row.GamesPlayed) },
      { key: "Rebounds", label: "REB", sortValue: (row) => row.Rebounds, render: (row) => displayStat(row.Rebounds, row._has.Rebounds, formatValue) },
      {
        key: "ReboundsPerGame",
        label: "RPG",
        sortValue: (row) => row.ReboundsPerGame,
        render: (row) => (row.GamesPlayed > 0 && row._has.Rebounds ? formatValue(row.ReboundsPerGame, 1) : "—"),
      },
      { key: "TenReboundGames", label: "10R G", sortValue: (row) => row.TenReboundGames, render: (row) => formatValue(row.TenReboundGames) },
      { key: "Steals", label: "STL", sortValue: (row) => row.Steals, render: (row) => displayStat(row.Steals, row._has.Steals, formatValue) },
      {
        key: "StealsPerGame",
        label: "SPG",
        sortValue: (row) => row.StealsPerGame,
        render: (row) => (row.GamesPlayed > 0 && row._has.Steals ? formatValue(row.StealsPerGame, 1) : "—"),
      },
      { key: "FiveStealGames", label: "5S G", sortValue: (row) => row.FiveStealGames, render: (row) => formatValue(row.FiveStealGames) },
      { key: "Blocks", label: "BLK", sortValue: (row) => row.Blocks, render: (row) => displayStat(row.Blocks, row._has.Blocks, formatValue) },
      {
        key: "BlocksPerGame",
        label: "BPG",
        sortValue: (row) => row.BlocksPerGame,
        render: (row) => (row.GamesPlayed > 0 && row._has.Blocks ? formatValue(row.BlocksPerGame, 1) : "—"),
      },
      { key: "FiveBlockGames", label: "5B G", sortValue: (row) => row.FiveBlockGames, render: (row) => formatValue(row.FiveBlockGames) },
    ],
  },
  milestones: {
    label: "Milestones",
    defaultSort: "DoubleDoubles",
    columns: [
      { key: "GamesPlayed", label: "G", sortValue: (row) => row.GamesPlayed, render: (row) => formatValue(row.GamesPlayed) },
      { key: "DoubleDoubles", label: "DD", sortValue: (row) => row.DoubleDoubles, render: (row) => formatValue(row.DoubleDoubles) },
      { key: "TripleDoubles", label: "TD", sortValue: (row) => row.TripleDoubles, render: (row) => formatValue(row.TripleDoubles) },
      { key: "TwentyPointGames", label: "20P G", sortValue: (row) => row.TwentyPointGames, render: (row) => formatValue(row.TwentyPointGames) },
      { key: "ThirtyPointGames", label: "30P G", sortValue: (row) => row.ThirtyPointGames, render: (row) => formatValue(row.ThirtyPointGames) },
      { key: "FortyPointGames", label: "40P G", sortValue: (row) => row.FortyPointGames, render: (row) => formatValue(row.FortyPointGames) },
      { key: "TenReboundGames", label: "10R G", sortValue: (row) => row.TenReboundGames, render: (row) => formatValue(row.TenReboundGames) },
      { key: "TenAssistGames", label: "10A G", sortValue: (row) => row.TenAssistGames, render: (row) => formatValue(row.TenAssistGames) },
      { key: "FiveStealGames", label: "5S G", sortValue: (row) => row.FiveStealGames, render: (row) => formatValue(row.FiveStealGames) },
      { key: "FiveBlockGames", label: "5B G", sortValue: (row) => row.FiveBlockGames, render: (row) => formatValue(row.FiveBlockGames) },
    ],
  },
};

export default function FullCareerStats() {
  const [careerRows, setCareerRows] = useState([]);
  const [selectedView, setSelectedView] = useState("scoring");
  const [sortField, setSortField] = useState(VIEW_CONFIG.scoring.defaultSort);
  const [sortDirection, setSortDirection] = useState("desc");
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setError("");

        const [statsDataRaw, playersDataRaw, seasonRostersDataRaw, adjustmentsDataRaw, careerAdjustmentsDataRaw] =
          await Promise.all([
            fetchJson("playergamestats.json", "/data/boys/basketball/playergamestats.json"),
            fetchJson("players.json", "/data/boys/players.json"),
            fetchJson("seasonrosters.json", "/data/boys/basketball/seasonrosters.json"),
            fetchJsonOptional("adjustments.json", "/data/boys/basketball/adjustments.json"),
            fetchJsonOptional("careeradjustments.json", "/data/boys/basketball/careeradjustments.json"),
          ]);

        const statsData = Array.isArray(statsDataRaw) ? statsDataRaw : [];
        const playersData = Array.isArray(playersDataRaw) ? playersDataRaw : [];
        const seasonRostersData = Array.isArray(seasonRostersDataRaw) ? seasonRostersDataRaw : [];
        const adjustmentsData = Array.isArray(adjustmentsDataRaw) ? adjustmentsDataRaw : [];
        const careerAdjustmentsData = Array.isArray(careerAdjustmentsDataRaw) ? careerAdjustmentsDataRaw : [];

        const playerMap = new Map(playersData.map((player) => [String(player.PlayerID), player]));
        const totalsMap = new Map();

        for (const player of playersData) {
          if (!player?.PlayerID) continue;
          const playerId = String(player.PlayerID);
          totalsMap.set(playerId, createEmptyTotals(playerId));
        }

        for (const season of seasonRostersData) {
          for (const rosterPlayer of season?.Players || []) {
            if (!rosterPlayer?.PlayerID) continue;
            const playerId = String(rosterPlayer.PlayerID);
            if (!totalsMap.has(playerId)) {
              totalsMap.set(playerId, createEmptyTotals(playerId));
            }
          }
        }

        for (const stat of statsData) {
          const playerId = String(stat?.PlayerID ?? "");
          if (!playerId) continue;

          if (!totalsMap.has(playerId)) {
            totalsMap.set(playerId, createEmptyTotals(playerId));
          }

          const total = totalsMap.get(playerId);

          const played = countsAsPlayerGame(stat);

          if (played) {
            total.GamesPlayed += 1;
          }

          if (hasValue(stat.Points)) {
            total.Points += safeNum(stat.Points);
            markHas(total, "Points");
          }
          if (hasValue(stat.Rebounds)) {
            total.Rebounds += safeNum(stat.Rebounds);
            markHas(total, "Rebounds");
          }
          if (hasValue(stat.Assists)) {
            total.Assists += safeNum(stat.Assists);
            markHas(total, "Assists");
          }
          if (hasValue(stat.Steals)) {
            total.Steals += safeNum(stat.Steals);
            markHas(total, "Steals");
          }
          if (hasValue(stat.Blocks)) {
            total.Blocks += safeNum(stat.Blocks);
            markHas(total, "Blocks");
          }
          if (hasValue(stat.Turnovers)) {
            total.Turnovers += safeNum(stat.Turnovers);
            markHas(total, "Turnovers");
          }
          if (hasValue(stat.TwoPM)) {
            total.TwoPM += safeNum(stat.TwoPM);
            markHas(total, "TwoPM");
          }
          if (hasValue(stat.TwoPA)) {
            total.TwoPA += safeNum(stat.TwoPA);
            markHas(total, "TwoPA");
          }
          if (hasValue(stat.ThreePM)) {
            total.ThreePM += safeNum(stat.ThreePM);
            markHas(total, "ThreePM");
          }
          if (hasValue(stat.ThreePA)) {
            total.ThreePA += safeNum(stat.ThreePA);
            markHas(total, "ThreePA");
          }
          if (hasValue(stat.FTM)) {
            total.FTM += safeNum(stat.FTM);
            markHas(total, "FTM");
          }
          if (hasValue(stat.FTA)) {
            total.FTA += safeNum(stat.FTA);
            markHas(total, "FTA");
          }

          if (safeNum(stat.Points) >= 20) total.TwentyPointGames += 1;
          if (safeNum(stat.Points) >= 30) total.ThirtyPointGames += 1;
          if (safeNum(stat.Points) >= 40) total.FortyPointGames += 1;
          if (safeNum(stat.Rebounds) >= 10) total.TenReboundGames += 1;
          if (safeNum(stat.Assists) >= 10) total.TenAssistGames += 1;
          if (safeNum(stat.Steals) >= 5) total.FiveStealGames += 1;
          if (safeNum(stat.Blocks) >= 5) total.FiveBlockGames += 1;

          const doubleDigitCategories = [
            safeNum(stat.Points),
            safeNum(stat.Rebounds),
            safeNum(stat.Assists),
            safeNum(stat.Steals),
            safeNum(stat.Blocks),
          ].filter((value) => value >= 10).length;

          if (doubleDigitCategories >= 2) total.DoubleDoubles += 1;
          if (doubleDigitCategories >= 3) total.TripleDoubles += 1;
        }

        for (const adjustment of adjustmentsData) {
          const playerId = String(adjustment?.PlayerID ?? "");
          if (!playerId) continue;

          if (!totalsMap.has(playerId)) {
            totalsMap.set(playerId, createEmptyTotals(playerId));
          }

          const total = totalsMap.get(playerId);

          if (hasValue(adjustment.Points)) {
            total.Points += safeNum(adjustment.Points);
            markHas(total, "Points");
          }
          if (hasValue(adjustment.Rebounds)) {
            total.Rebounds += safeNum(adjustment.Rebounds);
            markHas(total, "Rebounds");
          }
          if (hasValue(adjustment.Assists)) {
            total.Assists += safeNum(adjustment.Assists);
            markHas(total, "Assists");
          }
          if (hasValue(adjustment.Steals)) {
            total.Steals += safeNum(adjustment.Steals);
            markHas(total, "Steals");
          }
          if (hasValue(adjustment.Blocks)) {
            total.Blocks += safeNum(adjustment.Blocks);
            markHas(total, "Blocks");
          }
          if (hasValue(adjustment.TwoPM)) {
            total.TwoPM += safeNum(adjustment.TwoPM);
            markHas(total, "TwoPM");
          }
          if (hasValue(adjustment.TwoPA)) {
            total.TwoPA += safeNum(adjustment.TwoPA);
            markHas(total, "TwoPA");
          }
          if (hasValue(adjustment.ThreePM)) {
            total.ThreePM += safeNum(adjustment.ThreePM);
            markHas(total, "ThreePM");
          }
          if (hasValue(adjustment.ThreePA)) {
            total.ThreePA += safeNum(adjustment.ThreePA);
            markHas(total, "ThreePA");
          }
          if (hasValue(adjustment.FTM)) {
            total.FTM += safeNum(adjustment.FTM);
            markHas(total, "FTM");
          }
          if (hasValue(adjustment.FTA)) {
            total.FTA += safeNum(adjustment.FTA);
            markHas(total, "FTA");
          }
        }

        for (const adjustment of careerAdjustmentsData) {
          const playerId = String(adjustment?.PlayerID ?? "");
          if (!playerId) continue;

          if (!totalsMap.has(playerId)) {
            totalsMap.set(playerId, createEmptyTotals(playerId));
          }

          const total = totalsMap.get(playerId);

          if (hasValue(adjustment.Points)) {
            total.Points += safeNum(adjustment.Points);
            markHas(total, "Points");
          }
          if (hasValue(adjustment.Rebounds)) {
            total.Rebounds += safeNum(adjustment.Rebounds);
            markHas(total, "Rebounds");
          }
          if (hasValue(adjustment.Assists)) {
            total.Assists += safeNum(adjustment.Assists);
            markHas(total, "Assists");
          }
          if (hasValue(adjustment.Steals)) {
            total.Steals += safeNum(adjustment.Steals);
            markHas(total, "Steals");
          }
          if (hasValue(adjustment.Blocks)) {
            total.Blocks += safeNum(adjustment.Blocks);
            markHas(total, "Blocks");
          }
          if (hasValue(adjustment.Turnovers)) {
            total.Turnovers += safeNum(adjustment.Turnovers);
            markHas(total, "Turnovers");
          }
          if (hasValue(adjustment.TwoPM)) {
            total.TwoPM += safeNum(adjustment.TwoPM);
            markHas(total, "TwoPM");
          }
          if (hasValue(adjustment.TwoPA)) {
            total.TwoPA += safeNum(adjustment.TwoPA);
            markHas(total, "TwoPA");
          }
          if (hasValue(adjustment.ThreePM)) {
            total.ThreePM += safeNum(adjustment.ThreePM);
            markHas(total, "ThreePM");
          }
          if (hasValue(adjustment.ThreePA)) {
            total.ThreePA += safeNum(adjustment.ThreePA);
            markHas(total, "ThreePA");
          }
          if (hasValue(adjustment.FTM)) {
            total.FTM += safeNum(adjustment.FTM);
            markHas(total, "FTM");
          }
          if (hasValue(adjustment.FTA)) {
            total.FTA += safeNum(adjustment.FTA);
            markHas(total, "FTA");
          }
        }

        const rows = Array.from(totalsMap.values())
          .map((totals) => {
            const player = playerMap.get(String(totals.PlayerID));
            const row = buildDerivedStats(totals);

            return {
              ...row,
              playerId: String(totals.PlayerID),
              playerName: player ? `${player.FirstName} ${player.LastName}` : "Unknown Player",
              gradYear: player?.GradYear ?? null,
              playerImg: player?.PlayerID ? `/images/boys/basketball/players/${player.PlayerID}.jpg` : null,
            };
          })
          .sort((a, b) => a.playerName.localeCompare(b.playerName));

        setCareerRows(rows);
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
    if (!activeColumn) return careerRows;

    return [...careerRows].sort((a, b) => {
      const av = activeColumn.sortValue(a);
      const bv = activeColumn.sortValue(b);
      const aNum = Number.isFinite(av) ? av : Number.NEGATIVE_INFINITY;
      const bNum = Number.isFinite(bv) ? bv : Number.NEGATIVE_INFINITY;

      if (aNum !== bNum) {
        return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
      }

      return a.playerName.localeCompare(b.playerName);
    });
  }, [activeView, careerRows, sortDirection, sortField]);

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
      <h1 className="text-2xl font-bold text-center">Full Career Stats</h1>
      <p className="-mt-1.5 text-center text-sm italic text-gray-600">
        View complete career totals for every St. Andrew&apos;s basketball player in the database
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
              <th className={`${recordTableStyles.headerCell} whitespace-nowrap`}>Player</th>
              <th className={`${recordTableStyles.headerCell} whitespace-nowrap`}>Class</th>
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
                key={row.playerId}
                className={`border-t ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
              >
                <td className={`${recordTableStyles.bodyCell} min-w-[180px]`}>
                  <div className={recordTableStyles.playerWrapStart}>
                    {row.playerImg ? (
                      <img
                        src={row.playerImg}
                        alt={row.playerName}
                        className={recordTableStyles.headshot}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_HEADSHOT;
                        }}
                      />
                    ) : (
                      <img
                        src={FALLBACK_HEADSHOT}
                        alt={row.playerName}
                        className={recordTableStyles.headshot}
                        loading="lazy"
                      />
                    )}

                    <Link
                      to={`/athletics/boys/basketball/players/${row.playerId}`}
                      className="min-w-0 max-w-full whitespace-normal break-words text-left leading-tight hover:underline"
                    >
                      {row.playerName}
                    </Link>
                  </div>
                </td>
                <td className={`${recordTableStyles.bodyCell} whitespace-nowrap`}>{row.gradYear ?? "—"}</td>
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

      <p className="text-center text-xs italic text-gray-500">
        Historical season and career adjustment rows are included in career counting totals where available. Per-game
        and milestone-game columns are based on tracked game logs.
      </p>
    </div>
  );
}
