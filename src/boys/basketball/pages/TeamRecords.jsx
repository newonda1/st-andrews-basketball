// src/boys/basketball/pages/TeamRecords.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function formatDate(dateValue) {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "";
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
  if (valid.length === 0) return null;

  return valid.reduce((best, g) =>
    selector(g) > selector(best) ? g : best
  );
}

function getMinGame(games, selector) {
  const valid = games.filter((g) => {
    const v = selector(g);
    return v !== null && v !== undefined && !Number.isNaN(Number(v));
  });
  if (valid.length === 0) return null;

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
        console.error("Error loading games:", err);
        setError("Unable to load game data.");
      } finally {
        setLoading(false);
      }
    }

    loadGames();
  }, []);

  const completeGames = useMemo(() => {
    return games.filter(
      (g) => g && (g.IsComplete === "Yes" || g.IsComplete === true)
    );
  }, [games]);

  const records = useMemo(() => {
    if (!completeGames.length) {
      return {
        mostPoints: null,
        fewestAllowed: null,
        largestWin: null,
        highestCombined: null,
        largestRegionWin: null,
        largestHomeWin: null,
        largestAwayWin: null,
      };
    }

    const mostPoints = getMaxGame(completeGames, (g) => Number(g.TeamScore));

    const fewestAllowed = getMinGame(completeGames, (g) =>
      Number(g.OpponentScore)
    );

    // If ResultMargin is missing for some games, fall back to TeamScore - OpponentScore
    const largestWin = getMaxGame(completeGames, (g) => {
      const margin =
        g.ResultMargin !== undefined && g.ResultMargin !== null
          ? Number(g.ResultMargin)
          : Number(g.TeamScore) - Number(g.OpponentScore);
      return margin;
    });

    const highestCombined = getMaxGame(completeGames, (g) =>
      Number(g.TeamScore) + Number(g.OpponentScore)
    );

    const regionGames = completeGames.filter(
      (g) =>
        g.GameType &&
        String(g.GameType).toLowerCase() === "region" &&
        Number(g.TeamScore) > Number(g.OpponentScore)
    );
    const largestRegionWin = getMaxGame(regionGames, (g) => {
      const margin =
        g.ResultMargin !== undefined && g.ResultMargin !== null
          ? Number(g.ResultMargin)
          : Number(g.TeamScore) - Number(g.OpponentScore);
      return margin;
    });

    const homeGames = completeGames.filter(
      (g) =>
        g.LocationType &&
        String(g.LocationType).toLowerCase() === "home" &&
        Number(g.TeamScore) > Number(g.OpponentScore)
    );
    const largestHomeWin = getMaxGame(homeGames, (g) => {
      const margin =
        g.ResultMargin !== undefined && g.ResultMargin !== null
          ? Number(g.ResultMargin)
          : Number(g.TeamScore) - Number(g.OpponentScore);
      return margin;
    });

    const awayGames = completeGames.filter(
      (g) =>
        g.LocationType &&
        String(g.LocationType).toLowerCase() === "away" &&
        Number(g.TeamScore) > Number(g.OpponentScore)
    );
    const largestAwayWin = getMaxGame(awayGames, (g) => {
      const margin =
        g.ResultMargin !== undefined && g.ResultMargin !== null
          ? Number(g.ResultMargin)
          : Number(g.TeamScore) - Number(g.OpponentScore);
      return margin;
    });

    return {
      mostPoints,
      fewestAllowed,
      largestWin,
      highestCombined,
      largestRegionWin,
      largestHomeWin,
      largestAwayWin,
    };
  }, [completeGames]);

  if (loading) {
    return <div className="p-4">Loading team records…</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  const {
    mostPoints,
    fewestAllowed,
    largestWin,
    highestCombined,
    largestRegionWin,
    largestHomeWin,
    largestAwayWin,
  } = records;

  const renderRow = (label, game, getValue) => {
    const value = game ? getValue(game) : "—";
    const opponent = game?.Opponent || "—";
    const season = game?.Season ?? "—";
    const date = game?.Date ? formatDate(game.Date) : "";
    const gameId = game?.GameID;

    return (
      <tr className="hover:bg-gray-50" key={label}>
        <td className="px-3 py-2 border-b">{label}</td>
        <td className="px-3 py-2 border-b text-right">{value}</td>
        <td className="px-3 py-2 border-b">
          {opponent}
          {date ? ` (${date})` : ""}
        </td>
        <td className="px-3 py-2 border-b">{season}</td>
        <td className="px-3 py-2 border-b text-center">
          {gameId ? (
            <Link
              to={`/athletics/boys/basketball/games/${gameId}`}
              className="text-blue-600 hover:underline"
            >
              View game
            </Link>
          ) : (
            "—"
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Team Single-Game Records</h2>
        <p className="text-sm text-gray-600 max-w-2xl mx-auto">
          Auto-calculated from the official game log. Only completed games are
          included. Click a game to view its full box score and recap.
        </p>
      </div>

      {/* Core scoring & margin records */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Scoring &amp; Margin</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 bg-white text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border-b text-left">Record</th>
                <th className="px-3 py-2 border-b text-right">Value</th>
                <th className="px-3 py-2 border-b text-left">Opponent (Date)</th>
                <th className="px-3 py-2 border-b text-left">Season</th>
                <th className="px-3 py-2 border-b text-center">Game</th>
              </tr>
            </thead>
            <tbody>
              {renderRow("Most points scored", mostPoints, (g) => g.TeamScore)}
              {renderRow(
                "Fewest points allowed",
                fewestAllowed,
                (g) => g.OpponentScore
              )}
              {renderRow("Largest margin of victory", largestWin, (g) => {
                const margin =
                  g.ResultMargin !== undefined && g.ResultMargin !== null
                    ? g.ResultMargin
                    : Number(g.TeamScore) - Number(g.OpponentScore);
                return `${margin} pts`;
              })}
              {renderRow(
                "Highest combined score",
                highestCombined,
                (g) => Number(g.TeamScore) + Number(g.OpponentScore)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Context-specific wins */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Context Records</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 bg-white text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border-b text-left">Record</th>
                <th className="px-3 py-2 border-b text-right">Value</th>
                <th className="px-3 py-2 border-b text-left">Opponent (Date)</th>
                <th className="px-3 py-2 border-b text-left">Season</th>
                <th className="px-3 py-2 border-b text-center">Game</th>
              </tr>
            </thead>
            <tbody>
              {renderRow(
                "Largest region win",
                largestRegionWin,
                (g) => {
                  const margin =
                    g.ResultMargin !== undefined && g.ResultMargin !== null
                      ? g.ResultMargin
                      : Number(g.TeamScore) - Number(g.OpponentScore);
                  return `${margin} pts`;
                }
              )}
              {renderRow(
                "Largest home win",
                largestHomeWin,
                (g) => {
                  const margin =
                    g.ResultMargin !== undefined && g.ResultMargin !== null
                      ? g.ResultMargin
                      : Number(g.TeamScore) - Number(g.OpponentScore);
                  return `${margin} pts`;
                }
              )}
              {renderRow(
                "Largest away win",
                largestAwayWin,
                (g) => {
                  const margin =
                    g.ResultMargin !== undefined && g.ResultMargin !== null
                      ? g.ResultMargin
                      : Number(g.TeamScore) - Number(g.OpponentScore);
                  return `${margin} pts`;
                }
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center max-w-xl mx-auto">
        Records on this page are generated directly from{" "}
        <code className="bg-gray-100 px-1 py-0.5 rounded">
          games.json
        </code>{" "}
        using current data. As older seasons and historical scores are added,
        these records will update automatically.
      </p>
    </div>
  );
}

export default TeamRecords;
