import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

function GameDetail() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const [gamesRes, statsRes, playersRes] = await Promise.all([
        fetch('/data/games.json'),
        fetch('/data/playergamestats.json'),
        fetch('/data/players.json')
      ]);

      const [gamesData, statsData, playersData] = await Promise.all([
        gamesRes.json(),
        statsRes.json(),
        playersRes.json()
      ]);

      const idNum = Number(gameId);

      const thisGame = gamesData.find((g) => g.GameID === idNum);
      const thisStats = statsData.filter((s) => s.GameID === idNum);

      setGame(thisGame || null);
      setPlayerStats(thisStats);
      setPlayers(playersData);
    }

    fetchData();
  }, [gameId]);

  const getPlayerName = (playerId) => {
    const p = players.find((pl) => pl.PlayerID === playerId);
    return p ? p.PlayerName : `Player ${playerId}`;
  };

  const formatDate = (ms) =>
    new Date(ms).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

  if (!game) {
    return <div className="p-4">Game not found.</div>;
  }

  const resultText =
    game.Result === 'W'
      ? 'Win'
      : game.Result === 'L'
      ? 'Loss'
      : 'Result pending';

  const showScore = game.Result === 'W' || game.Result === 'L';

  return (
    <div className="p-4 space-y-6">
      {/* 👈 Adjust this path to whatever your 2025–26 season route is */}
      <Link
        to="/seasons/Season2025_26"
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
              {' '}
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
        <p className="text-gray-700 leading-relaxed">
          {/* TODO: Replace this with your actual recap text for this game. */}
          Recap coming soon.
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
                      {getPlayerName(s.PlayerID)}
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
