import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { StateBracket8GameSVG } from "../../boys/basketball/components/GameCardBracketsSVG";
import {
  getTennisDateLabel,
  getTennisMatchCategory,
  getTennisSeasonLabel,
  sortTennisMatches,
} from "../tennisPageUtils";

const BOYS_STATE_TOURNAMENT_BRACKET = {
  title: "2026 GIAA Class AAA Boys Tennis State Tournament",
  layout: {
    minWidth: 1080,
    teamNameFontSize: 14,
  },
  rounds: {
    quarterfinals: {
      label: "Tuesday, April 28, 2026",
      subtitle: "Quarterfinals",
    },
    semifinals: {
      label: "Wednesday, April 29, 2026",
      subtitle: "Semifinals",
    },
    championship: {
      label: "Wednesday, April 29, 2026",
      subtitle: "Championship",
    },
  },
  teams: {
    rivers: {
      schoolId: "ga-rivers-academy-alpharetta",
      seed: 1,
    },
    williamReed: {
      schoolId: "ga-william-and-reed-academy-johns-creek",
      seed: 2,
    },
    brookwood: {
      schoolId: "ga-brookwood-academy-thomasville",
      seed: 3,
    },
    westminster: {
      schoolId: "ga-westminster-schools-of-augusta-augusta",
      seed: 4,
    },
    stAndrews: {
      schoolId: "ga-st-andrews-school-savannah",
      seed: 5,
    },
    terrell: {
      schoolId: "ga-terrell-academy-dawson",
      seed: 6,
    },
    pinewoodChristian: {
      schoolId: "ga-pinewood-christian-academy-bellville",
      seed: 7,
    },
  },
  games: {
    qf_1: {
      top: { teamId: "rivers", seed: 1 },
      bottom: { name: "BYE", seed: 8 },
      winner: "rivers",
    },
    qf_2: {
      top: { teamId: "westminster", seed: 4 },
      bottom: { teamId: "stAndrews", seed: 5 },
      winner: "stAndrews",
    },
    qf_3: {
      top: { teamId: "brookwood", seed: 3 },
      bottom: { teamId: "terrell", seed: 6 },
      winner: "brookwood",
    },
    qf_4: {
      top: { teamId: "williamReed", seed: 2 },
      bottom: { teamId: "pinewoodChristian", seed: 7 },
      winner: "williamReed",
    },
    sf_top: {
      top: { teamId: "rivers", seed: 1 },
      bottom: { teamId: "stAndrews", seed: 5 },
    },
    sf_bot: {
      top: { teamId: "brookwood", seed: 3 },
      bottom: { teamId: "williamReed", seed: 2 },
      winner: "williamReed",
    },
    final: {
      top: { name: "Semifinal Winner" },
      bottom: { teamId: "williamReed", seed: 2 },
    },
  },
};

function buildSchoolMap(schools = []) {
  return new Map(
    (Array.isArray(schools) ? schools : [])
      .filter((school) => school?.SchoolID)
      .map((school) => [String(school.SchoolID), school])
  );
}

function getOpponentSchool(match, schoolMap) {
  if (!match?.OpponentSchoolID) return null;
  return schoolMap.get(String(match.OpponentSchoolID)) || null;
}

function getOpponentDisplayName(match, schoolMap) {
  const school = getOpponentSchool(match, schoolMap);
  return (
    school?.Name ||
    school?.ShortName ||
    match?.Opponent ||
    match?.Name ||
    "Opponent"
  );
}

function getOpponentLogoPath(match, schoolMap) {
  const school = getOpponentSchool(match, schoolMap);
  return school?.LogoPath || school?.BracketLogoPath || null;
}

function getInitials(label = "") {
  const parts = String(label)
    .replace(/St\. Andrew's/gi, "")
    .split(/\s+/)
    .filter(Boolean);
  return (parts[0]?.slice(0, 1) || "T").toUpperCase();
}

function getMatchSiteLabel(match) {
  if (match?.HomeAway) return match.HomeAway;
  if (match?.MatchType === "Tournament") return "Neutral";

  const name = String(match?.Name || "").toLowerCase();
  if (name.includes(" at ")) return "Away";
  if (name.includes(" vs. ") || name.includes(" vs ")) return "Home";

  return "—";
}

export default function SeasonPage({
  seasons = [],
  matches = [],
  schools = [],
  status = "",
}) {
  const { seasonId } = useParams();
  const schoolMap = useMemo(() => buildSchoolMap(schools), [schools]);

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
  const showBoysStateTournamentBracket = Number(seasonId) === 2026;

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
          {getTennisSeasonLabel(season)} Season
        </h1>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">
          Schedule &amp; Results
        </h2>

        <SeasonMatchTable
          title="Boys Matches"
          matches={boysMatches}
          schoolMap={schoolMap}
        />
        {showBoysStateTournamentBracket ? (
          <section id="boys-state-tournament-bracket" className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">
              Boys State Tournament Bracket
            </h3>
            <StateBracket8GameSVG
              bracket={BOYS_STATE_TOURNAMENT_BRACKET}
              schools={schools}
            />
          </section>
        ) : null}
        <SeasonMatchTable
          title="Girls Matches"
          matches={girlsMatches}
          schoolMap={schoolMap}
        />
        {otherMatches.length ? (
          <SeasonMatchTable
            title="Other Events"
            matches={otherMatches}
            schoolMap={schoolMap}
          />
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

function SeasonMatchTable({ title, matches = [], schoolMap }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] border-collapse text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="border-b border-slate-300 px-3 py-2 text-left font-bold">
                Date
              </th>
              <th className="border-b border-slate-300 px-3 py-2 text-left font-bold">
                Opponent
              </th>
              <th className="border-b border-slate-300 px-3 py-2 text-center font-bold">
                Home/Away
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
              matches.map((match, index) => {
                const opponentName =
                  match.MatchType === "Tournament"
                    ? match.Name
                    : getOpponentDisplayName(match, schoolMap);
                const logoPath =
                  match.MatchType === "Tournament"
                    ? null
                    : getOpponentLogoPath(match, schoolMap);
                const result = resultLabel(match);
                const resultTone = result.startsWith("W")
                  ? "text-emerald-700"
                  : result.startsWith("L")
                    ? "text-rose-700"
                    : "text-slate-700";

                return (
                  <tr
                    key={match.MatchID}
                    className={index % 2 === 0 ? "bg-white" : "bg-slate-50/70"}
                  >
                    <td className="border-b border-slate-200 px-3 py-2 whitespace-nowrap">
                      {getTennisDateLabel(match)}
                    </td>
                    <td className="border-b border-slate-200 px-3 py-2">
                      <div className="flex items-center gap-3">
                        {logoPath ? (
                          <img
                            src={logoPath}
                            alt=""
                            className="h-8 w-8 shrink-0 object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center text-xs font-bold text-slate-500"
                            aria-hidden="true"
                          >
                            {getInitials(opponentName)}
                          </span>
                        )}
                        <div className="min-w-0">
                          <Link
                            to={`/athletics/tennis/matches/${match.MatchID}`}
                            className="font-bold text-blue-700 hover:text-blue-900"
                          >
                            {opponentName}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-slate-200 px-3 py-2 text-center whitespace-nowrap">
                      {getMatchSiteLabel(match)}
                    </td>
                    <td className="border-b border-slate-200 px-3 py-2 text-center whitespace-nowrap">
                      {getTennisMatchCategory(match)}
                    </td>
                    <td
                      className={`border-b border-slate-200 px-3 py-2 text-center font-bold whitespace-nowrap ${resultTone}`}
                    >
                      {result}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="px-3 py-8 text-center text-slate-500" colSpan={5}>
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
