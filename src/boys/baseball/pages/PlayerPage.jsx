

import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

const DATA_BASE = "/data/boys/baseball";
const IMAGE_BASE = "/images/boys/baseball/players";

function safeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function oneDecimal(value) {
  return Number.isFinite(value) ? value.toFixed(1) : "-";
}

function formatPct(value) {
  if (!Number.isFinite(value)) return "-";
  return value.toFixed(3).replace(/^0(?=\.)/, "");
}

function formatEraWhip(value) {
  return Number.isFinite(value) ? value.toFixed(2) : "-";
}

function formatSeasonLabel(season) {
  return String(season ?? "");
}

function formatDateFromGameId(gameId) {
  const raw = String(gameId || "").slice(0, 8);
  if (raw.length !== 8) return "-";
  const yyyy = raw.slice(0, 4);
  const mm = raw.slice(4, 6);
  const dd = raw.slice(6, 8);
  const date = new Date(`${yyyy}-${mm}-${dd}T12:00:00`);
  if (Number.isNaN(date.getTime())) return `${mm}/${dd}/${yyyy}`;
  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

function baseballInningsToOuts(value) {
  const innings = safeNumber(value);
  const whole = Math.trunc(innings);
  const decimal = Math.round((innings - whole) * 10);
  return whole * 3 + decimal;
}

function outsToBaseballInnings(outs) {
  const safeOuts = safeNumber(outs);
  const whole = Math.floor(safeOuts / 3);
  const remainder = safeOuts % 3;
  return Number(`${whole}.${remainder}`);
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
  const outs = stats.IPOuts;
  return outs > 0 ? (stats.ER * 21) / outs : NaN;
}

function pitchingWhip(stats) {
  const outs = stats.IPOuts;
  return outs > 0 ? ((stats.H_Allowed + stats.BB_Allowed) * 3) / outs : NaN;
}

function emptyTotals() {
  return {
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
    SB: 0,
    CS: 0,
    TB: 0,
    ROE: 0,
    FC: 0,
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
    Games: 0,
  };
}

function addStats(total, row) {
  total.PA += safeNumber(row.PA);
  total.AB += safeNumber(row.AB);
  total.R += safeNumber(row.R);
  total.H += safeNumber(row.H);
  total["1B"] += safeNumber(row["1B"]);
  total["2B"] += safeNumber(row["2B"]);
  total["3B"] += safeNumber(row["3B"]);
  total.HR += safeNumber(row.HR);
  total.RBI += safeNumber(row.RBI);
  total.BB += safeNumber(row.BB);
  total.SO += safeNumber(row.SO);
  total.HBP += safeNumber(row.HBP);
  total.SAC += safeNumber(row.SAC);
  total.SF += safeNumber(row.SF);
  total.SB += safeNumber(row.SB);
  total.CS += safeNumber(row.CS);
  total.TB += safeNumber(row.TB);
  total.ROE += safeNumber(row.ROE);
  total.FC += safeNumber(row.FC);
  total.IPOuts += baseballInningsToOuts(row.IP);
  total.BF += safeNumber(row.BF);
  total.Pitches += safeNumber(row.Pitches);
  total.W += safeNumber(row.W);
  total.L += safeNumber(row.L);
  total.SV += safeNumber(row.SV);
  total.SVO += safeNumber(row.SVO);
  total.BS += safeNumber(row.BS);
  total.H_Allowed += safeNumber(row.H_Allowed);
  total.R_Allowed += safeNumber(row.R_Allowed);
  total.ER += safeNumber(row.ER);
  total.BB_Allowed += safeNumber(row.BB_Allowed);
  total.SO_Pitching += safeNumber(row.SO_Pitching);
  total.HBP_Pitching += safeNumber(row.HBP_Pitching);
  total.BK += safeNumber(row.BK);
  total.PIK_Allowed += safeNumber(row.PIK_Allowed);
  total.CS_Pitching += safeNumber(row.CS_Pitching);
  total.SB_Allowed += safeNumber(row.SB_Allowed);
  total.WP += safeNumber(row.WP);
  total.A += safeNumber(row.A);
  total.PO += safeNumber(row.PO);
  total.E += safeNumber(row.E);
  total.DP += safeNumber(row.DP);
  total.TP += safeNumber(row.TP);
  total.PB += safeNumber(row.PB);
  total.PIK_Fielding += safeNumber(row.PIK_Fielding);
  total.CI += safeNumber(row.CI);
  total.P_Innings += safeNumber(row.P_Innings);
  total.C_Innings += safeNumber(row.C_Innings);
  total["1B_Innings"] += safeNumber(row["1B_Innings"]);
  total["2B_Innings"] += safeNumber(row["2B_Innings"]);
  total["3B_Innings"] += safeNumber(row["3B_Innings"]);
  total.SS_Innings += safeNumber(row.SS_Innings);
  total.LF_Innings += safeNumber(row.LF_Innings);
  total.CF_Innings += safeNumber(row.CF_Innings);
  total.RF_Innings += safeNumber(row.RF_Innings);
  total.SF_Innings += safeNumber(row.SF_Innings);
}

const STAT_VIEWS = {
  batting: {
    label: "Batting",
    summaryColumns: [
      { key: "Games", label: "G", render: (s) => s.Games },
      { key: "PA", label: "PA", render: (s) => s.PA },
      { key: "AB", label: "AB", render: (s) => s.AB },
      { key: "R", label: "R", render: (s) => s.R },
      { key: "H", label: "H", render: (s) => s.H },
      { key: "2B", label: "2B", render: (s) => s["2B"] },
      { key: "3B", label: "3B", render: (s) => s["3B"] },
      { key: "HR", label: "HR", render: (s) => s.HR },
      { key: "RBI", label: "RBI", render: (s) => s.RBI },
      { key: "BB", label: "BB", render: (s) => s.BB },
      { key: "SO", label: "SO", render: (s) => s.SO },
      { key: "SB", label: "SB", render: (s) => s.SB },
      { key: "AVG", label: "AVG", render: (s) => formatPct(battingAverage(s)) },
      { key: "OBP", label: "OBP", render: (s) => formatPct(onBasePercentage(s)) },
      { key: "SLG", label: "SLG", render: (s) => formatPct(sluggingPercentage(s)) },
    ],
    logColumns: [
      { key: "date", label: "Date", render: (g) => formatDateFromGameId(g.GameID) },
      { key: "opponent", label: "Opponent", render: (g) => g.Opponent },
      { key: "result", label: "Result", render: (g) => `${g.TeamScore}-${g.OpponentScore} ${g.Result === "W" ? "Win" : "Loss"}` },
      { key: "PA", label: "PA", render: (g) => g.stats.PA },
      { key: "AB", label: "AB", render: (g) => g.stats.AB },
      { key: "R", label: "R", render: (g) => g.stats.R },
      { key: "H", label: "H", render: (g) => g.stats.H },
      { key: "2B", label: "2B", render: (g) => g.stats["2B"] },
      { key: "3B", label: "3B", render: (g) => g.stats["3B"] },
      { key: "HR", label: "HR", render: (g) => g.stats.HR },
      { key: "RBI", label: "RBI", render: (g) => g.stats.RBI },
      { key: "BB", label: "BB", render: (g) => g.stats.BB },
      { key: "SO", label: "SO", render: (g) => g.stats.SO },
      { key: "SB", label: "SB", render: (g) => g.stats.SB },
    ],
  },
  fielding: {
    label: "Fielding",
    summaryColumns: [
      { key: "Games", label: "G", render: (s) => s.Games },
      { key: "INN", label: "INN", render: (s) => oneDecimal(s.P_Innings + s.C_Innings + s["1B_Innings"] + s["2B_Innings"] + s["3B_Innings"] + s.SS_Innings + s.LF_Innings + s.CF_Innings + s.RF_Innings + s.SF_Innings) },
      { key: "PO", label: "PO", render: (s) => s.PO },
      { key: "A", label: "A", render: (s) => s.A },
      { key: "E", label: "E", render: (s) => s.E },
      { key: "TC", label: "TC", render: (s) => s.PO + s.A + s.E },
      { key: "DP", label: "DP", render: (s) => s.DP },
      { key: "PB", label: "PB", render: (s) => s.PB },
      { key: "FLDPCT", label: "FLD%", render: (s) => formatPct(fieldingPct(s)) },
    ],
    logColumns: [
      { key: "date", label: "Date", render: (g) => formatDateFromGameId(g.GameID) },
      { key: "opponent", label: "Opponent", render: (g) => g.Opponent },
      { key: "result", label: "Result", render: (g) => `${g.TeamScore}-${g.OpponentScore} ${g.Result === "W" ? "Win" : "Loss"}` },
      { key: "PO", label: "PO", render: (g) => g.stats.PO },
      { key: "A", label: "A", render: (g) => g.stats.A },
      { key: "E", label: "E", render: (g) => g.stats.E },
      { key: "TC", label: "TC", render: (g) => g.stats.PO + g.stats.A + g.stats.E },
      { key: "DP", label: "DP", render: (g) => g.stats.DP },
      { key: "PB", label: "PB", render: (g) => g.stats.PB },
      { key: "FLDPCT", label: "FLD%", render: (g) => formatPct(fieldingPct(g.stats)) },
    ],
  },
  pitching: {
    label: "Pitching",
    summaryColumns: [
      { key: "Games", label: "G", render: (s) => s.Games },
      { key: "IP", label: "IP", render: (s) => outsToBaseballInnings(s.IPOuts) },
      { key: "W", label: "W", render: (s) => s.W },
      { key: "L", label: "L", render: (s) => s.L },
      { key: "SV", label: "SV", render: (s) => s.SV },
      { key: "H", label: "H", render: (s) => s.H_Allowed },
      { key: "R", label: "R", render: (s) => s.R_Allowed },
      { key: "ER", label: "ER", render: (s) => s.ER },
      { key: "BB", label: "BB", render: (s) => s.BB_Allowed },
      { key: "SO", label: "SO", render: (s) => s.SO_Pitching },
      { key: "ERA", label: "ERA", render: (s) => formatEraWhip(pitchingEra(s)) },
      { key: "WHIP", label: "WHIP", render: (s) => formatEraWhip(pitchingWhip(s)) },
    ],
    logColumns: [
      { key: "date", label: "Date", render: (g) => formatDateFromGameId(g.GameID) },
      { key: "opponent", label: "Opponent", render: (g) => g.Opponent },
      { key: "result", label: "Result", render: (g) => `${g.TeamScore}-${g.OpponentScore} ${g.Result === "W" ? "Win" : "Loss"}` },
      { key: "IP", label: "IP", render: (g) => g.stats.IP },
      { key: "W", label: "W", render: (g) => g.stats.W },
      { key: "L", label: "L", render: (g) => g.stats.L },
      { key: "SV", label: "SV", render: (g) => g.stats.SV },
      { key: "H", label: "H", render: (g) => g.stats.H_Allowed },
      { key: "R", label: "R", render: (g) => g.stats.R_Allowed },
      { key: "ER", label: "ER", render: (g) => g.stats.ER },
      { key: "BB", label: "BB", render: (g) => g.stats.BB_Allowed },
      { key: "SO", label: "SO", render: (g) => g.stats.SO_Pitching },
      { key: "ERA", label: "ERA", render: (g) => formatEraWhip(pitchingEra({ ...g.stats, IPOuts: baseballInningsToOuts(g.stats.IP) })) },
      { key: "WHIP", label: "WHIP", render: (g) => formatEraWhip(pitchingWhip({ ...g.stats, IPOuts: baseballInningsToOuts(g.stats.IP) })) },
    ],
  },
};

function PlayerPage() {
  const { playerId } = useParams();
  const numericPlayerId = Number(playerId);

  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [seasonRosters, setSeasonRosters] = useState([]);
  const [selectedView, setSelectedView] = useState("batting");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [playersRes, gamesRes, statsRes, rostersRes] = await Promise.all([
          fetch(`/data/boys/players.json`),
          fetch(`${DATA_BASE}/games.json`),
          fetch(`${DATA_BASE}/playergamestats.json`),
          fetch(`${DATA_BASE}/seasonrosters.json`),
        ]);

        if (!playersRes.ok || !gamesRes.ok || !statsRes.ok || !rostersRes.ok) {
          throw new Error("Unable to load player page data.");
        }

        const [playersData, gamesData, statsData, rostersData] = await Promise.all([
          playersRes.json(),
          gamesRes.json(),
          statsRes.json(),
          rostersRes.json(),
        ]);

        if (!cancelled) {
          setPlayers(Array.isArray(playersData) ? playersData : []);
          setGames(Array.isArray(gamesData) ? gamesData : []);
          setPlayerStats(Array.isArray(statsData) ? statsData : []);
          setSeasonRosters(Array.isArray(rostersData) ? rostersData : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load player page.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const player = useMemo(
    () => players.find((p) => Number(p.PlayerID) === numericPlayerId) || null,
    [players, numericPlayerId]
  );

  const playerGameRows = useMemo(() => {
    return playerStats
      .filter((row) => Number(row.PlayerID) === numericPlayerId)
      .map((row) => {
        const game = games.find((g) => Number(g.GameID) === Number(row.GameID));
        return game ? { ...game, stats: row } : null;
      })
      .filter(Boolean)
      .sort((a, b) => Number(b.GameID) - Number(a.GameID));
  }, [playerStats, games, numericPlayerId]);

  const currentJersey = useMemo(() => {
    const sortedRosters = [...seasonRosters].sort((a, b) => {
      const aYear = Number(String(a.SeasonID || "").slice(0, 4));
      const bYear = Number(String(b.SeasonID || "").slice(0, 4));
      return bYear - aYear;
    });

    for (const roster of sortedRosters) {
      const match = (roster.Players || []).find(
        (p) => Number(p.PlayerID) === numericPlayerId
      );
      if (match) return match.JerseyNumber;
    }
    return null;
  }, [seasonRosters, numericPlayerId]);

  const careerTotals = useMemo(() => {
    const totals = emptyTotals();
    playerGameRows.forEach((game) => {
      addStats(totals, game.stats);
      totals.Games += 1;
    });
    return totals;
  }, [playerGameRows]);

  const regionTotals = useMemo(() => {
    const totals = emptyTotals();
    playerGameRows
      .filter((game) => game.GameType === "Region")
      .forEach((game) => {
        addStats(totals, game.stats);
        totals.Games += 1;
      });
    return totals;
  }, [playerGameRows]);

  const gamesBySeason = useMemo(() => {
    const grouped = new Map();

    playerGameRows.forEach((game) => {
      const key = formatSeasonLabel(game.Season);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(game);
    });

    return [...grouped.entries()].sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [playerGameRows]);

  const photoSrc = `${IMAGE_BASE}/${numericPlayerId}.jpg`;
  const activeView = STAT_VIEWS[selectedView];

  const cardClass =
    "rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden";
  const tableWrapClass = "overflow-x-auto";
  const thClass =
    "px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600 bg-slate-100 border-b border-slate-200 whitespace-nowrap";
  const tdClass =
    "px-3 py-3 text-sm text-slate-800 border-b border-slate-100 whitespace-nowrap";

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-8 text-slate-600">Loading player page...</div>;
  }

  if (error) {
    return <div className="max-w-6xl mx-auto px-4 py-8 text-red-700">{error}</div>;
  }

  if (!player) {
    return <div className="max-w-6xl mx-auto px-4 py-8 text-slate-600">Player not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6">
        <div className="text-sm text-slate-500">
          <Link to="/athletics/boys/baseball" className="hover:text-slate-800">
            Boys' Baseball
          </Link>
          <span className="mx-2">/</span>
          <span>{player.FirstName} {player.LastName}</span>
        </div>

        <section className={`${cardClass}`}>
          <div className="p-5 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
              {!imageError ? (
                <img
                  src={photoSrc}
                  alt={`${player.FirstName} ${player.LastName}`}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-semibold">
                  No Image
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                  {player.FirstName} {player.LastName}
                </h1>
                {currentJersey != null ? (
                  <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-800 px-3 py-1 text-sm font-bold border border-blue-100">
                    #{currentJersey}
                  </span>
                ) : null}
              </div>

              <div className="text-slate-600 text-base md:text-lg font-medium">
                Class of {player.GradYear ?? "-"}
              </div>
            </div>
          </div>
        </section>

        <section className={`${cardClass}`}>
          <div className="p-4 md:p-5 border-b border-slate-200">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-4">Stat View</h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(STAT_VIEWS).map(([key, value]) => {
                const active = selectedView === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedView(key)}
                    className={`px-4 py-2 rounded-full border text-sm font-bold transition ${
                      active
                        ? "bg-blue-700 text-white border-blue-700"
                        : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                    }`}
                  >
                    {value.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className={`${cardClass}`}>
          <div className="p-4 md:p-5 border-b border-slate-200">
            <h2 className="text-xl md:text-2xl font-black text-slate-900">Career Totals</h2>
          </div>
          <div className={tableWrapClass}>
            <table className="min-w-full">
              <thead>
                <tr>
                  {activeView.summaryColumns.map((col) => (
                    <th key={col.key} className={thClass}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {activeView.summaryColumns.map((col) => (
                    <td key={col.key} className={tdClass}>{col.render(careerTotals)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={`${cardClass}`}>
          <div className="p-4 md:p-5 border-b border-slate-200">
            <h2 className="text-xl md:text-2xl font-black text-slate-900">Region Game Totals</h2>
          </div>
          <div className={tableWrapClass}>
            <table className="min-w-full">
              <thead>
                <tr>
                  {activeView.summaryColumns.map((col) => (
                    <th key={col.key} className={thClass}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {activeView.summaryColumns.map((col) => (
                    <td key={col.key} className={tdClass}>{col.render(regionTotals)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={`${cardClass}`}>
          <div className="p-4 md:p-5 border-b border-slate-200">
            <h2 className="text-xl md:text-2xl font-black text-slate-900">Game Logs</h2>
          </div>

          <div className="divide-y divide-slate-200">
            {gamesBySeason.length === 0 ? (
              <div className="p-5 text-slate-600">No games found for this player.</div>
            ) : (
              gamesBySeason.map(([season, seasonGames]) => (
                <div key={season}>
                  <div className="px-4 md:px-5 py-4 bg-slate-50 border-b border-slate-200 text-lg font-black text-slate-900">
                    {season}
                  </div>
                  <div className={tableWrapClass}>
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          {activeView.logColumns.map((col) => (
                            <th key={col.key} className={thClass}>{col.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {seasonGames.map((game) => (
                          <tr key={game.GameID}>
                            {activeView.logColumns.map((col) => {
                              const content = col.render(game);
                              const isOpponentColumn = col.key === "opponent";
                              return (
                                <td key={col.key} className={tdClass}>
                                  {isOpponentColumn ? (
                                    <Link
                                      to={`/athletics/boys/baseball/games/${game.GameID}`}
                                      className="text-blue-700 hover:text-blue-900 font-semibold"
                                    >
                                      {content}
                                    </Link>
                                  ) : (
                                    content
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
  );
}

export default PlayerPage;