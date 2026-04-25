import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  formatTennisDate,
  getTennisSeasonLabel,
  sortTennisMatches,
} from "../tennisPageUtils";

export default function SeasonPage({ seasons = [], matches = [], status = "" }) {
  const { seasonId } = useParams();

  const season = useMemo(() => {
    return (
      seasons.find((entry) => Number(entry.SeasonID) === Number(seasonId)) || null
    );
  }, [seasonId, seasons]);

  const seasonMatches = useMemo(() => {
    return sortTennisMatches(
      matches.filter((match) => Number(match.Season) === Number(seasonId))
    );
  }, [matches, seasonId]);

  const boysMatches = useMemo(
    () => seasonMatches.filter((match) => match.Gender === "Boys"),
    [seasonMatches]
  );
  const girlsMatches = useMemo(
    () => seasonMatches.filter((match) => match.Gender === "Girls"),
    [seasonMatches]
  );
  const otherMatches = useMemo(
    () =>
      seasonMatches.filter(
        (match) => match.Gender !== "Boys" && match.Gender !== "Girls"
      ),
    [seasonMatches]
  );

  if (!season) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center sm:px-6">
        <section className="rounded-[1.4rem] border border-slate-200 bg-white px-6 py-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Season Not Found</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            That tennis season is not available yet.
          </p>
          <Link
            to="/athletics/tennis/yearly-results"
            className="mt-5 inline-flex rounded-full bg-[#012169] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Tennis Seasons
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-24 pt-2 sm:px-6">
      {status ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm text-slate-600 shadow-sm">
          {status}
        </div>
      ) : null}

      <header className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          {getTennisSeasonLabel(season)} Tennis
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          {season.Classification || "Season results"}
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">
          Matches &amp; Tournaments
        </h2>

        <SeasonMatchTable title="Boys Matches" matches={boysMatches} />
        <SeasonMatchTable title="Girls Matches" matches={girlsMatches} />
        {otherMatches.length ? (
          <SeasonMatchTable title="Other Events" matches={otherMatches} />
        ) : null}
      </section>
    </div>
  );
}

function resultLabel(match) {
  const score = match.TeamScore;
  if (!score) return match.Status || "—";

  const result = score.Result ? `${score.Result} ` : "";
  if (score.StAndrews !== undefined && score.Opponent !== undefined) {
    return `${result}${score.StAndrews}-${score.Opponent}`.trim();
  }

  return result.trim() || match.Status || "—";
}

function SeasonMatchTable({ title, matches = [] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border-b border-slate-300 px-3 py-2 text-center font-bold">
                Date
              </th>
              <th className="border-b border-slate-300 px-3 py-2 text-left font-bold">
                Event
              </th>
              <th className="border-b border-slate-300 px-3 py-2 text-center font-bold">
                Type
              </th>
              <th className="border-b border-slate-300 px-3 py-2 text-center font-bold">
                Result
              </th>
            </tr>
          </thead>
          <tbody>
            {matches.length ? (
              matches.map((match) => (
                <tr key={match.MatchID}>
                  <td className="border-b border-slate-200 px-3 py-2 text-center">
                    {formatTennisDate(match.Date)}
                  </td>
                  <td className="border-b border-slate-200 px-3 py-2">
                    <Link
                      to={`/athletics/tennis/matches/${match.MatchID}`}
                      className="font-bold text-blue-700 hover:text-blue-900"
                    >
                      {match.Name}
                    </Link>
                    {match.Location ? (
                      <div className="mt-1 text-xs text-slate-500">
                        {match.Location}
                      </div>
                    ) : null}
                  </td>
                  <td className="border-b border-slate-200 px-3 py-2 text-center">
                    {match.MatchType || "Match"}
                  </td>
                  <td className="border-b border-slate-200 px-3 py-2 text-center font-semibold">
                    {resultLabel(match)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-3 py-8 text-center text-slate-500" colSpan={4}>
                  No matches added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
