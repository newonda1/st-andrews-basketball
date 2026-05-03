import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import {
  buildPlayerMap,
  formatSoccerDate,
  getPlayerName,
  soccerGamePath,
  soccerSeasonPath,
} from "../soccerData";

export default function PlayerPage({ data, status = "" }) {
  const { playerId } = useParams();

  const playerMap = useMemo(() => buildPlayerMap(data?.players || []), [data]);
  const player = playerMap.get(String(playerId)) || null;

  const rosterEntries = useMemo(() => {
    return (data?.rosters || [])
      .flatMap((roster) =>
        (roster.Players || [])
          .filter((entry) => String(entry.PlayerID) === String(playerId))
          .map((entry) => ({
            ...entry,
            SeasonID: roster.SeasonID,
            SeasonLabel: roster.DisplaySeason || roster.SourceSeasonLabel || roster.SeasonID,
          }))
      )
      .sort((a, b) => Number(a.SeasonID) - Number(b.SeasonID));
  }, [data, playerId]);

  const statRows = useMemo(() => {
    return (data?.games || [])
      .map((game) => {
        const goals = (game.GoalScorers || [])
          .filter((row) => String(row.PlayerID) === String(playerId))
          .reduce((sum, row) => sum + Number(row.Goals || 0), 0);
        const assists = (game.Assists || [])
          .filter((row) => String(row.PlayerID) === String(playerId))
          .reduce((sum, row) => sum + Number(row.Assists || 0), 0);
        const saves = (game.Saves || [])
          .filter((row) => String(row.PlayerID) === String(playerId))
          .reduce((sum, row) => sum + Number(row.Saves || 0), 0);

        if (!goals && !assists && !saves) return null;

        return {
          game,
          goals,
          assists,
          saves,
        };
      })
      .filter(Boolean)
      .sort((a, b) => Number(a.game?.GameID || 0) - Number(b.game?.GameID || 0));
  }, [data, playerId]);

  if (!player && !rosterEntries.length && !status) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center sm:px-6">
        <section className="rounded-[1.4rem] border border-slate-200 bg-white px-6 py-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Player Not Found</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            That girls soccer player is not available yet.
          </p>
          <Link
            to="/athletics/girls/soccer/seasons/2004"
            className="mt-5 inline-flex rounded-full bg-[#012169] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Spring 2004
          </Link>
        </section>
      </div>
    );
  }

  const displayName = getPlayerName(player || rosterEntries[0]);
  const latestRosterEntry = rosterEntries[rosterEntries.length - 1] || {};

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 pb-24 pt-2 sm:px-6">
      {status ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm text-slate-600 shadow-sm">
          {status}
        </div>
      ) : null}

      <header className="text-center">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
          Girls Soccer
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{displayName}</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          {[latestRosterEntry.Grade, (latestRosterEntry.Positions || []).join(", ")]
            .filter(Boolean)
            .join(" • ") || "St. Andrew's player"}
        </p>
      </header>

      <section className="rounded-[1.4rem] border border-slate-200 bg-white px-5 py-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Seasons</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="border-b border-slate-200 px-3 py-2 text-left">Season</th>
                <th className="border-b border-slate-200 px-3 py-2 text-center">Grade</th>
                <th className="border-b border-slate-200 px-3 py-2 text-left">Position</th>
              </tr>
            </thead>
            <tbody>
              {rosterEntries.map((entry) => (
                <tr key={`${entry.SeasonID}-${entry.PlayerID}`} className="odd:bg-white even:bg-slate-50">
                  <td className="border-b border-slate-200 px-3 py-2 font-semibold">
                    <Link
                      to={soccerSeasonPath(entry.SeasonID)}
                      className="text-blue-700 hover:text-blue-900"
                    >
                      {entry.SeasonLabel}
                    </Link>
                  </td>
                  <td className="border-b border-slate-200 px-3 py-2 text-center text-slate-700">
                    {entry.Grade || "—"}
                  </td>
                  <td className="border-b border-slate-200 px-3 py-2 text-slate-700">
                    {(entry.Positions || []).join(", ") || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[1.4rem] border border-slate-200 bg-white px-5 py-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Published Game Stats</h2>
        {statRows.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="border-b border-slate-200 px-3 py-2 text-left">Date</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left">Opponent</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-center">Result</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-center">G</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-center">A</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-center">Saves</th>
                </tr>
              </thead>
              <tbody>
                {statRows.map(({ game, goals, assists, saves }) => (
                  <tr key={game.GameID} className="odd:bg-white even:bg-slate-50">
                    <td className="border-b border-slate-200 px-3 py-2 font-semibold text-slate-900">
                      {formatSoccerDate(game)}
                    </td>
                    <td className="border-b border-slate-200 px-3 py-2">
                      <Link
                        to={soccerGamePath(game.GameID)}
                        className="font-semibold text-blue-700 hover:text-blue-900"
                      >
                        {game.Opponent}
                      </Link>
                    </td>
                    <td className="border-b border-slate-200 px-3 py-2 text-center text-slate-700">
                      {game.Result || "—"} {game.TeamScore}-{game.OpponentScore}
                    </td>
                    <td className="border-b border-slate-200 px-3 py-2 text-center font-bold text-slate-900">
                      {goals || "—"}
                    </td>
                    <td className="border-b border-slate-200 px-3 py-2 text-center font-bold text-slate-900">
                      {assists || "—"}
                    </td>
                    <td className="border-b border-slate-200 px-3 py-2 text-center font-bold text-slate-900">
                      {saves || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm leading-7 text-slate-600">
            No published game stats are available for this player yet.
          </p>
        )}
      </section>
    </div>
  );
}
