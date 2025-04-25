import React, { useEffect, useState } from "react";

function App() {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    fetch("/data/games.json")
      .then((res) => res.json())
      .then(setGames)
      .catch((err) => console.error("Failed to load games", err));

    fetch("/data/player_game_stats.json")
      .then((res) => res.json())
      .then(setPlayerStats)
      .catch((err) => console.error("Failed to load player stats", err));

    fetch("/data/players.json")
      .then((res) => res.json())
      .then(setPlayers)
      .catch((err) => console.error("Failed to load players", err));
  }, []);

  const playerMap = Object.fromEntries(
    players.map((p) => [p.PlayerID, `${p.FirstName} ${p.LastName}`])
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10">
      <header className="text-center">
        <img src="/logo.png" alt="St. Andrew's Logo" className="h-20 mx-auto mb-4" />
        <h1 className="text-3xl font-bold">
          Celebrating the Legacy of St. Andrew&apos;s Basketball
        </h1>
      </header>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Game Results</h2>
        <div className="space-y-4">
          {games.slice(0, 10).map((game) => (
            <div key={game.GameID} className="border rounded-lg p-4 shadow-sm">
              <p className="font-semibold">{game.Date} vs. {game.Opponent}</p>
              <p>Result: {game.Result} — {game.TeamScore} to {game.OpponentScore}</p>
              <p>Location: {game.LocationType} | Game Type: {game.GameType}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Player Stats</h2>
        <div className="space-y-4">
          {playerStats.slice(0, 10).map((stat, index) => (
            <div key={index} className="border rounded-lg p-4 shadow-sm">
              <p className="font-semibold">Player: {playerMap[stat.PlayerID] || stat.PlayerID}</p>
              <p>Game ID: {stat.GameID}</p>
              <p>
                PTS: {stat.Points} | REB: {stat.Rebounds} | AST: {stat.Assists} | STL: {stat.Steals} | BLK: {stat.Blocks}
              </p>
              <p>
                3PM: {stat.ThreePM} / {stat.ThreePA}, 2PM: {stat.TwoPM} / {stat.TwoPA}, FTM: {stat.FTM} / {stat.FTA}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
