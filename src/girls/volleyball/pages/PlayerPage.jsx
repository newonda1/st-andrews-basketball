import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  VOLLEYBALL_STAT_SECTIONS,
  aggregateAllPlayerSeasonStatsFromGames,
  aggregateVolleyballSeasonStatRows,
  aggregateVolleyballStatRows,
  buildPlayerMap,
  formatDate,
  formatStat,
  getPlayerName,
  getRosterForSeason,
  getSeasonGames,
  getSeasonLabel,
} from "../volleyballData";

function statViewKey(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getLogColumns(section) {
  return section.columns.filter(
    (column) =>
      !["BlocksPerMatch", "DigsPerMatch", "ReceptionsPerMatch"].includes(column.key)
  );
}

const STAT_VIEWS = Object.fromEntries(
  VOLLEYBALL_STAT_SECTIONS.map((section) => [
    statViewKey(section.title),
    {
      label: section.title,
      summaryColumns: [
        { key: "Games", label: "M", render: (stats) => formatStat(stats.Games) },
        ...section.columns.map((column) => ({
          ...column,
          render: (stats) => formatStat(stats[column.key], column),
        })),
      ],
      logColumns: getLogColumns(section).map((column) => ({
        ...column,
        render: (row) => formatStat(row[column.key], column),
      })),
    },
  ])
);

const DEFAULT_VIEW = statViewKey(VOLLEYBALL_STAT_SECTIONS[0]?.title || "Attacking");

function getSeasonMeta(seasons, seasonId) {
  return seasons.find((season) => Number(season.SeasonID) === Number(seasonId)) || {
    SeasonID: seasonId,
  };
}

function getSeasonDisplay(seasons, seasonId) {
  return getSeasonLabel(getSeasonMeta(seasons, seasonId));
}

function groupRowsBySeason(rows, seasons) {
  const grouped = new Map();

  rows.forEach((row) => {
    const season = Number(row.Season);
    if (!grouped.has(season)) grouped.set(season, []);
    grouped.get(season).push(row);
  });

  return [...grouped.entries()]
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([season, seasonRows]) => ({
      season,
      label: getSeasonDisplay(seasons, season),
      totals: aggregateVolleyballStatRows(seasonRows, {
        Season: season,
        PlayerID: seasonRows[0]?.PlayerID,
        JerseyNumber: seasonRows[0]?.JerseyNumber,
        PlayerName: seasonRows[0]?.PlayerName,
      }),
    }));
}

function groupGamesBySeason(rows, seasons) {
  const grouped = new Map();

  rows.forEach((row) => {
    const season = Number(row.Season);
    if (!grouped.has(season)) grouped.set(season, []);
    grouped.get(season).push(row);
  });

  return [...grouped.entries()]
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([season, seasonRows]) => ({
      season,
      label: getSeasonDisplay(seasons, season),
      rows: seasonRows.sort((a, b) =>
        String(b.game?.Date || "").localeCompare(String(a.game?.Date || ""))
      ),
    }));
}

function getVolleyballProfileBlurbs(player) {
  return (player?.ProfileBlurbs || []).filter(
    (entry) => String(entry?.Sport || "").toLowerCase() === "girls volleyball"
  );
}

export default function PlayerPage({ data, status = "" }) {
  const { playerId } = useParams();
  const resolvedPlayerId = Number(playerId);
  const [selectedView, setSelectedView] = useState(DEFAULT_VIEW);

  const playerMap = useMemo(() => buildPlayerMap(data.players), [data.players]);
  const player = playerMap.get(String(resolvedPlayerId));
  const rosterEntry = useMemo(() => {
    const sortedRosters = [...data.rosters].sort(
      (a, b) => Number(b.SeasonID || 0) - Number(a.SeasonID || 0)
    );

    for (const roster of sortedRosters) {
      const match = getRosterForSeason([roster], roster.SeasonID).Players.find(
        (entry) => Number(entry.PlayerID) === resolvedPlayerId
      );
      if (match) return { ...match, SeasonID: roster.SeasonID };
    }

    return null;
  }, [data.rosters, resolvedPlayerId]);
  const playerGameRows = useMemo(
    () =>
      data.playerGameStats
        .filter((entry) => Number(entry.PlayerID) === resolvedPlayerId)
        .map((entry) => {
          const seasonGames = getSeasonGames(data.games, entry.Season);
          const game = seasonGames.find(
            (gameEntry) => String(gameEntry.GameID) === String(entry.GameID)
          );
          return game ? { ...entry, game } : null;
        })
        .filter(Boolean),
    [data.games, data.playerGameStats, resolvedPlayerId]
  );
  const playerSeasonRows = useMemo(
    () =>
      aggregateAllPlayerSeasonStatsFromGames(
        data.playerGameStats,
        data.playerSeasonAdjustments
      ).filter((entry) => Number(entry.PlayerID) === resolvedPlayerId),
    [data.playerGameStats, data.playerSeasonAdjustments, resolvedPlayerId]
  );
  const careerTotalsBySeason = useMemo(
    () =>
      playerSeasonRows
        .slice()
        .sort((a, b) => Number(a.Season) - Number(b.Season))
        .map((row) => ({
          season: Number(row.Season),
          label: getSeasonDisplay(data.seasons, row.Season),
          totals: row,
        })),
    [data.seasons, playerSeasonRows]
  );
  const careerTotals = useMemo(
    () =>
      aggregateVolleyballSeasonStatRows(playerSeasonRows, {
        PlayerID: resolvedPlayerId,
        JerseyNumber: rosterEntry?.JerseyNumber,
        PlayerName: player ? getPlayerName(player) : "",
      }),
    [player, playerSeasonRows, resolvedPlayerId, rosterEntry]
  );
  const gamesBySeason = useMemo(
    () => groupGamesBySeason(playerGameRows, data.seasons),
    [data.seasons, playerGameRows]
  );
  const profileBlurbs = useMemo(() => getVolleyballProfileBlurbs(player), [player]);

  const activeView = STAT_VIEWS[selectedView] || STAT_VIEWS[DEFAULT_VIEW];
  const thClass =
    "px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-600 bg-slate-100 border-b border-slate-200 whitespace-nowrap";
  const tdClass =
    "px-2 py-1.5 text-[15px] text-slate-800 text-center border-b border-slate-100 whitespace-nowrap";

  if (status) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 text-slate-600">
        {status}
      </div>
    );
  }

  if (!player) {
    return <div className="mx-auto max-w-6xl px-4 py-8 text-slate-600">Player not found.</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <Link
        to={`/athletics/volleyball/seasons/${rosterEntry?.SeasonID || 2025}`}
        className="mb-8 inline-block text-sm font-semibold text-blue-700 hover:text-blue-900"
      >
        Back to Season
      </Link>

      <section className="mb-10">
        <div className="flex items-center gap-4 md:gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-lg font-black text-slate-500 md:h-24 md:w-24">
            {rosterEntry?.JerseyNumber != null ? `#${rosterEntry.JerseyNumber}` : "SA"}
          </div>

          <div className="min-w-0">
            <h1 className="mb-1 text-2xl font-black leading-tight text-black md:text-3xl">
              {getPlayerName(player)}
            </h1>
            <div className="text-lg font-medium text-slate-700 md:text-xl">
              {[
                rosterEntry?.JerseyNumber != null ? `#${rosterEntry.JerseyNumber}` : null,
                (rosterEntry?.Positions || []).join(", ") || null,
                rosterEntry?.GradeLabel || null,
                `Class of ${player.GradYear ?? "-"}`,
              ]
                .filter(Boolean)
                .join(" / ")}
            </div>
          </div>
        </div>
      </section>

      {profileBlurbs.length > 0 ? (
        <section className="mb-10 space-y-4">
          {profileBlurbs.map((blurb, index) => (
            <article
              key={`${blurb.SourceDate || "source"}-${index}`}
              className="border-l-4 border-blue-800 bg-blue-50 px-4 py-4 text-slate-800"
            >
              {blurb.Headline ? (
                <h2 className="mb-2 text-lg font-black text-slate-950">{blurb.Headline}</h2>
              ) : null}
              <p className="text-base leading-7">{blurb.Text}</p>
              {[blurb.SourcePublication, blurb.SourceDate, blurb.SourceTitle]
                .filter(Boolean)
                .length > 0 ? (
                <div className="mt-3 text-sm font-medium leading-6 text-slate-600">
                  Source: {[blurb.SourcePublication, blurb.SourceDate]
                    .filter(Boolean)
                    .join(", ")}
                  {blurb.SourceTitle ? `, "${blurb.SourceTitle}"` : ""}
                </div>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}

      <section className="mb-10">
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-black text-black md:text-2xl">Career Totals</h2>
          <div className="flex flex-wrap gap-3 md:justify-end">
            {Object.entries(STAT_VIEWS).map(([key, value]) => {
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
        </div>

        <div className="overflow-x-auto border border-slate-200">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className={thClass}>Season</th>
                {activeView.summaryColumns.map((column) => (
                  <th key={column.key} className={thClass}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {careerTotalsBySeason.length === 0 ? (
                <tr className="bg-white">
                  <td
                    className={tdClass}
                    colSpan={activeView.summaryColumns.length + 1}
                  >
                    -
                  </td>
                </tr>
              ) : (
                careerTotalsBySeason.map(({ season, label, totals }, index) => (
                  <tr
                    key={season}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50/70"} hover:bg-gray-100`}
                  >
                    <td className={`${tdClass} font-semibold`}>{label}</td>
                    {activeView.summaryColumns.map((column) => (
                      <td key={column.key} className={tdClass}>
                        {column.render(totals)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
              <tr className="bg-slate-100 font-semibold">
                <td className={`${tdClass} font-bold`}>Total</td>
                {activeView.summaryColumns.map((column) => (
                  <td key={column.key} className={`${tdClass} font-bold`}>
                    {column.render(careerTotals)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-black text-black md:text-2xl">Match Logs</h2>

        {gamesBySeason.length === 0 ? (
          <div className="text-slate-600">No matches found for this player.</div>
        ) : (
          gamesBySeason.map(({ season, label, rows }) => (
            <div key={season} className="mb-8 last:mb-0">
              <div className="mb-3 text-lg font-black text-black md:text-xl">{label}</div>
              <div className="overflow-x-auto border border-slate-200">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className={thClass}>Date</th>
                      <th className={thClass}>Opponent</th>
                      <th className={thClass}>Result</th>
                      {activeView.logColumns.map((column) => (
                        <th key={column.key} className={thClass}>
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr
                        key={row.GameID}
                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50/70"} hover:bg-gray-100`}
                      >
                        <td className={tdClass}>{formatDate(row.game.Date)}</td>
                        <td className={tdClass}>
                          <Link
                            to={`/athletics/volleyball/games/${row.GameID}`}
                            className="text-blue-700 hover:text-blue-900"
                          >
                            {row.game.Opponent}
                          </Link>
                        </td>
                        <td className={tdClass}>
                          {row.game.Result} {row.game.TeamScore}-{row.game.OpponentScore}
                        </td>
                        {activeView.logColumns.map((column) => (
                          <td key={column.key} className={tdClass}>
                            {column.render(row)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
