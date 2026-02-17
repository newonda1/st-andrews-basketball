

import React, { useMemo } from "react";

/**
 * StateBracket12SVG
 * 12-team bracket with top 4 seeds receiving byes.
 *
 * Recommended bracket JSON shape:
 * {
 *   title: "2025 State Tournament",
 *   teams: {
 *     standrews: { name: "St. Andrew’s", seed: 1, card: "/images/.../standrews.svg" },
 *     ...
 *   },
 *   games: {
 *     // Round of 12 (4 games): 5v12, 6v11, 7v10, 8v9
 *     r1_5_12: { top:{teamId,score}, bottom:{teamId,score}, winner },
 *     r1_6_11: { ... },
 *     r1_7_10: { ... },
 *     r1_8_9:  { ... },
 *
 *     // Quarterfinals (4 games): byes + R1 winners
 *     qf_4: { top:{teamId,score}, bottom:{teamId,score}, winner }, // 4 vs winner(5/12)
 *     qf_3: { top:{teamId,score}, bottom:{teamId,score}, winner }, // 3 vs winner(6/11)
 *     qf_2: { top:{teamId,score}, bottom:{teamId,score}, winner }, // 2 vs winner(7/10)
 *     qf_1: { top:{teamId,score}, bottom:{teamId,score}, winner }, // 1 vs winner(8/9)
 *
 *     // Semifinals (2 games)
 *     sf_top: { top:{teamId,score}, bottom:{teamId,score}, winner }, // winners of qf_4 and qf_3
 *     sf_bot: { top:{teamId,score}, bottom:{teamId,score}, winner }, // winners of qf_2 and qf_1
 *
 *     // Final (1 game)
 *     final: { top:{teamId,score}, bottom:{teamId,score}, winner }
 *   }
 * }
 *
 * Notes:
 * - Seeds are displayed from teams[teamId].seed (preferred). If seed is missing, it will be blank.
 * - Seed and score are INSIDE the rounded rectangle:
 *   - seed: left side (inside)
 *   - score: right side (inside)
 * - The team-card image is inset so it doesn't overlap the seed/score pills.
 */
function StateBracket12SVG({ bracket }) {
  // --- Layout constants (smaller than the region bracket; 4 columns) ---
  const cardW = 270;
  const cardH = 58;
  const colGap = 60;
  const rowGap = 18;

  const leftPad = 36;
  const topPad = 46;

  // Columns: R1, QF, SF, Final
  const x0 = leftPad;
  const x1 = x0 + cardW + colGap;
  const x2 = x1 + cardW + colGap;
  const x3 = x2 + cardW + colGap;

  // Total width (viewBox). Keep some padding for labels.
  const W = x3 + cardW + 60;

  // R1 has 8 team slots (4 games)
  const yR1 = Array.from({ length: 8 }, (_, i) => topPad + i * (cardH + rowGap));

  // Quarterfinal slots align with R1 order:
  // Top-down: qf_1 (1 vs w5/12), qf_4 (4 vs w8/9), qf_3 (3 vs w6/11), qf_2 (2 vs w7/10)
  const yQF = [
    yR1[0], yR1[1], // qf_1
    yR1[2], yR1[3], // qf_4
    yR1[4], yR1[5], // qf_3
    yR1[6], yR1[7], // qf_2
  ];

  // Semifinals: 4 slots (2 games)
  // sf_top: winners of qf_1 and qf_4
  // sf_bot: winners of qf_3 and qf_2
  const ySF = [
    yR1[1], // sf_top top
    yR1[3], // sf_top bottom
    yR1[5], // sf_bot top
    yR1[7], // sf_bot bottom
  ];

  // Final: 2 slots centered between semis
  const yFinal = [
    yR1[3], // final top
    yR1[5], // final bottom
  ];

  // Total height
  const H = yR1[7] + cardH + topPad;

  const teams = bracket?.teams ?? {};
  const games = bracket?.games ?? {};

  const seedOf = (teamId) => {
    if (!teamId) return null;
    const s = teams?.[teamId]?.seed;
    return (s === 0 || s) ? s : null;
  };

  const winnerOf = (gameKey) => {
    const g = games?.[gameKey];
    return g?.winner ?? null;
  };

  // Resolve winners that flow forward
  const resolved = useMemo(() => {
    const w5_12 = winnerOf("r1_5_12");
    const w6_11 = winnerOf("r1_6_11");
    const w7_10 = winnerOf("r1_7_10");
    const w8_9 = winnerOf("r1_8_9");

    const wqf4 = winnerOf("qf_4");
    const wqf3 = winnerOf("qf_3");
    const wqf2 = winnerOf("qf_2");
    const wqf1 = winnerOf("qf_1");

    const wsfTop = winnerOf("sf_top");
    const wsfBot = winnerOf("sf_bot");

    return {
      // R1 winners
      w5_12, w6_11, w7_10, w8_9,
      // QF winners
      wqf4, wqf3, wqf2, wqf1,
      // SF winners
      wsfTop, wsfBot,
      // Final winners
      champion: winnerOf("final"),
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
    const strokeW = highlight ? 2.3 : 1.2;
    const winnerFill = highlight ? "rgba(25,115,232,0.08)" : "transparent";

    // Pills (inside the card)
    const bubbleW = 32;
    const bubbleH = 30;
    const bubbleR = 10;
    const bubbleY = y + (cardH - bubbleH) / 2;

    // Reserve space so pills don't overlap the team-card image/text.
    const leftInset = bubbleW + 16;   // seed pill + gap
    const rightInset = bubbleW + 16;  // score pill + gap

    const seedX = x + 10;                    // inside left
    const scoreX = x + cardW - 10 - bubbleW; // inside right

    const imgX = x + leftInset;
    const imgW = cardW - leftInset - rightInset;

    return (
      <g>
        {/* subtle winner background */}
        <rect x={x} y={y} width={cardW} height={cardH} rx={14} fill={winnerFill} />

        {/* outline */}
        <rect x={x} y={y} width={cardW} height={cardH} rx={14} fill="transparent" stroke={stroke} strokeWidth={strokeW} />

        {/* team card image (inset so pills don't overlap) */}
        {href ? (
          <image href={href} x={imgX} y={y} width={imgW} height={cardH} preserveAspectRatio="xMidYMid meet" />
        ) : (
          <g>
            <rect x={x} y={y} width={cardW} height={cardH} rx={14} fill="rgba(245,247,250,1)" />
            <text x={imgX + 8} y={y + 36} fontSize="15" fill="rgba(40,44,52,0.9)">
              {teamId ? teams[teamId]?.name ?? teamId : "TBD"}
            </text>
          </g>
        )}

        {/* Seed pill (inside card, left) */}
        {seed !== null && seed !== undefined && seed !== "" && (
          <g>
            <rect
              x={seedX}
              y={bubbleY}
              width={bubbleW}
              height={bubbleH}
              rx={bubbleR}
              fill="rgba(255,255,255,0.92)"
              stroke="rgba(120,130,140,0.35)"
              strokeWidth="1"
            />
            <text
              x={seedX + bubbleW / 2}
              y={bubbleY + bubbleH / 2 + 5}
              textAnchor="middle"
              fontSize="13"
              fontWeight="700"
              fill="rgba(30,34,40,0.95)"
            >
              {seed}
            </text>
          </g>
        )}

        {/* Score pill (inside card, right) */}
        {score !== null && score !== undefined && score !== "" && (
          <g>
            <rect
              x={scoreX}
              y={bubbleY}
              width={bubbleW}
              height={bubbleH}
              rx={bubbleR}
              fill="rgba(255,255,255,0.92)"
              stroke="rgba(120,130,140,0.35)"
              strokeWidth="1"
            />
            <text
              x={scoreX + bubbleW / 2}
              y={bubbleY + bubbleH / 2 + 5}
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

  // Connector helper
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

  // Convenience: card center Y
  const cy = (y) => y + cardH / 2;

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <div style={{ minWidth: 1100, padding: "8px 0" }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>{bracket?.title ?? "State Tournament"}</div>

        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="auto" role="img" aria-label={bracket?.title ?? "State Tournament Bracket"}>
          {/* Column labels */}
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

          {/* ---------------- R1 (5v12, 8v9, 6v11, 7v10) ---------------- */}
          {/* r1_5_12 */}
          <Card
            x={x0}
            y={yR1[0]}
            teamId={games.r1_5_12?.top?.teamId ?? null}
            seed={seedOf(games.r1_5_12?.top?.teamId)}
            score={scoreFor("r1_5_12", "top")}
            highlight={isWinner("r1_5_12", games.r1_5_12?.top?.teamId)}
          />
          <Card
            x={x0}
            y={yR1[1]}
            teamId={games.r1_5_12?.bottom?.teamId ?? null}
            seed={seedOf(games.r1_5_12?.bottom?.teamId)}
            score={scoreFor("r1_5_12", "bottom")}
            highlight={isWinner("r1_5_12", games.r1_5_12?.bottom?.teamId)}
          />

          {/* r1_8_9 */}
          <Card
            x={x0}
            y={yR1[2]}
            teamId={games.r1_8_9?.top?.teamId ?? null}
            seed={seedOf(games.r1_8_9?.top?.teamId)}
            score={scoreFor("r1_8_9", "top")}
            highlight={isWinner("r1_8_9", games.r1_8_9?.top?.teamId)}
          />
          <Card
            x={x0}
            y={yR1[3]}
            teamId={games.r1_8_9?.bottom?.teamId ?? null}
            seed={seedOf(games.r1_8_9?.bottom?.teamId)}
            score={scoreFor("r1_8_9", "bottom")}
            highlight={isWinner("r1_8_9", games.r1_8_9?.bottom?.teamId)}
          />

          {/* r1_6_11 */}
          <Card
            x={x0}
            y={yR1[4]}
            teamId={games.r1_6_11?.top?.teamId ?? null}
            seed={seedOf(games.r1_6_11?.top?.teamId)}
            score={scoreFor("r1_6_11", "top")}
            highlight={isWinner("r1_6_11", games.r1_6_11?.top?.teamId)}
          />
          <Card
            x={x0}
            y={yR1[5]}
            teamId={games.r1_6_11?.bottom?.teamId ?? null}
            seed={seedOf(games.r1_6_11?.bottom?.teamId)}
            score={scoreFor("r1_6_11", "bottom")}
            highlight={isWinner("r1_6_11", games.r1_6_11?.bottom?.teamId)}
          />

          {/* r1_7_10 */}
          <Card
            x={x0}
            y={yR1[6]}
            teamId={games.r1_7_10?.top?.teamId ?? null}
            seed={seedOf(games.r1_7_10?.top?.teamId)}
            score={scoreFor("r1_7_10", "top")}
            highlight={isWinner("r1_7_10", games.r1_7_10?.top?.teamId)}
          />
          <Card
            x={x0}
            y={yR1[7]}
            teamId={games.r1_7_10?.bottom?.teamId ?? null}
            seed={seedOf(games.r1_7_10?.bottom?.teamId)}
            score={scoreFor("r1_7_10", "bottom")}
            highlight={isWinner("r1_7_10", games.r1_7_10?.bottom?.teamId)}
          />

          {/* ---------------- QF ---------------- */}
          {/* qf_1 (1 vs winner 5/12) */}
          <Card
            x={x1}
            y={yQF[0]}
            teamId={games.qf_1?.top?.teamId ?? null}
            seed={seedOf(games.qf_1?.top?.teamId)}
            score={scoreFor("qf_1", "top")}
            highlight={isWinner("qf_1", games.qf_1?.top?.teamId)}
          />
          <Card
            x={x1}
            y={yQF[1]}
            teamId={resolved.w5_12}
            seed={seedOf(resolved.w5_12)}
            score={scoreFor("qf_1", "bottom")}
            highlight={isWinner("qf_1", resolved.w5_12)}
          />

          {/* qf_4 (4 vs winner 8/9) */}
          <Card
            x={x1}
            y={yQF[2]}
            teamId={games.qf_4?.top?.teamId ?? null}
            seed={seedOf(games.qf_4?.top?.teamId)}
            score={scoreFor("qf_4", "top")}
            highlight={isWinner("qf_4", games.qf_4?.top?.teamId)}
          />
          <Card
            x={x1}
            y={yQF[3]}
            teamId={resolved.w8_9}
            seed={seedOf(resolved.w8_9)}
            score={scoreFor("qf_4", "bottom")}
            highlight={isWinner("qf_4", resolved.w8_9)}
          />

          {/* qf_3 (3 vs winner 6/11) */}
          <Card
            x={x1}
            y={yQF[4]}
            teamId={games.qf_3?.top?.teamId ?? null}
            seed={seedOf(games.qf_3?.top?.teamId)}
            score={scoreFor("qf_3", "top")}
            highlight={isWinner("qf_3", games.qf_3?.top?.teamId)}
          />
          <Card
            x={x1}
            y={yQF[5]}
            teamId={resolved.w6_11}
            seed={seedOf(resolved.w6_11)}
            score={scoreFor("qf_3", "bottom")}
            highlight={isWinner("qf_3", resolved.w6_11)}
          />

          {/* qf_2 (2 vs winner 7/10) */}
          <Card
            x={x1}
            y={yQF[6]}
            teamId={games.qf_2?.top?.teamId ?? null}
            seed={seedOf(games.qf_2?.top?.teamId)}
            score={scoreFor("qf_2", "top")}
            highlight={isWinner("qf_2", games.qf_2?.top?.teamId)}
          />
          <Card
            x={x1}
            y={yQF[7]}
            teamId={resolved.w7_10}
            seed={seedOf(resolved.w7_10)}
            score={scoreFor("qf_2", "bottom")}
            highlight={isWinner("qf_2", resolved.w7_10)}
          />

          {/* ---------------- SF ---------------- */}
          {/* sf_top: winners of qf_1 and qf_4 */}
          <Card
            x={x2}
            y={ySF[0]}
            teamId={resolved.wqf1}
            seed={seedOf(resolved.wqf1)}
            score={scoreFor("sf_top", "top")}
            highlight={isWinner("sf_top", resolved.wqf1)}
          />
          <Card
            x={x2}
            y={ySF[1]}
            teamId={resolved.wqf4}
            seed={seedOf(resolved.wqf4)}
            score={scoreFor("sf_top", "bottom")}
            highlight={isWinner("sf_top", resolved.wqf4)}
          />

          {/* sf_bot: winners of qf_3 and qf_2 */}
          <Card
            x={x2}
            y={ySF[2]}
            teamId={resolved.wqf3}
            seed={seedOf(resolved.wqf3)}
            score={scoreFor("sf_bot", "top")}
            highlight={isWinner("sf_bot", resolved.wqf3)}
          />
          <Card
            x={x2}
            y={ySF[3]}
            teamId={resolved.wqf2}
            seed={seedOf(resolved.wqf2)}
            score={scoreFor("sf_bot", "bottom")}
            highlight={isWinner("sf_bot", resolved.wqf2)}
          />

          {/* ---------------- FINAL ---------------- */}
          <Card
            x={x3}
            y={yFinal[0]}
            teamId={resolved.wsfTop}
            seed={seedOf(resolved.wsfTop)}
            score={scoreFor("final", "top")}
            highlight={isWinner("final", resolved.wsfTop)}
          />
          <Card
            x={x3}
            y={yFinal[1]}
            teamId={resolved.wsfBot}
            seed={seedOf(resolved.wsfBot)}
            score={scoreFor("final", "bottom")}
            highlight={isWinner("final", resolved.wsfBot)}
          />

          {/* ---------------- CONNECTORS ---------------- */}
          {/* R1 -> QF (connect both R1 cards to the QF bottom slot for that pairing) */}
          {/* r1_5_12 -> qf_1 bottom */}
          <path d={elbow(x0 + cardW, cy(yR1[0]), x1, cy(yQF[1]))} {...lineStyle} />
          <path d={elbow(x0 + cardW, cy(yR1[1]), x1, cy(yQF[1]))} {...lineStyle} />

          {/* r1_8_9 -> qf_4 bottom */}
          <path d={elbow(x0 + cardW, cy(yR1[2]), x1, cy(yQF[3]))} {...lineStyle} />
          <path d={elbow(x0 + cardW, cy(yR1[3]), x1, cy(yQF[3]))} {...lineStyle} />

          {/* r1_6_11 -> qf_3 bottom */}
          <path d={elbow(x0 + cardW, cy(yR1[4]), x1, cy(yQF[5]))} {...lineStyle} />
          <path d={elbow(x0 + cardW, cy(yR1[5]), x1, cy(yQF[5]))} {...lineStyle} />

          {/* r1_7_10 -> qf_2 bottom */}
          <path d={elbow(x0 + cardW, cy(yR1[6]), x1, cy(yQF[7]))} {...lineStyle} />
          <path d={elbow(x0 + cardW, cy(yR1[7]), x1, cy(yQF[7]))} {...lineStyle} />

          {/* QF -> SF (connect both QF cards to their SF slot) */}
          {/* qf_1 -> sf_top top */}
          <path d={elbow(x1 + cardW, cy(yQF[0]), x2, cy(ySF[0]))} {...lineStyle} />
          <path d={elbow(x1 + cardW, cy(yQF[1]), x2, cy(ySF[0]))} {...lineStyle} />

          {/* qf_4 -> sf_top bottom */}
          <path d={elbow(x1 + cardW, cy(yQF[2]), x2, cy(ySF[1]))} {...lineStyle} />
          <path d={elbow(x1 + cardW, cy(yQF[3]), x2, cy(ySF[1]))} {...lineStyle} />

          {/* qf_3 -> sf_bot top */}
          <path d={elbow(x1 + cardW, cy(yQF[4]), x2, cy(ySF[2]))} {...lineStyle} />
          <path d={elbow(x1 + cardW, cy(yQF[5]), x2, cy(ySF[2]))} {...lineStyle} />

          {/* qf_2 -> sf_bot bottom */}
          <path d={elbow(x1 + cardW, cy(yQF[6]), x2, cy(ySF[3]))} {...lineStyle} />
          <path d={elbow(x1 + cardW, cy(yQF[7]), x2, cy(ySF[3]))} {...lineStyle} />

          {/* SF -> Final */}
          <path d={elbow(x2 + cardW, cy(ySF[0]), x3, cy(yFinal[0]))} {...lineStyle} />
          <path d={elbow(x2 + cardW, cy(ySF[1]), x3, cy(yFinal[0]))} {...lineStyle} />
          <path d={elbow(x2 + cardW, cy(ySF[2]), x3, cy(yFinal[1]))} {...lineStyle} />
          <path d={elbow(x2 + cardW, cy(ySF[3]), x3, cy(yFinal[1]))} {...lineStyle} />
        </svg>
      </div>
    </div>
  );
}

export { StateBracket12SVG };
export default StateBracket12SVG;