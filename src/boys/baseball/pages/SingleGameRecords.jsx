

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

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

function tryParseGameDate(game) {
  const gid = String(game?.GameID ?? "");

  // Baseball GameIDs may include extra trailing digits after YYYYMMDD,
  // so use the first 8 digits whenever available.
  if (/^\d{8,}$/.test(gid)) {
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

  const A = Number(game.TeamScore);
  const B = Number(game.OpponentScore);

  if (!Number.isFinite(A) || !Number.isFinite(B)) return "—";

  let outcome = "Tie";
  if (A > B) outcome = "Win";
  else if (A < B) outcome = "Loss";

  return `${A}-${B} ${outcome}`;
}

const FALLBACK_HEADSHOT = "/images/common/logo.png";

export default function SingleGameRecords() {
  const [rowsByRecord, setRowsByRecord] = useState({});
  const [error, setError] = useState("");
  const [expandedKey, setExpandedKey] = useState(null);

  const sectionDefs = useMemo(
    () => [
      {
        title: "Batting",
        records: [
          { key: "PA", label: "Plate Appearances", abbr: "PA", valueFn: (s) => safeNum(s?.PA) },
          { key: "AB", label: "At Bats", abbr: "AB", valueFn: (s) => safeNum(s?.AB) },
          { key: "R", label: "Runs", abbr: "R", valueFn: (s) => safeNum(s?.R) },
          { key: "H", label: "Hits", abbr: "H", valueFn: (s) => safeNum(s?.H) },
          { key: "1B", label: "Singles", abbr: "1B", valueFn: (s) => safeNum(s?.["1B"]) },
          { key: "2B", label: "Doubles", abbr: "2B", valueFn: (s) => safeNum(s?.["2B"]) },
          { key: "3B", label: "Triples", abbr: "3B", valueFn: (s) => safeNum(s?.["3B"]) },
          { key: "HR", label: "Home Runs", abbr: "HR", valueFn: (s) => safeNum(s?.HR) },
          { key: "RBI", label: "Runs Batted In", abbr: "RBI", valueFn: (s) => safeNum(s?.RBI) },
          { key: "BB", label: "Walks", abbr: "BB", valueFn: (s) => safeNum(s?.BB) },
          { key: "SO", label: "Strikeouts (Batting)", abbr: "SO", valueFn: (s) => safeNum(s?.SO) },
          { key: "HBP", label: "Hit By Pitch", abbr: "HBP", valueFn: (s) => safeNum(s?.HBP) },
          { key: "SAC", label: "Sacrifice Hits", abbr: "SAC", valueFn: (s) => safeNum(s?.SAC) },
          { key: "SF", label: "Sacrifice Flies", abbr: "SF", valueFn: (s) => safeNum(s?.SF) },
          { key: "ROE", label: "Reached on Error", abbr: "ROE", valueFn: (s) => safeNum(s?.ROE) },
          { key: "FC", label: "Fielder's Choice", abbr: "FC", valueFn: (s) => safeNum(s?.FC) },
          { key: "TB", label: "Total Bases", abbr: "TB", valueFn: (s) => safeNum(s?.TB) },
        ],
      },
      {
        title: "Pitching",
        records: [
          { key: "IP", label: "Innings Pitched", abbr: "IP", valueFn: (s) => safeNum(s?.IP) },
          { key: "BF", label: "Batters Faced", abbr: "BF", valueFn: (s) => safeNum(s?.BF) },
          { key: "Pitches", label: "Pitches", abbr: "P", valueFn: (s) => safeNum(s?.Pitches) },
          {
            key: "SO_Pitching",
            label: "Strikeouts (Pitching)",
            abbr: "K",
            valueFn: (s) => safeNum(s?.SO_Pitching),
          },
          {
            key: "H_Allowed",
            label: "Hits Allowed",
            abbr: "H",
            valueFn: (s) => safeNum(s?.H_Allowed),
          },
          {
            key: "R_Allowed",
            label: "Runs Allowed",
            abbr: "R",
            valueFn: (s) => safeNum(s?.R_Allowed),
          },
          { key: "ER", label: "Earned Runs", abbr: "ER", valueFn: (s) => safeNum(s?.ER) },
          {
            key: "BB_Allowed",
            label: "Walks Allowed",
            abbr: "BB",
            valueFn: (s) => safeNum(s?.BB_Allowed),
          },
          {
            key: "HBP_Pitching",
            label: "Hit Batters",
            abbr: "HBP",
            valueFn: (s) => safeNum(s?.HBP_Pitching),
          },
          { key: "BK", label: "Balks", abbr: "BK", valueFn: (s) => safeNum(s?.BK) },
          {
            key: "PIK_Allowed",
            label: "Pickoffs Allowed",
            abbr: "PIK",
            valueFn: (s) => safeNum(s?.PIK_Allowed),
          },
          { key: "WP", label: "Wild Pitches", abbr: "WP", valueFn: (s) => safeNum(s?.WP) },
        ],
      },
      {
        title: "Baserunning",
        records: [
          { key: "SB", label: "Stolen Bases", abbr: "SB", valueFn: (s) => safeNum(s?.SB) },
          { key: "CS", label: "Caught Stealing", abbr: "CS", valueFn: (s) => safeNum(s?.CS) },
          {
            key: "CS_Pitching",
            label: "Runners Caught Stealing",
            abbr: "CS",
            valueFn: (s) => safeNum(s?.CS_Pitching),
          },
          {
            key: "SB_Allowed",
            label: "Stolen Bases Allowed",
            abbr: "SB",
            valueFn: (s) => safeNum(s?.SB_Allowed),
          },
        ],
      },
      {
        title: "Fielding",
        records: [
          { key: "PO", label: "Putouts", abbr: "PO", valueFn: (s) => safeNum(s?.PO) },
          { key: "A", label: "Assists", abbr: "A", valueFn: (s) => safeNum(s?.A) },
          { key: "E", label: "Errors", abbr: "E", valueFn: (s) => safeNum(s?.E) },
          { key: "DP", label: "Double Plays", abbr: "DP", valueFn: (s) => safeNum(s?.DP) },
          { key: "TP", label: "Triple Plays", abbr: "TP", valueFn: (s) => safeNum(s?.TP) },
          { key: "PB", label: "Passed Balls", abbr: "PB", valueFn: (s) => safeNum(s?.PB) },
          {
            key: "PIK_Fielding",
            label: "Pickoffs (Fielding)",
            abbr: "PIK",
            valueFn: (s) => safeNum(s?.PIK_Fielding),
          },
          {
            key: "CI",
            label: "Catcher's Interference",
            abbr: "CI",
            valueFn: (s) => safeNum(s?.CI),
          },
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
          fetchJson("playergamestats.json", "/data/boys/baseball/playergamestats.json"),
          fetchJson("players.json", "/data/boys/players.json"),
          fetchJson("games.json", "/data/boys/baseball/games.json"),
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
              return {
                value: def.valueFn(s),
                playerId: String(s.PlayerID),
                playerName: player ? `${player.FirstName} ${player.LastName}` : "Unknown",
                playerImg: player?.PlayerID ? `/images/boys/baseball/players/${player.PlayerID}.jpg` : null,
                date: game ? formatDateFromGame(game) : "Unknown Date",
                opponent: game?.Opponent ?? "Unknown Opponent",
                gameResult: getGameResult(game),
              };
            })
            .filter((r) => Number.isFinite(r.value) && r.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 20);

          while (list.length < 20) {
            list.push({
              value: "—",
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
        <table className="min-w-full table-auto text-xs border text-center">
          <thead className="bg-gray-200 font-bold">
            <tr>
              <th className="border px-2 py-1">Record</th>
              <th className="border px-2 py-1">Player</th>
              <th className="border px-2 py-1">Value</th>
              <th className="border px-2 py-1">Date</th>
              <th className="border px-2 py-1">Opponent</th>
              <th className="border px-2 py-1">Game Result</th>
            </tr>
          </thead>

          <tbody>
            {sectionDefs.map((section) => (
              <React.Fragment key={section.title}>
                <tr className="border-t bg-blue-50">
                  <td className="border px-2 py-2 text-left font-bold text-blue-900" colSpan={6}>
                    {section.title}
                  </td>
                </tr>

                {section.records.map((def) => {
                  const top = (rowsByRecord[def.key] || [])[0];
                  const isOpen = expandedKey === def.key;

                  const topPlayer = top?.playerName ?? "—";
                  const topPlayerId = top?.playerId ?? null;
                  const topValue = top?.value ?? "—";
                  const topDate = top?.date ?? "—";
                  const topOpp = top?.opponent ?? "—";
                  const topResult = top?.gameResult ?? "—";

                  return (
                    <React.Fragment key={def.key}>
                      <tr
                        onClick={() => toggleExpanded(def.key)}
                        className={`border-t cursor-pointer hover:bg-gray-100 ${isOpen ? "bg-gray-50" : "bg-white"}`}
                      >
                        <td className="border px-2 py-2 font-semibold">{def.label}</td>
                        <td className="border px-2 py-2">
                          <div className="flex items-center justify-center gap-2">
                            {top?.playerImg && topPlayer !== "—" && topPlayer !== "Unknown" ? (
                              <img
                                src={top.playerImg}
                                alt={topPlayer}
                                className="h-7 w-7 rounded-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = FALLBACK_HEADSHOT;
                                }}
                              />
                            ) : null}

                            {topPlayerId && topPlayer !== "—" && topPlayer !== "Unknown" ? (
                              <Link
                                to={`/athletics/boys/baseball/players/${topPlayerId}`}
                                className="hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {topPlayer}
                              </Link>
                            ) : (
                              <span>{topPlayer}</span>
                            )}
                          </div>
                        </td>
                        <td className="border px-2 py-2 font-semibold">{topValue}</td>
                        <td className="border px-2 py-2">{topDate}</td>
                        <td className="border px-2 py-2">{topOpp}</td>
                        <td className="border px-2 py-2">{topResult}</td>
                      </tr>

                      {isOpen && (
                        <tr className="border-t">
                          <td className="border px-2 py-2" colSpan={6}>
                            <div className="overflow-x-auto">
                              <table className="min-w-full table-auto text-xs border text-center">
                                <thead className="bg-gray-200 font-bold">
                                  <tr>
                                    <th className="border px-2 py-1">#</th>
                                    <th className="border px-2 py-1">Player</th>
                                    <th className="border px-2 py-1">{def.abbr}</th>
                                    <th className="border px-2 py-1">Date</th>
                                    <th className="border px-2 py-1">Opponent</th>
                                    <th className="border px-2 py-1">Game Result</th>
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
                                      <td className="border px-2 py-1 font-semibold">{idx + 1}</td>
                                      <td className="border px-2 py-1">
                                        <div className="flex items-center justify-center gap-2">
                                          {r.playerImg && r.playerName !== "—" && r.playerName !== "Unknown" ? (
                                            <img
                                              src={r.playerImg}
                                              alt={r.playerName}
                                              className="h-7 w-7 rounded-full object-cover"
                                              loading="lazy"
                                              onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = FALLBACK_HEADSHOT;
                                              }}
                                            />
                                          ) : null}

                                          {r.playerId && r.playerName !== "—" && r.playerName !== "Unknown" ? (
                                            <Link
                                              to={`/athletics/boys/baseball/players/${r.playerId}`}
                                              className="hover:underline"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              {r.playerName}
                                            </Link>
                                          ) : (
                                            <span>{r.playerName}</span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="border px-2 py-1 font-semibold">{r.value}</td>
                                      <td className="border px-2 py-1">{r.date}</td>
                                      <td className="border px-2 py-1">{r.opponent}</td>
                                      <td className="border px-2 py-1">{r.gameResult}</td>
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
