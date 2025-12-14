import React, { useEffect, useMemo, useState } from "react";

/**
 * FullCareerStats.jsx (Boys Basketball)
 *
 * Updates included:
 * ✅ Fetches from new folder paths:
 *    - /data/boys/basketball/playergamestats.json
 *    - /data/boys/basketball/players.json
 *    - /data/boys/basketball/adjustments.json (optional; won't crash if missing)
 *
 * ✅ Replaces "0" with "—" ONLY when the total is 0 because the stat was never tracked
 *    (i.e., all entries were null/undefined across the dataset for that player/stat).
 *
 * ✅ Fades the "—" slightly for nicer visual appearance.
 *
 * ✅ Keeps sorting numeric and stable (we still sort using the numeric totals).
 *
 * Notes:
 * - If a stat is tracked (even if it's legitimately 0), it will show 0.
 * - If a stat was never tracked for that player (all rows were null/undefined), it will show "—".
 */

function displayStat(value, hasData) {
  if (!hasData) return "—";
  return value;
}

function absUrl(path) {
  return new URL(path, window.location.origin).toString();
}

async function fetchJson(label, path) {
  const url = absUrl(path);
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`${label} failed (HTTP ${res.status}) at ${path}`);
  }

  const text = await res.text();
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

async function fetchJsonOptional(label, path) {
  try {
    const url = absUrl(path);
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const text = await res.text();
    const trimmed = text.trim();
    if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) return [];
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function safeNum(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

function hasValue(x) {
  // IMPORTANT: 0 counts as "value exists" if explicitly present.
  // Only null/undefined means "not tracked".
  return x !== null && x !== undefined;
}

export default function FullCareerStats() {
  const [careerStats, setCareerStats] = useState([]);
  const [sortField, setSortField] = useState("Points"); // Default sort
  const [sortDirection, setSortDirection] = useState("desc"); // desc = highest first
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setError("");

        const statsPath = "/data/boys/basketball/playergamestats.json";
        const playersPath = "/data/boys/basketball/players.json";
        const adjustmentsPath = "/data/boys/basketball/adjustments.json";

        const [statsDataRaw, playersDataRaw, adjustmentsDataRaw] = await Promise.all([
          fetchJson("playergamestats.json", statsPath),
          fetchJson("players.json", playersPath),
          fetchJsonOptional("adjustments.json", adjustmentsPath),
        ]);

        const statsData = Array.isArray(statsDataRaw) ? statsDataRaw : [];
        const playersData = Array.isArray(playersDataRaw) ? playersDataRaw : [];
        const adjustmentsData = Array.isArray(adjustmentsDataRaw) ? adjustmentsDataRaw : [];

        const combinedStats = [...statsData, ...adjustmentsData];

        const playerTotals = {};

        for (const stat of combinedStats) {
          const playerId = Number(stat.PlayerID);
          if (!Number.isFinite(playerId)) continue;

          if (!playerTotals[playerId]) {
            playerTotals[playerId] = {
              PlayerID: playerId,

              Points: 0,
              Rebounds: 0,
              Assists: 0,
              Steals: 0,
              Blocks: 0,
              GamesPlayed: 0,

              ThreePM: 0,
              ThreePA: 0,
              TwoPM: 0,
              TwoPA: 0,
              FTM: 0,
              FTA: 0,

              // Track whether a stat was ever recorded (non-null/undefined)
              _has: {
                Points: false,
                Rebounds: false,
                Assists: false,
                Steals: false,
                Blocks: false,
                ThreePM: false,
                ThreePA: false,
                TwoPM: false,
                TwoPA: false,
                FTM: false,
                FTA: false,
              },
            };
          }

          // Only count the stat toward totals and mark as "tracked" if the field exists.
          // This prevents missing-history nulls from masquerading as "real zeros".
          if (hasValue(stat.Points)) {
            playerTotals[playerId].Points += safeNum(stat.Points);
            playerTotals[playerId]._has.Points = true;
          }
          if (hasValue(stat.Rebounds)) {
            playerTotals[playerId].Rebounds += safeNum(stat.Rebounds);
            playerTotals[playerId]._has.Rebounds = true;
          }
          if (hasValue(stat.Assists)) {
            playerTotals[playerId].Assists += safeNum(stat.Assists);
            playerTotals[playerId]._has.Assists = true;
          }
          if (hasValue(stat.Steals)) {
            playerTotals[playerId].Steals += safeNum(stat.Steals);
            playerTotals[playerId]._has.Steals = true;
          }
          if (hasValue(stat.Blocks)) {
            playerTotals[playerId].Blocks += safeNum(stat.Blocks);
            playerTotals[playerId]._has.Blocks = true;
          }

          if (hasValue(stat.ThreePM)) {
            playerTotals[playerId].ThreePM += safeNum(stat.ThreePM);
            playerTotals[playerId]._has.ThreePM = true;
          }
          if (hasValue(stat.ThreePA)) {
            playerTotals[playerId].ThreePA += safeNum(stat.ThreePA);
            playerTotals[playerId]._has.ThreePA = true;
          }

          if (hasValue(stat.TwoPM)) {
            playerTotals[playerId].TwoPM += safeNum(stat.TwoPM);
            playerTotals[playerId]._has.TwoPM = true;
          }
          if (hasValue(stat.TwoPA)) {
            playerTotals[playerId].TwoPA += safeNum(stat.TwoPA);
            playerTotals[playerId]._has.TwoPA = true;
          }

          if (hasValue(stat.FTM)) {
            playerTotals[playerId].FTM += safeNum(stat.FTM);
            playerTotals[playerId]._has.FTM = true;
          }
          if (hasValue(stat.FTA)) {
            playerTotals[playerId].FTA += safeNum(stat.FTA);
            playerTotals[playerId]._has.FTA = true;
          }

          // Keep your original behavior: each row counts as a game played.
          // If you ever want to dedupe by GameID, we can do that later.
          playerTotals[playerId].GamesPlayed += 1;
        }

        const fullCareerStats = Object.values(playerTotals).map((player) => {
          const playerInfo = playersData.find((p) => Number(p.PlayerID) === Number(player.PlayerID));

          const threePct =
            player._has.ThreePA && player.ThreePA > 0 ? (player.ThreePM / player.ThreePA) * 100 : 0;
          const twoPct =
            player._has.TwoPA && player.TwoPA > 0 ? (player.TwoPM / player.TwoPA) * 100 : 0;
          const ftPct = player._has.FTA && player.FTA > 0 ? (player.FTM / player.FTA) * 100 : 0;

          return {
            ...player,
            Name: playerInfo ? `${playerInfo.FirstName} ${playerInfo.LastName}` : "Unknown Player",
            GradYear: playerInfo ? playerInfo.GradYear : "Unknown",
            ThreePPercentage: threePct,
            TwoPPercentage: twoPct,
            FTPercentage: ftPct,
          };
        });

        setCareerStats(fullCareerStats);
      } catch (e) {
        setError(String(e?.message || e));
      }
    }

    fetchData();
  }, []);

  const sortedStats = useMemo(() => {
    return [...careerStats].sort((a, b) => {
      const av = a?.[sortField] ?? 0;
      const bv = b?.[sortField] ?? 0;

      // numeric sort
      if (sortDirection === "asc") return (Number(av) || 0) - (Number(bv) || 0);
      return (Number(bv) || 0) - (Number(av) || 0);
    });
  }, [careerStats, sortField, sortDirection]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // A small helper to render faded dashes
  const StatCell = ({ value, hasData }) => {
    const shown = displayStat(value, hasData);
    if (shown === "—") {
      return <span className="text-gray-400 font-medium">—</span>;
    }
    return <span>{shown}</span>;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Full Career Stats</h1>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200 whitespace-pre-wrap">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm md:text-base table-auto whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50">
              <th className="sticky left-0 z-20 bg-gray-50 px-2 py-1 text-left border-r">Player</th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("GradYear")}>
                Grad Year{sortField === "GradYear" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("Points")}>
                Points{sortField === "Points" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("Rebounds")}>
                Rebounds{sortField === "Rebounds" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("Assists")}>
                Assists{sortField === "Assists" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("Steals")}>
                Steals{sortField === "Steals" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("Blocks")}>
                Blocks{sortField === "Blocks" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("GamesPlayed")}>
                Games Played{sortField === "GamesPlayed" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("ThreePM")}>
                3PM{sortField === "ThreePM" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("ThreePA")}>
                3PA{sortField === "ThreePA" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("ThreePPercentage")}>
                3P%{sortField === "ThreePPercentage" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("TwoPM")}>
                2PM{sortField === "TwoPM" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("TwoPA")}>
                2PA{sortField === "TwoPA" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("TwoPPercentage")}>
                2P%{sortField === "TwoPPercentage" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("FTM")}>
                FTM{sortField === "FTM" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("FTA")}>
                FTA{sortField === "FTA" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>

              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort("FTPercentage")}>
                FT%{sortField === "FTPercentage" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedStats.map((player, index) => (
              <tr key={index} className="border-t odd:bg-white even:bg-gray-100">
                <td className="sticky left-0 z-10 px-2 py-1 bg-inherit border-r font-medium">
                  {player.Name}
                </td>

                <td className="px-2 py-1 text-center">{player.GradYear}</td>

                <td className="px-2 py-1 text-center">
                  <StatCell value={player.Points} hasData={player._has?.Points} />
                </td>

                <td className="px-2 py-1 text-center">
                  <StatCell value={player.Rebounds} hasData={player._has?.Rebounds} />
                </td>

                <td className="px-2 py-1 text-center">
                  <StatCell value={player.Assists} hasData={player._has?.Assists} />
                </td>

                <td className="px-2 py-1 text-center">
                  <StatCell value={player.Steals} hasData={player._has?.Steals} />
                </td>

                <td className="px-2 py-1 text-center">
                  <StatCell value={player.Blocks} hasData={player._has?.Blocks} />
                </td>

                <td className="px-2 py-1 text-center">{player.GamesPlayed}</td>

                <td className="px-2 py-1 text-center">
                  <StatCell value={player.ThreePM} hasData={player._has?.ThreePM} />
                </td>

                <td className="px-2 py-1 text-center">
                  <StatCell value={player.ThreePA} hasData={player._has?.ThreePA} />
                </td>

                <td className="px-2 py-1 text-center">
                  {player._has?.ThreePA && player.ThreePA > 0 ? player.ThreePPercentage.toFixed(1) + "%" : (
                    <span className="text-gray-400 font-medium">—</span>
                  )}
                </td>

                <td className="px-2 py-1 text-center">
                  <StatCell value={player.TwoPM} hasData={player._has?.TwoPM} />
                </td>

                <td className="px-2 py-1 text-center">
                  <StatCell value={player.TwoPA} hasData={player._has?.TwoPA} />
                </td>

                <td className="px-2 py-1 text-center">
                  {player._has?.TwoPA && player.TwoPA > 0 ? player.TwoPPercentage.toFixed(1) + "%" : (
                    <span className="text-gray-400 font-medium">—</span>
                  )}
                </td>

                <td className="px-2 py-1 text-center">
                  <StatCell value={player.FTM} hasData={player._has?.FTM} />
                </td>

                <td className="px-2 py-1 text-center">
                  <StatCell value={player.FTA} hasData={player._has?.FTA} />
                </td>

                <td className="px-2 py-1 text-center">
                  {player._has?.FTA && player.FTA > 0 ? player.FTPercentage.toFixed(1) + "%" : (
                    <span className="text-gray-400 font-medium">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
