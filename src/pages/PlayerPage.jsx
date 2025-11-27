import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

// We will fetch JSON from /data instead of importing it

// These must match the field names in player_game_stats.json
const statKeys = [
  "Points",
  "Rebounds",
  "Assists",
  "Steals",
  "Blocks",
  "ThreePM",
  "ThreePA",
  "TwoPM",
  "TwoPA",
  "FTM",
  "FTA",
];

function PlayerPage() {
  const { playerId } = useParams();

  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [loading, setLoading] = useState(true);

    // Helper to find the player by ID, handling numeric IDs and alternate field names
  const getPlayerById = (id) => {
    const idNum = Number(id);

    return (
      players.find((p) => Number(p.PlayerID) === idNum) ||
      players.find((p) => Number(p.PlayerId) === idNum) ||
      players.find((p) => Number(p.ID) === idNum) ||
      null
    );
  };

  // Load all the data we need
  useEffect(() => {
    async function loadData() {
      try {
        const [playersRes, gamesRes, statsRes] = await Promise.all([
          fetch("/data/players.json"),
          fetch("/data/games.json"),
          fetch("/data/playergamestats.json"),
        ]);

        const [playersData, gamesData, statsData] = await Promise.all([
          playersRes.json(),
          gamesRes.json(),
          statsRes.json(),
        ]);

        setPlayers(playersData);
        setGames(gamesData);
        setPlayerStats(statsData);
      } catch (err) {
        console.error("Error loading player page data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading player information...</div>;
  }

  // 1. Find player
  const player = getPlayerById(playerId);

  if (!player) {
    return <div className="p-6">Player not found.</div>;
  }

  const playerName =
    player.PlayerName ||
    player.Name ||
    (player.FirstName && player.LastName
      ? `${player.FirstName} ${player.LastName}`
      : `Player ${playerId}`);
  
  // Later you can add fields like YearsWithTeam or PhotoUrl to players.json
  const yearsWithTeam = player.YearsWithTeam || "";
  const photoUrl = player.PhotoUrl || null;

  // 2. Get all game stats for this player
  const statsForPlayer = playerStats.filter(
    (s) => Number(s.PlayerID) === Number(playerId)
  );

  // 3. Join with game info (date, opponent, result, season)
  const statsWithGameInfo = statsForPlayer
    .map((stat) => {
      const game = games.find(
        (g) => String(g.GameID) === String(stat.GameID)
      );
      return {
        ...stat,
        gameDate: game?.Date || "",
        opponent: game?.Opponent || "",
        result: game?.Result || "",
        season: game?.Season || game?.Year || "",
      };
    })
    .sort((a, b) => {
      if (!a.gameDate || !b.gameDate) return 0;
      return new Date(a.gameDate) - new Date(b.gameDate);
    });

  // 4. Build season totals
  const seasonMap = {}; // { "2025-26": { season, gamesPlayed, Points, ... } }

  statsWithGameInfo.forEach((stat) => {
    const seasonKey = stat.season || "Unknown";

    if (!seasonMap[seasonKey]) {
      seasonMap[seasonKey] = {
        season: seasonKey,
        gamesPlayed: 0,
      };
      statKeys.forEach((key) => {
        seasonMap[seasonKey][key] = 0;
      });
    }

    seasonMap[seasonKey].gamesPlayed += 1;
    statKeys.forEach((key) => {
      seasonMap[seasonKey][key] += Number(stat[key]) || 0;
    });
  });

  const seasonTotals = Object.values(seasonMap).sort((a, b) =>
    String(a.season).localeCompare(String(b.season))
  );

  // 5. Career totals
  const careerTotals = {
    season: "Career",
    gamesPlayed: seasonTotals.reduce(
      (total, s) => total + (s.gamesPlayed || 0),
      0
    ),
  };

  statKeys.forEach((key) => {
    careerTotals[key] = seasonTotals.reduce(
      (total, s) => total + (s[key] || 0),
      0
    );
  });

    const formatDate = (ms) =>
    new Date(Number(ms)).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="player-page max-w-5xl mx-auto p-4 space-y-8">
      {/* 1. Header: name, years, picture */}
      <header className="flex items-center gap-4 mb-4">
        {photoUrl && (
          <img
            src={photoUrl}
            alt={playerName}
            className="w-24 h-24 object-cover rounded-full border"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold">{playerName}</h1>
          {yearsWithTeam && (
            <p className="text-gray-600 text-lg">
              St. Andrew&apos;s Lions • {yearsWithTeam}
            </p>
          )}
        </div>
      </header>

      {/* 2. Season-by-season stats table */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Season Totals</h2>
        {seasonTotals.length === 0 ? (
          <p>No stats available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1 text-left">Season</th>
                  <th className="border px-2 py-1 text-right">GP</th>
                  {statKeys.map((key) => (
                    <th
                      key={key}
                      className="border px-2 py-1 text-right"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {seasonTotals.map((row) => (
                  <tr key={row.season}>
                    <td className="border px-2 py-1">{row.season}</td>
                    <td className="border px-2 py-1 text-right">
                      {row.gamesPlayed}
                    </td>
                    {statKeys.map((key) => (
                      <td
                        key={key}
                        className="border px-2 py-1 text-right"
                      >
                        {row[key]}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Career row */}
                <tr className="bg-gray-50 font-semibold">
                  <td className="border px-2 py-1">
                    {careerTotals.season}
                  </td>
                  <td className="border px-2 py-1 text-right">
                    {careerTotals.gamesPlayed}
                  </td>
                  {statKeys.map((key) => (
                    <td
                      key={key}
                      className="border px-2 py-1 text-right"
                    >
                      {careerTotals[key]}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 3. Game-by-game table */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Game Logs</h2>
        {statsWithGameInfo.length === 0 ? (
          <p>No game logs available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1 text-left">Date</th>
                  <th className="border px-2 py-1 text-left">Opponent</th>
                  <th className="border px-2 py-1 text-left">Result</th>
                  {statKeys.map((key) => (
                    <th
                      key={key}
                      className="border px-2 py-1 text-right"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {statsWithGameInfo.map((row, idx) => (
                  <tr key={`${row.GameID}-${idx}`}>
                    <td className="border px-2 py-1 whitespace-nowrap">
                      {row.gameDate ? formatDate(row.gameDate) : ""}
                    </td>
                    <td className="border px-2 py-1 whitespace-nowrap">
                      <Link
                      to={`/games/${row.GameID}`}
                      className="text-blue-600 hover:underline"
                    >
                      {row.opponent}
                    </Link>
                    </td>
                    <td className="border px-2 py-1">
                      {row.result}
                    </td>
                    {statKeys.map((key) => (
                      <td
                        key={key}
                        className="border px-2 py-1 text-right"
                      >
                        {row[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default PlayerPage;
