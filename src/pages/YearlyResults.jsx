// src/pages/YearlyResults.jsx
import React, { useEffect, useState } from "react";

function YearlyResults() {
  const [games, setGames] = useState([]);
  const [seasons, setSeasons] = useState([]);

  useEffect(() => {
    fetch("/data/games.json")
      .then((res) => res.json())
      .then((data) => {
        setGames(data);

        // Group games by season
        const grouped = data.reduce((acc, game) => {
          const season = game.Season;
          if (!acc[season]) acc[season] = [];
          acc[season].push(game);
          return acc;
        }, {});

        // Convert grouped object to sorted array
        const seasonList = Object.entries(grouped).sort(([a], [b]) =>
          a.localeCompare(b)
        );
        setSeasons(seasonList);
      });
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-center">Full Year-by-Year Results</h2>
      {seasons.map(([season, games]) => (
        <div key={season} className="border rounded-lg p-4 shadow">
          <h3 className="text-xl font-semibold mb-2">{season}</h3>
          <table className="w-full table-auto text-sm border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Opponent</th>
                <th className="border px-2 py-1">Location</th>
                <th className="border px-2 py-1">Result</th>
                <th className="border px-2 py-1">Score</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game, idx) => (
                <tr key={idx} className="text-center">
                  <td className="border px-2 py-1">{game.Date || "TBD"}</td>
                  <td className="border px-2 py-1">{game.Opponent || "Unknown"}</td>
                  <td className="border px-2 py-1">{game.Location || "-"}</td>
                  <td className="border px-2 py-1">
                    {game.TeamScore > game.OpponentScore ? "W" : game.TeamScore < game.OpponentScore ? "L" : "T"}
                  </td>
                  <td className="border px-2 py-1">
                    {game.TeamScore}-{game.OpponentScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default YearlyResults;
