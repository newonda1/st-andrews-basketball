import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { athleteProfilePath } from "../../athletes/archiveEra";
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

function getSchoolDisplayName(school) {
  return school?.Name || school?.ShortName || null;
}

function getSchoolLogoPath(school) {
  return school?.LogoPath || school?.BracketLogoPath || null;
}

function getOpponentFallbackName(match) {
  return match?.Opponent || match?.Name || "Opponent";
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

function splitParagraphs(value) {
  if (Array.isArray(value)) {
    return value.map((paragraph) => String(paragraph || "").trim()).filter(Boolean);
  }

  return String(value || "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function formatRosterGrade(grade) {
  if (grade === null || grade === undefined || grade === "") return "-";
  const value = Number(grade);
  if (!Number.isFinite(value)) return String(grade);
  if (value === 8) return "8th";
  if (value === 9) return "Fr.";
  if (value === 10) return "So.";
  if (value === 11) return "Jr.";
  if (value === 12) return "Sr.";
  return String(grade);
}

function gradeFromGradYear(gradYear, seasonId) {
  const grad = Number(gradYear);
  const season = Number(seasonId);
  if (!Number.isFinite(grad) || !Number.isFinite(season)) return null;
  const grade = 12 + season - grad;
  return grade >= 7 && grade <= 12 ? grade : null;
}

function getPlayerDisplayName(player) {
  return (
    player?.PlayerName ||
    [player?.FirstName, player?.LastName].filter(Boolean).join(" ") ||
    "Unknown Player"
  );
}

function SeasonRecapSection({ season }) {
  const paragraphs = splitParagraphs(
    season?.SeasonRecapParagraphs || season?.SeasonRecap || season?.StatusNote
  );

  return (
    <section id="season-recap" className="mx-auto max-w-4xl space-y-3">
      <h2 className="text-2xl font-semibold text-slate-900">Season Recap</h2>
      {paragraphs.length ? (
        <div className="space-y-3 text-base leading-7 text-slate-700">
          {paragraphs.map((paragraph, index) => (
            <p key={`${paragraph}-${index}`}>{paragraph}</p>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
          <p className="text-base font-semibold text-slate-900">Season recap not ready yet</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            A written recap for this tennis season will be added here.
          </p>
        </div>
      )}
    </section>
  );
}

function SeasonImagesSection({ seasonLabel }) {
  return (
    <section id="season-images" className="space-y-3">
      <h2 className="text-2xl font-semibold text-slate-900">Season Images</h2>
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
        <p className="text-base font-semibold text-slate-900">Season photo gallery coming soon</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Photos from the {seasonLabel} tennis season will be added here.
        </p>
      </div>
    </section>
  );
}

function TennisRosterTable({ rows }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full bg-white text-sm text-center">
        <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
          <tr>
            <th className="px-3 py-2 text-left font-normal">Player</th>
            <th className="px-3 py-2 font-normal">Grade</th>
            <th className="px-3 py-2 font-normal">Team</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr
                key={row.playerId}
                className={`border-t border-slate-200 ${
                  index % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                } hover:bg-slate-100`}
              >
                <td className="px-3 py-2 text-left">
                  <Link
                    to={athleteProfilePath(row.playerId, "tennis")}
                    className="text-blue-700 underline hover:text-blue-900"
                  >
                    {row.name}
                  </Link>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{formatRosterGrade(row.grade)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{row.team}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="px-3 py-4 text-center text-slate-600">
                No roster data is available for this season yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function SeasonPage({
  seasons = [],
  matches = [],
  players = [],
  schools = [],
  status = "",
}) {
  const { seasonId } = useParams();
  const schoolMap = useMemo(() => buildSchoolMap(schools), [schools]);
  const playersById = useMemo(() => {
    return new Map(
      (Array.isArray(players) ? players : []).map((player) => [
        String(player.PlayerID),
        player,
      ])
    );
  }, [players]);

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
  const rosterRows = useMemo(() => {
    const rowsByPlayerId = new Map();

    seasonMatches.forEach((match) => {
      const lineMatches = Array.isArray(match.LineMatches) ? match.LineMatches : [];
      lineMatches.forEach((lineMatch) => {
        const participants = Array.isArray(lineMatch.Participants) ? lineMatch.Participants : [];
        participants
          .filter((participant) => participant?.ParticipantType === "stAndrewsPlayer")
          .forEach((participant) => {
            const playerId = String(participant.PlayerID || "").trim();
            if (!playerId || rowsByPlayerId.has(playerId)) return;

            const player = playersById.get(playerId);
            rowsByPlayerId.set(playerId, {
              playerId,
              name: getPlayerDisplayName(player),
              grade: gradeFromGradYear(player?.GradYear, seasonId),
              team: match.Gender || "Tennis",
            });
          });
      });
    });

    return Array.from(rowsByPlayerId.values()).sort((a, b) => {
      const gradeDiff = Number(b.grade || 0) - Number(a.grade || 0);
      if (gradeDiff) return gradeDiff;
      return a.name.localeCompare(b.name);
    });
  }, [playersById, seasonId, seasonMatches]);
  const showBoysStateTournamentBracket = Number(seasonId) === 2026;
  const seasonLabel = getTennisSeasonLabel(season);

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
          {seasonLabel} Season
        </h1>
      </header>

      <SeasonRecapSection season={season} />

      <SeasonImagesSection seasonLabel={seasonLabel} />

      <section id="season-roster" className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Roster</h2>
        <TennisRosterTable rows={rosterRows} />
      </section>

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
              <th className="border-b border-slate-300 px-2 py-2 text-left text-xs font-normal whitespace-nowrap">
                Date
              </th>
              <th className="border-b border-slate-300 px-2 py-2 pl-10 text-left text-xs font-normal whitespace-nowrap">
                Opponent
              </th>
              <th className="border-b border-slate-300 px-2 py-2 text-center text-xs font-normal whitespace-nowrap">
                Home/Away
              </th>
              <th className="border-b border-slate-300 px-2 py-2 text-center text-xs font-normal whitespace-nowrap">
                Type
              </th>
              <th className="border-b border-slate-300 px-2 py-2 text-center text-xs font-normal whitespace-nowrap">
                Result
              </th>
            </tr>
          </thead>
          <tbody>
            {matches.length ? (
              matches.map((match, index) => {
                const opponentSchool =
                  match.MatchType === "Tournament"
                    ? null
                    : getOpponentSchool(match, schoolMap);
                const opponentName =
                  match.MatchType === "Tournament"
                    ? match.Name
                    : getSchoolDisplayName(opponentSchool) ||
                      getOpponentFallbackName(match);
                const logoPath = getSchoolLogoPath(opponentSchool);
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
                    <td className="border-b border-slate-200 px-2 py-1.5 align-middle whitespace-nowrap">
                      {getTennisDateLabel(match)}
                    </td>
                    <td className="border-b border-slate-200 px-2 py-1.5 align-middle">
                      <div className="flex items-center gap-2">
                        {logoPath ? (
                          <img
                            src={logoPath}
                            alt={`${opponentName} logo`}
                            className="h-6 w-6 shrink-0 object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center text-xs font-bold text-slate-500"
                            aria-hidden="true"
                          >
                            {getInitials(opponentName)}
                          </span>
                        )}
                        <div className="min-w-0">
                          <Link
                            to={`/athletics/tennis/matches/${match.MatchID}`}
                            className="text-blue-700 hover:text-blue-900"
                          >
                            {opponentName}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-slate-200 px-2 py-1.5 text-center align-middle whitespace-nowrap">
                      {getMatchSiteLabel(match)}
                    </td>
                    <td className="border-b border-slate-200 px-2 py-1.5 text-center align-middle whitespace-nowrap">
                      {getTennisMatchCategory(match)}
                    </td>
                    <td
                      className={`border-b border-slate-200 px-2 py-1.5 text-center align-middle font-semibold whitespace-nowrap ${resultTone}`}
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
