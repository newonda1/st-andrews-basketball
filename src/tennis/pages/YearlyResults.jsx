import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { getTennisSeasonLabel } from "../tennisPageUtils";

export default function YearlyResults({ seasons = [], matches = [], status = "" }) {
  const rows = useMemo(() => {
    return seasons
      .slice()
      .sort((a, b) => Number(a.SeasonID) - Number(b.SeasonID))
      .map((season) => {
        const seasonMatches = matches.filter(
          (match) => Number(match.Season) === Number(season.SeasonID)
        );

        return {
          seasonId: season.SeasonID,
          label: getTennisSeasonLabel(season),
          classification: season.Classification || "—",
          matchCount: seasonMatches.length,
          note: season.StatusNote || "—",
        };
      });
  }, [matches, seasons]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-2 sm:px-6">
      {status ? (
        <div className="mb-5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm text-slate-600 shadow-sm">
          {status}
        </div>
      ) : null}

      <h1 className="text-center text-3xl font-bold text-slate-900">
        Tennis Seasons
      </h1>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 px-3 py-2 text-center font-bold">
                Season
              </th>
              <th className="border border-slate-300 px-3 py-2 text-center font-bold">
                Classification
              </th>
              <th className="border border-slate-300 px-3 py-2 text-center font-bold">
                Matches
              </th>
              <th className="border border-slate-300 px-3 py-2 text-left font-bold">
                Snapshot
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr key={row.seasonId} className="bg-white">
                  <td className="border border-slate-300 px-3 py-2 text-center">
                    <Link
                      to={`/athletics/tennis/seasons/${row.seasonId}`}
                      className="font-bold text-blue-700 hover:text-blue-900"
                    >
                      {row.label}
                    </Link>
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-center">
                    {row.classification}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-center">
                    {row.matchCount}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 leading-6 text-slate-700">
                    {row.note}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="border border-slate-300 bg-white px-3 py-8 text-center text-slate-500"
                  colSpan={4}
                >
                  Tennis seasons will appear here when data is added.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
