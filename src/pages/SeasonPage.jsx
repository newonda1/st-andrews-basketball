import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function SeasonPage() {
  const { seasonID } = useParams();
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetch("/data/games.json")
      .then((res) => res.json())
      .then((allGames) => {
        const seasonGames = allGames.filter((g) => g.Season === seasonID);
        setGames(seasonGames);
      })
      .catch((err) => console.error("Failed to load games", err));
  }, [seasonID]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center mb-4">
        {seasonID} Season Recap
      </h1>
      <p className="text-gray-700 text-lg">
        The 2024–2025 season marked the beginning of a new era for St. Andrew’s
        basketball. After graduating a large senior class, the team returned with
        only two players who had varsity experience. Despite the inexperience, the
        Lions showed flashes of promise behind standout leadership from returning
        all-state player Zayden Edwards. With several freshmen and new contributors
        stepping into big roles, the team focused on building chemistry and laying
        the foundation for future success.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">Game Results</h2>
      <ul className="space-y-3">
        {games.map((game) => (
          <li key={game.GameID}>
            <a
              href={`/game/${game.GameID}`}
              className="block p-4 border rounded hover:bg-gray-100"
            >
              <strong>{game.Date}</strong>: vs. {game.Opponent} — {game.TeamScore} to {game.OpponentScore} ({game.Result})
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SeasonPage;
