import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { recordTableStyles } from "./recordTableStyles";

function absUrl(path) {
  return new URL(path, window.location.origin).toString();
}

async function fetchJson(label, path) {
  const url = absUrl(path);
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();

  if (!res.ok) throw new Error(`${label} failed (HTTP ${res.status}) at ${path}`);

  const trimmed = text.trim();
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
    throw new Error(`${label} did not return JSON at ${path} (returned HTML).`);
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`${label} returned invalid JSON at ${path}: ${String(e?.message || e)}`);
  }
}

function safeNum(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

function fmtPercent(n, decimals = 1) {
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(decimals)}%`;
}

function tryParseGameDate(game) {
  const gid = String(game?.GameID ?? "");
  if (/^\d{8}$/.test(gid)) {
    const y = Number(gid.slice(0, 4));
    const m = Number(gid.slice(4, 6));
    const d = Number(gid.slice(6, 8));

    const dt = new Date(Date.UTC(y, m - 1, d));
    if (!Number.isNaN(dt.getTime())) return dt;
  }
  return null;
}

function formatDateFromGame(game) {
  const dt = tryParseGameDate(game);
  if (!dt) return "Unknown Date";
  return dt.toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getGameResult(game) {
  if (!game) return "—";

  const teamScore = Number(game.TeamScore);
  const opponentScore = Number(game.OpponentScore);

  if (!Number.isFinite(teamScore) || !Number.isFinite(opponentScore)) return "—";

  let outcome = "Tie";
  if (teamScore > opponentScore) outcome = "Win";
  else if (teamScore < opponentScore) outcome = "Loss";

  return `${teamScore}-${opponentScore} ${outcome}`;
}

const FALLBACK_HEADSHOT = "/images/common/logo.png";

const minimumAttemptsText = {
  FGP: "Minimum of 8 field-goal attempts",
  TwoP: "Minimum of 6 two-point attempts",
  ThreeP: "Minimum of 5 three-point attempts",
  FTP: "Minimum of 5 free-throw attempts",
};

export default function SingleGameRecords() {
  const [rowsByRecord, setRowsByRecord] = useState({});
  const [error, setError] = useState("");
  const [expandedKey, setExpandedKey] = useState(null);

  const sectionDefs = useMemo(
    () => [
      {
        title: "Scoring",
        records: [
          { key: "Points", label: "Points", abbr: "PTS", valueFn: (s) => safeNum(s?.Points), displayFn: (v) => String(v) },
          {
            key: "FGM",
            label: "Field Goals Made",
            abbr: "FGM",
            valueFn: (s) => safeNum(s?.TwoPM) + safeNum(s?.ThreePM),
            displayFn: (v) => String(v),
          },
          {
            key: "FGA",
            label: "Field Goal Attempts",
            abbr: "FGA",
            valueFn: (s) => safeNum(s?.TwoPA) + safeNum(s?.ThreePA),
            displayFn: (v) => String(v),
          },
          {
            key: "FGP",
            label: "Field Goal Percentage",
            abbr: "FG%",
            qualifierText: minimumAttemptsText.FGP,
            valueFn: (s) => {
              const attempts = safeNum(s?.TwoPA) + safeNum(s?.ThreePA);
              if (attempts < 8) return null;
              const makes = safeNum(s?.TwoPM) + safeNum(s?.ThreePM);
              return attempts > 0 ? (makes / attempts) * 100 : null;
            },
            displayFn: (v) => fmtPercent(v, 1),
          },
          { key: "TwoPM", label: "2-Pt Field Goals Made", abbr: "2PM", valueFn: (s) => safeNum(s?.TwoPM), displayFn: (v) => String(v) },
          { key: "TwoPA", label: "2-Pt Field Goal Attempts", abbr: "2PA", valueFn: (s) => safeNum(s?.TwoPA), displayFn: (v) => String(v) },
          {
            key: "TwoP",
            label: "2-Pt Field Goal Percentage",
            abbr: "2PT%",
            qualifierText: minimumAttemptsText.TwoP,
            valueFn: (s) => {
              const attempts = safeNum(s?.TwoPA);
              if (attempts < 6) return null;
              return attempts > 0 ? (safeNum(s?.TwoPM) / attempts) * 100 : null;
            },
            displayFn: (v) => fmtPercent(v, 1),
          },
          { key: "ThreePM", label: "3-Pt Field Goals Made", abbr: "3PM", valueFn: (s) => safeNum(s?.ThreePM), displayFn: (v) => String(v) },
          { key: "ThreePA", label: "3-Pt Field Goal Attempts", abbr: "3PA", valueFn: (s) => safeNum(s?.ThreePA), displayFn: (v) => String(v) },
          {
            key: "ThreeP",
            label: "3-Pt Field Goal Percentage",
            abbr: "3PT%",
            qualifierText: minimumAttemptsText.ThreeP,
            valueFn: (s) => {
              const attempts = safeNum(s?.ThreePA);
              if (attempts < 5) return null;
              return attempts > 0 ? (safeNum(s?.ThreePM) / attempts) * 100 : null;
            },
            displayFn: (v) => fmtPercent(v, 1),
          },
          { key: "FTM", label: "Free Throws Made", abbr: "FTM", valueFn: (s) => safeNum(s?.FTM), displayFn: (v) => String(v) },
          { key: "FTA", label: "Free Throw Attempts", abbr: "FTA", valueFn: (s) => safeNum(s?.FTA), displayFn: (v) => String(v) },
          {
            key: "FTP",
            label: "Free Throw Percentage",
            abbr: "FT%",
            qualifierText: minimumAttemptsText.FTP,
            valueFn: (s) => {
              const attempts = safeNum(s?.FTA);
              if (attempts < 5) return null;
              return attempts > 0 ? (safeNum(s?.FTM) / attempts) * 100 : null;
            },
            displayFn: (v) => fmtPercent(v, 1),
          },
        ],
      },
      {
        title: "Playmaking",
        records: [
          { key: "Assists", label: "Assists", abbr: "AST", valueFn: (s) => safeNum(s?.Assists), displayFn: (v) => String(v) },
          { key: "Turnovers", label: "Turnovers", abbr: "TO", valueFn: (s) => safeNum(s?.Turnovers), displayFn: (v) => String(v) },
        ],
      },
      {
        title: "Rebounding & Defense",
        records: [
          { key: "Rebounds", label: "Rebounds", abbr: "REB", valueFn: (s) => safeNum(s?.Rebounds), displayFn: (v) => String(v) },
          { key: "Steals", label: "Steals", abbr: "STL", valueFn: (s) => safeNum(s?.Steals), displayFn: (v) => String(v) },
          { key: "Blocks", label: "Blocks", abbr: "BLK", valueFn: (s) => safeNum(s?.Blocks), displayFn: (v) => String(v) },
        ],
      },
    ],
    []
  );

  const recordDefs = useMemo(() => sectionDefs.flatMap((section) => section.records), [sectionDefs]);

  useEffect(() => {
    const run = async () => {
      try {
        setError("");

        const [playerStatsDataRaw, playersDataRaw, gamesDataRaw] = await Promise.all([
          fetchJson("playergamestats.json", "/data/boys/basketball/playergamestats.json"),
          fetchJson("players.json", "/data/boys/basketball/players.json"),
          fetchJson("games.json", "/data/boys/basketball/games.json"),
        ]);

        const playerStatsData = Array.isArray(playerStatsDataRaw) ? playerStatsDataRaw : [];
        const playersData = Array.isArray(playersDataRaw) ? playersDataRaw : [];
        const gamesData = Array.isArray(gamesDataRaw) ? gamesDataRaw : [];

        const playerMap = new Map(playersData.map((p) => [String(p.PlayerID), p]));
        const gameMap = new Map(gamesData.map((g) => [String(g.GameID), g]));

        const next = {};

        for (const def of recordDefs) {
          const list = playerStatsData
            .filter((s) => s && s.PlayerID != null && s.GameID != null)
            .map((s) => {
              const player = playerMap.get(String(s.PlayerID));
              const game = gameMap.get(String(s.GameID));
              const rawValue = def.valueFn(s);

              return {
                sortValue: Number(rawValue),
                displayValue: Number.isFinite(Number(rawValue))
                  ? def.displayFn(Number(rawValue))
                  : "—",
                playerId: String(s.PlayerID),
                playerName: player ? `${player.FirstName} ${player.LastName}` : "Unknown",
                playerImg: player?.PlayerID ? `/images/boys/basketball/players/${player.PlayerID}.jpg` : null,
                date: game ? formatDateFromGame(game) : "Unknown Date",
                opponent: game?.Opponent ?? "Unknown Opponent",
                gameResult: getGameResult(game),
              };
            })
            .filter((r) => Number.isFinite(r.sortValue) && r.sortValue > 0)
            .sort((a, b) => b.sortValue - a.sortValue)
            .slice(0, 20);

          while (list.length < 20) {
            list.push({
              sortValue: 0,
              displayValue: "—",
              playerId: null,
              playerName: "—",
              playerImg: null,
              date: "—",
              opponent: "—",
              gameResult: "—",
              _placeholder: true,
            });
          }

          next[def.key] = list;
        }

        setRowsByRecord(next);
      } catch (e) {
        setError(String(e?.message || e));
        console.error(e);
      }
    };

    run();
  }, [recordDefs]);

  const toggleExpanded = (key) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  return (
    <div className="pt-2 pb-10 lg:pb-40 space-y-6 px-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-center">Single Game Records</h1>
      <p className="-mt-3 text-center text-sm italic text-gray-600">
        Select any record to see the top 20 historical results for that record
      </p>

      {error && (
        <div className="p-3 rounded bg-red-50 text-red-700 border border-red-200 whitespace-pre-wrap">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className={recordTableStyles.outerTable}>
          <thead className="bg-gray-200 font-bold">
            <tr>
              <th className={recordTableStyles.headerCell}>Record</th>
              <th className={recordTableStyles.headerCell}>Player</th>
              <th className={recordTableStyles.headerCell}>Value</th>
              <th className={recordTableStyles.headerCell}>Date</th>
              <th className={recordTableStyles.headerCell}>Opponent</th>
              <th className={recordTableStyles.headerCell}>Game Result</th>
            </tr>
          </thead>

          <tbody>
            {sectionDefs.map((section) => (
              <React.Fragment key={section.title}>
                <tr className="border-t bg-blue-50">
                  <td className={recordTableStyles.sectionCell} colSpan={6}>
                    {section.title}
                  </td>
                </tr>

                {section.records.map((def) => {
                  const top = (rowsByRecord[def.key] || [])[0];
                  const isOpen = expandedKey === def.key;

                  const topPlayer = top?.playerName ?? "—";
                  const topPlayerId = top?.playerId ?? null;
                  const topValue = top?.displayValue ?? "—";
                  const topDate = top?.date ?? "—";
                  const topOpp = top?.opponent ?? "—";
                  const topResult = top?.gameResult ?? "—";

                  return (
                    <React.Fragment key={def.key}>
                      <tr
                        onClick={() => toggleExpanded(def.key)}
                        className={`border-t cursor-pointer hover:bg-gray-100 ${isOpen ? "bg-gray-50" : "bg-white"}`}
                      >
                        <td className={`${recordTableStyles.bodyCell} font-semibold`}>
                          <div className="leading-tight">
                            <div>{def.label}</div>
                            {def.qualifierText ? (
                              <div className="mt-1 text-[clamp(0.62rem,0.85vw,0.8rem)] italic font-normal text-gray-600">
                                {def.qualifierText}
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className={recordTableStyles.bodyCell}>
                          <div className={recordTableStyles.playerWrap}>
                            {top?.playerImg && topPlayer !== "—" && topPlayer !== "Unknown" ? (
                              <img
                                src={top.playerImg}
                                alt={topPlayer}
                                className={recordTableStyles.headshot}
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = FALLBACK_HEADSHOT;
                                }}
                              />
                            ) : null}

                            {topPlayerId && topPlayer !== "—" && topPlayer !== "Unknown" ? (
                              <Link
                                to={`/athletics/boys/basketball/players/${topPlayerId}`}
                                className={recordTableStyles.playerLink}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {topPlayer}
                              </Link>
                            ) : (
                              <span className={recordTableStyles.playerText}>{topPlayer}</span>
                            )}
                          </div>
                        </td>
                        <td className={`${recordTableStyles.bodyCell} font-semibold`}>{topValue}</td>
                        <td className={recordTableStyles.bodyCell}>{topDate}</td>
                        <td className={recordTableStyles.bodyCell}>{topOpp}</td>
                        <td className={recordTableStyles.bodyCell}>{topResult}</td>
                      </tr>

                      {isOpen && (
                        <tr className="border-t">
                          <td className={recordTableStyles.bodyCell} colSpan={6}>
                            <div className="overflow-x-auto">
                              <table className={recordTableStyles.innerTable}>
                                <thead className="bg-gray-200 font-bold">
                                  <tr>
                                    <th className={recordTableStyles.headerCell}>#</th>
                                    <th className={recordTableStyles.headerCell}>Player</th>
                                    <th className={recordTableStyles.headerCell}>{def.abbr}</th>
                                    <th className={recordTableStyles.headerCell}>Date</th>
                                    <th className={recordTableStyles.headerCell}>Opponent</th>
                                    <th className={recordTableStyles.headerCell}>Game Result</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(rowsByRecord[def.key] || []).map((r, idx) => (
                                    <tr
                                      key={idx}
                                      className={`border-t ${
                                        r._placeholder
                                          ? "bg-white text-gray-400"
                                          : idx % 2 === 0
                                            ? "bg-white"
                                            : "bg-gray-50"
                                      }`}
                                    >
                                      <td className={`${recordTableStyles.detailCell} font-semibold`}>{idx + 1}</td>
                                      <td className={recordTableStyles.detailCell}>
                                        <div className={recordTableStyles.playerWrap}>
                                          {r.playerImg && r.playerName !== "—" && r.playerName !== "Unknown" ? (
                                            <img
                                              src={r.playerImg}
                                              alt={r.playerName}
                                              className={recordTableStyles.headshot}
                                              loading="lazy"
                                              onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = FALLBACK_HEADSHOT;
                                              }}
                                            />
                                          ) : null}

                                          {r.playerId && r.playerName !== "—" && r.playerName !== "Unknown" ? (
                                            <Link
                                              to={`/athletics/boys/basketball/players/${r.playerId}`}
                                              className={recordTableStyles.playerLink}
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              {r.playerName}
                                            </Link>
                                          ) : (
                                            <span className={recordTableStyles.playerText}>{r.playerName}</span>
                                          )}
                                        </div>
                                      </td>
                                      <td className={`${recordTableStyles.detailCell} font-semibold`}>{r.displayValue}</td>
                                      <td className={recordTableStyles.detailCell}>{r.date}</td>
                                      <td className={recordTableStyles.detailCell}>{r.opponent}</td>
                                      <td className={recordTableStyles.detailCell}>{r.gameResult}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
