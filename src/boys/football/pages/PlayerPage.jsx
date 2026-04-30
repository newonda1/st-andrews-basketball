import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { formatGameDate } from "../footballData";
import { usePreparedFootballRecordsData } from "../footballRecordsData";

import {
  FOOTBALL_DETAIL_VIEW_ENTRIES,
  FOOTBALL_DETAIL_VIEWS,
  footballGamePath,
  formatPlayerWeight,
  formatPositions,
  getPlayerDisplayName,
  getVisibleColumns,
  summarizePlayerProfile,
  trackedGamesColumn,
} from "./footballDetailUtils";

const FOOTBALL_IMAGE_BASE = "/images/boys/football/players";
const FOOTBALL_ICON = "/images/common/football_icon.png";

const NON_AGGREGATE_KEYS = new Set([
  "SeasonID",
  "DisplaySeason",
  "SourceSeasonLabel",
  "SeasonLabel",
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
  "GameType",
  "LocationType",
  "Venue",
  "Notes",
  "GameResultText",
  "TeamScore",
  "OpponentScore",
  "TrackedGames",
  "GamesTracked",
  "TrackedStatGames",
]);

function seasonLabel(row) {
  return String(row?.SeasonLabel || row?.DisplaySeason || row?.SeasonID || "—");
}

function safeSeasonId(row) {
  return Number(row?.SeasonID) || Number(String(row?.GameID || "").slice(0, 4)) || 0;
}

function aggregateRows(rows, meta = {}) {
  const total = {
    ...meta,
    GamesTracked: rows.length,
    TrackedGames: rows.length,
  };

  rows.forEach((row) => {
    Object.entries(row || {}).forEach(([key, value]) => {
      if (NON_AGGREGATE_KEYS.has(key)) return;
      const number = Number(value);
      if (!Number.isFinite(number)) return;
      total[key] = (total[key] || 0) + number;
    });
  });

  return total;
}

function aggregateRowsBySeason(rows) {
  const grouped = new Map();

  rows.forEach((row) => {
    const seasonId = safeSeasonId(row);
    if (!seasonId) return;
    const key = String(seasonId);

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }

    grouped.get(key).push(row);
  });

  return [...grouped.entries()]
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([seasonId, seasonRows]) =>
      aggregateRows(seasonRows, {
        SeasonID: Number(seasonId),
        SeasonLabel: seasonRows[0]?.SeasonLabel || seasonRows[0]?.DisplaySeason || seasonId,
      })
    );
}

function groupGamesBySeason(rows) {
  const grouped = new Map();

  rows.forEach((row) => {
    const seasonId = safeSeasonId(row);
    const key = String(seasonId || "Unknown");
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  });

  return [...grouped.entries()]
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([season, seasonRows]) => [
      seasonRows[0]?.SeasonLabel || season,
      [...seasonRows].sort((a, b) => Number(b?.GameID || 0) - Number(a?.GameID || 0)),
    ]);
}

function profileLine(player) {
  return [
    player.JerseyNumber != null && player.JerseyNumber !== "" ? `#${player.JerseyNumber}` : "",
    player.Grade || "",
    formatPositions(player.Positions) !== "—" ? formatPositions(player.Positions) : "",
  ]
    .filter(Boolean)
    .join(" • ");
}

function StatViewButtons({ selectedView, setSelectedView }) {
  return (
    <div className="flex flex-wrap gap-3 md:justify-end">
      {FOOTBALL_DETAIL_VIEW_ENTRIES.map(([key, value]) => {
        const active = selectedView === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => setSelectedView(key)}
            className={`rounded-full border px-3 py-1.5 text-sm font-bold transition ${
              active
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
            }`}
          >
            {value.label}
          </button>
        );
      })}
    </div>
  );
}

function TotalsTable({ columns, seasonRows, totalRow, emptyText }) {
  const thClass =
    "border-b border-slate-200 bg-slate-100 px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-600 whitespace-nowrap";
  const tdClass =
    "border-b border-slate-100 px-2 py-1.5 text-center text-[15px] text-slate-800 whitespace-nowrap";

  if (!seasonRows.length && !totalRow) {
    return <div className="text-slate-600">{emptyText}</div>;
  }

  return (
    <div className="overflow-x-auto border border-slate-200">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className={thClass}>Season</th>
            {columns.map((column) => (
              <th key={column.key} className={thClass}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {seasonRows.map((row, index) => (
            <tr
              key={row.SeasonID || row.SeasonLabel}
              className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50/70"} hover:bg-gray-100`}
            >
              <td className={`${tdClass} font-semibold`}>
                <Link
                  to={`/athletics/football/seasons/${row.SeasonID}`}
                  className="text-blue-700 hover:text-blue-900"
                >
                  {seasonLabel(row)}
                </Link>
              </td>
              {columns.map((column) => (
                <td key={`${row.SeasonID || row.SeasonLabel}-${column.key}`} className={tdClass}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
          {totalRow ? (
            <tr className="bg-slate-100 font-semibold">
              <td className={`${tdClass} font-bold`}>Total</td>
              {columns.map((column) => (
                <td key={`total-${column.key}`} className={`${tdClass} font-bold`}>
                  {column.render(totalRow)}
                </td>
              ))}
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function EmptyRegionTable({ colSpan }) {
  return (
    <div className="overflow-x-auto border border-slate-200">
      <table className="min-w-full">
        <tbody>
          <tr className="bg-white">
            <td className="border-b border-slate-100 px-2 py-1.5 text-center text-[15px] text-slate-800" colSpan={colSpan}>
              -
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function GameLogs({ columns, gamesBySeason }) {
  const thClass =
    "border-b border-slate-200 bg-slate-100 px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-600 whitespace-nowrap";
  const tdClass =
    "border-b border-slate-100 px-2 py-1.5 text-center text-[15px] text-slate-800 whitespace-nowrap";

  if (!gamesBySeason.length) {
    return <div className="text-slate-600">No games found for this player.</div>;
  }

  return (
    <div>
      {gamesBySeason.map(([season, seasonGames]) => (
        <div key={season} className="mb-8 last:mb-0">
          <div className="mb-3 text-lg font-black text-black md:text-xl">{season}</div>
          <div className="overflow-x-auto border border-slate-200">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className={thClass}>Date</th>
                  <th className={thClass}>Opponent</th>
                  <th className={thClass}>Result</th>
                  {columns.map((column) => (
                    <th key={column.key} className={thClass}>
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {seasonGames.map((game, index) => (
                  <tr
                    key={`${game.PlayerID}-${game.GameID}`}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50/70"} hover:bg-gray-100`}
                  >
                    <td className={tdClass}>{formatGameDate(game)}</td>
                    <td className={tdClass}>
                      <Link
                        to={footballGamePath(game.GameID)}
                        className="text-blue-700 hover:text-blue-900"
                      >
                        {game.Opponent || "—"}
                      </Link>
                    </td>
                    <td className={tdClass}>{game.GameResultText || game.Result || "—"}</td>
                    {columns.map((column) => (
                      <td key={`${game.PlayerID}-${game.GameID}-${column.key}`} className={tdClass}>
                        {column.render(game)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PlayerPage() {
  const { playerId } = useParams();
  const { data, error } = usePreparedFootballRecordsData();
  const [selectedView, setSelectedView] = useState("offense");
  const [imageError, setImageError] = useState(false);

  const profile = useMemo(
    () => (data ? summarizePlayerProfile(data, playerId) : null),
    [data, playerId]
  );

  const activeView = FOOTBALL_DETAIL_VIEWS[selectedView] || FOOTBALL_DETAIL_VIEWS.offense;
  const statColumns = activeView.columns;
  const seasonRows = profile?.seasonTotals || [];
  const gameRows = profile?.gameRows || [];
  const careerTotal = profile?.careerTotal || null;

  const careerTotalsBySeason = useMemo(
    () => [...seasonRows].sort((a, b) => Number(a?.SeasonID || 0) - Number(b?.SeasonID || 0)),
    [seasonRows]
  );
  const regionGameRows = useMemo(
    () => gameRows.filter((row) => String(row?.GameType || "").toLowerCase() === "region"),
    [gameRows]
  );
  const regionTotalsBySeason = useMemo(
    () => aggregateRowsBySeason(regionGameRows),
    [regionGameRows]
  );
  const regionTotal = useMemo(
    () => (regionGameRows.length ? aggregateRows(regionGameRows) : null),
    [regionGameRows]
  );

  const totalColumns = useMemo(() => {
    const visible = getVisibleColumns(
      [...careerTotalsBySeason, careerTotal, ...regionTotalsBySeason, regionTotal].filter(Boolean),
      statColumns,
      { includeAllWhenEmpty: true }
    );
    return [trackedGamesColumn, ...visible];
  }, [careerTotal, careerTotalsBySeason, regionTotal, regionTotalsBySeason, statColumns]);

  const gameColumns = useMemo(
    () => getVisibleColumns(gameRows, statColumns, { includeAllWhenEmpty: true }),
    [gameRows, statColumns]
  );
  const gamesBySeason = useMemo(() => groupGamesBySeason(gameRows), [gameRows]);

  if (!data && !error) {
    return <div className="mx-auto max-w-6xl px-4 py-8 text-slate-600">Loading player page...</div>;
  }

  if (error) {
    return <div className="mx-auto max-w-6xl px-4 py-8 text-red-700">{error}</div>;
  }

  if (!profile?.player) {
    return <div className="mx-auto max-w-6xl px-4 py-8 text-slate-600">Player not found.</div>;
  }

  const player = profile.player;
  const playerName = getPlayerDisplayName(player);
  const photoSrc = `${FOOTBALL_IMAGE_BASE}/${player.PlayerID}.jpg`;
  const latestSeasonId = player.SeasonID || seasonRows[0]?.SeasonID;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <section className="mb-10">
        <div className="flex items-center gap-4 md:gap-5">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 md:h-24 md:w-24">
            {!imageError ? (
              <img
                src={photoSrc}
                alt={playerName}
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-4">
                <img src={FOOTBALL_ICON} alt="" className="h-full w-full object-contain opacity-60" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h1 className="mb-1 text-2xl font-black leading-tight text-black md:text-3xl">
              {playerName}
            </h1>
            <div className="text-lg font-medium text-slate-700 md:text-xl">
              {profileLine(player) || "Football"}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-600">
              {latestSeasonId ? (
                <Link
                  to={`/athletics/football/seasons/${latestSeasonId}`}
                  className="font-semibold text-blue-700 hover:text-blue-900"
                >
                  {player.SeasonLabel || seasonRows[0]?.SeasonLabel || latestSeasonId} season
                </Link>
              ) : null}
              {player.Height ? <span>{player.Height}</span> : null}
              {formatPlayerWeight(player.Weight) !== "—" ? <span>{formatPlayerWeight(player.Weight)}</span> : null}
              {player.Captain ? <span>Captain</span> : null}
              {player.CanonicalUrl ? (
                <a
                  href={player.CanonicalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-blue-700 hover:text-blue-900"
                >
                  MaxPreps athlete page
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-black text-black md:text-2xl">Career Totals</h2>
          <StatViewButtons selectedView={selectedView} setSelectedView={setSelectedView} />
        </div>
        <TotalsTable
          columns={totalColumns}
          seasonRows={careerTotalsBySeason}
          totalRow={careerTotal}
          emptyText="No tracked career totals are available for this player."
        />
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-black text-black md:text-2xl">Region Game Totals</h2>
        {regionTotalsBySeason.length ? (
          <TotalsTable
            columns={totalColumns}
            seasonRows={regionTotalsBySeason}
            totalRow={regionTotal}
            emptyText="No region game totals are available for this player."
          />
        ) : (
          <EmptyRegionTable colSpan={totalColumns.length + 1} />
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-black text-black md:text-2xl">Game Logs</h2>
        <GameLogs columns={gameColumns} gamesBySeason={gamesBySeason} />
      </section>
    </div>
  );
}
