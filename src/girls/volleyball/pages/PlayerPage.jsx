import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  VOLLEYBALL_STAT_SECTIONS,
  aggregatePlayerSeasonStatsFromGames,
  buildPlayerMap,
  formatDate,
  formatStat,
  getPlayerName,
  getRosterForSeason,
  getSeasonGames,
} from "../volleyballData";

const LEADER_FIELDS = [
  { key: "SetsPlayed", label: "SP" },
  { key: "Kills", label: "Kills" },
  { key: "Aces", label: "Aces" },
  { key: "Digs", label: "Digs" },
  { key: "Assists", label: "Assists" },
  { key: "TotalBlocks", label: "Blocks" },
];

export default function PlayerPage({ data, status = "" }) {
  const { playerId } = useParams();
  const resolvedPlayerId = Number(playerId);
  const playerMap = useMemo(() => buildPlayerMap(data.players), [data.players]);
  const player = playerMap.get(String(resolvedPlayerId));
  const rosterEntry = useMemo(() => {
    for (const roster of data.rosters) {
      const match = (roster.Players || []).find(
        (entry) => Number(entry.PlayerID) === resolvedPlayerId
      );
      if (match) return { ...match, SeasonID: roster.SeasonID };
    }
    return null;
  }, [data.rosters, resolvedPlayerId]);
  const seasonStats = useMemo(
    () =>
      aggregatePlayerSeasonStatsFromGames(
        data.playerGameStats,
        rosterEntry?.SeasonID || 2025
      ).find((entry) => Number(entry.PlayerID) === resolvedPlayerId) || null,
    [data.playerGameStats, resolvedPlayerId, rosterEntry]
  );
  const seasonGames = useMemo(
    () => getSeasonGames(data.games, rosterEntry?.SeasonID || 2025),
    [data.games, rosterEntry]
  );
  const gameRows = useMemo(
    () =>
      data.playerGameStats
        .filter((entry) => Number(entry.PlayerID) === resolvedPlayerId)
        .map((entry) => ({
          ...entry,
          game: seasonGames.find((game) => String(game.GameID) === String(entry.GameID)),
        }))
        .filter((entry) => entry.game)
        .sort((a, b) => String(a.game.Date || "").localeCompare(String(b.game.Date || ""))),
    [data.playerGameStats, resolvedPlayerId, seasonGames]
  );

  if (status) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center text-sm text-slate-600">
        {status}
      </div>
    );
  }

  if (!player) {
    return <div className="p-4 text-center text-slate-600">Player not found.</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pb-24 pt-2 sm:px-6">
      <Link
        to={`/athletics/volleyball/seasons/${rosterEntry?.SeasonID || 2025}`}
        className="text-sm font-semibold text-blue-700 hover:text-blue-900"
      >
        Back to Season
      </Link>

      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
          Volleyball Athlete
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">{getPlayerName(player)}</h1>
        <p className="mt-2 text-sm text-slate-500">
          #{rosterEntry?.JerseyNumber ?? "—"} • {(rosterEntry?.Positions || []).join(", ") || "—"} •{" "}
          {rosterEntry?.GradeLabel || "—"} • Class of {player.GradYear || "—"}
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {LEADER_FIELDS.map((field) => (
          <div
            key={field.key}
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
          >
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {field.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {formatStat(seasonStats?.[field.key])}
            </p>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">Season Stats</h2>
        {VOLLEYBALL_STAT_SECTIONS.map((section) => (
          <div key={section.title} className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[620px] border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th
                    className="border-b border-slate-300 px-3 py-2 text-left font-bold"
                    colSpan={section.columns.length}
                  >
                    {section.title}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {section.columns.map((column) => (
                    <td
                      key={`${section.title}-${column.key}`}
                      className="border-b border-slate-200 px-3 py-2 text-center"
                    >
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {column.label}
                      </div>
                      <div className="mt-1 font-semibold text-slate-900">
                        {formatStat(seasonStats?.[column.key], column)}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Match Log</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border-b border-slate-300 px-3 py-2 text-left font-bold">
                  Date
                </th>
                <th className="border-b border-slate-300 px-3 py-2 text-left font-bold">
                  Opponent
                </th>
                <th className="border-b border-slate-300 px-3 py-2 text-center font-bold">
                  Result
                </th>
                {LEADER_FIELDS.map((field) => (
                  <th
                    key={`log-${field.key}`}
                    className="border-b border-slate-300 px-3 py-2 text-center font-bold"
                  >
                    {field.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gameRows.length ? (
                gameRows.map((row) => (
                  <tr key={row.GameID} className="odd:bg-white even:bg-slate-50">
                    <td className="border-b border-slate-200 px-3 py-2 whitespace-nowrap">
                      {formatDate(row.game.Date)}
                    </td>
                    <td className="border-b border-slate-200 px-3 py-2">
                      <Link
                        to={`/athletics/volleyball/games/${row.GameID}`}
                        className="font-semibold text-blue-700 hover:text-blue-900"
                      >
                        {row.game.Opponent}
                      </Link>
                    </td>
                    <td
                      className={`border-b border-slate-200 px-3 py-2 text-center font-bold ${
                        row.game.Result === "W" ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {row.game.Result} {row.game.TeamScore}-{row.game.OpponentScore}
                    </td>
                    {LEADER_FIELDS.map((field) => (
                      <td
                        key={`${row.GameID}-${field.key}`}
                        className="border-b border-slate-200 px-3 py-2 text-center"
                      >
                        {formatStat(row[field.key])}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="border-b border-slate-200 px-3 py-4 text-center text-slate-500"
                    colSpan={LEADER_FIELDS.length + 3}
                  >
                    No match log entries are available for this player.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
