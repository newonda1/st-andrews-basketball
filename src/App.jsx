import { Link } from "react-router-dom";
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

    <section className="text-center">
      <p className="text-gray-700 text-lg max-w-3xl mx-auto">
        This site chronicles the history of St. Andrew’s boys basketball, featuring game results, player statistics,
        and season recaps. Each year builds on the legacy of past teams, coaches, and athletes who have shaped the program.
      </p>
    </section>

    <section className="text-center">
      <h2 className="text-2xl font-semibold mt-10 mb-4">Individual Season Results</h2>
      <Link
        to="/season/2024-2025"
        className="inline-block text-blue-600 hover:text-blue-800 underline text-lg font-medium"
>
  View 2024–2025 Season
</Link>

    </section>

  </div>
);
}

export default App;
