import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  SOFTBALL_BASE_PATH,
  getSoftballPlayerGameRows,
  getSoftballPlayerTotals,
} from "../softballData";

function formatAverage(hits, atBats) {
  if (!atBats) return "-";
  return (hits / atBats).toFixed(3).replace(/^0(?=\.)/, "");
}

function getPlayerDisplayName(player) {
  return (
    player?.PlayerName ||
    [player?.FirstName, player?.LastName].filter(Boolean).join(" ") ||
    "Unknown Player"
  );
}

function formatGameResult(game) {
  const score =
    game.teamScore == null || game.opponentScore == null
      ? "-"
      : `${game.teamScore}-${game.opponentScore}`;
  const resultLabel =
    game.result === "W" ? "Win" : game.result === "L" ? "Loss" : game.result === "T" ? "Tie" : "";
  return [score, resultLabel].filter(Boolean).join(" ");
}

const STAT_VIEWS = {
  batting: {
    label: "Batting",
    summaryColumns: [
      { key: "G", label: "G", render: (totals) => totals.battingGames },
      { key: "AB", label: "AB", render: (totals) => totals.atBats },
      { key: "H", label: "H", render: (totals) => totals.hits },
      { key: "2B", label: "2B", render: (totals) => totals.doubles },
      { key: "3B", label: "3B", render: (totals) => totals.triples },
      { key: "HR", label: "HR", render: (totals) => totals.homeRuns },
      { key: "RBI", label: "RBI", render: (totals) => totals.rbi },
      { key: "AVG", label: "AVG", render: (totals) => formatAverage(totals.hits, totals.atBats) },
    ],
    logColumns: [
      { key: "date", label: "Date", render: (game) => game.displayDate },
      { key: "opponent", label: "Opponent", render: (game) => game.opponent },
      { key: "result", label: "Result", render: formatGameResult },
      { key: "AB", label: "AB", render: (game) => game.batting?.atBats ?? "-" },
      { key: "H", label: "H", render: (game) => game.batting?.hits ?? "-" },
      { key: "2B", label: "2B", render: (game) => game.batting?.doubles ?? "-" },
      { key: "3B", label: "3B", render: (game) => game.batting?.triples ?? "-" },
      { key: "HR", label: "HR", render: (game) => game.batting?.homeRuns ?? "-" },
      { key: "RBI", label: "RBI", render: (game) => game.batting?.rbi ?? "-" },
      { key: "AVG", label: "AVG", render: (game) => formatAverage(game.batting?.hits, game.batting?.atBats) },
    ],
  },
  pitching: {
    label: "Pitching",
    summaryColumns: [
      { key: "APP", label: "APP", render: (totals) => totals.pitchingAppearances },
      { key: "W", label: "W", render: (totals) => totals.wins },
      { key: "L", label: "L", render: (totals) => totals.losses },
      { key: "SV", label: "SV", render: (totals) => totals.saves },
    ],
    logColumns: [
      { key: "date", label: "Date", render: (game) => game.displayDate },
      { key: "opponent", label: "Opponent", render: (game) => game.opponent },
      { key: "result", label: "Result", render: formatGameResult },
      { key: "APP", label: "APP", render: (game) => game.pitching?.appearances ?? "-" },
      { key: "W", label: "W", render: (game) => game.pitching?.wins ?? "-" },
      { key: "L", label: "L", render: (game) => game.pitching?.losses ?? "-" },
      { key: "SV", label: "SV", render: (game) => game.pitching?.saves ?? "-" },
    ],
  },
};

function emptySeasonTotals() {
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

function addGameToTotals(totals, game) {
  if (game.batting) {
    totals.battingGames += 1;
    totals.atBats += Number(game.batting.atBats || 0);
    totals.hits += Number(game.batting.hits || 0);
    totals.doubles += Number(game.batting.doubles || 0);
    totals.triples += Number(game.batting.triples || 0);
    totals.homeRuns += Number(game.batting.homeRuns || 0);
    totals.rbi += Number(game.batting.rbi || 0);
  }

  if (game.pitching) {
    totals.pitchingAppearances += Number(game.pitching.appearances || 0);
    totals.wins += Number(game.pitching.wins || 0);
    totals.losses += Number(game.pitching.losses || 0);
    totals.saves += Number(game.pitching.saves || 0);
  }
}

function buildSeasonTotals(games) {
  const grouped = new Map();

  games.forEach((game) => {
    const season = String(game.season);
    if (!grouped.has(season)) grouped.set(season, emptySeasonTotals());
    addGameToTotals(grouped.get(season), game);
  });

  return [...grouped.entries()]
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([season, totals]) => ({ season, totals }));
}

export default function PlayerPage() {
  const { playerId } = useParams();
  const [selectedView, setSelectedView] = useState("batting");
  const [masterPlayers, setMasterPlayers] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadPlayers() {
      const res = await fetch("/data/players.json");
      const data = await res.json();
      if (!cancelled) setMasterPlayers(Array.isArray(data) ? data : []);
    }

    loadPlayers();
    return () => {
      cancelled = true;
    };
  }, []);

  const player = useMemo(
    () => masterPlayers.find((record) => String(record.PlayerID) === String(playerId)) || null,
    [masterPlayers, playerId]
  );
  const playerGameRows = useMemo(() => getSoftballPlayerGameRows(playerId), [playerId]);
  const careerTotals = useMemo(() => getSoftballPlayerTotals(playerId), [playerId]);
  const careerTotalsBySeason = useMemo(() => buildSeasonTotals(playerGameRows), [playerGameRows]);

  const gamesBySeason = useMemo(() => {
    const grouped = new Map();
    playerGameRows.forEach((game) => {
      const season = String(game.season);
      if (!grouped.has(season)) grouped.set(season, []);
      grouped.get(season).push(game);
    });
    return [...grouped.entries()].sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [playerGameRows]);

  const activeView = STAT_VIEWS[selectedView];
  const thClass =
    "px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-600 bg-slate-100 border-b border-slate-200 whitespace-nowrap";
  const tdClass =
    "px-2 py-1.5 text-[15px] text-slate-800 text-center border-b border-slate-100 whitespace-nowrap";

  if (!masterPlayers.length) {
    return <div className="max-w-6xl mx-auto px-4 py-8 text-slate-600">Loading player page...</div>;
  }

  if (!player) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-slate-600">
        <h1 className="text-3xl font-bold mb-3 text-black">Player Not Found</h1>
        <Link to={SOFTBALL_BASE_PATH} className="text-blue-700 hover:underline">
          Back to Softball
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
      <section className="mb-10">
        <div className="flex items-center gap-4 md:gap-5">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 p-3">
            <img
              src="/images/girls/softball/softball_icon.svg"
              alt=""
              className="w-full h-full object-contain"
            />
          </div>

          <div className="min-w-0">
            <div className="text-sm text-slate-600 mb-1">
              <Link to={SOFTBALL_BASE_PATH} className="text-blue-700 hover:underline">
                Softball
              </Link>
            </div>
              <h1 className="text-2xl md:text-3xl font-black text-black leading-tight mb-1">
              {getPlayerDisplayName(player)}
            </h1>
            <div className="text-slate-700 text-lg md:text-xl font-medium">
              {player.GradYear ? `Class of ${player.GradYear}` : "Softball"}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl md:text-2xl font-black text-black">Career Totals</h2>
          <div className="flex flex-wrap gap-3 md:justify-end">
            {Object.entries(STAT_VIEWS).map(([key, value]) => {
              const active = selectedView === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedView(key)}
                  className={`px-3 py-1.5 rounded-full border text-sm font-bold transition ${
                    active
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                  }`}
                >
                  {value.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="overflow-x-auto border border-slate-200">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className={thClass}>Season</th>
                {activeView.summaryColumns.map((col) => (
                  <th key={col.key} className={thClass}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {careerTotalsBySeason.map(({ season, totals }, index) => (
                <tr
                  key={season}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50/70"} hover:bg-gray-100`}
                >
                  <td className={`${tdClass} font-semibold`}>
                    <Link
                      to={`${SOFTBALL_BASE_PATH}/seasons/${season}`}
                      className="text-blue-700 hover:underline"
                    >
                      {season}
                    </Link>
                  </td>
                  {activeView.summaryColumns.map((col) => (
                    <td key={col.key} className={tdClass}>{col.render(totals)}</td>
                  ))}
                </tr>
              ))}
              <tr className="bg-slate-100 font-semibold">
                <td className={`${tdClass} font-bold`}>Total</td>
                {activeView.summaryColumns.map((col) => (
                  <td key={col.key} className={`${tdClass} font-bold`}>{col.render(careerTotals)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl md:text-2xl font-black text-black mb-3">Game Logs</h2>

        <div>
          {gamesBySeason.length === 0 ? (
            <div className="text-slate-600">No games found for this player.</div>
          ) : (
            gamesBySeason.map(([season, seasonGames]) => (
              <div key={season} className="mb-8 last:mb-0">
                <div className="text-lg md:text-xl font-black text-black mb-3">
                  {season}
                </div>
                <div className="overflow-x-auto border border-slate-200">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        {activeView.logColumns.map((col) => (
                          <th key={col.key} className={thClass}>{col.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {seasonGames.map((game, index) => (
                        <tr
                          key={game.id}
                          className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50/70"} hover:bg-gray-100`}
                        >
                          {activeView.logColumns.map((col) => {
                            const content = col.render(game);
                            const isOpponentColumn = col.key === "opponent";
                            return (
                              <td key={col.key} className={tdClass}>
                                {isOpponentColumn && !game.isPlaceholder ? (
                                  <Link
                                    to={`${SOFTBALL_BASE_PATH}/games/${game.id}`}
                                    className="text-blue-700 hover:text-blue-900"
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
