import React, { useMemo } from "react";

const ST_ANDREWS_SCHOOL_ID = "ga-st-andrews-school-savannah";

const ROUND_CONFIG = [
  { code: "R16", label: "Round of 16" },
  { code: "QF", label: "Quarterfinals" },
  { code: "SF", label: "Semifinals" },
  { code: "F", label: "Final" },
];

function classLabelFromGradYear(gradYear, seasonEndYear = 2026) {
  const year = Number(gradYear);
  if (!Number.isFinite(year)) return null;

  const diff = year - seasonEndYear;
  if (diff === 0) return "SR";
  if (diff === 1) return "JR";
  if (diff === 2) return "SO";
  if (diff === 3) return "FR";
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

function resolveParticipant(participant, playerMap, opponentMap, schoolMap) {
  if (!participant || participant.ParticipantType === "bye") {
    return {
      name: "Bye",
      classLabel: null,
      schoolName: null,
      logoPath: null,
      isBye: true,
    };
  }

  const isStAndrews = participant.ParticipantType === "stAndrewsPlayer";
  const player = isStAndrews ? playerMap.get(String(participant.PlayerID)) : null;
  const opponent = !isStAndrews
    ? opponentMap.get(String(participant.OpponentAthleteID))
    : null;
  const schoolId = isStAndrews ? ST_ANDREWS_SCHOOL_ID : opponent?.SchoolID;
  const school = schoolId ? schoolMap.get(String(schoolId)) : null;
  const classLabel = isStAndrews
    ? classLabelFromGradYear(player?.GradYear)
    : opponent?.ClassYearLabel || classLabelFromGradYear(opponent?.GradYear);

  return {
    name:
      (player?.FirstName || player?.LastName
        ? `${player?.FirstName || ""} ${player?.LastName || ""}`.trim()
        : null) ||
      opponent?.DisplayName ||
      participant.DisplayName ||
      "TBD",
    classLabel,
    schoolName:
      school?.ShortName ||
      school?.Name ||
      opponent?.SourceSchoolLabel ||
      (isStAndrews ? "St. Andrew's" : null),
    logoPath: school?.BracketLogoPath || school?.LogoPath || null,
    isBye: false,
  };
}

function scoreForSide(match, side) {
  return Array.isArray(match?.Sets)
    ? match.Sets.map((set) => set?.[side]).filter((score) => score !== undefined)
    : [];
}

function ParticipantLogo({ participant }) {
  if (participant.logoPath) {
    return (
      <img
        src={participant.logoPath}
        alt=""
        className="h-9 w-9 shrink-0 object-contain"
      />
    );
  }

  if (participant.isBye) {
    return <span className="h-9 w-9 shrink-0" aria-hidden="true" />;
  }

  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-bold text-slate-500"
      aria-hidden="true"
    >
      {participant.name.slice(0, 1)}
    </span>
  );
}

function ParticipantRow({ participant, scores, isWinner }) {
  return (
    <div className="relative grid min-h-[70px] grid-cols-[1fr_auto] items-center gap-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <ParticipantLogo participant={participant} />
        <div className="min-w-0">
          <p
            className={`truncate text-base font-bold ${
              participant.isBye
                ? "text-slate-800"
                : isWinner
                  ? "text-[#1f73d8]"
                  : "text-slate-700"
            }`}
          >
            {participant.name}
          </p>
          {participant.classLabel || participant.schoolName ? (
            <p className="mt-1 truncate text-sm font-semibold text-slate-500">
              {participant.classLabel}
              {participant.classLabel && participant.schoolName ? " • " : ""}
              {participant.schoolName}
            </p>
          ) : null}
        </div>
      </div>

      {scores.length ? (
        <div className="flex items-center gap-3 pr-3 text-lg font-bold tabular-nums">
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

      {isWinner && !participant.isBye ? (
        <span
          className="absolute right-0 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[9px] border-r-[12px] border-y-transparent border-r-black"
          aria-label="Winner"
        />
      ) : null}
    </div>
  );
}

function MatchCard({ match, playerMap, opponentMap, schoolMap }) {
  const topEntry =
    match.Participants?.find((participant) => participant.Side === "top") || null;
  const bottomEntry =
    match.Participants?.find((participant) => participant.Side === "bottom") || null;
  const top = resolveParticipant(topEntry, playerMap, opponentMap, schoolMap);
  const bottom = resolveParticipant(bottomEntry, playerMap, opponentMap, schoolMap);

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <ParticipantRow
        participant={top}
        scores={scoreForSide(match, "top")}
        isWinner={match.WinnerSide === "top"}
      />
      <div className="mx-4 border-t border-dashed border-slate-300" />
      <ParticipantRow
        participant={bottom}
        scores={scoreForSide(match, "bottom")}
        isWinner={match.WinnerSide === "bottom"}
      />
    </article>
  );
}

export default function TennisTournamentBracket({
  bracket,
  matches = [],
  players = [],
  opponentAthletes = [],
  schools = [],
}) {
  const playerMap = useMemo(() => buildMap(players, "PlayerID"), [players]);
  const opponentMap = useMemo(
    () => buildMap(opponentAthletes, "OpponentAthleteID"),
    [opponentAthletes]
  );
  const schoolMap = useMemo(() => buildMap(schools, "SchoolID"), [schools]);

  const rounds = useMemo(() => {
    return ROUND_CONFIG.map((round) => ({
      ...round,
      matches: matches
        .filter((match) => match.BracketID === bracket.BracketID)
        .filter((match) => match.RoundCode === round.code)
        .slice()
        .sort((a, b) => Number(a.MatchNumber) - Number(b.MatchNumber)),
    })).filter((round) => round.matches.length);
  }, [bracket.BracketID, matches]);

  if (!rounds.length) {
    return (
      <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        Bracket data will appear here when it is added.
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto pb-3">
      <div className="grid min-w-[1480px] grid-cols-4 gap-8">
        {rounds.map((round) => (
          <div key={round.code} className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
              {round.label}
            </h4>
            <div
              className={
                round.code === "QF"
                  ? "space-y-16 pt-[74px]"
                  : round.code === "SF"
                    ? "space-y-40 pt-[228px]"
                    : round.code === "F"
                      ? "space-y-4 pt-[474px]"
                      : "space-y-4"
              }
            >
              {round.matches.map((match) => (
                <MatchCard
                  key={match.TennisMatchID}
                  match={match}
                  playerMap={playerMap}
                  opponentMap={opponentMap}
                  schoolMap={schoolMap}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
