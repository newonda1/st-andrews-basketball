import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  buildGolfPdfPagesLabel,
  formatGolfDate,
  formatGolfPlace,
  getGolfSeasonLabel,
  sortGolfMatches,
  sortGolfTournaments,
} from "../golfPageUtils";

function SummaryCard({ season }) {
  const recapParagraphs = Array.isArray(season.HistoricalSummary)
    ? season.HistoricalSummary
    : [];

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">Season Recap</h2>
        {season.ArchivePdfUrl ? (
          <a
            href={season.ArchivePdfUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-full bg-[#012169] px-4 py-2 text-sm font-semibold text-white no-underline"
          >
            Open Official PDF
          </a>
        ) : null}
      </div>

      <div className="text-gray-800 leading-relaxed">
        {recapParagraphs.length ? (
          recapParagraphs.map((paragraph, index) => (
            <p key={`${season.SeasonID}-summary-${index}`} className="mb-3 leading-relaxed">
              {paragraph}
            </p>
          ))
        ) : (
          <p className="mb-3 leading-relaxed">
            {season.StatusNote || "State archive summary."}
          </p>
        )}
      </div>

      {Array.isArray(season.HighlightNotes) && season.HighlightNotes.length ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700">
          {season.HighlightNotes[0]}
        </p>
      ) : null}
    </section>
  );
}

function FinishersTable({ title, finishers = [], compact = false }) {
  if (!finishers.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border-b border-slate-300 px-3 py-2 text-center font-bold">
                Place
              </th>
              <th className="border-b border-slate-300 px-3 py-2 text-left font-bold">
                Golfer
              </th>
              <th className="border-b border-slate-300 px-3 py-2 text-left font-bold">
                School
              </th>
              <th className="border-b border-slate-300 px-3 py-2 text-center font-bold">
                Score
              </th>
            </tr>
          </thead>
          <tbody>
            {finishers.map((finisher) => (
              <tr
                key={`${title}-${finisher.place}-${finisher.player}-${finisher.score}`}
                className={finisher.isStAndrews ? "bg-blue-50" : "bg-white"}
              >
                <td className="border-b border-slate-200 px-3 py-2 text-center font-semibold text-slate-900">
                  {formatGolfPlace(finisher.place)}
                </td>
                <td className="border-b border-slate-200 px-3 py-2 text-slate-900">
                  <div className="font-semibold">{finisher.player}</div>
                  {!compact && finisher.award ? (
                    <div className="mt-1 text-xs text-slate-500">{finisher.award}</div>
                  ) : null}
                </td>
                <td className="border-b border-slate-200 px-3 py-2 text-slate-700">
                  {finisher.school}
                </td>
                <td className="border-b border-slate-200 px-3 py-2 text-center font-semibold text-slate-900">
                  {finisher.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TournamentCard({ tournament }) {
  const metaItems = [
    { label: "Date", value: tournament.Date ? formatGolfDate(tournament.Date) : null },
    { label: "Division", value: tournament.Division || "State Tournament" },
    { label: "Course", value: tournament.Course || null },
    { label: "Location", value: tournament.Location || null },
    {
      label: "Field",
      value: tournament.EntryCount
        ? `${tournament.EntryCount} published scores`
        : null,
    },
  ].filter((item) => item.value);

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{tournament.Name}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {metaItems.map((item) => (
              <span
                key={`${tournament.TournamentID}-${item.label}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600"
              >
                {item.label}: {item.value}
              </span>
            ))}
          </div>
        </div>
        <a
          href={tournament.SourcePdfUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 no-underline"
        >
          {buildGolfPdfPagesLabel(tournament.SourcePdfPages)}
        </a>
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-700">{tournament.Summary}</p>

      {tournament.ArchiveNote ? (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900">
          {tournament.ArchiveNote}
        </p>
      ) : null}

      <div className="mt-5 space-y-4">
        <FinishersTable title="Top Finishers" finishers={tournament.TopFinishers} />
        <FinishersTable
          title="Additional St. Andrew's Finishers"
          finishers={tournament.StAndrewsFinishers}
          compact
        />
      </div>
    </section>
  );
}

function getDivisionResultLabel(division) {
  const scores = Array.isArray(division.TeamScores) ? division.TeamScores : [];
  const stAndrews = scores.find((score) => score.IsStAndrews);

  if (!stAndrews || scores.length < 2) return "Result not listed";

  if (scores.length === 2) {
    const opponent = scores.find((score) => !score.IsStAndrews);
    const won = Number(stAndrews.Score) < Number(opponent.Score);
    return `${won ? "W" : "L"} ${stAndrews.Score}-${opponent.Score}`;
  }

  const sortedScores = scores
    .slice()
    .sort((a, b) => Number(a.Score) - Number(b.Score));
  const place =
    sortedScores.findIndex((score) => score.School === stAndrews.School) + 1;

  return `${formatGolfPlace(place)} of ${scores.length} / ${stAndrews.Score}`;
}

function getPlayerName(player) {
  if (!player) return "";
  if (player.PlayerName) return player.PlayerName;
  return [player.FirstName, player.LastName].filter(Boolean).join(" ");
}

function buildSchoolMap(schools) {
  return new Map(
    (Array.isArray(schools) ? schools : []).map((school) => [
      String(school.SchoolID),
      school,
    ])
  );
}

function getSchoolDisplayName(school, fallback = "") {
  return school?.ShortName || school?.Name || fallback;
}

function getSchoolLogoPath(school) {
  return school?.LogoPath || school?.BracketLogoPath || null;
}

function schoolKey(score) {
  return String(score?.SchoolID || score?.School || "");
}

function getPrimaryDivision(match) {
  const divisions = Array.isArray(match.Divisions) ? match.Divisions : [];
  return divisions[0] || null;
}

function getOpponents(match, schoolById) {
  const opponents = [];
  const seen = new Set();

  (Array.isArray(match.Divisions) ? match.Divisions : []).forEach((division) => {
    (Array.isArray(division.TeamScores) ? division.TeamScores : [])
      .filter((score) => !score.IsStAndrews)
      .forEach((score) => {
        const key = schoolKey(score);
        if (seen.has(key)) return;
        seen.add(key);
        opponents.push({
          score,
          school: schoolById.get(String(score.SchoolID)),
        });
      });
  });

  return opponents;
}

function getScheduleResultPieces(match) {
  const divisions = Array.isArray(match.Divisions) ? match.Divisions : [];

  return divisions
    .map((division) => {
      const scores = Array.isArray(division.TeamScores) ? division.TeamScores : [];
      const stAndrews = scores.find((score) => score.IsStAndrews);

      if (!stAndrews || scores.length < 2) {
        return null;
      }

      if (scores.length === 2) {
        const opponent = scores.find((score) => !score.IsStAndrews);
        const won = Number(stAndrews.Score) < Number(opponent.Score);
        return {
          division: division.Division,
          result: won ? "W" : "L",
          score: `${stAndrews.Score}-${opponent.Score}`,
        };
      }

      const sortedScores = scores
        .slice()
        .sort((a, b) => Number(a.Score) - Number(b.Score));
      const place =
        sortedScores.findIndex((score) => schoolKey(score) === schoolKey(stAndrews)) + 1;

      return {
        division: division.Division,
        result: `${formatGolfPlace(stAndrews.Place || place)} of ${
          division.TeamFieldSize || scores.length
        }`,
        score: String(stAndrews.Score),
      };
    })
    .filter(Boolean);
}

function SchoolLogo({ school, fallbackName }) {
  const logoPath = getSchoolLogoPath(school);
  const initials = getSchoolDisplayName(school, fallbackName)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden">
      {logoPath ? (
        <img
          src={logoPath}
          alt=""
          className="h-full w-full object-contain"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 text-[0.65rem] font-bold text-slate-500">
          {initials}
        </span>
      )}
    </div>
  );
}

function MatchCard({ match }) {
  const divisions = Array.isArray(match.Divisions) ? match.Divisions : [];

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            <Link
              to={`/athletics/golf/matches/${match.MatchID}`}
              className="text-blue-700 hover:text-blue-900"
            >
              {match.Name}
            </Link>
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { label: "Date", value: formatGolfDate(match.Date) },
              { label: "Course", value: match.Course },
              { label: "Location", value: match.Location },
              { label: "Source", value: match.SourceCitation },
            ]
              .filter((item) => item.value)
              .map((item) => (
                <span
                  key={`${match.MatchID}-${item.label}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600"
                >
                  {item.label}: {item.value}
                </span>
              ))}
          </div>
        </div>
        <Link
          to={`/athletics/golf/matches/${match.MatchID}`}
          className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 no-underline"
        >
          Open Match
        </Link>
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-700">{match.Summary}</p>

      {divisions.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {divisions.map((division) => (
            <div
              key={`${match.MatchID}-${division.Division}`}
              className="rounded-xl border border-slate-200 bg-white px-4 py-4"
            >
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-slate-500">
                {division.Division}
              </p>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {getDivisionResultLabel(division)}
              </p>
              {division.Medalist ? (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Medalist: {division.Medalist.PlayerName} (
                  {division.Medalist.School}) {division.Medalist.Score}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function SeasonRoster({ roster, playersById = new Map() }) {
  const players = Array.isArray(roster?.Players) ? roster.Players : [];

  if (!players.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-2xl font-semibold text-slate-900">Roster</h2>
        <span className="text-sm font-semibold text-slate-500">{players.length} golfers</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">Golfer</th>
              <th className="border px-3 py-2 text-center">Class</th>
              <th className="border px-3 py-2 text-center">Team</th>
            </tr>
          </thead>
          <tbody>
            {players.map((rosterPlayer, index) => {
              const masterPlayer = playersById.get(String(rosterPlayer.PlayerID));
              const displayName =
                getPlayerName(masterPlayer) || rosterPlayer.PlayerName || "Unknown";
              const gradYear = masterPlayer?.GradYear || rosterPlayer.GradYear || "-";

              return (
                <tr
                  key={rosterPlayer.PlayerID || `${displayName}-${index}`}
                  className={index % 2 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="border px-3 py-2 font-semibold text-slate-900">
                    {displayName}
                  </td>
                  <td className="border px-3 py-2 text-center text-slate-700">
                    {gradYear}
                  </td>
                  <td className="border px-3 py-2 text-center text-slate-700">
                    {rosterPlayer.Gender || masterPlayer?.Gender || "Golf"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {roster.Source ? (
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Source: {roster.Source}
        </p>
      ) : null}
    </section>
  );
}

function SeasonSchedule({ matches, schoolById }) {
  if (!matches.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-2xl font-semibold text-slate-900">Schedule &amp; Results</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">Date</th>
              <th className="border px-3 py-2 text-left">Opponent</th>
              <th className="border px-3 py-2">Location</th>
              <th className="border px-3 py-2">Result</th>
              <th className="border px-3 py-2">Score</th>
              <th className="border px-3 py-2">Type</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match, index) => {
              const opponents = getOpponents(match, schoolById);
              const resultPieces = getScheduleResultPieces(match);
              const type = match.MatchType || "Regular Season";

              return (
                <tr key={match.MatchID} className={index % 2 ? "bg-gray-50" : "bg-white"}>
                  <td className="border px-3 py-2 whitespace-nowrap">
                    {formatGolfDate(match.Date)}
                  </td>
                  <td className="border px-3 py-2">
                    <div className="space-y-2">
                      {opponents.map(({ score, school }) => (
                        <div key={schoolKey(score)} className="flex items-center gap-3">
                          <SchoolLogo school={school} fallbackName={score.School} />
                          <Link
                            to={`/athletics/golf/matches/${match.MatchID}`}
                            className="min-w-0 text-blue-700 underline hover:text-blue-900"
                          >
                            {getSchoolDisplayName(school, score.School)}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="border px-3 py-2 text-center">
                    {match.Course || match.Location || "Unknown"}
                  </td>
                  <td className="border px-3 py-2 text-center font-bold text-slate-900">
                    <div className="space-y-1">
                      {resultPieces.map((piece) => (
                        <div
                          key={`${match.MatchID}-${piece.division}-result`}
                          className={
                            piece.result === "W"
                              ? "text-green-700"
                              : piece.result === "L"
                                ? "text-red-700"
                                : "text-slate-900"
                          }
                        >
                          {resultPieces.length > 1 ? `${piece.division} ` : ""}
                          {piece.result}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="border px-3 py-2 text-center">
                    <div className="space-y-1">
                      {resultPieces.map((piece) => (
                        <div key={`${match.MatchID}-${piece.division}-score`}>
                          {resultPieces.length > 1 ? `${piece.division} ` : ""}
                          {piece.score}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="border px-3 py-2 text-center">{type}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function SeasonPage({
  seasons = [],
  tournaments = [],
  matches = [],
  seasonRosters = [],
  players = [],
  schools = [],
  status = "",
}) {
  const { seasonId } = useParams();

  const schoolById = useMemo(() => buildSchoolMap(schools), [schools]);

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

  const seasonTournaments = useMemo(() => {
    return sortGolfTournaments(
      tournaments.filter((entry) => Number(entry.Season) === Number(seasonId))
    );
  }, [seasonId, tournaments]);

  const seasonMatches = useMemo(() => {
    return sortGolfMatches(
      matches.filter((entry) => Number(entry.Season) === Number(seasonId))
    );
  }, [seasonId, matches]);

  const seasonRoster = useMemo(() => {
    return (
      seasonRosters.find(
        (entry) => Number(entry.SeasonID) === Number(seasonId)
      ) || null
    );
  }, [seasonId, seasonRosters]);

  if (!season) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center sm:px-6">
        <section className="rounded-[1.4rem] border border-slate-200 bg-white px-6 py-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Season Not Found</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            That golf season is not available yet.
          </p>
          <Link
            to="/athletics/golf/yearly-results"
            className="mt-5 inline-flex rounded-full bg-[#012169] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Golf Seasons
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
          {getGolfSeasonLabel(season)} Golf
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          {season.Classification || "State archive"}
        </p>
      </header>

      {seasonRoster ? (
        <SeasonRoster roster={seasonRoster} playersById={playersById} />
      ) : null}

      <SummaryCard season={season} />

      <SeasonSchedule matches={seasonMatches} schoolById={schoolById} />

      {seasonTournaments.length || !seasonMatches.length ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">
            State Tournaments
          </h2>

          {seasonTournaments.length ? (
            seasonTournaments.map((tournament) => (
              <TournamentCard
                key={tournament.TournamentID}
                tournament={tournament}
              />
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center text-sm text-slate-600">
              This season currently has an archive summary but no cleaned tournament
              table loaded yet.
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
