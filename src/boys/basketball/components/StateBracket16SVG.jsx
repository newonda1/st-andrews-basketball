import React from "react";

function StateBracket16SVG({ bracket }) {
  const teams = bracket?.teams ?? {};
  const games = bracket?.games ?? {};

  const cardW = 270;
  const cardH = 54;
  const colGap = 54;
  const rowGap = 12;
  const leftPad = 34;
  const topPad = 44;

  const x0 = leftPad;
  const x1 = x0 + cardW + colGap;
  const x2 = x1 + cardW + colGap;
  const x3 = x2 + cardW + colGap;
  const W = x3 + cardW + 54;

  const yR1 = Array.from({ length: 16 }, (_, i) => topPad + i * (cardH + rowGap));
  const yQF = [yR1[1], yR1[3], yR1[5], yR1[7], yR1[9], yR1[11], yR1[13], yR1[15]];
  const ySF = [yR1[3], yR1[7], yR1[11], yR1[15]];
  const yFinal = [yR1[7], yR1[11]];
  const H = yR1[15] + cardH + topPad;

  const seedOf = (teamId) => teams?.[teamId]?.seed ?? teams?.[teamId]?.seedLabel ?? null;
  const winnerOf = (gameKey) => games?.[gameKey]?.winner ?? null;
  const scoreFor = (gameKey, side) => games?.[gameKey]?.[side]?.score ?? null;
  const isWinner = (gameKey, teamId) => Boolean(teamId && games?.[gameKey]?.winner === teamId);
  const cy = (y) => y + cardH / 2;

  const getTeamMeta = (teamId) => {
    const team = teamId ? teams[teamId] : null;
    return {
      name: team?.name || (teamId ? String(teamId) : "TBD"),
      card: team?.card || team?.logo || null,
      color: team?.primaryColor || "#1d4ed8",
    };
  };

  const Card = ({ x, y, teamId, seed, score, highlight }) => {
    const meta = getTeamMeta(teamId);
    const scoreW = 32;
    const imageX = x + 40;
    const imageW = cardW - 86;
    const seedValue = String(seed ?? "").match(/#?\s*(\d+)$/)?.[1];
    const seedText = seedValue ? `#${seedValue}` : null;

    return (
      <g>
        <rect x={x} y={y} width={cardW} height={cardH} rx={13} fill="rgba(255,255,255,0.96)" />
        {highlight && (
          <rect x={x} y={y} width={cardW} height={cardH} rx={13} fill={meta.color} opacity="0.08" />
        )}
        <rect
          x={x}
          y={y}
          width={cardW}
          height={cardH}
          rx={13}
          fill="transparent"
          stroke={highlight ? meta.color : "rgba(120,130,140,0.45)"}
          strokeWidth={highlight ? 2.2 : 1.15}
        />
        {seedText && (
          <text
            x={x + 10}
            y={y + 33}
            fontSize={seedText.length > 4 ? 10.5 : 12.5}
            fontWeight="800"
            fill="rgba(30,34,40,0.95)"
          >
            {seedText}
          </text>
        )}
        {meta.card ? (
          <image href={meta.card} x={imageX} y={y} width={imageW} height={cardH} preserveAspectRatio="xMidYMid meet" />
        ) : (
          <text x={imageX + 4} y={y + 33} fontSize={meta.name.length > 18 ? 12 : 13.5} fontWeight="700" fill="rgba(30,34,40,0.95)">
            {meta.name}
          </text>
        )}
        {score !== null && score !== undefined && (
          <g>
            <rect
              x={x + cardW - scoreW - 10}
              y={y + 12}
              width={scoreW}
              height={30}
              rx={10}
              fill="rgba(255,255,255,0.92)"
              stroke="rgba(120,130,140,0.35)"
            />
            <text
              x={x + cardW - scoreW / 2 - 10}
              y={y + 32}
              textAnchor="middle"
              fontSize="13"
              fontWeight="700"
              fill="rgba(30,34,40,0.95)"
            >
              {score}
            </text>
          </g>
        )}
      </g>
    );
  };

  const connector = (xA, yTop, yBottom, xB, yTarget) => {
    const spineX = xA + Math.min(32, Math.max(22, (xB - xA) * 0.42));
    const spineTop = Math.min(yTop, yBottom, yTarget);
    const spineBottom = Math.max(yTop, yBottom, yTarget);
    return [
      `M ${xA} ${yTop} L ${spineX} ${yTop}`,
      `M ${xA} ${yBottom} L ${spineX} ${yBottom}`,
      `M ${spineX} ${spineTop} L ${spineX} ${spineBottom}`,
      `M ${spineX} ${yTarget} L ${xB} ${yTarget}`,
    ].join(" ");
  };

  const lineStyle = {
    fill: "none",
    stroke: "rgba(90,100,110,0.65)",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const firstRoundKeys = [
    "r1_1_16",
    "r1_8_9",
    "r1_4_13",
    "r1_5_12",
    "r1_2_15",
    "r1_7_10",
    "r1_3_14",
    "r1_6_11",
  ];
  const qfKeys = ["qf_1", "qf_4", "qf_2", "qf_3"];
  const sfKeys = ["sf_top", "sf_bot"];
  const qfTeams = [
    [winnerOf("r1_1_16"), winnerOf("r1_8_9")],
    [winnerOf("r1_4_13"), winnerOf("r1_5_12")],
    [winnerOf("r1_2_15"), winnerOf("r1_7_10")],
    [winnerOf("r1_3_14"), winnerOf("r1_6_11")],
  ];
  const sfTeams = [
    [winnerOf("qf_1"), winnerOf("qf_4")],
    [winnerOf("qf_2"), winnerOf("qf_3")],
  ];
  const finalTeams = [winnerOf("sf_top"), winnerOf("sf_bot")];

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <div style={{ minWidth: 1100, padding: "8px 0" }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>{bracket?.title ?? "State Tournament"}</div>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="auto" role="img" aria-label={bracket?.title ?? "State Tournament Bracket"}>
          <text x={x0} y={topPad - 18} fontSize="14" fill="rgba(60,70,80,0.85)" fontWeight="700">
            First Round
          </text>
          <text x={x1} y={topPad - 18} fontSize="14" fill="rgba(60,70,80,0.85)" fontWeight="700">
            Quarterfinals
          </text>
          <text x={x2} y={topPad - 18} fontSize="14" fill="rgba(60,70,80,0.85)" fontWeight="700">
            Semifinals
          </text>
          <text x={x3} y={topPad - 18} fontSize="14" fill="rgba(60,70,80,0.85)" fontWeight="700">
            Championship
          </text>

          {firstRoundKeys.map((gameKey, idx) => (
            <React.Fragment key={gameKey}>
              <Card
                x={x0}
                y={yR1[idx * 2]}
                teamId={games[gameKey]?.top?.teamId}
                seed={seedOf(games[gameKey]?.top?.teamId)}
                score={scoreFor(gameKey, "top")}
                highlight={isWinner(gameKey, games[gameKey]?.top?.teamId)}
              />
              <Card
                x={x0}
                y={yR1[idx * 2 + 1]}
                teamId={games[gameKey]?.bottom?.teamId}
                seed={seedOf(games[gameKey]?.bottom?.teamId)}
                score={scoreFor(gameKey, "bottom")}
                highlight={isWinner(gameKey, games[gameKey]?.bottom?.teamId)}
              />
            </React.Fragment>
          ))}

          {qfKeys.map((gameKey, idx) => (
            <React.Fragment key={gameKey}>
              <Card
                x={x1}
                y={yQF[idx * 2]}
                teamId={qfTeams[idx][0]}
                seed={seedOf(qfTeams[idx][0])}
                score={scoreFor(gameKey, "top")}
                highlight={isWinner(gameKey, qfTeams[idx][0])}
              />
              <Card
                x={x1}
                y={yQF[idx * 2 + 1]}
                teamId={qfTeams[idx][1]}
                seed={seedOf(qfTeams[idx][1])}
                score={scoreFor(gameKey, "bottom")}
                highlight={isWinner(gameKey, qfTeams[idx][1])}
              />
            </React.Fragment>
          ))}

          {sfKeys.map((gameKey, idx) => (
            <React.Fragment key={gameKey}>
              <Card
                x={x2}
                y={ySF[idx * 2]}
                teamId={sfTeams[idx][0]}
                seed={seedOf(sfTeams[idx][0])}
                score={scoreFor(gameKey, "top")}
                highlight={isWinner(gameKey, sfTeams[idx][0])}
              />
              <Card
                x={x2}
                y={ySF[idx * 2 + 1]}
                teamId={sfTeams[idx][1]}
                seed={seedOf(sfTeams[idx][1])}
                score={scoreFor(gameKey, "bottom")}
                highlight={isWinner(gameKey, sfTeams[idx][1])}
              />
            </React.Fragment>
          ))}

          <Card
            x={x3}
            y={yFinal[0]}
            teamId={finalTeams[0]}
            seed={seedOf(finalTeams[0])}
            score={scoreFor("final", "top")}
            highlight={isWinner("final", finalTeams[0])}
          />
          <Card
            x={x3}
            y={yFinal[1]}
            teamId={finalTeams[1]}
            seed={seedOf(finalTeams[1])}
            score={scoreFor("final", "bottom")}
            highlight={isWinner("final", finalTeams[1])}
          />

          {firstRoundKeys.map((gameKey, idx) => (
            <path key={`${gameKey}-connector`} d={connector(x0 + cardW, cy(yR1[idx * 2]), cy(yR1[idx * 2 + 1]), x1, cy(yQF[idx]))} {...lineStyle} />
          ))}
          {qfKeys.map((gameKey, idx) => (
            <path key={`${gameKey}-connector`} d={connector(x1 + cardW, cy(yQF[idx * 2]), cy(yQF[idx * 2 + 1]), x2, cy(ySF[idx]))} {...lineStyle} />
          ))}
          {sfKeys.map((gameKey, idx) => (
            <path key={`${gameKey}-connector`} d={connector(x2 + cardW, cy(ySF[idx * 2]), cy(ySF[idx * 2 + 1]), x3, cy(yFinal[idx]))} {...lineStyle} />
          ))}
        </svg>
      </div>
    </div>
  );
}

export default StateBracket16SVG;
