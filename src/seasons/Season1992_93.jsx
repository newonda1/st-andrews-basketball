import React, { useEffect, useState } from 'react';

function Season1992_93() {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [adjustments, setAdjustments] = useState([]);  // New state to hold adjustments data
  const [selectedPhoto, setSelectedPhoto] = useState(null); // for modal
  const [uploadedPhotos, setUploadedPhotos] = useState([
    '/images/1992_93_photo1.jpg',
    '/images/1992_93_photo2.jpg',
    '/images/1992_93_photo3.jpg',
    '/images/1992_93_photo4.jpg',
    '/images/1992_93_photo5.jpg',
    '/images/1992_93_photo6.jpg',
    '/images/1992_93_photo7.jpg',
    '/images/1992_93_photo8.jpg',
    '/images/1992_93_photo9.jpg',
  ]);
  const statLabels = {
    Points: 'Points',
    Rebounds: 'Rebounds'
  };

  useEffect(() => {
    async function fetchData() {
      const gamesRes = await fetch("/data/games.json");
      const statsRes = await fetch("/data/playergamestats.json");
      const playersRes = await fetch("/data/players.json");
      const adjustmentsRes = await fetch("/data/adjustments.json"); // Fetch the adjustments.json file
      const gamesData = await gamesRes.json();
      const statsData = await statsRes.json();
      const playersData = await playersRes.json();
      const adjustmentsData = await adjustmentsRes.json(); // Store adjustments data

      // Set the data
      setGames(gamesData.filter(g => g.Season === 1992));
      setPlayers(playersData);
      setAdjustments(adjustmentsData);

      // Aggregate stats for each player for the 1992 season
      const totals = {};
      statsData.filter(s => {
        const game = gamesData.find(g => g.GameID === s.GameID);
        return game && game.Season === 1992;
      }).forEach(stat => {
        if (!totals[stat.PlayerID]) {
          totals[stat.PlayerID] = { PlayerID: stat.PlayerID, Points: 0, Rebounds: 0 };
        }

        totals[stat.PlayerID].Points += stat.Points || 0;
        totals[stat.PlayerID].Rebounds += stat.Rebounds || 0;
      });

      // Apply adjustments to the player stats
      adjustmentsData.forEach(adjustment => {
        if (totals[adjustment.PlayerID]) {
          totals[adjustment.PlayerID].Points += adjustment.Points || 0;
          totals[adjustment.PlayerID].Rebounds += adjustment.Rebounds || 0;
        }
      });

      // Set the aggregated stats including adjustments
      setPlayerStats(totals);
    }

    fetchData();
  }, []);

  const getPlayerName = (id) => {
    const player = players.find(p => p.PlayerID === id);
    return player ? `${player.FirstName} ${player.LastName}` : 'Unknown Player';
  };

  // Sort the player stats by Points in descending order
  const sortedPlayerStats = Object.values(playerStats).sort((a, b) => b.Points - a.Points);

  // Handle file upload
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(file => URL.createObjectURL(file));  // Convert files to image URLs
    setUploadedPhotos(prev => [...prev, ...newPhotos]); // Add new uploaded photos to the existing ones
  };

  return (
    <div className="bg-gray-100 p-8 rounded-lg shadow-md max-w-6xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold text-center mb-4">1992-93 Season Recap</h1>

      {/* Section 0: Photo Collage */}
      {uploadedPhotos.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">📸 Team Photos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {uploadedPhotos.map((src, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPhoto(src)}
                className="relative overflow-hidden rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <img
                  src={src}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover aspect-[4/3] sm:aspect-[3/2] md:aspect-[1/1] transition-transform duration-300 hover:scale-105"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section 1: Season Schedule & Results */}
      <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4 whitespace-nowrap">
        📅 Season Schedule & Results
      </h2>
       <div className="overflow-x-auto px-1">
        <div className="bg-white rounded-lg shadow p-4">
          <table className="w-full border text-center text-xs sm:text-sm md:text-base">
            <thead>
              <tr>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Opponent</th>
                <th className="border px-2 py-1">Location</th>
                <th className="border px-2 py-1">Result</th>
                <th className="border px-2 py-1">Score</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{new Date(game.Date).toLocaleDateString()}</td>
                  <td className="border px-2 py-1">{game.Opponent}</td>
                  <td className="border px-2 py-1">{game.LocationType}</td>
                  <td className="border px-2 py-1">{game.Result}</td>
                  <td className="border px-2 py-1 whitespace-nowrap">{game.TeamScore} - {game.OpponentScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Player Totals for Points and Rebounds */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">🏀 Player Totals (Points & Rebounds)</h2>
        <div className="overflow-x-auto px-1">
          <div className="bg-white rounded-lg shadow p-4 max-w-2xl mx-auto">
            <table className="table-auto text-center text-xs sm:text-sm md:text-base w-full">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Player</th>
                  <th className="border px-2 py-1">Points</th>
                  <th className="border px-2 py-1">Rebounds</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayerStats.map((stat, idx) => {
                  const playerName = getPlayerName(stat.PlayerID);
                  return (
                    <tr key={idx}>
                      <td className="border px-2 py-1">{playerName}</td>
                      <td className="border px-2 py-1">{stat.Points}</td>
                      <td className="border px-2 py-1">
                        {stat.Rebounds === 0 ? '-' : stat.Rebounds}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      {/* Section 3: Photo Upload */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">📸 Upload Your Photos</h2>
      <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="block mb-4" />
      <p className="text-sm text-gray-600">
        Submitted photos will be reviewed before inclusion in the team’s online photobook.
      </p>
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center px-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()} // Prevent closing on image click
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-2 right-2 text-white text-3xl font-bold z-10"
              aria-label="Close"
            >
              &times;
            </button>
              <img
                src={selectedPhoto}
                alt="Full Size"
                className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-lg mx-auto"
              />
          </div>
        </div>
      )}
    </div>
  );
}

export default Season1992_93;
