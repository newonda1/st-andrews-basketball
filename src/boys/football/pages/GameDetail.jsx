import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { recordTableStyles } from "../../basketball/pages/recordTableStyles";
import { formatGameDate, formatSeasonLabel } from "../footballData";
import {
  formatDecimal,
  formatWhole,
  totalOffenseYards,
  usePreparedFootballRecordsData,
} from "../footballRecordsData";

import {
  FOOTBALL_DETAIL_VIEW_ENTRIES,
  FOOTBALL_DETAIL_VIEWS,
  footballPlayerPath,
  formatTeamScore,
  getVisibleColumns,
  getVisibleRowsForColumns,
} from "./footballDetailUtils";

function rawWhole(row, key) {
  const value = row?.[key];
  return Number.isFinite(Number(value)) ? formatWhole(Number(value)) : "—";
}

function rawDecimal(row, key) {
  const value = row?.[key];
  return Number.isFinite(Number(value)) ? formatDecimal(Number(value), 1) : "—";
}

function resultClass(result) {
  const normalized = String(result || "").toUpperCase();
  if (normalized === "W") return "text-emerald-700";
  if (normalized === "L") return "text-rose-700";
  return "text-slate-700";
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-bold text-slate-900">{value || "—"}</div>
    </div>
  );
}

function getYouTubeEmbedUrl(videoUrl) {
  const match = String(videoUrl || "").match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );

  return match ? `https://www.youtube.com/embed/${match[1]}` : "";
}

function GameVideo({ game }) {
  const embedUrl = getYouTubeEmbedUrl(game?.VideoUrl);

  if (!embedUrl) return null;

  const title =
    String(game?.VideoTitle || "").trim() ||
    `Game video: St. Andrew's vs. ${game?.Opponent || "opponent"}`;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-slate-950">Game Video</h2>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-black shadow-sm">
        <iframe
          className="block aspect-video w-full border-0"
          src={embedUrl}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </section>
  );
}

function TeamStatTable({ title, columns, row }) {
  if (!columns.length) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[360px] border-collapse text-sm">
          <tbody>
            {columns.map((column) => (
              <tr key={`${title}-${column.key}`} className="odd:bg-white even:bg-slate-50">
                <td className="border-b border-slate-200 px-3 py-2 font-semibold text-slate-600">
                  {column.label}
                </td>
                <td className="border-b border-slate-200 px-3 py-2 text-right font-semibold text-slate-900">
                  {column.render(row)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeamTotals({ row }) {
  const sections = FOOTBALL_DETAIL_VIEW_ENTRIES
    .map(([viewKey, view]) => ({
      key: viewKey,
      title: view.label,
      columns: getVisibleColumns([row], view.columns),
    }))
    .filter((section) => section.columns.length > 0);

  if (!sections.length) {
    return (
      <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        No tracked team stats are available for this game.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {sections.map((section) => (
        <TeamStatTable
          key={section.key}
          title={section.title}
          columns={section.columns}
          row={row}
        />
      ))}
    </div>
  );
}

export default function GameDetail() {
  const { gameId } = useParams();
  const numericGameId = Number(gameId);
  const { data, error } = usePreparedFootballRecordsData();
  const [selectedView, setSelectedView] = useState("offense");

  const game = useMemo(() => {
    if (!data) return null;
    return (
      (data.teamGames || []).find((entry) => Number(entry?.GameID) === numericGameId) ||
      (data.games || []).find((entry) => Number(entry?.GameID) === numericGameId) ||
      null
    );
  }, [data, numericGameId]);

  const playerRows = useMemo(() => {
    if (!data) return [];
    return (data.playerGameRows || [])
      .filter((row) => Number(row?.GameID) === numericGameId)
      .sort((a, b) => String(a?.PlayerName || "").localeCompare(String(b?.PlayerName || "")));
  }, [data, numericGameId]);

  const activeView = FOOTBALL_DETAIL_VIEWS[selectedView] || FOOTBALL_DETAIL_VIEWS.offense;
  const playerColumns = useMemo(
    () => getVisibleColumns(playerRows, activeView.columns),
    [activeView.columns, playerRows]
  );
  const visiblePlayerRows = useMemo(
    () => getVisibleRowsForColumns(playerRows, playerColumns),
    [playerColumns, playerRows]
  );

  const summaryCards = useMemo(() => {
    if (!game) return [];

    const totalOffense = totalOffenseYards(game);

    return [
      { label: "Score", value: formatTeamScore(game) },
      {
        label: "Total Offense",
        value: Number.isFinite(Number(totalOffense)) ? formatWhole(totalOffense) : "—",
      },
      { label: "Passing Yards", value: rawWhole(game, "PassingYards") },
      { label: "Rushing Yards", value: rawWhole(game, "RushingYards") },
      { label: "Total Tackles", value: rawWhole(game, "TotalTackles") },
      { label: "Sacks", value: rawDecimal(game, "Sacks") },
    ];
  }, [game]);

  if (!data && !error) {
    return <div className="p-4 text-center text-gray-600">Loading football game details…</div>;
  }

  if (!game) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center text-slate-600">
        <p>No football game was found for game ID {gameId}.</p>
        <Link to="/athletics/football" className="mt-3 inline-block text-blue-700 hover:underline">
          Back to football
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pb-10 pt-2 lg:pb-40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/athletics/football/seasons/${game.SeasonID || game.Season}`}
          className="text-sm font-semibold text-blue-700 hover:underline"
        >
          Back to {formatSeasonLabel(game)}
        </Link>

        {game.GameUrl ? (
          <a
            href={game.GameUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-blue-700 hover:underline"
          >
            MaxPreps box score
          </a>
        ) : null}
      </div>

      <section className="space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {formatGameDate(game)}
        </p>
        <h1 className="text-3xl font-bold text-slate-950">
          St. Andrew&apos;s vs. {game.Opponent || "Unknown Opponent"}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-slate-600">
          <span className={`font-bold ${resultClass(game.Result)}`}>
            {game.Result || "—"} {formatTeamScore(game)}
          </span>
          <span>{game.LocationType || "—"}</span>
          <span>{game.GameType || "—"}</span>
          {game.Venue ? <span>{game.Venue}</span> : null}
        </div>
      </section>

      {error ? (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {summaryCards.map((card) => (
          <DetailCard key={card.label} label={card.label} value={card.value} />
        ))}
      </section>

      <GameVideo game={game} />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-950">Team Stats</h2>
        <TeamTotals row={game} />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-slate-950">Player Stats</h2>
          <div className="flex flex-wrap gap-2">
            {FOOTBALL_DETAIL_VIEW_ENTRIES.map(([viewKey, view]) => {
              const isActive = selectedView === viewKey;
              return (
                <button
                  key={viewKey}
                  type="button"
                  onClick={() => setSelectedView(viewKey)}
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
        </div>

        {playerRows.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No tracked player stats are available for this game.
          </p>
        ) : visiblePlayerRows.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No tracked {activeView.label.toLowerCase()} stats are available for this game.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
            <table className="min-w-full bg-white text-center text-sm">
              <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-700">
                <tr>
                  <th className={`${recordTableStyles.headerCell} text-left`}>Player</th>
                  {playerColumns.map((column) => (
                    <th key={column.key} className={recordTableStyles.headerCell}>
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visiblePlayerRows.map((row, index) => (
                  <tr
                    key={`${row.PlayerID}-${row.GameID}`}
                    className={`border-t border-gray-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/70"
                    } hover:bg-gray-100`}
                  >
                    <td className={`${recordTableStyles.bodyCell} text-left`}>
                      <Link
                        to={footballPlayerPath(row.PlayerID)}
                        className="font-semibold text-blue-700 hover:underline"
                      >
                        {row.PlayerName || "—"}
                      </Link>
                    </td>
                    {playerColumns.map((column) => (
                      <td
                        key={`${row.PlayerID}-${row.GameID}-${column.key}`}
                        className={recordTableStyles.bodyCell}
                      >
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
