import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import {
  buildPlayerMap,
  formatSoccerDate,
  getPlayerName,
  getSoccerSeasonLabel,
  soccerSeasonPath,
} from "../soccerData";

function resultClass(result) {
  const normalized = String(result || "").toUpperCase();
  if (normalized === "W") return "text-emerald-700";
  if (normalized === "L") return "text-rose-700";
  return "text-slate-700";
}

function StatList({ title, rows = [], valueKey, emptyText }) {
  return (
    <section className="rounded-[1.4rem] border border-slate-200 bg-white px-5 py-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      {rows.length ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="border-b border-slate-200 px-3 py-2 text-left">Team</th>
                <th className="border-b border-slate-200 px-3 py-2 text-left">Player</th>
                <th className="border-b border-slate-200 px-3 py-2 text-center">
                  {title}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${title}-${row.Team}-${row.PlayerName}-${index}`} className="odd:bg-white even:bg-slate-50">
                  <td className="border-b border-slate-200 px-3 py-2 text-slate-700">
                    {row.Team || "—"}
                  </td>
                  <td className="border-b border-slate-200 px-3 py-2 font-semibold text-slate-900">
                    {row.PlayerName || "—"}
                  </td>
                  <td className="border-b border-slate-200 px-3 py-2 text-center font-bold text-slate-900">
                    {row[valueKey] ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-3 text-sm leading-7 text-slate-600">{emptyText}</p>
      )}
    </section>
  );
}

function SaveTable({ rows = [], playerMap }) {
  return (
    <section className="rounded-[1.4rem] border border-slate-200 bg-white px-5 py-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Saves</h2>
      {rows.length ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="border-b border-slate-200 px-3 py-2 text-left">Team</th>
                <th className="border-b border-slate-200 px-3 py-2 text-left">Goalkeeper</th>
                <th className="border-b border-slate-200 px-3 py-2 text-center">Saves</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const player = row.PlayerID
                  ? playerMap.get(String(row.PlayerID))
                  : null;
                return (
                  <tr key={`${row.Team}-${row.PlayerName}-${index}`} className="odd:bg-white even:bg-slate-50">
                    <td className="border-b border-slate-200 px-3 py-2 text-slate-700">
                      {row.Team || "—"}
                    </td>
                    <td className="border-b border-slate-200 px-3 py-2 font-semibold text-slate-900">
                      {player ? getPlayerName(player) : row.PlayerName || "—"}
                    </td>
                    <td className="border-b border-slate-200 px-3 py-2 text-center font-bold text-slate-900">
                      {row.Saves ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-3 text-sm leading-7 text-slate-600">
          No goalkeeper saves were listed for this match.
        </p>
      )}
    </section>
  );
}

export default function GameDetail({ data, status = "" }) {
  const { gameId } = useParams();

  const game = useMemo(
    () =>
      (data?.games || []).find(
        (entry) => String(entry.GameID) === String(gameId)
      ) || null,
    [data, gameId]
  );

  const season = useMemo(
    () =>
      game
        ? (data?.seasons || []).find(
            (entry) => Number(entry.SeasonID) === Number(game.SeasonID ?? game.Season)
          ) || null
        : null,
    [data, game]
  );

  const playerMap = useMemo(() => buildPlayerMap(data?.players || []), [data]);

  if (!game && !status) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center sm:px-6">
        <section className="rounded-[1.4rem] border border-slate-200 bg-white px-6 py-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Game Not Found</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            That girls soccer game is not available yet.
          </p>
          <Link
            to="/athletics/girls/soccer/yearly-results"
            className="mt-5 inline-flex rounded-full bg-[#012169] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Girls Soccer Seasons
          </Link>
        </section>
      </div>
    );
  }

  const seasonLabel = season ? getSoccerSeasonLabel(season) : game?.DisplaySeason || "Season";
  const score =
    Number.isFinite(Number(game?.TeamScore)) &&
    Number.isFinite(Number(game?.OpponentScore))
      ? `${game.TeamScore}-${game.OpponentScore}`
      : "—";
  const gameTitle =
    game?.Opponent && score !== "—"
      ? Number(game.TeamScore) >= Number(game.OpponentScore)
        ? `St. Andrew's ${game.TeamScore}, ${game.Opponent} ${game.OpponentScore}`
        : `${game.Opponent} ${game.OpponentScore}, St. Andrew's ${game.TeamScore}`
      : game?.RecapTitle || "Girls Soccer Game";

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-24 pt-2 sm:px-6">
      {status ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm text-slate-600 shadow-sm">
          {status}
        </div>
      ) : null}

      <header className="text-center">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
          {formatSoccerDate(game)}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {gameTitle}
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          {[seasonLabel, game?.Tournament, "Girls Soccer"].filter(Boolean).join(" • ")}
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-4 text-center shadow-sm">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Result
          </div>
          <div className={`mt-2 text-2xl font-black ${resultClass(game?.Result)}`}>
            {game?.Result || "—"}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-4 text-center shadow-sm">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Score
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{score}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-4 text-center shadow-sm">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Site
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {game?.LocationType || "Unknown"}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-4 text-center shadow-sm">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Type
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {game?.GameType || "—"}
          </div>
        </div>
      </section>

      <section className="rounded-[1.4rem] border border-slate-200 bg-white px-5 py-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Game Recap</h2>
            {game?.SourceCitation ? (
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {game.SourceCitation}
              </p>
            ) : null}
          </div>
          {game?.RecordNote ? (
            <p className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
              {game.RecordNote}
            </p>
          ) : null}
        </div>

        <div className="mt-4 space-y-4 text-sm leading-7 text-slate-700">
          {String(game?.Recap || "")
            .split("\n\n")
            .filter(Boolean)
            .map((paragraph, index) => (
              <p key={`recap-${index}`}>{paragraph}</p>
            ))}
        </div>

        {game?.Notes ? (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-950">
            {game.Notes}
          </p>
        ) : null}

        {game?.Venue ? (
          <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700">
            Venue: {game.Venue}
          </p>
        ) : null}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <StatList
          title="Goals"
          rows={game?.GoalScorers || []}
          valueKey="Goals"
          emptyText="No goal scorers were listed for this match."
        />
        <StatList
          title="Assists"
          rows={game?.Assists || []}
          valueKey="Assists"
          emptyText="No assists were listed for this match."
        />
      </div>

      <SaveTable rows={game?.Saves || []} playerMap={playerMap} />

      <div className="text-center">
        <Link
          to={soccerSeasonPath(game?.SeasonID ?? game?.Season)}
          className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 no-underline"
        >
          Back to {seasonLabel}
        </Link>
      </div>
    </div>
  );
}
