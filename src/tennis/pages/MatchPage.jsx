import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import TennisTournamentBracket from "../components/TennisTournamentBracket";
import { formatTennisDate } from "../tennisPageUtils";

const ST_ANDREWS_SCHOOL_ID = "ga-st-andrews-school-savannah";

function classLabelFromGradYear(gradYear, seasonEndYear = 2026) {
  const year = Number(gradYear);
  if (!Number.isFinite(year)) return null;

  const diff = year - seasonEndYear;
  if (diff === 0) return "SR";
  if (diff === 1) return "JR";
  if (diff === 2) return "SO";
  if (diff === 3) return "FR";
  if (diff === 4) return "8th";
  if (diff > 3) return `${12 - diff}th`;
  return null;
}

function buildMap(items, key) {
  const map = new Map();
  for (const item of Array.isArray(items) ? items : []) {
    if (item?.[key] !== undefined && item?.[key] !== null) {
      map.set(String(item[key]), item);
    }
  }
  return map;
}

function scoreForSide(line, side) {
  return Array.isArray(line?.Sets)
    ? line.Sets.map((set) => set?.[side]).filter((score) => score !== undefined)
    : [];
}

function resolveLineMember(member, playerMap, opponentMap, schoolMap) {
  const isStAndrews = member?.ParticipantType === "stAndrewsPlayer";
  const player = isStAndrews ? playerMap.get(String(member.PlayerID)) : null;
  const opponent = !isStAndrews
    ? opponentMap.get(String(member?.OpponentAthleteID))
    : null;
  const schoolId = isStAndrews
    ? ST_ANDREWS_SCHOOL_ID
    : member?.SchoolID || opponent?.SchoolID;
  const school = schoolId ? schoolMap.get(String(schoolId)) : null;
  const classLabel =
    member?.ClassYearLabel ||
    (isStAndrews
      ? classLabelFromGradYear(player?.GradYear)
      : opponent?.ClassYearLabel || classLabelFromGradYear(opponent?.GradYear));

  return {
    name:
      member?.DisplayName ||
      (player?.FirstName || player?.LastName
        ? `${player?.FirstName || ""} ${player?.LastName || ""}`.trim()
        : null) ||
      opponent?.DisplayName ||
      "TBD",
    ratingLabel: member?.RatingLabel || null,
    classLabel,
    schoolName:
      school?.ShortName ||
      school?.Name ||
      opponent?.SourceSchoolLabel ||
      member?.SourceSchoolLabel ||
      (isStAndrews ? "St. Andrew's" : null),
    logoPath: school?.BracketLogoPath || school?.LogoPath || null,
  };
}

function resolveLineSide(participant, playerMap, opponentMap, schoolMap) {
  if (Array.isArray(participant?.TeamMembers) && participant.TeamMembers.length) {
    const members = participant.TeamMembers.map((member) =>
      resolveLineMember(member, playerMap, opponentMap, schoolMap)
    );

    return {
      name: participant.DisplayName || members.map((member) => member.name).join(" / "),
      members,
    };
  }

  return {
    name: participant?.DisplayName || "TBD",
    members: [resolveLineMember(participant, playerMap, opponentMap, schoolMap)],
  };
}

function LineMember({ member, isWinner }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      {member.logoPath ? (
        <img src={member.logoPath} alt="" className="h-8 w-8 shrink-0 object-contain" />
      ) : (
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-bold text-slate-500"
          aria-hidden="true"
        >
          {member.name.slice(0, 1)}
        </span>
      )}
      <div className="min-w-0">
        <p
          className={`truncate text-sm font-bold ${
            isWinner ? "text-[#1f73d8]" : "text-slate-700"
          }`}
        >
          {member.name}
          {member.ratingLabel ? (
            <span className="ml-2 font-semibold text-slate-500">
              {member.ratingLabel}
            </span>
          ) : null}
        </p>
        {member.classLabel || member.schoolName ? (
          <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
            {member.classLabel}
            {member.classLabel && member.schoolName ? " • " : ""}
            {member.schoolName}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function LineSide({ participant, scores, isWinner }) {
  return (
    <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
      <div className="min-w-0 space-y-2">
        {participant.members.map((member, index) => (
          <LineMember
            key={`${participant.name}-${member.name}-${index}`}
            member={member}
            isWinner={isWinner}
          />
        ))}
      </div>
      {scores.length ? (
        <div className="flex items-center gap-3 pr-2 text-lg font-bold tabular-nums">
          {scores.map((score, index) => (
            <span
              key={`${participant.name}-score-${index}`}
              className={isWinner ? "text-black" : "text-slate-500"}
            >
              {score}
            </span>
          ))}
        </div>
      ) : null}
      {isWinner ? (
        <span
          className="absolute right-0 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[8px] border-r-[10px] border-y-transparent border-r-black"
          aria-label="Winner"
        />
      ) : null}
    </div>
  );
}

function DualLineCard({ line, playerMap, opponentMap, schoolMap }) {
  const topEntry =
    line.Participants?.find((participant) => participant.Side === "top") || null;
  const bottomEntry =
    line.Participants?.find((participant) => participant.Side === "bottom") || null;
  const top = resolveLineSide(topEntry, playerMap, opponentMap, schoolMap);
  const bottom = resolveLineSide(bottomEntry, playerMap, opponentMap, schoolMap);

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {line.EventType} {line.LineNumber}
      </div>
      <LineSide
        participant={top}
        scores={scoreForSide(line, "top")}
        isWinner={line.WinnerSide === "top"}
      />
      <div className="mx-4 border-t border-dashed border-slate-300" />
      <LineSide
        participant={bottom}
        scores={scoreForSide(line, "bottom")}
        isWinner={line.WinnerSide === "bottom"}
      />
    </article>
  );
}

function DualMatchResults({ match, players, opponentAthletes, schools }) {
  const playerMap = useMemo(() => buildMap(players, "PlayerID"), [players]);
  const opponentMap = useMemo(
    () => buildMap(opponentAthletes, "OpponentAthleteID"),
    [opponentAthletes]
  );
  const schoolMap = useMemo(() => buildMap(schools, "SchoolID"), [schools]);
  const lines = Array.isArray(match.LineMatches) ? match.LineMatches : [];
  const groupedLines = ["Singles", "Doubles"]
    .map((eventType) => ({
      eventType,
      lines: lines
        .filter((line) => line.EventType === eventType)
        .slice()
        .sort((a, b) => Number(a.LineNumber) - Number(b.LineNumber)),
    }))
    .filter((group) => group.lines.length);
  const opponentSchool = schoolMap.get(String(match.OpponentSchoolID));
  const opponentName =
    opponentSchool?.ShortName || opponentSchool?.Name || "Opponent";

  return (
    <section className="space-y-5">
      {match.TeamScore ? (
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Final
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            St. Andrew&apos;s {match.TeamScore.StAndrews}
            <span className="px-3 text-slate-400">-</span>
            {match.TeamScore.Opponent} {opponentName}
          </p>
        </div>
      ) : null}

      {groupedLines.map((group) => (
        <div key={group.eventType}>
          <h2 className="text-xl font-bold text-slate-900">{group.eventType}</h2>
          <div className="mt-3 grid gap-3">
            {group.lines.map((line) => (
              <DualLineCard
                key={line.TennisMatchID}
                line={line}
                playerMap={playerMap}
                opponentMap={opponentMap}
                schoolMap={schoolMap}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function BracketSection({
  bracket,
  bracketMatches,
  players,
  opponentAthletes,
  schools,
}) {
  const hasMatches = bracketMatches.some(
    (match) => match.BracketID === bracket.BracketID
  );

  return (
    <section className="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">{bracket.Name}</h3>
      {hasMatches ? (
        <TennisTournamentBracket
          bracket={bracket}
          matches={bracketMatches}
          players={players}
          opponentAthletes={opponentAthletes}
          schools={schools}
        />
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          Awaiting bracket data.
        </div>
      )}
    </section>
  );
}

export default function MatchPage({
  matches = [],
  players = [],
  opponentAthletes = [],
  schools = [],
  status = "",
}) {
  const { matchId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [tournamentStatus, setTournamentStatus] = useState("");

  const match = useMemo(() => {
    return matches.find((entry) => String(entry.MatchID) === String(matchId)) || null;
  }, [matchId, matches]);

  useEffect(() => {
    let cancelled = false;

    async function loadTournament() {
      if (!match?.TournamentDataPath) {
        setTournament(null);
        setTournamentStatus("");
        return;
      }

      setTournamentStatus("Loading tournament data...");

      try {
        const response = await fetch(match.TournamentDataPath);
        if (!response.ok) {
          throw new Error(`Could not load tournament data (${response.status}).`);
        }
        const data = await response.json();

        if (!cancelled) {
          setTournament(data);
          setTournamentStatus("");
        }
      } catch (error) {
        if (!cancelled) {
          setTournament(null);
          setTournamentStatus(error?.message || "Failed to load tournament data.");
        }
      }
    }

    loadTournament();

    return () => {
      cancelled = true;
    };
  }, [match?.TournamentDataPath]);

  if (!match) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center sm:px-6">
        <section className="rounded-[1.4rem] border border-slate-200 bg-white px-6 py-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Match Not Found</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            That tennis match or tournament is not available yet.
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

  const brackets = match.Brackets || tournament?.Brackets || [];
  const bracketMatches = Array.isArray(match.BracketMatches)
    ? match.BracketMatches
    : [];
  const lineMatches = Array.isArray(match.LineMatches) ? match.LineMatches : [];

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-24 pt-2 sm:px-6">
      {status || tournamentStatus ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm text-slate-600 shadow-sm">
          {tournamentStatus || status}
        </div>
      ) : null}

      <header className="text-center">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
          {formatTennisDate(match.Date)}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{match.Name}</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          {match.Classification || tournament?.Classification || match.MatchType}
        </p>
      </header>

      {lineMatches.length ? (
        <DualMatchResults
          match={match}
          players={players}
          opponentAthletes={opponentAthletes}
          schools={schools}
        />
      ) : null}

      {brackets.length ? (
        <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Tournament Brackets
            </h2>
          </div>
          <span className="text-sm font-semibold text-slate-500">
            {brackets.length} brackets
          </span>
        </div>

        {brackets.length ? (
          <div className="space-y-4">
            {brackets.map((bracket) => (
              <BracketSection
                key={bracket.BracketID}
                bracket={bracket}
                bracketMatches={bracketMatches}
                players={players}
                opponentAthletes={opponentAthletes}
                schools={schools}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            Bracket data will appear here when it is added.
          </div>
        )}
        </section>
      ) : null}
    </div>
  );
}
