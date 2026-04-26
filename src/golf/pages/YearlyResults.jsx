import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { getGolfSeasonLabel } from "../golfPageUtils";

function buildSeasonSnapshot(season) {
  if (Array.isArray(season?.HighlightNotes) && season.HighlightNotes.length > 0) {
    return season.HighlightNotes[0];
  }

  if (
    Array.isArray(season?.HistoricalSummary) &&
    season.HistoricalSummary.length > 0
  ) {
    return season.HistoricalSummary[0];
  }

  return season?.StatusNote || "—";
}

export default function YearlyResults({
  seasons = [],
  tournaments = [],
  status = "",
}) {
  const rows = useMemo(() => {
    return seasons
      .slice()
      .sort((a, b) => Number(a.SeasonID) - Number(b.SeasonID))
      .map((season) => {
        const seasonTournaments = tournaments.filter(
          (tournament) => Number(tournament.Season) === Number(season.SeasonID)
        );

        return {
          seasonId: season.SeasonID,
          label: getGolfSeasonLabel(season),
          classification: season.Classification || "—",
          coverage:
            season.ArchiveScope === "summary"
              ? "Archive summary"
              : `${seasonTournaments.length} tournament${
                  seasonTournaments.length === 1 ? "" : "s"
                }`,
          snapshot: buildSeasonSnapshot(season),
        };
      });
  }, [seasons, tournaments]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-2 sm:px-6">
      {status ? (
        <div className="mb-5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm text-slate-600 shadow-sm">
          {status}
        </div>
      ) : null}

      <header className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Golf Seasons</h1>
        <p className="mt-2 text-sm text-slate-500">
          State tournament archive coverage from Spring 2019 onward.
        </p>
      </header>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 px-3 py-2 text-center font-bold">
                Season
              </th>
              <th className="border border-slate-300 px-3 py-2 text-center font-bold">
                Classification
              </th>
              <th className="border border-slate-300 px-3 py-2 text-center font-bold">
                Coverage
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
                      to={`/athletics/golf/seasons/${row.seasonId}`}
                      className="font-bold text-blue-700 hover:text-blue-900"
                    >
                      {row.label}
                    </Link>
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-center">
                    {row.classification}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-center">
                    {row.coverage}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 leading-6 text-slate-700">
                    {row.snapshot}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="border border-slate-300 bg-white px-3 py-8 text-center text-slate-500"
                  colSpan={4}
                >
                  Golf seasons will appear here when data is added.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
