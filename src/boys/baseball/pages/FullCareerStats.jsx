import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { recordTableStyles } from "./recordTableStyles";

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

function totalFieldingInnings(stats) {
  return (
    stats.P_Innings +
    stats.C_Innings +
    stats["1B_Innings"] +
    stats["2B_Innings"] +
    stats["3B_Innings"] +
    stats.SS_Innings +
    stats.LF_Innings +
    stats.CF_Innings +
    stats.RF_Innings +
    stats.SF_Innings
  );
}

function createEmptyTotals(playerId) {
  return {
    PlayerID: playerId,
    GamesPlayed: 0,
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
    SF_Innings: 0,
  };
}

function accumulateStats(total, row) {
  total.GamesPlayed += 1;
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
  total.P_Innings += safeNum(row.P_Innings);
  total.C_Innings += safeNum(row.C_Innings);
  total["1B_Innings"] += safeNum(row["1B_Innings"]);
  total["2B_Innings"] += safeNum(row["2B_Innings"]);
  total["3B_Innings"] += safeNum(row["3B_Innings"]);
  total.SS_Innings += safeNum(row.SS_Innings);
  total.LF_Innings += safeNum(row.LF_Innings);
  total.CF_Innings += safeNum(row.CF_Innings);
  total.RF_Innings += safeNum(row.RF_Innings);
  total.SF_Innings += safeNum(row.SF_Innings);
}

const FALLBACK_HEADSHOT = "/images/common/logo.png";

const VIEW_CONFIG = {
  batting: {
    label: "Batting",
    defaultSort: "H",
    columns: [
      { key: "GamesPlayed", label: "G", sortValue: (row) => row.GamesPlayed, render: (row) => formatValue(row.GamesPlayed) },
      { key: "PA", label: "PA", sortValue: (row) => row.PA, render: (row) => formatValue(row.PA) },
      { key: "AB", label: "AB", sortValue: (row) => row.AB, render: (row) => formatValue(row.AB) },
      { key: "R", label: "R", sortValue: (row) => row.R, render: (row) => formatValue(row.R) },
      { key: "H", label: "H", sortValue: (row) => row.H, render: (row) => formatValue(row.H) },
      { key: "2B", label: "2B", sortValue: (row) => row["2B"], render: (row) => formatValue(row["2B"]) },
      { key: "3B", label: "3B", sortValue: (row) => row["3B"], render: (row) => formatValue(row["3B"]) },
      { key: "HR", label: "HR", sortValue: (row) => row.HR, render: (row) => formatValue(row.HR) },
      { key: "RBI", label: "RBI", sortValue: (row) => row.RBI, render: (row) => formatValue(row.RBI) },
      { key: "BB", label: "BB", sortValue: (row) => row.BB, render: (row) => formatValue(row.BB) },
      { key: "SO", label: "SO", sortValue: (row) => row.SO, render: (row) => formatValue(row.SO) },
      { key: "SB", label: "SB", sortValue: (row) => row.SB, render: (row) => formatValue(row.SB) },
      { key: "AVG", label: "AVG", sortValue: (row) => battingAverage(row), render: (row) => formatPct(battingAverage(row)) },
      { key: "OBP", label: "OBP", sortValue: (row) => onBasePercentage(row), render: (row) => formatPct(onBasePercentage(row)) },
      { key: "SLG", label: "SLG", sortValue: (row) => sluggingPercentage(row), render: (row) => formatPct(sluggingPercentage(row)) },
    ],
  },
  pitching: {
    label: "Pitching",
    defaultSort: "IP",
    columns: [
      { key: "GamesPlayed", label: "G", sortValue: (row) => row.GamesPlayed, render: (row) => formatValue(row.GamesPlayed) },
      { key: "IP", label: "IP", sortValue: (row) => row.IPOuts, render: (row) => formatValue(outsToBaseballInnings(row.IPOuts), 1) },
      { key: "W", label: "W", sortValue: (row) => row.W, render: (row) => formatValue(row.W) },
      { key: "L", label: "L", sortValue: (row) => row.L, render: (row) => formatValue(row.L) },
      { key: "SV", label: "SV", sortValue: (row) => row.SV, render: (row) => formatValue(row.SV) },
      { key: "BF", label: "BF", sortValue: (row) => row.BF, render: (row) => formatValue(row.BF) },
      { key: "H_Allowed", label: "H", sortValue: (row) => row.H_Allowed, render: (row) => formatValue(row.H_Allowed) },
      { key: "R_Allowed", label: "R", sortValue: (row) => row.R_Allowed, render: (row) => formatValue(row.R_Allowed) },
      { key: "ER", label: "ER", sortValue: (row) => row.ER, render: (row) => formatValue(row.ER) },
      { key: "BB_Allowed", label: "BB", sortValue: (row) => row.BB_Allowed, render: (row) => formatValue(row.BB_Allowed) },
      { key: "SO_Pitching", label: "SO", sortValue: (row) => row.SO_Pitching, render: (row) => formatValue(row.SO_Pitching) },
      { key: "ERA", label: "ERA", sortValue: (row) => pitchingEra(row), render: (row) => formatEraWhip(pitchingEra(row)) },
      { key: "WHIP", label: "WHIP", sortValue: (row) => pitchingWhip(row), render: (row) => formatEraWhip(pitchingWhip(row)) },
    ],
  },
  fielding: {
    label: "Fielding",
    defaultSort: "PO",
    columns: [
      { key: "GamesPlayed", label: "G", sortValue: (row) => row.GamesPlayed, render: (row) => formatValue(row.GamesPlayed) },
      { key: "INN", label: "INN", sortValue: (row) => totalFieldingInnings(row), render: (row) => formatValue(totalFieldingInnings(row), 1) },
      { key: "PO", label: "PO", sortValue: (row) => row.PO, render: (row) => formatValue(row.PO) },
      { key: "A", label: "A", sortValue: (row) => row.A, render: (row) => formatValue(row.A) },
      { key: "E", label: "E", sortValue: (row) => row.E, render: (row) => formatValue(row.E) },
      { key: "TC", label: "TC", sortValue: (row) => row.PO + row.A + row.E, render: (row) => formatValue(row.PO + row.A + row.E) },
      { key: "DP", label: "DP", sortValue: (row) => row.DP, render: (row) => formatValue(row.DP) },
      { key: "PB", label: "PB", sortValue: (row) => row.PB, render: (row) => formatValue(row.PB) },
      { key: "FLDPCT", label: "FLD%", sortValue: (row) => fieldingPct(row), render: (row) => formatPct(fieldingPct(row)) },
    ],
  },
};

export default function FullCareerStats() {
  const [careerRows, setCareerRows] = useState([]);
  const [selectedView, setSelectedView] = useState("batting");
  const [sortField, setSortField] = useState(VIEW_CONFIG.batting.defaultSort);
  const [sortDirection, setSortDirection] = useState("desc");
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setError("");

        const [playerStatsDataRaw, playersDataRaw, seasonRostersDataRaw] = await Promise.all([
          fetchJson("playergamestats.json", "/data/boys/baseball/playergamestats.json"),
          fetchJson("players.json", "/data/boys/players.json"),
          fetchJson("seasonrosters.json", "/data/boys/baseball/seasonrosters.json"),
        ]);

        const playerStatsData = Array.isArray(playerStatsDataRaw) ? playerStatsDataRaw : [];
        const playersData = Array.isArray(playersDataRaw) ? playersDataRaw : [];
        const seasonRostersData = Array.isArray(seasonRostersDataRaw) ? seasonRostersDataRaw : [];

        const playerMap = new Map(playersData.map((player) => [String(player.PlayerID), player]));
        const totalsMap = new Map();

        for (const row of playerStatsData) {
          if (!row?.PlayerID) continue;

          const playerId = String(row.PlayerID);
          if (!totalsMap.has(playerId)) {
            totalsMap.set(playerId, createEmptyTotals(playerId));
          }

          accumulateStats(totalsMap.get(playerId), row);
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

        const rows = Array.from(totalsMap.values())
          .map((totals) => {
            const player = playerMap.get(String(totals.PlayerID));
            return {
              ...totals,
              playerId: String(totals.PlayerID),
              playerName: player ? `${player.FirstName} ${player.LastName}` : "Unknown Player",
              gradYear: player?.GradYear ?? null,
              playerImg: player?.PlayerID ? `/images/boys/baseball/players/${player.PlayerID}.jpg` : null,
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
        View complete career totals for every St. Andrew&apos;s baseball player in the database
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
                      to={`/athletics/boys/baseball/players/${row.playerId}`}
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
    </div>
  );
}
