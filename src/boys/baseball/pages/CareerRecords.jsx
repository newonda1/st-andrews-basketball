

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

function formatRecordValue(value) {
  if (!Number.isFinite(value)) return value;

  const roundedToTenth = Math.round(value * 10) / 10;

  if (Math.abs(roundedToTenth - Math.round(roundedToTenth)) < 1e-9) {
    return String(Math.round(roundedToTenth));
  }

  return roundedToTenth.toFixed(1);
}

function hasMinimumNoHitLength(ip) {
  return safeNum(ip) >= 5;
}

function isSoloPitchingEffortForGame(playerId, gameRows) {
  const pitchingRows = (gameRows || []).filter((row) => safeNum(row?.IP) > 0);
  if (pitchingRows.length !== 1) return false;
  return String(pitchingRows[0].PlayerID) === String(playerId);
}

const FALLBACK_HEADSHOT = "/images/common/logo.png";

export default function CareerRecords() {
  const [rowsByRecord, setRowsByRecord] = useState({});
  const [error, setError] = useState("");
  const [expandedKey, setExpandedKey] = useState(null);

  const recordDefs = useMemo(
    () => [
      { key: "GamesPlayed", label: "Games Played", abbr: "GP", valueFn: (s) => safeNum(s?.GamesPlayed) },
      { key: "NoHitters", label: "No-Hitters", abbr: "NH", valueFn: (s) => safeNum(s?.NoHitters) },
      { key: "PerfectGames", label: "Perfect Games", abbr: "PG", valueFn: (s) => safeNum(s?.PerfectGames) },

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
      { key: "SB", label: "Stolen Bases", abbr: "SB", valueFn: (s) => safeNum(s?.SB) },
      { key: "CS", label: "Caught Stealing", abbr: "CS", valueFn: (s) => safeNum(s?.CS) },
      { key: "TB", label: "Total Bases", abbr: "TB", valueFn: (s) => safeNum(s?.TB) },

      { key: "IP", label: "Innings Pitched", abbr: "IP", valueFn: (s) => safeNum(s?.IP) },
      { key: "BF", label: "Batters Faced", abbr: "BF", valueFn: (s) => safeNum(s?.BF) },
      { key: "Pitches", label: "Pitches", abbr: "P", valueFn: (s) => safeNum(s?.Pitches) },
      { key: "W", label: "Wins", abbr: "W", valueFn: (s) => safeNum(s?.W) },
      { key: "L", label: "Losses", abbr: "L", valueFn: (s) => safeNum(s?.L) },
      { key: "SV", label: "Saves", abbr: "SV", valueFn: (s) => safeNum(s?.SV) },
      { key: "SVO", label: "Save Opportunities", abbr: "SVO", valueFn: (s) => safeNum(s?.SVO) },
      { key: "BS", label: "Blown Saves", abbr: "BS", valueFn: (s) => safeNum(s?.BS) },
      { key: "H_Allowed", label: "Hits Allowed", abbr: "H", valueFn: (s) => safeNum(s?.H_Allowed) },
      { key: "R_Allowed", label: "Runs Allowed", abbr: "R", valueFn: (s) => safeNum(s?.R_Allowed) },
      { key: "ER", label: "Earned Runs", abbr: "ER", valueFn: (s) => safeNum(s?.ER) },
      { key: "BB_Allowed", label: "Walks Allowed", abbr: "BB", valueFn: (s) => safeNum(s?.BB_Allowed) },
      { key: "SO_Pitching", label: "Strikeouts (Pitching)", abbr: "K", valueFn: (s) => safeNum(s?.SO_Pitching) },
      { key: "HBP_Pitching", label: "Hit Batters", abbr: "HBP", valueFn: (s) => safeNum(s?.HBP_Pitching) },
      { key: "BK", label: "Balks", abbr: "BK", valueFn: (s) => safeNum(s?.BK) },
      { key: "PIK_Allowed", label: "Pickoffs Allowed", abbr: "PIK", valueFn: (s) => safeNum(s?.PIK_Allowed) },
      { key: "CS_Pitching", label: "Runners Caught Stealing", abbr: "CS", valueFn: (s) => safeNum(s?.CS_Pitching) },
      { key: "SB_Allowed", label: "Stolen Bases Allowed", abbr: "SB", valueFn: (s) => safeNum(s?.SB_Allowed) },
      { key: "WP", label: "Wild Pitches", abbr: "WP", valueFn: (s) => safeNum(s?.WP) },

      { key: "A", label: "Assists", abbr: "A", valueFn: (s) => safeNum(s?.A) },
      { key: "PO", label: "Putouts", abbr: "PO", valueFn: (s) => safeNum(s?.PO) },
      { key: "E", label: "Errors", abbr: "E", valueFn: (s) => safeNum(s?.E) },
      { key: "DP", label: "Double Plays", abbr: "DP", valueFn: (s) => safeNum(s?.DP) },
      { key: "TP", label: "Triple Plays", abbr: "TP", valueFn: (s) => safeNum(s?.TP) },
      { key: "PB", label: "Passed Balls", abbr: "PB", valueFn: (s) => safeNum(s?.PB) },
      { key: "PIK_Fielding", label: "Pickoffs (Fielding)", abbr: "PIK", valueFn: (s) => safeNum(s?.PIK_Fielding) },
      { key: "CI", label: "Catcher's Interference", abbr: "CI", valueFn: (s) => safeNum(s?.CI) },

      { key: "P_Innings", label: "Pitcher Innings", abbr: "P INN", valueFn: (s) => safeNum(s?.P_Innings) },
      { key: "C_Innings", label: "Catcher Innings", abbr: "C INN", valueFn: (s) => safeNum(s?.C_Innings) },
      { key: "1B_Innings", label: "1B Innings", abbr: "1B INN", valueFn: (s) => safeNum(s?.["1B_Innings"]) },
      { key: "2B_Innings", label: "2B Innings", abbr: "2B INN", valueFn: (s) => safeNum(s?.["2B_Innings"]) },
      { key: "3B_Innings", label: "3B Innings", abbr: "3B INN", valueFn: (s) => safeNum(s?.["3B_Innings"]) },
      { key: "SS_Innings", label: "SS Innings", abbr: "SS INN", valueFn: (s) => safeNum(s?.SS_Innings) },
      { key: "LF_Innings", label: "LF Innings", abbr: "LF INN", valueFn: (s) => safeNum(s?.LF_Innings) },
      { key: "CF_Innings", label: "CF Innings", abbr: "CF INN", valueFn: (s) => safeNum(s?.CF_Innings) },
      { key: "RF_Innings", label: "RF Innings", abbr: "RF INN", valueFn: (s) => safeNum(s?.RF_Innings) },
      { key: "SF_Innings", label: "Short Field Innings", abbr: "SF INN", valueFn: (s) => safeNum(s?.SF_Innings) },
    ],
    []
  );

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

        const statsByGame = new Map();
        for (const row of playerStatsData) {
          if (!row || row.GameID == null) continue;
          const key = String(row.GameID);
          if (!statsByGame.has(key)) statsByGame.set(key, []);
          statsByGame.get(key).push(row);
        }

        const careerTotalsMap = new Map();

        for (const s of playerStatsData) {
          if (!s || s.PlayerID == null || s.GameID == null) continue;

          const playerKey = String(s.PlayerID);

          if (!careerTotalsMap.has(playerKey)) {
            careerTotalsMap.set(playerKey, {
              PlayerID: playerKey,
              GamesPlayed: 0,
              NoHitters: 0,
              PerfectGames: 0,
            });
          }

          const totals = careerTotalsMap.get(playerKey);
          totals.GamesPlayed += 1;

          for (const def of recordDefs) {
            if (def.key === "GamesPlayed" || def.key === "NoHitters" || def.key === "PerfectGames") continue;
            totals[def.key] = safeNum(totals[def.key]) + def.valueFn(s);
          }

          const game = gameMap.get(String(s.GameID));
          const gameRows = statsByGame.get(String(s.GameID)) || [];
          const gameIsSoloEffort = isSoloPitchingEffortForGame(s.PlayerID, gameRows);
          const gameHasMinimumLength = hasMinimumNoHitLength(s?.IP);
          const sasErrors = safeNum(game?.LineScore?.StAndrewsTotals?.E);

          if (gameIsSoloEffort && gameHasMinimumLength && safeNum(s?.H_Allowed) === 0) {
            totals.NoHitters = safeNum(totals.NoHitters) + 1;
          }

          if (
            gameIsSoloEffort &&
            gameHasMinimumLength &&
            safeNum(s?.H_Allowed) === 0 &&
            safeNum(s?.BB_Allowed) === 0 &&
            safeNum(s?.HBP_Pitching) === 0 &&
            sasErrors === 0
          ) {
            totals.PerfectGames = safeNum(totals.PerfectGames) + 1;
          }
        }

        const careerTotals = Array.from(careerTotalsMap.values());
        const next = {};

        for (const def of recordDefs) {
          const list = careerTotals
            .map((careerRow) => {
              const player = playerMap.get(String(careerRow.PlayerID));
              return {
                value: def.valueFn(careerRow),
                playerId: String(careerRow.PlayerID),
                playerName: player ? `${player.FirstName} ${player.LastName}` : "Unknown",
                playerImg: player?.PlayerID ? `/images/boys/baseball/players/${player.PlayerID}.jpg` : null,
              };
            })
            .filter((r) => Number.isFinite(r.value) && r.value > 0)
            .sort((a, b) => {
              if (b.value !== a.value) return b.value - a.value;
              return a.playerName.localeCompare(b.playerName);
            })
            .slice(0, 20);

          while (list.length < 20) {
            list.push({
              value: "—",
              playerId: null,
              playerName: "—",
              playerImg: null,
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
    <div className="space-y-6 px-4">
      <h1 className="text-2xl font-bold text-center">Career Records</h1>
      <p className="-mt-3 text-center text-sm italic text-gray-600">
        Select any record to see the top 20 historical results for that record
      </p>
      <p className="-mt-4 text-center text-xs italic text-gray-500">
        No-hitters and perfect games require a solo pitching effort of at least 5 innings. Perfect games also require 0 hits, 0 walks, 0 hit batters, and 0 St. Andrew&apos;s errors.
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
            </tr>
          </thead>

          <tbody>
            {recordDefs.map((def) => {
              const top = (rowsByRecord[def.key] || [])[0];
              const isOpen = expandedKey === def.key;

              const topPlayer = top?.playerName ?? "—";
              const topPlayerId = top?.playerId ?? null;
              const topValue = top?.value ?? "—";

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
                    <td className="border px-2 py-2 font-semibold">
                      {topValue === "—" ? topValue : formatRecordValue(topValue)}
                    </td>
                  </tr>

                  {isOpen && (
                    <tr className="border-t">
                      <td className="border px-2 py-2" colSpan={3}>
                        <div className="overflow-x-auto">
                          <table className="min-w-full table-auto text-xs border text-center">
                            <thead className="bg-gray-200 font-bold">
                              <tr>
                                <th className="border px-2 py-1">#</th>
                                <th className="border px-2 py-1">Player</th>
                                <th className="border px-2 py-1">{def.abbr}</th>
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
                                  <td className="border px-2 py-1 font-semibold">
                                    {r.value === "—" ? r.value : formatRecordValue(r.value)}
                                  </td>
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
