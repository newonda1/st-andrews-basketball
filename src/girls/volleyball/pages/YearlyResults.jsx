import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  buildGameRecord,
  formatRecord,
  getSeasonGames,
  getSeasonLabel,
} from "../volleyballData";

export default function YearlyResults({ data, status = "" }) {
  const rows = useMemo(
    () =>
      data.seasons
        .slice()
        .sort((a, b) => Number(b.SeasonID) - Number(a.SeasonID))
        .map((season) => {
          const games = getSeasonGames(data.games, season.SeasonID);
          const record = buildGameRecord(games);
          return { season, games, record };
        }),
    [data.games, data.seasons]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-2 sm:px-6">
      {status ? (
        <div className="mb-5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm text-slate-600 shadow-sm">
          {status}
        </div>
      ) : null}

      <header className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Volleyball Seasons</h1>
        <p className="mt-2 text-sm text-slate-500">
          Varsity girls volleyball results and MaxPreps stat archive.
        </p>
      </header>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 px-3 py-2 text-center font-bold">
                Season
              </th>
              <th className="border border-slate-300 px-3 py-2 text-center font-bold">
                Record
              </th>
              <th className="border border-slate-300 px-3 py-2 text-center font-bold">
                Sets
              </th>
              <th className="border border-slate-300 px-3 py-2 text-center font-bold">
                League
              </th>
              <th className="border border-slate-300 px-3 py-2 text-left font-bold">
                Coverage
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map(({ season, games, record }) => (
                <tr key={season.SeasonID} className="bg-white">
                  <td className="border border-slate-300 px-3 py-2 text-center">
                    <Link
                      to={`/athletics/volleyball/seasons/${season.SeasonID}`}
                      className="font-bold text-blue-700 hover:text-blue-900"
                    >
                      {getSeasonLabel(season)}
                    </Link>
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-center font-semibold">
                    {formatRecord(record.wins, record.losses, record.ties)}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-center">
                    {record.setsWon}-{record.setsLost}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-center">
                    {season.League || "—"}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 leading-6 text-slate-700">
                    {games.length} matches, roster, match pages, and player stats.
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="border border-slate-300 bg-white px-3 py-8 text-center text-slate-500"
                  colSpan={5}
                >
                  Volleyball seasons will appear here when data is added.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
