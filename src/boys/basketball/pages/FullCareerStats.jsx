import React, { useEffect, useMemo, useState } from "react";

/**
 * SingleGameRecords.jsx (Boys Basketball)
 *
 * Updates:
 * ✅ Fetches from new folder structure:
 *    - /data/boys/basketball/playergamestats.json
 *    - /data/boys/basketball/players.json
 *    - /data/boys/basketball/games.json
 *
 * ✅ Restores a cleaner, consistent look (cards + tables) similar to the older pages
 * ✅ Handles BOTH possible GameID styles:
 *    - date-style numeric (YYYYMMDD)  e.g. 20251212
 *    - older timestamp-ms            e.g. 17655840000000
 *
 * ✅ Handles BOTH possible game date formats:
 *    - number (ms)
 *    - string (YYYY-MM-DD)
 *    - string date-like
 */

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

function tryParseGameDate(game) {
  const d = game?.Date;

  // 1) ms timestamp
  if (typeof d === "number" && Number.isFinite(d)) {
    const dt = new Date(d);
    if (!Number.isNaN(dt.getTime())) return dt;
  }

  // 2) date string
  if (typeof d === "string") {
    const dt = new Date(d);
    if (!Number.isNaN(dt.getTime())) return dt;
  }

  // 3) If no Date, try from GameID if it looks like YYYYMMDD
  const gid = String(game?.GameID ?? "");
  if (/^\d{8}$/.test(gid)) {
    const y = Number(gid.slice(0, 4));
    const m = Number(gid.slice(4, 6));
    const day = Number(gid.slice(6, 8));
    const dt = new Date(y, m - 1, day);
    if (!Number.isNaN(dt.getTime())) return dt;
  }

  return null;
}

function formatDateFromGame(game) {
  const dt = tryParseGameDate(game);
  if (!dt) return "Unknown Date";
  return dt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function safeNum(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

export default function SingleGameRecords() {
  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [topRecordsByStat, setTopRecordsByStat] = useState({});
  const [error, setError] = useState("");

  const statCategories = useMemo(
    () => ["Points", "Rebounds", "Assists", "Steals", "TwoPM", "ThreePM", "FTM", "FTA"],
    []
  );

  useEffect(() => {
    const fetchData = async () => {
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

        setPlayerStats(playerStatsData);
        setPlayers(playersData);
        setGames(gamesData);

        // Quick lookup maps
        const playerMap = new Map(playersData.map((p) => [String(p.PlayerID), p]));
        const gameMap = new Map(gamesData.map((g) => [String(g.GameID), g]));

        const result = {};

        statCategories.forEach((stat) => {
          const top = [...playerStatsData]
            .filter((entry) => entry && entry[stat] !== undefined && safeNum(entry[stat]) > 0)
            .sort((a, b) => safeNum(b[stat]) - safeNum(a[stat]))
            .slice(0, 10);

          const detailed = top.map((entry) => {
            const player = playerMap.get(String(entry.PlayerID));
            const game = gameMap.get(String(entry.GameID));

            return {
              value: safeNum(entry[stat]),
              playerName: player ? `${player.FirstName} ${player.LastName}` : "Unknown Player",
              opponent: game?.Opponent ?? "Unknown Opponent",
              date: game ? formatDateFromGame(game) : "Unknown Date",
            };
          });

          result[stat] = detailed;
        });

        setTopRecordsByStat(result);
      } catch (err) {
        setError(String(err?.message || err));
        // Still log for devtools
        console.error("Error loading data:", err);
      }
    };

    fetchData();
  }, [statCategories]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Single Game Records</h1>

      {error && (
        <div className="mb-5 p-3 rounded bg-red-50 text-red-700 border border-red-200 whitespace-pre-wrap">
          {error}
        </div>
      )}

      <div className="space-y-8">
        {statCategories.map((stat) => (
          <div key={stat} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold">{stat}</h2>
              <span className="text-xs text-gray-500">Top 10</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm md:text-base table-auto whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Value</th>
                    <th className="p-2 text-left">Player</th>
                    <th className="p-2 text-left">Opponent</th>
                    <th className="p-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(topRecordsByStat[stat] || []).map((record, index) => (
                    <tr key={index} className="border-t odd:bg-white even:bg-gray-50">
                      <td className="p-2 font-semibold">{record.value}</td>
                      <td className="p-2">{record.playerName}</td>
                      <td className="p-2">{record.opponent}</td>
                      <td className="p-2">{record.date}</td>
                    </tr>
                  ))}

                  {(topRecordsByStat[stat] || []).length === 0 && (
                    <tr className="border-t">
                      <td className="p-3 text-gray-500" colSpan={4}>
                        No records found (no {stat} values &gt; 0).
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
