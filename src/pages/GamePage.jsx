import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function GamePage() {
  // 👇 MUST match :gameId in App.jsx route
  const { gameId } = useParams();

  const [game, setGame] = useState(null);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [gamesRes, statsRes, playersRes] = await Promise.all([
          fetch("/data/games.json"),
          // 👇 match the filename you use in App.jsx
          fetch("/data/playergamestats.json"),
          fetch("/data/players.json"),
        ]);

        const [gamesData, statsData, playersData] = await Promise.all([
          gamesRes.json(),
          statsRes.json(),
          playersRes.json(),
        ]);

        setPlayers(playersData);

        // Make sure we compare as strings in case one side is numeric
        const foundGame = gamesData.find(
          (g) => String(g.GameID) === String(gameId)
        );
        setGame(foundGame || null);

        const statsForGame = statsData.filter(
          (s) => String(s.GameID) === String(gameId)
        );
        setPlayerStats(statsForGame);
      } catch (err) {
        console.error("Error loading game page data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [gameId]);

  if (loading) {
    return <div className="p-6">Loading game information...</div>;
  }

  if (!game) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Game not found</h1>
        <p>We couldn&apos;t find a game with ID: {gameId}</p>
        <p className="mt-4">
          <Link to="/" className="text-blue-600 underline">
            Back to home
          </Link>
        </p>
      </div>
    );
  }

  const playerMap = Object.fromEntries(
    players.map((p) => [p.PlayerID, `${p.FirstName} ${p.LastName}`])
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center mb-4">
        {game.Date}: {game.Opponent}
      </h1>
      <p className="text-center text-lg text-gray-700">
        Final Score: {game.TeamScore} – {game.OpponentScore} ({game.Result})
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Player Stats</h2>
      {playerStats.length === 0 ? (
        <p>No stats recorded for this game.</p>
      ) : (
        <ul className="space-y-4">
          {playerStats.map((stat, index) => (
            <li key={index} className="border rounded p-4 shadow-sm">
              <p className="font-semibold">
                <Link
                  to={`/players/${stat.PlayerID}`}
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  {playerMap[stat.PlayerID] || stat.PlayerID}
                </Link>
              </p>
              <p>
                PTS: {stat.Points} | REB: {stat.Rebounds} | AST: {stat.Assists} | STL:{" "}
                {stat.Steals} | BLK: {stat.Blocks}
              </p>
              <p>
                3PM: {stat.ThreePM} / {stat.ThreePA}, 2PM: {stat.TwoPM} /{" "}
                {stat.TwoPA}, FTM: {stat.FTM} / {stat.FTA}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default GamePage;
