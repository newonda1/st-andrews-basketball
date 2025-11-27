import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function GameDetail() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [gamesRes, statsRes, playersRes] = await Promise.all([
          fetch("/data/games.json"),
          fetch("/data/playergamestats.json"),
          fetch("/data/players.json"),
        ]);

        const [gamesData, statsData, playersData] = await Promise.all([
          gamesRes.json(),
          statsRes.json(),
          playersRes.json(),
        ]);

        const idNum = Number(gameId);

        const thisGame = gamesData.find((g) => Number(g.GameID) === idNum);
        const thisStats = statsData.filter(
          (s) => Number(s.GameID) === idNum
        );

        setGame(thisGame || null);
        setPlayerStats(thisStats);
        setPlayers(playersData || []);
      } catch (err) {
        console.error("Failed to load game detail data:", err);
      }
    }

    fetchData();
  }, [gameId]);

  // More robust player-name lookup that handles different field names / types
  const getPlayerName = (playerId) => {
    const idNum = Number(playerId);

    const p =
      players.find((pl) => Number(pl.PlayerID) === idNum) ||
      players.find((pl) => Number(pl.PlayerId) === idNum) ||
      players.find((pl) => Number(pl.ID) === idNum);

    if (!p) {
      return `Player ${playerId}`;
    }

    // Try several name fields in order
    const fullName =
      p.PlayerName ||
      p.Name ||
      (p.FirstName && p.LastName
        ? `${p.FirstName} ${p.LastName}`
        : null);

    return fullName || `Player ${playerId}`;
  };

  const formatDate = (ms) =>
    new Date(ms).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  if (!game) {
    return <div className="p-4">Game not found.</div>;
  }

  const resultText =
    game.Result === "W"
      ? "Win"
      : game.Result === "L"
      ? "Loss"
      : "Result pending";

  const showScore = game.Result === "W" || game.Result === "L";

  return (
    <div className="p-4 space-y-6">
      {/* Adjust this route if your season page path is different */}
      <Link
        to="/seasons/2025-26"
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to 2025–26 Season
      </Link>

      <header>
        <h1 className="text-2xl font-bold mb-2">
          {formatDate(game.Date)} vs {game.Opponent}
        </h1>
        <p className="text-lg">
          {resultText}
          {showScore && (
            <>
              {" "}
              — {game.TeamScore}–{game.OpponentScore}
            </>
          )}
        </p>
        <p className="text-sm text-gray-600">
          {game.LocationType} • {game.GameType}
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-2">Game Recap</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {game.Recap && game.Recap.trim().length > 0
            ? game.Recap
            : "Recap coming soon."}
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Box Score</h2>
        {playerStats.length === 0 ? (
          <p className="text-gray-600">
            No player statistics recorded for this game yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-xs sm:text-sm text-center">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1">Player</th>
                  <th className="border px-2 py-1">PTS</th>
                  <th className="border px-2 py-1">REB</th>
                  <th className="border px-2 py-1">AST</th>
                  <th className="border px-2 py-1">STL</th>
                  <th className="border px-2 py-1">BLK</th>
                  <th className="border px-2 py-1">3PM</th>
                  <th className="border px-2 py-1">2PM</th>
                  <th className="border px-2 py-1">FT</th>
                </tr>
              </thead>
              <tbody>
                {playerStats.map((s) => (
                  <tr key={s.PlayerGameStatsID}>
                    <td className="border px-2 py-1">
                      <Link
                        to={`/players/${s.PlayerID}`}
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        {getPlayerName(s.PlayerID)}
                      </Link>
                    </td>
                    <td className="border px-2 py-1">{s.Points}</td>
                    <td className="border px-2 py-1">{s.Rebounds}</td>
                    <td className="border px-2 py-1">{s.Assists}</td>
                    <td className="border px-2 py-1">{s.Steals}</td>
                    <td className="border px-2 py-1">{s.Blocks}</td>
                    <td className="border px-2 py-1">{s.ThreePM}</td>
                    <td className="border px-2 py-1">{s.TwoPM}</td>
                    <td className="border px-2 py-1">
                      {s.FTM}/{s.FTA}
                    </td>
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

export default GameDetail;
