import React, { useMemo } from "react";

/**
 * RegionBracket5SVG
 * Renders a 5-team region tournament bracket:
 * - Play-in: 4 vs 5
 * - Semifinals: 1 vs (4/5 winner) and 2 vs 3
 * - Final: winners meet
 *
 * Expects a `bracket` object shaped like:
 * {
 *   title: "2025 Region Tournament",
 *   teams: { teamId: { name, card } },
 *   games: {
 *     playIn: { top:{teamId,score}, bottom:{teamId,score}, winner },
 *     semi1:  { top:{teamId,score}, bottom:{teamId,score}, winner },
 *     semi2:  { top:{teamId,score}, bottom:{teamId,score}, winner },
 *     final:  { top:{teamId,score}, bottom:{teamId,score}, winner }
 *   }
 * }
 *
 * Team "card" should be a public URL path, e.g.:
 * "/images/boys/basketball/teams/standrews.svg"
 */
function RegionBracket5SVG({ bracket }) {
  // --- Layout constants (tweak once; every season stays consistent) ---
  const cardW = 320;
  const cardH = 64;
  const colGap = 90;
  const rowGap = 28;

  // SVG canvas size (viewBox) — responsive via width: 100%
  // Columns: Play-in (col0), Semis (col1), Final (col2)
  const W = 3 * cardW + 2 * colGap + 200;
  const leftPad = 40;
  const topPad = 40;

  // Row positions (top-left y of each card)
  // Play-in
  const yPlayTop = topPad + 0;
  const yPlayBot = yPlayTop + cardH + rowGap;

  // Semis: Semi1 above, Semi2 below
  const ySemi1Top = topPad + 0;
  const ySemi1Bot = ySemi1Top + cardH + rowGap;

  const ySemi2Top = topPad + 2 * (cardH + rowGap) + 40;
  const ySemi2Bot = ySemi2Top + cardH + rowGap;

  // Final sits between the two semis
  const yFinalTop = topPad + (cardH + rowGap) + 20;
  const yFinalBot = yFinalTop + cardH + rowGap;

  // Column x positions
  const x0 = leftPad;
  const x1 = x0 + cardW + colGap;
  const x2 = x1 + cardW + colGap;

  // Overall canvas height
  const H = ySemi2Bot + cardH + topPad;

  const teams = bracket?.teams ?? {};
  const games = bracket?.games ?? {};

  // Helper: resolve winner teamId for a given game key
  const winnerOf = (gameKey) => {
    const g = games?.[gameKey];
    return g?.winner ?? null;
  };

  // Resolve placeholder slots that come from earlier winners + infer seeds by bracket position
  const resolved = useMemo(() => {
    const playTopTeam = games.playIn?.top?.teamId ?? null;     // seed 4
    const playBotTeam = games.playIn?.bottom?.teamId ?? null;  // seed 5

    const semi1TopTeam = games.semi1?.top?.teamId ?? null;     // seed 1
    const semi2TopTeam = games.semi2?.top?.teamId ?? null;     // seed 2
    const semi2BotTeam = games.semi2?.bottom?.teamId ?? null;  // seed 3

    const playWinnerTeam = winnerOf("playIn");
    const playWinnerSeed =
      playWinnerTeam === playTopTeam ? 4 :
      playWinnerTeam === playBotTeam ? 5 :
      null;

    const semi1BottomTeam = playWinnerTeam; // 1 plays the play-in winner
    const semi1BottomSeed = playWinnerSeed;

    const semi1WinnerTeam = winnerOf("semi1");
    const semi1WinnerSeed =
      semi1WinnerTeam === semi1TopTeam ? 1 :
      semi1WinnerTeam === semi1BottomTeam ? semi1BottomSeed :
      null;

    const semi2WinnerTeam = winnerOf("semi2");
    const semi2WinnerSeed =
      semi2WinnerTeam === semi2TopTeam ? 2 :
      semi2WinnerTeam === semi2BotTeam ? 3 :
      null;

    return {
      // Play-in slots
      playTopTeam,
      playBotTeam,
      playTopSeed: 4,
      playBotSeed: 5,

      // Semis slots
      semi1TopTeam,
      semi1TopSeed: 1,
      semi1BottomTeam,
      semi1BottomSeed,
      semi2TopTeam,
      semi2TopSeed: 2,
      semi2BotTeam,
      semi2BotSeed: 3,

      // Finals slots (derived)
      finalTopTeam: semi1WinnerTeam,
      finalTopSeed: semi1WinnerSeed,
      finalBotTeam: semi2WinnerTeam,
      finalBotSeed: semi2WinnerSeed,
    };
  }, [games]);

  const cardPath = (teamId) => (teamId && teams[teamId]?.card ? teams[teamId].card : null);

  const scoreFor = (gameKey, side) => {
    const g = games?.[gameKey];
    if (!g) return null;
    const obj = g?.[side];
    if (!obj) return null;
    return obj.score ?? null;
  };

  const isWinner = (gameKey, teamId) => {
    const g = games?.[gameKey];
    return !!teamId && g?.winner === teamId;
  };

  const Card = ({ x, y, teamId, seed, score, highlight }) => {
    const href = cardPath(teamId);

    const stroke = highlight ? "rgba(25,115,232,0.9)" : "rgba(120,130,140,0.45)";
    const strokeW = highlight ? 2.5 : 1.25;

    const winnerFill = highlight ? "rgba(25,115,232,0.08)" : "transparent";

    // Bubble geometry (seed left, score right)
    const bubbleW = 34;
    const bubbleH = 36;
    const bubbleR = 10;
    const bubbleY = y + 14;

    const seedX = x - (bubbleW + 10);
    const scoreX = x + cardW + 10;

    return (
      <g>
        {/* subtle winner background */}
        <rect x={x} y={y} width={cardW} height={cardH} rx={14} fill={winnerFill} />

        {/* outline */}
        <rect
          x={x}
          y={y}
          width={cardW}
          height={cardH}
          rx={14}
          fill="transparent"
          stroke={stroke}
          strokeWidth={strokeW}
        />

        {href ? (
          <image
            href={href}
            x={x}
            y={y}
            width={cardW}
            height={cardH}
            preserveAspectRatio="xMidYMid meet"
          />
        ) : (
          <g>
            <rect x={x} y={y} width={cardW} height={cardH} rx={14} fill="rgba(245,247,250,1)" />
            <text x={x + 14} y={y + 38} fontSize="16" fill="rgba(40,44,52,0.9)">
              {teamId ? teams[teamId]?.name ?? teamId : "TBD"}
            </text>
          </g>
        )}

        {/* Seed bubble (left of card) */}
        {seed !== null && seed !== undefined && seed !== "" && (
          <g>
            <rect
              x={seedX}
              y={bubbleY}
              width={bubbleW}
              height={bubbleH}
              rx={bubbleR}
              fill="rgba(255,255,255,0.9)"
              stroke="rgba(120,130,140,0.35)"
              strokeWidth="1"
            />
            <text
              x={seedX + bubbleW / 2}
              y={bubbleY + 25}
              textAnchor="middle"
              fontSize="14"
              fontWeight="700"
              fill="rgba(30,34,40,0.95)"
            >
              {seed}
            </text>
          </g>
        )}

        {/* Score bubble (right of card) */}
        {score !== null && score !== undefined && score !== "" && (
          <g>
            <rect
              x={scoreX}
              y={bubbleY}
              width={bubbleW}
              height={bubbleH}
              rx={bubbleR}
              fill="rgba(255,255,255,0.9)"
              stroke="rgba(120,130,140,0.35)"
              strokeWidth="1"
            />
            <text
              x={scoreX + bubbleW / 2}
              y={bubbleY + 25}
              textAnchor="middle"
              fontSize="14"
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

  // connector helper: from right-middle of one card to left-middle of another, with elbow
  const elbow = (xA, yA, xB, yB) => {
    const midX = (xA + xB) / 2;
    return `M ${xA} ${yA} L ${midX} ${yA} L ${midX} ${yB} L ${xB} ${yB}`;
  };

  const lineStyle = {
    fill: "none",
    stroke: "rgba(90,100,110,0.65)",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <div style={{ minWidth: 820, padding: "8px 0" }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>
          {bracket?.title ?? "Region Tournament"}
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height="auto"
          role="img"
          aria-label={bracket?.title ?? "Region Tournament Bracket"}
        >
          {/* PLAY-IN (4 vs 5) */}
          <Card
            x={x0}
            y={yPlayTop}
            teamId={games.playIn?.top?.teamId ?? null}
            seed={resolved.playTopSeed}
            score={scoreFor("playIn", "top")}
            highlight={isWinner("playIn", games.playIn?.top?.teamId)}
          />
          <Card
            x={x0}
            y={yPlayBot}
            teamId={games.playIn?.bottom?.teamId ?? null}
            seed={resolved.playBotSeed}
            score={scoreFor("playIn", "bottom")}
            highlight={isWinner("playIn", games.playIn?.bottom?.teamId)}
          />

          {/* SEMI 1 (1 vs play-in winner) */}
          <Card
            x={x1}
            y={ySemi1Top}
            teamId={games.semi1?.top?.teamId ?? null}
            seed={resolved.semi1TopSeed}
            score={scoreFor("semi1", "top")}
            highlight={isWinner("semi1", games.semi1?.top?.teamId)}
          />
          <Card
            x={x1}
            y={ySemi1Bot}
            teamId={resolved.semi1BottomTeam}
            seed={resolved.semi1BottomSeed}
            score={scoreFor("semi1", "bottom")}
            highlight={isWinner("semi1", resolved.semi1BottomTeam)}
          />

          {/* SEMI 2 (2 vs 3) */}
          <Card
            x={x1}
            y={ySemi2Top}
            teamId={games.semi2?.top?.teamId ?? null}
            seed={resolved.semi2TopSeed}
            score={scoreFor("semi2", "top")}
            highlight={isWinner("semi2", games.semi2?.top?.teamId)}
          />
          <Card
            x={x1}
            y={ySemi2Bot}
            teamId={games.semi2?.bottom?.teamId ?? null}
            seed={resolved.semi2BotSeed}
            score={scoreFor("semi2", "bottom")}
            highlight={isWinner("semi2", games.semi2?.bottom?.teamId)}
          />

          {/* FINAL */}
          <Card
            x={x2}
            y={yFinalTop}
            teamId={resolved.finalTopTeam}
            seed={resolved.finalTopSeed}
            score={scoreFor("final", "top")}
            highlight={isWinner("final", resolved.finalTopTeam)}
          />
          <Card
            x={x2}
            y={yFinalBot}
            teamId={resolved.finalBotTeam}
            seed={resolved.finalBotSeed}
            score={scoreFor("final", "bottom")}
            highlight={isWinner("final", resolved.finalBotTeam)}
          />

          {/* CONNECTORS */}
          <path d={elbow(x0 + cardW, yPlayTop + cardH / 2, x1, ySemi1Bot + cardH / 2)} {...lineStyle} />
          <path d={elbow(x0 + cardW, yPlayBot + cardH / 2, x1, ySemi1Bot + cardH / 2)} {...lineStyle} />

          <path d={elbow(x1 + cardW, ySemi1Top + cardH / 2, x2, yFinalTop + cardH / 2)} {...lineStyle} />
          <path d={elbow(x1 + cardW, ySemi1Bot + cardH / 2, x2, yFinalTop + cardH / 2)} {...lineStyle} />

          <path d={elbow(x1 + cardW, ySemi2Top + cardH / 2, x2, yFinalBot + cardH / 2)} {...lineStyle} />
          <path d={elbow(x1 + cardW, ySemi2Bot + cardH / 2, x2, yFinalBot + cardH / 2)} {...lineStyle} />

          <text x={x0} y={topPad - 14} fontSize="14" fill="rgba(60,70,80,0.85)" fontWeight="700">
            Play-In (4 vs 5)
          </text>
          <text x={x1} y={topPad - 14} fontSize="14" fill="rgba(60,70,80,0.85)" fontWeight="700">
            Semifinals
          </text>
          <text x={x2} y={topPad - 14} fontSize="14" fill="rgba(60,70,80,0.85)" fontWeight="700">
            Championship
          </text>
        </svg>
      </div>
    </div>
  );
}

export { RegionBracket5SVG };
export default RegionBracket5SVG;