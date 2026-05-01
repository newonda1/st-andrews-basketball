import React, { useMemo } from "react";

function useSchoolsById(schools) {
  return useMemo(() => {
    const map = new Map();
    for (const school of Array.isArray(schools) ? schools : []) {
      if (school?.SchoolID) map.set(String(school.SchoolID), school);
    }
    return map;
  }, [schools]);
}

function makeTeamResolver(teams, schoolsById) {
  return (teamId) => {
    const team = teamId ? teams?.[teamId] : null;
    const school = team?.schoolId ? schoolsById.get(String(team.schoolId)) : null;
    const logoPath =
      school?.BracketLogoPath ||
      school?.LogoPath ||
      team?.logo ||
      (team?.card?.startsWith("/images/schools/logos/") ? team.card : null);

    return {
      name:
        team?.name ||
        school?.Abbreviation ||
        school?.ShortName ||
        school?.Name ||
        (teamId ? String(teamId) : "TBD"),
      logoPath,
      legacyCardPath: logoPath ? null : team?.card ?? null,
      primaryColor: school?.PrimaryColor || team?.primaryColor || "#1d4ed8",
      seed: team?.seed ?? team?.seedLabel ?? null,
    };
  };
}

function GameCard({
  x,
  y,
  width,
  height,
  game,
  getTeam,
  rowGap = 26,
}) {
  const topTeamId = game?.top?.teamId ?? null;
  const bottomTeamId = game?.bottom?.teamId ?? null;
  const top = topTeamId
    ? { ...getTeam(topTeamId), seed: game?.top?.seed ?? getTeam(topTeamId).seed }
    : { name: game?.top?.name ?? "TBD", seed: game?.top?.seed ?? null };
  const bottom = bottomTeamId
    ? { ...getTeam(bottomTeamId), seed: game?.bottom?.seed ?? getTeam(bottomTeamId).seed }
    : { name: game?.bottom?.name ?? "TBD", seed: game?.bottom?.seed ?? null };
  const topWins = Boolean(topTeamId && game?.winner === topTeamId);
  const bottomWins = Boolean(bottomTeamId && game?.winner === bottomTeamId);
  const rowY = [y + height / 2 - rowGap / 2, y + height / 2 + rowGap / 2];
  const note = String(game?.note ?? "").trim();

  const TeamRow = ({ team, teamId, score, rowCenterY, winner }) => {
    const seed = team.seed;
    const scoreX = x + width - 22;
    const logoX = x + 22;
    const logoSize = 25;
    const seedX = logoX + logoSize + 10;
    const hasSeed = seed !== null && seed !== undefined && seed !== "";
    const nameX = hasSeed ? seedX + 19 : seedX;
    const name = team.name;
    const nameFontSize = name.length > 18 ? 13 : name.length > 14 ? 14 : 15.5;
    const subdued = !winner && (topWins || bottomWins);
    const isPlaceholder = !teamId;

    return (
      <g>
        {team.logoPath ? (
          <image
            href={team.logoPath}
            x={logoX}
            y={rowCenterY - logoSize / 2}
            width={logoSize}
            height={logoSize}
            preserveAspectRatio="xMidYMid meet"
            filter="url(#gameCardLogoShadow)"
          />
        ) : team.legacyCardPath ? (
          <image
            href={team.legacyCardPath}
            x={logoX}
            y={rowCenterY - 13}
            width={logoSize}
            height={26}
            preserveAspectRatio="xMidYMid meet"
          />
        ) : isPlaceholder ? null : (
          <circle cx={logoX + logoSize / 2} cy={rowCenterY} r="10" fill="rgba(210,216,224,0.9)" />
        )}
        {hasSeed && (
          <text
            x={seedX}
            y={rowCenterY + 5}
            fontSize="13"
            fill={subdued ? "rgba(75,85,99,0.7)" : "rgba(31,41,55,0.78)"}
          >
            {seed}
          </text>
        )}
        <text
          x={nameX}
          y={rowCenterY + 5}
          fontSize={nameFontSize}
          fontWeight={winner ? "800" : isPlaceholder ? "600" : "700"}
          fill={
            isPlaceholder
              ? "rgba(100,116,139,0.78)"
              : subdued
                ? "rgba(75,85,99,0.72)"
                : "rgba(17,24,39,0.96)"
          }
        >
          {name}
        </text>
        {score !== null && score !== undefined && score !== "" && (
          <text
            x={scoreX}
            y={rowCenterY + 5}
            textAnchor="end"
            fontSize="16"
            fontWeight={winner ? "800" : "700"}
            fill={subdued ? "rgba(75,85,99,0.72)" : "rgba(17,24,39,0.96)"}
          >
            {score}
          </text>
        )}
      </g>
    );
  };

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        fill="rgba(255,255,255,0.98)"
        filter="url(#gameCardShadow)"
      />
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        fill="none"
        stroke="rgba(148,163,184,0.28)"
      />
      <TeamRow
        team={top}
        teamId={topTeamId}
        score={game?.top?.score}
        rowCenterY={rowY[0]}
        winner={topWins}
      />
      <TeamRow
        team={bottom}
        teamId={bottomTeamId}
        score={game?.bottom?.score}
        rowCenterY={rowY[1]}
        winner={bottomWins}
      />
      {note ? (
        <text
          x={x + width - 22}
          y={y + height - 7}
          textAnchor="end"
          fontSize="10"
          fontWeight="700"
          fill="rgba(100,116,139,0.86)"
        >
          {note}
        </text>
      ) : null}
    </g>
  );
}

function pairConnector(xA, yA, yB, xB, yTarget) {
  const spineX = xA + (xB - xA) / 2;
  const top = Math.min(yA, yB, yTarget);
  const bottom = Math.max(yA, yB, yTarget);
  return [
    `M ${xA} ${yA} H ${spineX}`,
    `M ${xA} ${yB} H ${spineX}`,
    `M ${spineX} ${top} V ${bottom}`,
    `M ${spineX} ${yTarget} H ${xB}`,
  ].join(" ");
}

function singleConnector(xA, yA, xB, yB) {
  const spineX = xA + (xB - xA) / 2;
  return `M ${xA} ${yA} H ${spineX} V ${yB} H ${xB}`;
}

function BracketDefs() {
  return (
    <defs>
      <filter id="gameCardShadow" x="-8%" y="-18%" width="116%" height="136%">
        <feDropShadow dx="0" dy="2" stdDeviation="2.2" floodColor="#0f172a" floodOpacity="0.18" />
      </filter>
      <filter id="gameCardLogoShadow" x="-35%" y="-35%" width="170%" height="170%">
        <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#0f172a" floodOpacity="0.28" />
      </filter>
    </defs>
  );
}

const lineStyle = {
  fill: "none",
  stroke: "rgba(100,116,139,0.55)",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function centerY(y, height) {
  return y + height / 2;
}

function StateBracket12GameSVG({ bracket, schools = [] }) {
  const teams = bracket?.teams ?? {};
  const games = bracket?.games ?? {};
  const schoolsById = useSchoolsById(schools);
  const getTeam = useMemo(() => makeTeamResolver(teams, schoolsById), [teams, schoolsById]);

  const cardW = 260;
  const cardH = 74;
  const colGap = 36;
  const rowGap = 24;
  const leftPad = 32;
  const topPad = 50;
  const labelY = 24;

  const x0 = leftPad;
  const x1 = x0 + cardW + colGap;
  const x2 = x1 + cardW + colGap;
  const x3 = x2 + cardW + colGap;
  const W = x3 + cardW + 40;

  const yR1 = Array.from({ length: 8 }, (_, index) => topPad + index * (cardH + rowGap));
  const yQF = [
    (centerY(yR1[0], cardH) + centerY(yR1[1], cardH)) / 2 - cardH / 2,
    (centerY(yR1[2], cardH) + centerY(yR1[3], cardH)) / 2 - cardH / 2,
    (centerY(yR1[4], cardH) + centerY(yR1[5], cardH)) / 2 - cardH / 2,
    (centerY(yR1[6], cardH) + centerY(yR1[7], cardH)) / 2 - cardH / 2,
  ];
  const ySF = [
    (centerY(yQF[0], cardH) + centerY(yQF[1], cardH)) / 2 - cardH / 2,
    (centerY(yQF[2], cardH) + centerY(yQF[3], cardH)) / 2 - cardH / 2,
  ];
  const yFinal = [(centerY(ySF[0], cardH) + centerY(ySF[1], cardH)) / 2 - cardH / 2];
  const H = yR1[7] + cardH + topPad;

  const byeGame = (teamId) => ({
    top: { teamId },
    bottom: { name: "Bye" },
    winner: teamId,
  });
  const r1 = [
    ["bye_1", yR1[0], byeGame(games.qf_1?.top?.teamId)],
    ["r1_8_9", yR1[1], games.r1_8_9],
    ["bye_4", yR1[2], byeGame(games.qf_4?.top?.teamId)],
    ["r1_5_12", yR1[3], games.r1_5_12],
    ["bye_3", yR1[4], byeGame(games.qf_3?.top?.teamId)],
    ["r1_6_11", yR1[5], games.r1_6_11],
    ["bye_2", yR1[6], byeGame(games.qf_2?.top?.teamId)],
    ["r1_7_10", yR1[7], games.r1_7_10],
  ];
  const qf = [
    ["qf_1", yQF[0]],
    ["qf_4", yQF[1]],
    ["qf_3", yQF[2]],
    ["qf_2", yQF[3]],
  ];
  const sf = [
    ["sf_top", ySF[0]],
    ["sf_bot", ySF[1]],
  ];

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <div style={{ minWidth: 1120, padding: "8px 0" }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>{bracket?.title ?? "State Tournament"}</div>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="auto" role="img" aria-label={bracket?.title ?? "State Tournament Bracket"}>
          <BracketDefs />
          <text x={x0} y={labelY} fontSize="14" fill="rgba(60,70,80,0.85)" fontWeight="700">First Round</text>
          <text x={x1} y={labelY} fontSize="14" fill="rgba(60,70,80,0.85)" fontWeight="700">Quarterfinals</text>
          <text x={x2} y={labelY} fontSize="14" fill="rgba(60,70,80,0.85)" fontWeight="700">Semifinals</text>
          <text x={x3} y={labelY} fontSize="14" fill="rgba(60,70,80,0.85)" fontWeight="700">Championship</text>

          <path d={pairConnector(x0 + cardW, centerY(yR1[0], cardH), centerY(yR1[1], cardH), x1, centerY(yQF[0], cardH))} {...lineStyle} />
          <path d={pairConnector(x0 + cardW, centerY(yR1[2], cardH), centerY(yR1[3], cardH), x1, centerY(yQF[1], cardH))} {...lineStyle} />
          <path d={pairConnector(x0 + cardW, centerY(yR1[4], cardH), centerY(yR1[5], cardH), x1, centerY(yQF[2], cardH))} {...lineStyle} />
          <path d={pairConnector(x0 + cardW, centerY(yR1[6], cardH), centerY(yR1[7], cardH), x1, centerY(yQF[3], cardH))} {...lineStyle} />
          <path d={pairConnector(x1 + cardW, centerY(yQF[0], cardH), centerY(yQF[1], cardH), x2, centerY(ySF[0], cardH))} {...lineStyle} />
          <path d={pairConnector(x1 + cardW, centerY(yQF[2], cardH), centerY(yQF[3], cardH), x2, centerY(ySF[1], cardH))} {...lineStyle} />
          <path d={pairConnector(x2 + cardW, centerY(ySF[0], cardH), centerY(ySF[1], cardH), x3, centerY(yFinal[0], cardH))} {...lineStyle} />

          {r1.map(([key, y, game]) => (
            <GameCard key={key} x={x0} y={y} width={cardW} height={cardH} game={game} getTeam={getTeam} />
          ))}
          {qf.map(([key, y]) => (
            <GameCard key={key} x={x1} y={y} width={cardW} height={cardH} game={games[key]} getTeam={getTeam} />
          ))}
          {sf.map(([key, y]) => (
            <GameCard key={key} x={x2} y={y} width={cardW} height={cardH} game={games[key]} getTeam={getTeam} />
          ))}
          <GameCard x={x3} y={yFinal[0]} width={cardW} height={cardH} game={games.final} getTeam={getTeam} />
        </svg>
      </div>
    </div>
  );
}

function StateBracket16GameSVG({ bracket, schools = [] }) {
  const teams = bracket?.teams ?? {};
  const games = bracket?.games ?? {};
  const schoolsById = useSchoolsById(schools);
  const getTeam = useMemo(() => makeTeamResolver(teams, schoolsById), [teams, schoolsById]);

  const cardW = 260;
  const cardH = 74;
  const colGap = 36;
  const rowGap = 20;
  const leftPad = 32;
  const topPad = 50;
  const labelY = 24;

  const x0 = leftPad;
  const x1 = x0 + cardW + colGap;
  const x2 = x1 + cardW + colGap;
  const x3 = x2 + cardW + colGap;
  const W = x3 + cardW + 40;

  const yR1 = Array.from({ length: 8 }, (_, index) => topPad + index * (cardH + rowGap));
  const yQF = [
    (centerY(yR1[0], cardH) + centerY(yR1[1], cardH)) / 2 - cardH / 2,
    (centerY(yR1[2], cardH) + centerY(yR1[3], cardH)) / 2 - cardH / 2,
    (centerY(yR1[4], cardH) + centerY(yR1[5], cardH)) / 2 - cardH / 2,
    (centerY(yR1[6], cardH) + centerY(yR1[7], cardH)) / 2 - cardH / 2,
  ];
  const ySF = [
    (centerY(yQF[0], cardH) + centerY(yQF[1], cardH)) / 2 - cardH / 2,
    (centerY(yQF[2], cardH) + centerY(yQF[3], cardH)) / 2 - cardH / 2,
  ];
  const yFinal = [(centerY(ySF[0], cardH) + centerY(ySF[1], cardH)) / 2 - cardH / 2];
  const H = yR1[7] + cardH + topPad;

  const r1 = [
    ["r1_1_16", yR1[0]],
    ["r1_8_9", yR1[1]],
    ["r1_4_13", yR1[2]],
    ["r1_5_12", yR1[3]],
    ["r1_2_15", yR1[4]],
    ["r1_7_10", yR1[5]],
    ["r1_3_14", yR1[6]],
    ["r1_6_11", yR1[7]],
  ];
  const qf = [
    ["qf_1", yQF[0]],
    ["qf_4", yQF[1]],
    ["qf_2", yQF[2]],
    ["qf_3", yQF[3]],
  ];
  const sf = [
    ["sf_top", ySF[0]],
    ["sf_bot", ySF[1]],
  ];

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <div style={{ minWidth: 1120, padding: "8px 0" }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>{bracket?.title ?? "State Tournament"}</div>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="auto" role="img" aria-label={bracket?.title ?? "State Tournament Bracket"}>
          <BracketDefs />
          <text x={x0} y={labelY} fontSize="14" fill="rgba(60,70,80,0.85)" fontWeight="700">First Round</text>
          <text x={x1} y={labelY} fontSize="14" fill="rgba(60,70,80,0.85)" fontWeight="700">Quarterfinals</text>
          <text x={x2} y={labelY} fontSize="14" fill="rgba(60,70,80,0.85)" fontWeight="700">Semifinals</text>
          <text x={x3} y={labelY} fontSize="14" fill="rgba(60,70,80,0.85)" fontWeight="700">Championship</text>

          <path d={pairConnector(x0 + cardW, centerY(yR1[0], cardH), centerY(yR1[1], cardH), x1, centerY(yQF[0], cardH))} {...lineStyle} />
          <path d={pairConnector(x0 + cardW, centerY(yR1[2], cardH), centerY(yR1[3], cardH), x1, centerY(yQF[1], cardH))} {...lineStyle} />
          <path d={pairConnector(x0 + cardW, centerY(yR1[4], cardH), centerY(yR1[5], cardH), x1, centerY(yQF[2], cardH))} {...lineStyle} />
          <path d={pairConnector(x0 + cardW, centerY(yR1[6], cardH), centerY(yR1[7], cardH), x1, centerY(yQF[3], cardH))} {...lineStyle} />
          <path d={pairConnector(x1 + cardW, centerY(yQF[0], cardH), centerY(yQF[1], cardH), x2, centerY(ySF[0], cardH))} {...lineStyle} />
          <path d={pairConnector(x1 + cardW, centerY(yQF[2], cardH), centerY(yQF[3], cardH), x2, centerY(ySF[1], cardH))} {...lineStyle} />
          <path d={pairConnector(x2 + cardW, centerY(ySF[0], cardH), centerY(ySF[1], cardH), x3, centerY(yFinal[0], cardH))} {...lineStyle} />

          {r1.map(([key, y]) => (
            <GameCard key={key} x={x0} y={y} width={cardW} height={cardH} game={games[key]} getTeam={getTeam} />
          ))}
          {qf.map(([key, y]) => (
            <GameCard key={key} x={x1} y={y} width={cardW} height={cardH} game={games[key]} getTeam={getTeam} />
          ))}
          {sf.map(([key, y]) => (
            <GameCard key={key} x={x2} y={y} width={cardW} height={cardH} game={games[key]} getTeam={getTeam} />
          ))}
          <GameCard x={x3} y={yFinal[0]} width={cardW} height={cardH} game={games.final} getTeam={getTeam} />
        </svg>
      </div>
    </div>
  );
}

function StateBracket8GameSVG({ bracket, schools = [] }) {
  const teams = bracket?.teams ?? {};
  const games = bracket?.games ?? {};
  const schoolsById = useSchoolsById(schools);
  const getTeam = useMemo(() => makeTeamResolver(teams, schoolsById), [teams, schoolsById]);

  const cardW = 320;
  const cardH = 78;
  const colGap = 82;
  const rowGap = 28;
  const leftPad = 40;
  const topPad = 50;
  const labelY = 24;

  const x0 = leftPad;
  const x1 = x0 + cardW + colGap;
  const x2 = x1 + cardW + colGap;
  const W = x2 + cardW + 48;

  const yQF = Array.from({ length: 4 }, (_, index) => topPad + index * (cardH + rowGap));
  const ySemi1 = (centerY(yQF[0], cardH) + centerY(yQF[1], cardH)) / 2 - cardH / 2;
  const ySemi2 = (centerY(yQF[2], cardH) + centerY(yQF[3], cardH)) / 2 - cardH / 2;
  const yFinal = (centerY(ySemi1, cardH) + centerY(ySemi2, cardH)) / 2 - cardH / 2;
  const H = yQF[3] + cardH + topPad;

  const qf = [
    ["qf_1", yQF[0]],
    ["qf_2", yQF[1]],
    ["qf_3", yQF[2]],
    ["qf_4", yQF[3]],
  ];

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <div style={{ minWidth: 1040, padding: "8px 0" }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>{bracket?.title ?? "State Tournament"}</div>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="auto" role="img" aria-label={bracket?.title ?? "State Tournament Bracket"}>
          <BracketDefs />
          <text x={x0} y={labelY} fontSize="14" fill="rgba(60,70,80,0.85)" fontWeight="700">Quarterfinals</text>
          <text x={x1} y={labelY} fontSize="14" fill="rgba(60,70,80,0.85)" fontWeight="700">Semifinals</text>
          <text x={x2} y={labelY} fontSize="14" fill="rgba(60,70,80,0.85)" fontWeight="700">Championship</text>

          <path d={pairConnector(x0 + cardW, centerY(yQF[0], cardH), centerY(yQF[1], cardH), x1, centerY(ySemi1, cardH))} {...lineStyle} />
          <path d={pairConnector(x0 + cardW, centerY(yQF[2], cardH), centerY(yQF[3], cardH), x1, centerY(ySemi2, cardH))} {...lineStyle} />
          <path d={pairConnector(x1 + cardW, centerY(ySemi1, cardH), centerY(ySemi2, cardH), x2, centerY(yFinal, cardH))} {...lineStyle} />

          {qf.map(([key, y]) => (
            <GameCard key={key} x={x0} y={y} width={cardW} height={cardH} game={games[key]} getTeam={getTeam} />
          ))}
          <GameCard x={x1} y={ySemi1} width={cardW} height={cardH} game={games.sf_top} getTeam={getTeam} />
          <GameCard x={x1} y={ySemi2} width={cardW} height={cardH} game={games.sf_bot} getTeam={getTeam} />
          <GameCard x={x2} y={yFinal} width={cardW} height={cardH} game={games.final} getTeam={getTeam} />
        </svg>
      </div>
    </div>
  );
}

function RegionBracket5GameSVG({ bracket, schools = [] }) {
  const teams = bracket?.teams ?? {};
  const games = bracket?.games ?? {};
  const schoolsById = useSchoolsById(schools);
  const getTeam = useMemo(() => makeTeamResolver(teams, schoolsById), [teams, schoolsById]);

  const withResolvedTeams = useMemo(() => {
    const playWinner = games.playIn?.winner ?? null;
    const semi1Winner = games.semi1?.winner ?? null;
    const semi2Winner = games.semi2?.winner ?? null;
    const playTopTeam = games.playIn?.top?.teamId ?? null;
    const playBottomTeam = games.playIn?.bottom?.teamId ?? null;
    const playWinnerSeed =
      playWinner === playTopTeam ? 4 :
      playWinner === playBottomTeam ? 5 :
      null;
    const semi1TopTeam = games.semi1?.top?.teamId ?? null;
    const semi2TopTeam = games.semi2?.top?.teamId ?? null;
    const semi2BottomTeam = games.semi2?.bottom?.teamId ?? null;
    const semi1WinnerSeed =
      semi1Winner === semi1TopTeam ? 1 :
      semi1Winner === playWinner ? playWinnerSeed :
      null;
    const semi2WinnerSeed =
      semi2Winner === semi2TopTeam ? 2 :
      semi2Winner === semi2BottomTeam ? 3 :
      null;
    const byeGame = (teamId, seed) => ({
      top: { teamId, seed },
      bottom: { name: "Bye" },
      winner: teamId,
    });

    return {
      firstRound: [
        ["bye_1", byeGame(semi1TopTeam, 1)],
        ["playIn", {
          ...games.playIn,
          top: { ...games.playIn?.top, seed: 4 },
          bottom: { ...games.playIn?.bottom, seed: 5 },
        }],
        ["bye_2", byeGame(semi2TopTeam, 2)],
        ["bye_3", byeGame(semi2BottomTeam, 3)],
      ],
      semi1: {
        ...games.semi1,
        top: {
          ...games.semi1?.top,
          seed: 1,
        },
        bottom: {
          ...games.semi1?.bottom,
          teamId: games.semi1?.bottom?.teamId ?? playWinner,
          seed: games.semi1?.bottom?.seed ?? playWinnerSeed,
        },
      },
      semi2: {
        ...games.semi2,
        top: {
          ...games.semi2?.top,
          seed: 2,
        },
        bottom: {
          ...games.semi2?.bottom,
          seed: 3,
        },
      },
      final: {
        ...games.final,
        top: {
          ...games.final?.top,
          teamId: games.final?.top?.teamId ?? semi1Winner,
          seed: games.final?.top?.seed ?? semi1WinnerSeed,
        },
        bottom: {
          ...games.final?.bottom,
          teamId: games.final?.bottom?.teamId ?? semi2Winner,
          seed: games.final?.bottom?.seed ?? semi2WinnerSeed,
        },
      },
    };
  }, [games]);

  const cardW = 320;
  const cardH = 78;
  const colGap = 82;
  const rowGap = 28;
  const leftPad = 40;
  const topPad = 50;
  const labelY = 24;

  const x0 = leftPad;
  const x1 = x0 + cardW + colGap;
  const x2 = x1 + cardW + colGap;
  const W = x2 + cardW + 48;

  const yR1 = Array.from({ length: 4 }, (_, index) => topPad + index * (cardH + rowGap));
  const ySemi1 = (centerY(yR1[0], cardH) + centerY(yR1[1], cardH)) / 2 - cardH / 2;
  const ySemi2 = (centerY(yR1[2], cardH) + centerY(yR1[3], cardH)) / 2 - cardH / 2;
  const yFinal = (centerY(ySemi1, cardH) + centerY(ySemi2, cardH)) / 2 - cardH / 2;
  const H = yR1[3] + cardH + topPad;

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <div style={{ minWidth: 1040, padding: "8px 0" }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>{bracket?.title ?? "Region Tournament"}</div>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="auto" role="img" aria-label={bracket?.title ?? "Region Tournament Bracket"}>
          <BracketDefs />
          <text x={x0} y={labelY} fontSize="14" fill="rgba(60,70,80,0.85)" fontWeight="700">First Round</text>
          <text x={x1} y={labelY} fontSize="14" fill="rgba(60,70,80,0.85)" fontWeight="700">Semifinals</text>
          <text x={x2} y={labelY} fontSize="14" fill="rgba(60,70,80,0.85)" fontWeight="700">Championship</text>

          <path d={pairConnector(x0 + cardW, centerY(yR1[0], cardH), centerY(yR1[1], cardH), x1, centerY(ySemi1, cardH))} {...lineStyle} />
          <path d={pairConnector(x0 + cardW, centerY(yR1[2], cardH), centerY(yR1[3], cardH), x1, centerY(ySemi2, cardH))} {...lineStyle} />
          <path d={pairConnector(x1 + cardW, centerY(ySemi1, cardH), centerY(ySemi2, cardH), x2, centerY(yFinal, cardH))} {...lineStyle} />

          {withResolvedTeams.firstRound.map(([key, game], index) => (
            <GameCard key={key} x={x0} y={yR1[index]} width={cardW} height={cardH} game={game} getTeam={getTeam} />
          ))}
          <GameCard x={x1} y={ySemi1} width={cardW} height={cardH} game={withResolvedTeams.semi1} getTeam={getTeam} />
          <GameCard x={x1} y={ySemi2} width={cardW} height={cardH} game={withResolvedTeams.semi2} getTeam={getTeam} />
          <GameCard x={x2} y={yFinal} width={cardW} height={cardH} game={withResolvedTeams.final} getTeam={getTeam} />
        </svg>
      </div>
    </div>
  );
}

export { RegionBracket5GameSVG, StateBracket8GameSVG, StateBracket12GameSVG, StateBracket16GameSVG };
