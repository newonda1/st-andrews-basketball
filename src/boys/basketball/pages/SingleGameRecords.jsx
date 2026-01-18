import React, { useEffect, useMemo, useState } from "react";

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
  if (/^\d{8}$/.test(gid)) {
    const y = Number(gid.slice(0, 4));
    const m = Number(gid.slice(4, 6));
    const d = Number(gid.slice(6, 8));

    // Use UTC to avoid timezone shifts
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

export default function SingleGameRecords() {
  const [topRecordsByStat, setTopRecordsByStat] = useState({});
  const [error, setError] = useState("");

  const statCategories = useMemo(
    () => ["Points", "Rebounds", "Assists", "Steals", "TwoPM", "ThreePM", "FTM", "FTA"],
    []
  );

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

        const result = {};

        statCategories.forEach((stat) => {
          const top10 = playerStatsData
            .filter((entry) => entry && entry[stat] !== undefined && safeNum(entry[stat]) > 0)
            .sort((a, b) => safeNum(b[stat]) - safeNum(a[stat]))
            .slice(0, 10)
            .map((entry) => {
              const player = playerMap.get(String(entry.PlayerID));
              const game = gameMap.get(String(entry.GameID));
              return {
                value: safeNum(entry[stat]),
                playerName: player ? `${player.FirstName} ${player.LastName}` : "Unknown Player",
                opponent: game?.Opponent ?? "Unknown Opponent",
                date: game ? formatDateFromGame(game) : "Unknown Date",
              };
            });

          // Pad to 10 rows so it’s obvious the UI is working even if data is missing
          while (top10.length < 10) {
            top10.push({
              value: "—",
              playerName: "—",
              opponent: "—",
              date: "—",
              _placeholder: true,
            });
          }

          result[stat] = top10;
        });

        setTopRecordsByStat(result);
      } catch (e) {
        setError(String(e?.message || e));
        console.error(e);
      }
    };

    run();
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
          <div
            key={stat}
            className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
          >
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold">{stat}</h2>
              <span className="text-xs text-gray-500">Top 10</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm md:text-base table-auto whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left w-12">#</th>
                    <th className="p-2 text-left">Value</th>
                    <th className="p-2 text-left">Player</th>
                    <th className="p-2 text-left">Opponent</th>
                    <th className="p-2 text-left">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {(topRecordsByStat[stat] || []).map((record, index) => (
                    <tr
                      key={index}
                      className={`border-t ${
                        record._placeholder ? "bg-white text-gray-400" : index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="p-2 font-semibold">{index + 1}</td>
                      <td className="p-2 font-semibold">{record.value}</td>
                      <td className="p-2">{record.playerName}</td>
                      <td className="p-2">{record.opponent}</td>
                      <td className="p-2">{record.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-2 text-xs text-gray-500 border-t bg-white">
              Note: If you see “—” rows, it means fewer than 10 entries exist with {stat} &gt; 0 in your data.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
