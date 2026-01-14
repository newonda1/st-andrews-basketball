import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Season1992_93() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetch("/data/boys/basketball/games.json")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((g) => g.Season === 1992);
        filtered.sort((a, b) => a.Date - b.Date);
        setGames(filtered);
      })
      .catch((err) => console.error("Failed to load games:", err));
  }, []);

  const formatDate = (ms) => {
    if (!ms) return "";
    const d = new Date(ms);
    return d.toLocaleDateString("en-US", {
      timeZone: "UTC",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 px-4">
      <header className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-blue-800">
          1992–93 Boys Varsity Basketball
        </h1>
        <p className="text-gray-700">Season schedule and results.</p>
      </header>

      <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Opponent</th>
              <th className="px-4 py-2 text-left">Location</th>
              <th className="px-4 py-2 text-center">Type</th>
              <th className="px-4 py-2 text-center">Result</th>
              <th className="px-4 py-2 text-center">Score</th>
            </tr>
          </thead>
          <tbody>
            {games.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-4 text-center text-gray-600"
                >
                  No games available for the 1992–93 season.
                </td>
              </tr>
            )}

            {games.map((game) => (
              <tr key={game.GameID} className="border-t">
                <td className="px-4 py-2 whitespace-nowrap">
                  {formatDate(game.Date)}
                </td>
                <td className="px-4 py-2">{game.Opponent}</td>
                <td className="px-4 py-2">{game.LocationType}</td>
                <td className="px-4 py-2 text-center">{game.GameType}</td>
                <td className="px-4 py-2 text-center">{game.Result || "-"}</td>
                <td className="px-4 py-2 text-center">
                  {game.TeamScore != null && game.OpponentScore != null
                    ? `${game.TeamScore}–${game.OpponentScore}`
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center">
        <Link
          to="/athletics/boys/basketball/yearly-results"
          className="inline-block mt-4 text-sm text-blue-700 hover:underline"
        >
          ← Back to Yearly Results
        </Link>
      </div>
    </div>
  );
}

export default Season1992_93;
