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
        className="h-8 w-8 shrink-0 object-contain"
      />
    );
  }

  if (participant.isBye) {
    return <span className="h-8 w-8 shrink-0" aria-hidden="true" />;
  }

  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-bold text-slate-500"
      aria-hidden="true"
    >
      {participant.name.slice(0, 1)}
    </span>
  );
}

function ParticipantRow({ participant, scores, isWinner }) {
  return (
    <div className="relative grid h-[58px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-2">
      <div className="flex min-w-0 items-center gap-2.5">
        <ParticipantLogo participant={participant} />
        <div className="min-w-0">
          <p
            className={`truncate text-[0.92rem] font-bold leading-5 ${
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
            <p className="mt-0.5 truncate text-[0.76rem] font-semibold leading-4 text-slate-500">
              {participant.classLabel}
              {participant.classLabel && participant.schoolName ? " • " : ""}
              {participant.schoolName}
            </p>
          ) : null}
        </div>
      </div>

      {scores.length ? (
        <div className="flex items-center gap-2 pr-2 text-base font-bold tabular-nums">
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
          className="absolute right-0 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[8px] border-r-[10px] border-y-transparent border-r-black"
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
    <article className="h-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
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

const BRACKET_LAYOUT = {
  cardW: 270,
  cardH: 117,
  colGap: 56,
  rowGap: 22,
  headerH: 34,
};

function makeLayout(rounds) {
  const { cardW, cardH, colGap, rowGap, headerH } = BRACKET_LAYOUT;
  const xByRound = {
    R16: 0,
    QF: cardW + colGap,
    SF: 2 * (cardW + colGap),
    F: 3 * (cardW + colGap),
  };
  const matchPositions = new Map();
  const matchesByRound = new Map(
    rounds.map((round) => [round.code, round.matches])
  );

  const setPosition = (match, roundCode, y) => {
    if (!match) return null;
    const position = {
      x: xByRound[roundCode],
      y,
      w: cardW,
      h: cardH,
    };
    matchPositions.set(match.TennisMatchID, position);
    return position;
  };

  const r16 = matchesByRound.get("R16") || [];
  r16.forEach((match, index) => {
    setPosition(match, "R16", headerH + index * (cardH + rowGap));
  });

  const setFromPair = (roundCode, match, sourceA, sourceB) => {
    const a = sourceA ? matchPositions.get(sourceA.TennisMatchID) : null;
    const b = sourceB ? matchPositions.get(sourceB.TennisMatchID) : null;
    if (!a || !b) return null;

    const centerY = (a.y + a.h / 2 + b.y + b.h / 2) / 2;
    return setPosition(match, roundCode, centerY - cardH / 2);
  };

  const qf = matchesByRound.get("QF") || [];
  qf.forEach((match, index) => {
    setFromPair("QF", match, r16[index * 2], r16[index * 2 + 1]);
  });

  const sf = matchesByRound.get("SF") || [];
  sf.forEach((match, index) => {
    setFromPair("SF", match, qf[index * 2], qf[index * 2 + 1]);
  });

  const finalMatches = matchesByRound.get("F") || [];
  setFromPair("F", finalMatches[0], sf[0], sf[1]);

  const canvasWidth = xByRound.F + cardW;
  const canvasHeight =
    headerH + Math.max(1, r16.length) * cardH + Math.max(0, r16.length - 1) * rowGap;

  return {
    canvasWidth,
    canvasHeight,
    matchPositions,
    xByRound,
  };
}

function Connector({ fromA, fromB, to, positions }) {
  const posA = positions.get(fromA?.TennisMatchID);
  const posB = positions.get(fromB?.TennisMatchID);
  const posTo = positions.get(to?.TennisMatchID);

  if (!posA || !posB || !posTo) return null;

  const startX = posA.x + posA.w;
  const targetX = posTo.x;
  const midX = startX + (targetX - startX) / 2;
  const yA = posA.y + posA.h / 2;
  const yB = posB.y + posB.h / 2;
  const yTo = posTo.y + posTo.h / 2;

  return (
    <path
      d={`M ${startX} ${yA} H ${midX} V ${yB} M ${startX} ${yB} H ${midX} M ${midX} ${yTo} H ${targetX}`}
      fill="none"
      stroke="#94a3b8"
      strokeWidth="1.5"
      strokeLinejoin="round"
      strokeLinecap="round"
      opacity="0.75"
    />
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

  const layout = useMemo(() => makeLayout(rounds), [rounds]);

  const roundByCode = useMemo(() => {
    const map = new Map();
    for (const round of rounds) {
      map.set(round.code, round);
    }
    return map;
  }, [rounds]);

  const connectorGroups = useMemo(() => {
    const r16 = roundByCode.get("R16")?.matches || [];
    const qf = roundByCode.get("QF")?.matches || [];
    const sf = roundByCode.get("SF")?.matches || [];
    const finalMatches = roundByCode.get("F")?.matches || [];

    return [
      ...qf.map((match, index) => ({
        fromA: r16[index * 2],
        fromB: r16[index * 2 + 1],
        to: match,
      })),
      ...sf.map((match, index) => ({
        fromA: qf[index * 2],
        fromB: qf[index * 2 + 1],
        to: match,
      })),
      {
        fromA: sf[0],
        fromB: sf[1],
        to: finalMatches[0],
      },
    ];
  }, [roundByCode]);

  if (!rounds.length) {
    return (
      <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        Bracket data will appear here when it is added.
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto pb-3">
      <div
        className="relative min-w-[1030px]"
        style={{
          width: `${layout.canvasWidth}px`,
          height: `${layout.canvasHeight}px`,
        }}
      >
        <svg
          className="pointer-events-none absolute inset-0 z-0"
          width={layout.canvasWidth}
          height={layout.canvasHeight}
          viewBox={`0 0 ${layout.canvasWidth} ${layout.canvasHeight}`}
          aria-hidden="true"
        >
          {connectorGroups.map((connector, index) => (
            <Connector
              key={`connector-${index}`}
              fromA={connector.fromA}
              fromB={connector.fromB}
              to={connector.to}
              positions={layout.matchPositions}
            />
          ))}
        </svg>

        {rounds.map((round) => (
          <h4
            key={`${round.code}-heading`}
            className="absolute top-0 z-10 text-xs font-bold uppercase tracking-[0.14em] text-slate-500"
            style={{ left: `${layout.xByRound[round.code]}px` }}
          >
            {round.label}
          </h4>
        ))}

        {rounds.flatMap((round) =>
          round.matches.map((match) => {
            const position = layout.matchPositions.get(match.TennisMatchID);
            if (!position) return null;

            return (
              <div
                key={match.TennisMatchID}
                className="absolute z-10"
                style={{
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  width: `${position.w}px`,
                  height: `${position.h}px`,
                }}
              >
                <MatchCard
                  match={match}
                  playerMap={playerMap}
                  opponentMap={opponentMap}
                  schoolMap={schoolMap}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
