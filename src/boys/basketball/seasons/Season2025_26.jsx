import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Season2025_26() {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [seasonTotals, setSeasonTotals] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "jersey",
    direction: "asc",
  });
  const [showPerGame, setShowPerGame] = useState(false);

  const SEASON_ID = 2025; // 2025–26 season

  // 1. Fetch data
  useEffect(() => {
    async function fetchData() {
      const gamesRes = await fetch("/data/boys/basketball/games.json");
      const statsRes = await fetch("/data/boys/basketball/playergamestats.json");
      const playersRes = await fetch("/data/boys/basketball/players.json");

      const gamesData = await gamesRes.json();
      const statsData = await statsRes.json();
      const playersData = await playersRes.json();

      const seasonGames = gamesData.filter((g) => g.Season === SEASON_ID);

      // Only stats for this season (based on GameID)
      const seasonGameIds = new Set(seasonGames.map((g) => g.GameID));
      const seasonStats = statsData.filter((s) => seasonGameIds.has(s.GameID));

      setGames(seasonGames);
      setPlayerStats(seasonStats);
      setPlayers(playersData);
    }

    fetchData();
  }, []);

  // 2. Build season totals
  useEffect(() => {
    const totalsMap = {};

    playerStats.forEach((stat) => {
      const pid = stat.PlayerID;

      if (!totalsMap[pid]) {
        totalsMap[pid] = {
          PlayerID: pid,
          GamesPlayed: 0,
          Points: 0,
          Rebounds: 0,
          Assists: 0,
          Turnovers: 0,
          Steals: 0,
          Blocks: 0,
        };
      }

      totalsMap[pid].GamesPlayed += 1;
      totalsMap[pid].Points += stat.Points || 0;
      totalsMap[pid].Rebounds += stat.Rebounds || 0;
      totalsMap[pid].Assists += stat.Assists || 0;
      totalsMap[pid].Turnovers += stat.Turnovers || 0;
      totalsMap[pid].Steals += stat.Steals || 0;
      totalsMap[pid].Blocks += stat.Blocks || 0;
    });

    setSeasonTotals(Object.values(totalsMap));
  }, [playerStats]);

  // Helpers
  const getPlayerName = (playerId) => {
    const p = players.find((pl) => String(pl.PlayerID) === String(playerId));
    return p ? `${p.FirstName} ${p.LastName}` : "Unknown";
  };

  const getJerseyNumber = (playerId) => {
    const p = players.find((pl) => String(pl.PlayerID) === String(playerId));
    return p?.JerseyNumber ?? "";
  };

  const getPlayerPhotoUrl = (playerId) => {
    const p = players.find((pl) => String(pl.PlayerID) === String(playerId));
    // Adjust if you store photo paths differently
    return p?.PhotoURL || "/images/boys/basketball/players/default.jpg";
  };

  const formatScore = (game) => {
    if (game.HomeScore == null || game.AwayScore == null) return "—";
    if (game.Location === "H") return `${game.HomeScore}-${game.AwayScore}`;
    return `${game.AwayScore}-${game.HomeScore}`;
  };

  const sortArrow = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "desc" };
    });
  };

  const formatPerGame = (player, statKey) => {
    const gp = player.GamesPlayed || 0;
    if (gp === 0) return "—";
    return (player[statKey] / gp).toFixed(1);
  };

  const sortedSeasonTotals = [...seasonTotals].sort((a, b) => {
    const { key, direction } = sortConfig;

    const getValue = (obj) => {
      if (key === "name") return getPlayerName(obj.PlayerID);
      if (key === "jersey") return Number(getJerseyNumber(obj.PlayerID)) || 999;
      return obj[key] ?? 0;
    };

    const valA = getValue(a);
    const valB = getValue(b);

    if (typeof valA === "string") {
      return direction === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    }

    return direction === "asc" ? valA - valB : valB - valA;
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">2025–26 Boys Basketball Season</h1>

      {/* 2. SCHEDULE & RESULTS */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">📅 Schedule &amp; Results</h2>
        <div className="overflow-x-auto px-1">
          <table className="w-full border text-center text-xs sm:text-sm md:text-base">
            <thead>
              <tr>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Opponent</th>
                <th className="border px-2 py-1">Result</th>
                <th className="border px-2 py-1">Score</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game, idx) => {
                const hasResult = game.Result === "W" || game.Result === "L";
                return (
                  <tr key={idx} className={idx % 2 ? "bg-gray-100" : "bg-white"}>
                    <td className="border px-2 py-1">{game.Date || "—"}</td>
                    <td className="border px-2 py-1">{game.Opponent}</td>
                    <td className="border px-2 py-1">{hasResult ? game.Result : "—"}</td>
                    <td className="border px-2 py-1">{formatScore(game)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. SEASON PLAYER TOTALS (sortable, with photos & jersey column) */}
      <section>
        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-2xl font-semibold">📊 Player Statistics for the Season</h2>

          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <span
              className={`${
                showPerGame ? "text-gray-400" : "text-gray-900 font-semibold"
              }`}
            >
              Season totals
            </span>

            <button
              className="relative w-12 h-6 bg-gray-300 rounded-full transition"
              onClick={() => setShowPerGame((prev) => !prev)}
              aria-label="toggle per game"
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  showPerGame ? "translate-x-6" : ""
                }`}
              />
            </button>

            <span
              className={`${
                showPerGame ? "text-gray-900 font-semibold" : "text-gray-400"
              }`}
            >
              Per game averages
            </span>
          </div>
        </div>

        {seasonTotals.length === 0 ? (
          <p className="text-gray-600">No player statistics are available yet for this season.</p>
        ) : (
          <div className="overflow-x-auto px-1">
            <table className="w-full border text-center text-xs sm:text-sm md:text-base table-auto">
              <thead className="bg-gray-400 text-black">
                <tr>
                  {/* ✅ FIXED: sticky player header now “seals” on the RIGHT and sits above */}
                  <th
                    className="border px-2 py-1 text-left cursor-pointer bg-gray-400 sticky left-0 z-50 border-r-4 border-gray-400 shadow-[6px_0_0_0_rgba(0,0,0,0.08)]"
                    onClick={() => handleSort("name")}
                  >
                    Player{sortArrow("name")}
                  </th>

                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("jersey")}
                  >
                    #{sortArrow("jersey")}
                  </th>

                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("GamesPlayed")}
                  >
                    GP{sortArrow("GamesPlayed")}
                  </th>

                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("Points")}
                  >
                    PTS{sortArrow("Points")}
                  </th>

                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("Rebounds")}
                  >
                    REB{sortArrow("Rebounds")}
                  </th>

                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("Assists")}
                  >
                    AST{sortArrow("Assists")}
                  </th>

                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("Turnovers")}
                  >
                    TO{sortArrow("Turnovers")}
                  </th>

                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("Steals")}
                  >
                    STL{sortArrow("Steals")}
                  </th>

                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("Blocks")}
                  >
                    BLK{sortArrow("Blocks")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedSeasonTotals.map((player) => {
                  const name = getPlayerName(player.PlayerID);
                  const jersey = getJerseyNumber(player.PlayerID);
                  const photoUrl = getPlayerPhotoUrl(player.PlayerID);

                  return (
                    <tr key={player.PlayerID}>
                      {/* ✅ FIXED: sticky player cell now has higher z-index + right “seal” */}
                      <td className="border px-2 py-1 text-left align-middle min-w-[220px] bg-gray-100 sticky left-0 z-30 border-r-4 border-gray-100 shadow-[6px_0_0_0_rgba(0,0,0,0.08)]">
                        <div className="flex items-center gap-2">
                          <img
                            src={photoUrl}
                            alt={name}
                            onError={(e) => {
                              e.currentTarget.src =
                                "/images/boys/basketball/players/default.jpg";
                            }}
                            className="w-8 h-8 rounded-full object-cover border"
                          />
                          <Link
                            to={`/athletics/boys/basketball/players/${player.PlayerID}`}
                            className="text-blue-600 underline hover:text-blue-800"
                          >
                            {name}
                          </Link>
                        </div>
                      </td>

                      <td className="border px-2 py-1 align-middle">{jersey}</td>

                      <td className="border px-2 py-1 align-middle">{player.GamesPlayed}</td>

                      <td className="border px-2 py-1 align-middle">
                        {showPerGame ? formatPerGame(player, "Points") : player.Points}
                      </td>

                      <td className="border px-2 py-1 align-middle">
                        {showPerGame ? formatPerGame(player, "Rebounds") : player.Rebounds}
                      </td>

                      <td className="border px-2 py-1 align-middle">
                        {showPerGame ? formatPerGame(player, "Assists") : player.Assists}
                      </td>

                      <td className="border px-2 py-1 align-middle">
                        {showPerGame ? formatPerGame(player, "Turnovers") : player.Turnovers}
                      </td>

                      <td className="border px-2 py-1 align-middle">
                        {showPerGame ? formatPerGame(player, "Steals") : player.Steals}
                      </td>

                      <td className="border px-2 py-1 align-middle">
                        {showPerGame ? formatPerGame(player, "Blocks") : player.Blocks}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Season2025_26;
