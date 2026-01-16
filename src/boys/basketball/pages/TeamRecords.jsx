// src/boys/basketball/pages/TeamRecords.jsx
import React, { useEffect, useMemo, useState } from "react";

function formatDate(dateValue) {
  if (!dateValue) return "—";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getMaxGame(games, selector) {
  const valid = games.filter((g) => {
    const v = selector(g);
    return v !== null && v !== undefined && !Number.isNaN(Number(v));
  });
  if (!valid.length) return null;

  return valid.reduce((best, g) =>
    selector(g) > selector(best) ? g : best
  );
}

function getMinGame(games, selector) {
  const valid = games.filter((g) => {
    const v = selector(g);
    return v !== null && v !== undefined && !Number.isNaN(Number(v));
  });
  if (!valid.length) return null;

  return valid.reduce((best, g) =>
    selector(g) < selector(best) ? g : best
  );
}

function TeamRecords() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load games.json
  useEffect(() => {
    async function loadGames() {
      try {
        const res = await fetch("/data/boys/basketball/games.json");
        if (!res.ok) throw new Error("Failed to load games.json");
        const data = await res.json();
        setGames(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Unable to load game data.");
      } finally {
        setLoading(false);
      }
    }
    loadGames();
  }, []);

  const completeGames = useMemo(
    () =>
      games.filter(
        (g) => g && (g.IsComplete === "Yes" || g.IsComplete === true)
      ),
    [games]
  );

  /* ----------------------------------
     INDIVIDUAL GAME RECORDS
  ---------------------------------- */
  const individualRecords = useMemo(() => {
    if (!completeGames.length) return {};

    const mostPoints = getMaxGame(completeGames, (g) => g.TeamScore);
    const leastAllowed = getMinGame(completeGames, (g) => g.OpponentScore);

    const largestMargin = getMaxGame(completeGames, (g) =>
      g.ResultMargin ?? g.TeamScore - g.OpponentScore
    );

    const mostCombined = getMaxGame(
      completeGames,
      (g) => g.TeamScore + g.OpponentScore
    );

    return {
      mostPoints,
      leastAllowed,
      largestMargin,
      mostCombined,
    };
  }, [completeGames]);

  /* ----------------------------------
     SEASON AGGREGATES
  ---------------------------------- */
  const seasonStats = useMemo(() => {
    const map = {};

    completeGames.forEach((g) => {
      const season = g.Season;
      if (!season) return;

      if (!map[season]) {
        map[season] = {
          season,
          games: 0,
          wins: 0,
          teamPoints: 0,
          oppPoints: 0,
        };
      }

      map[season].games += 1;
      if (g.Result === "W") map[season].wins += 1;
      map[season].teamPoints += Number(g.TeamScore) || 0;
      map[season].oppPoints += Number(g.OpponentScore) || 0;
    });

    return Object.values(map).map((s) => ({
      ...s,
      winPct: s.games ? s.wins / s.games : 0,
      avgDiff: s.games
        ? (s.teamPoints - s.oppPoints) / s.games
        : 0,
    }));
  }, [completeGames]);

  const seasonRecords = useMemo(() => {
    if (!seasonStats.length) return {};

    const mostWins = seasonStats.reduce((a, b) =>
      b.wins > a.wins ? b : a
    );

    const highestWinPct = seasonStats.reduce((a, b) =>
      b.winPct > a.winPct ? b : a
    );

    const mostPoints = seasonStats.reduce((a, b) =>
      b.teamPoints > a.teamPoints ? b : a
    );

    const leastPointsAllowed = seasonStats.reduce((a, b) =>
      b.oppPoints < a.oppPoints ? b : a
    );

    const bestAvgDiff = seasonStats.reduce((a, b) =>
      b.avgDiff > a.avgDiff ? b : a
    );

    return {
      mostWins,
      highestWinPct,
      mostPoints,
      leastPointsAllowed,
      bestAvgDiff,
    };
  }, [seasonStats]);

  if (loading) return <div className="p-4">Loading team records…</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="space-y-10">
      {/* ----------------------------------
          INDIVIDUAL GAME RECORDS
      ---------------------------------- */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-center">
          Individual Game Records
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 bg-white text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border-b text-left">Record</th>
                <th className="px-3 py-2 border-b text-right">Value</th>
                <th className="px-3 py-2 border-b text-left">Opponent</th>
                <th className="px-3 py-2 border-b text-left">Date</th>
                <th className="px-3 py-2 border-b text-center">Game Score</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2 border-b">Most points scored</td>
                <td className="px-3 py-2 border-b text-right">
                  {individualRecords.mostPoints?.TeamScore ?? "—"}
                </td>
                <td className="px-3 py-2 border-b">
                  {individualRecords.mostPoints?.Opponent ?? "—"}
                </td>
                <td className="px-3 py-2 border-b">
                  {formatDate(individualRecords.mostPoints?.Date)}
                </td>
                <td className="px-3 py-2 border-b text-center">
                  {individualRecords.mostPoints
                    ? `${individualRecords.mostPoints.TeamScore}-${individualRecords.mostPoints.OpponentScore}`
                    : "—"}
                </td>
              </tr>

              <tr>
                <td className="px-3 py-2 border-b">Least points allowed</td>
                <td className="px-3 py-2 border-b text-right">
                  {individualRecords.leastAllowed?.OpponentScore ?? "—"}
                </td>
                <td className="px-3 py-2 border-b">
                  {individualRecords.leastAllowed?.Opponent ?? "—"}
                </td>
                <td className="px-3 py-2 border-b">
                  {formatDate(individualRecords.leastAllowed?.Date)}
                </td>
                <td className="px-3 py-2 border-b text-center">
                  {individualRecords.leastAllowed
                    ? `${individualRecords.leastAllowed.TeamScore}-${individualRecords.leastAllowed.OpponentScore}`
                    : "—"}
                </td>
              </tr>

              <tr>
                <td className="px-3 py-2 border-b">
                  Largest margin of victory
                </td>
                <td className="px-3 py-2 border-b text-right">
                  {individualRecords.largestMargin
                    ? `${individualRecords.largestMargin.ResultMargin ?? individualRecords.largestMargin.TeamScore - individualRecords.largestMargin.OpponentScore}`
                    : "—"}
                </td>
                <td className="px-3 py-2 border-b">
                  {individualRecords.largestMargin?.Opponent ?? "—"}
                </td>
                <td className="px-3 py-2 border-b">
                  {formatDate(individualRecords.largestMargin?.Date)}
                </td>
                <td className="px-3 py-2 border-b text-center">
                  {individualRecords.largestMargin
                    ? `${individualRecords.largestMargin.TeamScore}-${individualRecords.largestMargin.OpponentScore}`
                    : "—"}
                </td>
              </tr>

              <tr>
                <td className="px-3 py-2 border-b">Most combined points</td>
                <td className="px-3 py-2 border-b text-right">
                  {individualRecords.mostCombined
                    ? individualRecords.mostCombined.TeamScore +
                      individualRecords.mostCombined.OpponentScore
                    : "—"}
                </td>
                <td className="px-3 py-2 border-b">
                  {individualRecords.mostCombined?.Opponent ?? "—"}
                </td>
                <td className="px-3 py-2 border-b">
                  {formatDate(individualRecords.mostCombined?.Date)}
                </td>
                <td className="px-3 py-2 border-b text-center">
                  {individualRecords.mostCombined
                    ? `${individualRecords.mostCombined.TeamScore}-${individualRecords.mostCombined.OpponentScore}`
                    : "—"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------------------------
          SEASON RECORDS
      ---------------------------------- */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-center">Season Records</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 bg-white text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border-b text-left">Record</th>
                <th className="px-3 py-2 border-b text-right">Value</th>
                <th className="px-3 py-2 border-b text-left">Season</th>
                <th className="px-3 py-2 border-b text-left">Coach</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2 border-b">Most wins</td>
                <td className="px-3 py-2 border-b text-right">
                  {seasonRecords.mostWins?.wins ?? "—"}
                </td>
                <td className="px-3 py-2 border-b">
                  {seasonRecords.mostWins?.season ?? "—"}
                </td>
                <td className="px-3 py-2 border-b">—</td>
              </tr>

              <tr>
                <td className="px-3 py-2 border-b">Highest winning %</td>
                <td className="px-3 py-2 border-b text-right">
                  {seasonRecords.highestWinPct
                    ? seasonRecords.highestWinPct.winPct.toFixed(3)
                    : "—"}
                </td>
                <td className="px-3 py-2 border-b">
                  {seasonRecords.highestWinPct?.season ?? "—"}
                </td>
                <td className="px-3 py-2 border-b">—</td>
              </tr>

              <tr>
                <td className="px-3 py-2 border-b">Most points scored</td>
                <td className="px-3 py-2 border-b text-right">
                  {seasonRecords.mostPoints?.teamPoints ?? "—"}
                </td>
                <td className="px-3 py-2 border-b">
                  {seasonRecords.mostPoints?.season ?? "—"}
                </td>
                <td className="px-3 py-2 border-b">—</td>
              </tr>

              <tr>
                <td className="px-3 py-2 border-b">Least points allowed</td>
                <td className="px-3 py-2 border-b text-right">
                  {seasonRecords.leastPointsAllowed?.oppPoints ?? "—"}
                </td>
                <td className="px-3 py-2 border-b">
                  {seasonRecords.leastPointsAllowed?.season ?? "—"}
                </td>
                <td className="px-3 py-2 border-b">—</td>
              </tr>

              <tr>
                <td className="px-3 py-2 border-b">
                  Highest average point differential
                </td>
                <td className="px-3 py-2 border-b text-right">
                  {seasonRecords.bestAvgDiff
                    ? seasonRecords.bestAvgDiff.avgDiff.toFixed(2)
                    : "—"}
                </td>
                <td className="px-3 py-2 border-b">
                  {seasonRecords.bestAvgDiff?.season ?? "—"}
                </td>
                <td className="px-3 py-2 border-b">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TeamRecords;
