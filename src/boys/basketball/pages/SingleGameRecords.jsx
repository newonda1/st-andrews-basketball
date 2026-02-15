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

function getGameScore(game) {
  if (!game) return "—";

  const A = Number(game.TeamScore);
  const B = Number(game.OpponentScore);

  if (Number.isFinite(A) && Number.isFinite(B)) return `${A}-${B}`;

  // If one/both are null/unknown, avoid showing "NaN-NaN"
  return "—";
}

export default function SingleGameRecords() {
  const [rowsByRecord, setRowsByRecord] = useState({});
  const [error, setError] = useState("");
  const [expandedKey, setExpandedKey] = useState(null);

  const recordDefs = useMemo(
    () => [
      { key: "Points", label: "Points", abbr: "PTS", valueFn: (s) => safeNum(s?.Points) },
      { key: "Rebounds", label: "Rebounds", abbr: "REB", valueFn: (s) => safeNum(s?.Rebounds) },
      { key: "Assists", label: "Assists", abbr: "AST", valueFn: (s) => safeNum(s?.Assists) },
      { key: "Steals", label: "Steals", abbr: "STL", valueFn: (s) => safeNum(s?.Steals) },
      { key: "Blocks", label: "Blocks", abbr: "BLK", valueFn: (s) => safeNum(s?.Blocks) },

      // FG = 2P + 3P
      {
        key: "FGM",
        label: "Field Goals Made",
        abbr: "FGM",
        valueFn: (s) => safeNum(s?.TwoPM) + safeNum(s?.ThreePM),
      },
      {
        key: "FGA",
        label: "Field Goal Attempts",
        abbr: "FGA",
        valueFn: (s) => safeNum(s?.TwoPA) + safeNum(s?.ThreePA),
      },

      { key: "TwoPM", label: "2-Pt Field Goals Made", abbr: "2PM", valueFn: (s) => safeNum(s?.TwoPM) },
      { key: "TwoPA", label: "2-Pt Field Goal Attempts", abbr: "2PA", valueFn: (s) => safeNum(s?.TwoPA) },
      { key: "ThreePM", label: "3-Pt Field Goals Made", abbr: "3PM", valueFn: (s) => safeNum(s?.ThreePM) },
      { key: "ThreePA", label: "3-Pt Field Goal Attempts", abbr: "3PA", valueFn: (s) => safeNum(s?.ThreePA) },
      { key: "FTM", label: "Free Throws Made", abbr: "FTM", valueFn: (s) => safeNum(s?.FTM) },
      { key: "FTA", label: "Free Throw Attempts", abbr: "FTA", valueFn: (s) => safeNum(s?.FTA) },
      { key: "Turnovers", label: "Turnovers", abbr: "TO", valueFn: (s) => safeNum(s?.Turnovers) },
    ],
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

        const next = {};

        for (const def of recordDefs) {
          const list = playerStatsData
            .filter((s) => s && s.PlayerID != null && s.GameID != null)
            .map((s) => {
              const player = playerMap.get(String(s.PlayerID));
              const game = gameMap.get(String(s.GameID));
              return {
                value: def.valueFn(s),
                playerName: player ? `${player.FirstName} ${player.LastName}` : "Unknown",
                date: game ? formatDateFromGame(game) : "Unknown Date",
                opponent: game?.Opponent ?? "Unknown Opponent",
                score: getGameScore(game),
              };
            })
            // Keep only rows with a meaningful value for the category
            .filter((r) => Number.isFinite(r.value) && r.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 20);

          // Pad out to 20 so it’s obvious the dropdown is working even if data is sparse
          while (list.length < 20) {
            list.push({
              value: "—",
              playerName: "—",
              date: "—",
              opponent: "—",
              score: "—",
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
      <h1 className="text-2xl font-bold text-center">Single Game Records</h1>

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
              <th className="border px-2 py-1">Game Score</th>
            </tr>
          </thead>

          <tbody>
            {recordDefs.map((def) => {
              const top = (rowsByRecord[def.key] || [])[0];
              const isOpen = expandedKey === def.key;

              const topPlayer = top?.playerName ?? "—";
              const topValue = top?.value ?? "—";
              const topDate = top?.date ?? "—";
              const topOpp = top?.opponent ?? "—";
              const topScore = top?.score ?? "—";

              return (
                <React.Fragment key={def.key}>
                  <tr
                    onClick={() => toggleExpanded(def.key)}
                    className={`border-t cursor-pointer hover:bg-gray-100 ${isOpen ? "bg-gray-50" : "bg-white"}`}
                  >
                    <td className="border px-2 py-2 font-semibold">{def.label}</td>
                    <td className="border px-2 py-2">{topPlayer}</td>
                    <td className="border px-2 py-2 font-semibold">{topValue}</td>
                    <td className="border px-2 py-2">{topDate}</td>
                    <td className="border px-2 py-2">{topOpp}</td>
                    <td className="border px-2 py-2">{topScore}</td>
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
                                <th className="border px-2 py-1">Score</th>
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
                                  <td className="border px-2 py-1">{r.playerName}</td>
                                  <td className="border px-2 py-1 font-semibold">{r.value}</td>
                                  <td className="border px-2 py-1">{r.date}</td>
                                  <td className="border px-2 py-1">{r.opponent}</td>
                                  <td className="border px-2 py-1">{r.score}</td>
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
