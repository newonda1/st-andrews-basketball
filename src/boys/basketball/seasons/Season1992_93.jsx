import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Season1992_93() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetch("/data/boys/basketball/games.json")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((g) => g.Season === 1992);
        filtered.sort(
          (a, b) => (Number(a.GameID) || 0) - (Number(b.GameID) || 0)
        );
        setGames(filtered);
      })
      .catch((err) => console.error("Failed to load games:", err));
  }, []);

  const formatDateFromGameID = (gameId) => {
    if (!gameId) return "";

    const n = Number(gameId);
    if (!Number.isFinite(n)) return "";

    const year = Math.floor(n / 10000);
    const month = Math.floor(n / 100) % 100;
    const day = n % 100;

    if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) {
      return "";
    }

    const d = new Date(Date.UTC(year, month - 1, day));

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
                  {formatDateFromGameID(game.GameID)}
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
