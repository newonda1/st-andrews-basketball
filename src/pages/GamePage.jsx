import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function GamePage() {
  const { gameID } = useParams();
  const [game, setGame] = useState(null);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    fetch("/data/games.json")
      .then((res) => res.json())
      .then((games) => {
        const foundGame = games.find((g) => g.GameID === gameID);
        setGame(foundGame);
      })
      .catch((err) => console.error("Failed to load game", err));

    fetch("/data/player_game_stats.json")
      .then((res) => res.json())
      .then((stats) => {
        const statsForGame = stats.filter((s) => s.GameID === gameID);
        setPlayerStats(statsForGame);
      })
      .catch((err) => console.error("Failed to load player stats", err));

    fetch("/data/players.json")
      .then((res) => res.json())
      .then(setPlayers)
      .catch((err) => console.error("Failed to load players", err));
  }, [gameID]);

  const playerMap = Object.fromEntries(
    players.map((p) => [p.PlayerID, `${p.FirstName} ${p.LastName}`])
  );

  if (!game) {
    return <div className="p-6">Loading game information...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center mb-4">
        {game.Date}: {game.Opponent}
      </h1>
      <p className="text-center text-lg text-gray-700">
        Final Score: {game.TeamScore} – {game.OpponentScore} ({game.Result})
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Player Stats</h2>
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
              PTS: {stat.Points} | REB: {stat.Rebounds} | AST: {stat.Assists} | STL: {stat.Steals} | BLK: {stat.Blocks}
            </p>
            <p>
              3PM: {stat.ThreePM} / {stat.ThreePA}, 2PM: {stat.TwoPM} / {stat.TwoPA}, FTM: {stat.FTM} / {stat.FTA}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GamePage;
