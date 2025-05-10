import React, { useEffect, useState } from 'react';

function Season2024_25() {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [leadersByStat, setLeadersByStat] = useState({});
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const gamesRes = await fetch("/data/games.json");
      const statsRes = await fetch("/data/playergamestats.json");
      const playersRes = await fetch("/data/players.json");
      const gamesData = await gamesRes.json();
      const statsData = await statsRes.json();
      const playersData = await playersRes.json();

      setGames(gamesData.filter(g => g.Season === 2024));
      setPlayerStats(statsData.filter(s => {
        const game = gamesData.find(g => g.GameID === s.GameID);
        return game && game.Season === 2024;
      }));
      setPlayers(playersData);
    }

    fetchData();
  }, []);

  useEffect(() => {
    const totals = {};
    playerStats.forEach(stat => {
      if (!totals[stat.PlayerID]) {
        totals[stat.PlayerID] = { ...stat, GamesPlayed: 1 };
      } else {
        totals[stat.PlayerID].Points += stat.Points || 0;
        totals[stat.PlayerID].Rebounds += stat.Rebounds || 0;
        totals[stat.PlayerID].Assists += stat.Assists || 0;
        totals[stat.PlayerID].Steals += stat.Steals || 0;
        totals[stat.PlayerID].Blocks += stat.Blocks || 0;
        totals[stat.PlayerID].ThreePM += stat.ThreePM || 0;
        totals[stat.PlayerID].TwoPM += stat.TwoPM || 0;
        totals[stat.PlayerID].FTM += stat.FTM || 0;
        totals[stat.PlayerID].FTA += stat.FTA || 0;
        totals[stat.PlayerID].GamesPlayed += 1;
      }
    });

    const calculateFTPercent = (player) =>
      player.FTA > 0 ? (player.FTM / player.FTA) * 100 : 0;

    const sortAndTakeTop3 = (statName, isPercent = false) => {
      return Object.values(totals)
        .map(p => ({
          ...p,
          StatValue: isPercent ? calculateFTPercent(p) : p[statName]
        }))
        .sort((a, b) => b.StatValue - a.StatValue)
        .slice(0, 3);
    };

    const stats = {
      Points: sortAndTakeTop3('Points'),
      Rebounds: sortAndTakeTop3('Rebounds'),
      Assists: sortAndTakeTop3('Assists'),
      Steals: sortAndTakeTop3('Steals'),
      Blocks: sortAndTakeTop3('Blocks'),
      ThreePM: sortAndTakeTop3('ThreePM'),
      TwoPM: sortAndTakeTop3('TwoPM'),
      FTPercentage: sortAndTakeTop3('FTM', true)
    };

    setLeadersByStat(stats);
  }, [playerStats]);

  const getPlayerName = (id) => {
    const player = players.find(p => p.PlayerID === id);
    return player ? `${player.FirstName} ${player.LastName}` : 'Unknown Player';
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(file => URL.createObjectURL(file));
    setUploadedPhotos(prev => [...prev, ...newPhotos]);
    // TODO: send to backend or storage if needed
  };

  return (
    <div className="p-8 space-y-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4">2024-25 Season Recap</h1>
      <p className="text-lg leading-relaxed">
        The 2024-25 season was one for the record books, culminating in a thrilling state championship
        victory under Coach Mel Abrams Jr. The team faced tough competition but held strong,
        finishing as Region Champions and capturing the state title as a #2 seed.
        Key wins included the opening night battle against Hampton High (46-37), and a dominant
        performance in the region final. Freshman sensation MJ Scott made headlines with standout defensive plays,
        while veteran leadership from the senior class carried the team through close contests.
        This season cemented the program’s legacy as a perennial powerhouse.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">🏅 Season Leaders</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(leadersByStat).map(([statName, topPlayers]) => (
          <div key={statName} className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold mb-2 text-center">{statName}</h3>
            <table className="w-full text-sm text-center">
              <thead>
                <tr>
                  <th className="border p-1">Player</th>
                  <th className="border p-1">{statName}</th>
                </tr>
              </thead>
              <tbody>
                {topPlayers.map((p, idx) => (
                  <tr key={idx}>
                    <td className="border p-1">{getPlayerName(p.PlayerID)}</td>
                    <td className="border p-1">
                      {statName === 'FTPercentage'
                        ? `${p.StatValue.toFixed(1)}%`
                        : p.StatValue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">📅 Season Schedule & Results</h2>
      <table className="w-full border text-center text-sm md:text-base">
        <thead>
          <tr>
            <th className="border p-2">Date</th>
            <th className="border p-2">Opponent</th>
            <th className="border p-2">Location</th>
            <th className="border p-2">Result</th>
            <th className="border p-2">Score</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game, idx) => (
            <tr key={idx}>
              <td className="border p-2">{new Date(game.Date).toLocaleDateString()}</td>
              <td className="border p-2">{game.Opponent}</td>
              <td className="border p-2">{game.LocationType}</td>
              <td className="border p-2">{game.Result}</td>
              <td className="border p-2">{game.TeamScore} - {game.OpponentScore}</td>
            </tr>
          ))}
        </tbody>
      </table>

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

export default Season2024_25;
