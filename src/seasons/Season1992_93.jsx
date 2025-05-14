import React, { useEffect, useState } from 'react';

function Season1992_93() {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const statLabels = {
    Points: 'Points',
    Rebounds: 'Rebounds'
  };

  useEffect(() => {
    async function fetchData() {
      const gamesRes = await fetch("/data/games.json");
      const statsRes = await fetch("/data/playergamestats.json");
      const playersRes = await fetch("/data/players.json");
      const gamesData = await gamesRes.json();
      const statsData = await statsRes.json();
      const playersData = await playersRes.json();

      setGames(gamesData.filter(g => g.Season === 1992));
      setPlayerStats(statsData.filter(s => {
        const game = gamesData.find(g => g.GameID === s.GameID);
        return game && game.Season === 1992;
      }));
      setPlayers(playersData);
    }

    fetchData();
  }, []);

  const getPlayerName = (id) => {
    const player = players.find(p => p.PlayerID === id);
    return player ? `${player.FirstName} ${player.LastName}` : 'Unknown Player';
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(file => URL.createObjectURL(file));
    setUploadedPhotos(prev => [...prev, ...newPhotos]);
  };

  return (
    <div className="bg-gray-100 p-8 rounded-lg shadow-md max-w-6xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold text-center mb-4">1992-93 Season Recap</h1>

      {/* Section 1: Season Schedule & Results */}
      <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4 whitespace-nowrap">
        📅 Season Schedule & Results
      </h2>
      <div className="overflow-x-auto px-1">
        <table className="w-full border text-center text-xs sm:text-sm md:text-base">
          <thead>
            <tr>
              <th className="border px-2 py-1">Date</th>
              <th className="border px-2 py-1">Opponent</th>
              <th className="border px-2 py-1">Result</th>
              <th className="border px-2 py-1">Score</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game, idx) => (
              <tr key={idx}>
                <td className="border px-2 py-1">{new Date(game.Date).toLocaleDateString()}</td>
                <td className="border px-2 py-1">{game.Opponent}</td>
                <td className="border px-2 py-1">{game.Result}</td>
                <td className="border px-2 py-1 whitespace-nowrap">{game.TeamScore} - {game.OpponentScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section 2: Player Totals for Points and Rebounds */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">🏀 Player Totals (Points & Rebounds)</h2>
      <div className="overflow-x-auto px-1">
        <table className="w-full border text-center text-xs sm:text-sm md:text-base">
          <thead>
            <tr>
              <th className="border px-2 py-1">Player</th>
              <th className="border px-2 py-1">Points</th>
              <th className="border px-2 py-1">Rebounds</th>
            </tr>
          </thead>
          <tbody>
            {playerStats.map((stat, idx) => {
              const playerName = getPlayerName(stat.PlayerID);
              return (
                <tr key={idx}>
                  <td className="border px-2 py-1">{playerName}</td>
                  <td className="border px-2 py-1">{stat.Points}</td>
                  <td className="border px-2 py-1">{stat.Rebounds}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Section 3: Photo Upload */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">📸 Upload Your Photos</h2>
      <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="block mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {uploadedPhotos.map((src, idx) => (
          <img key={idx} src={src} alt={`Uploaded ${idx}`} className="w-full h-auto rounded shadow" />
        ))}
      </div>
      <p className="text-sm text-gray-600">
        Submitted photos will be reviewed before inclusion in the team’s online photobook.
      </p>
    </div>
  );
}

export default Season1992_93;
