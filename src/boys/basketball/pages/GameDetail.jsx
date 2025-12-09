import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function GameDetail() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("/data/boys/basketball/games.json").then((res) => res.json()),
      fetch("/data/boys/basketball/playergamestats.json").then((res) =>
        res.json()
      ),
      fetch("/data/boys/basketball/players.json").then((res) => res.json()),
    ])
      .then(([gamesData, statsData, playersData]) => {
        const gameObj = gamesData.find(
          (g) => String(g.GameID) === String(gameId)
        );
        setGame(gameObj || null);

        const statsForGame = statsData.filter(
          (s) => String(s.GameID) === String(gameId)
        );
        setPlayerStats(statsForGame);
        setPlayers(playersData);
      })
      .catch((err) => console.error("Failed to load game detail:", err));
  }, [gameId]);

  const formatDate = (ms) => {
    if (!ms) return "";
    const d = new Date(ms);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPlayerName = (playerId) => {
    const p = players.find((pl) => pl.PlayerID === playerId);
    return p ? `${p.FirstName} ${p.LastName}` : "Unknown";
  };

  if (!game) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <p className="text-center text-gray-700">Loading game data…</p>
      </div>
    );
  }

  const teamScore = game.TeamScore ?? "-";
  const opponentScore = game.OpponentScore ?? "-";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-blue-800">
          {game.Opponent} – Game Detail
        </h1>
        <p className="text-gray-700">
          {formatDate(game.Date)} • {game.LocationType} • {game.GameType}
        </p>
        <p className="text-lg font-semibold">
          Final: {teamScore}–{opponentScore} ({game.Result || "TBD"})
        </p>
      </header>

      {/* Box Score */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Box Score</h2>
        <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-xs border text-center">
            <thead className="bg-gray-200 font-bold">
              <tr>
                <th className="border px-2 py-1 text-left">Player</th>
                <th className="border px-2 py-1">MIN</th>
                <th className="border px-2 py-1">PTS</th>
                <th className="border px-2 py-1">REB</th>
                <th className="border px-2 py-1">AST</th>
                <th className="border px-2 py-1">STL</th>
                <th className="border px-2 py-1">BLK</th>
                <th className="border px-2 py-1">TOV</th>
                <th className="border px-2 py-1">2PM</th>
                <th className="border px-2 py-1">2PA</th>
                <th className="border px-2 py-1">3PM</th>
                <th className="border px-2 py-1">3PA</th>
                <th className="border px-2 py-1">FTM</th>
                <th className="border px-2 py-1">FTA</th>
              </tr>
            </thead>
            <tbody>
              {playerStats.length === 0 && (
                <tr>
                  <td
                    colSpan={14}
                    className="border px-2 py-3 text-center text-gray-600"
                  >
                    No player statistics available for this game.
                  </td>
                </tr>
              )}
              {playerStats.map((stat) => (
                <tr key={stat.ID} className="border-t">
                  <td className="border px-2 py-1 text-left whitespace-nowrap">
                    {getPlayerName(stat.PlayerID)}
                  </td>
                  <td className="border px-2 py-1">
                    {stat.MinutesPlayed ?? "-"}
                  </td>
                  <td className="border px-2 py-1">{stat.Points ?? 0}</td>
                  <td className="border px-2 py-1">{stat.Rebounds ?? 0}</td>
                  <td className="border px-2 py-1">{stat.Assists ?? 0}</td>
                  <td className="border px-2 py-1">{stat.Steals ?? 0}</td>
                  <td className="border px-2 py-1">{stat.Blocks ?? 0}</td>
                  <td className="border px-2 py-1">{stat.Turnovers ?? 0}</td>
                  <td className="border px-2 py-1">{stat.TwoPM ?? 0}</td>
                  <td className="border px-2 py-1">{stat.TwoPA ?? 0}</td>
                  <td className="border px-2 py-1">{stat.ThreePM ?? 0}</td>
                  <td className="border px-2 py-1">{stat.ThreePA ?? 0}</td>
                  <td className="border px-2 py-1">{stat.FTM ?? 0}</td>
                  <td className="border px-2 py-1">{stat.FTA ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="text-center">
        <Link
          to="/athletics/boys/basketball/seasons/2025-26"
          className="inline-block mt-4 text-sm text-blue-700 hover:underline"
        >
          ← Back to 2025–26 Season
        </Link>
      </div>
    </div>
  );
}

export default GameDetail;
