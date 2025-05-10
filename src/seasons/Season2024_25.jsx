import React, { useEffect, useState } from 'react';

function Season2024_25() {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [seasonLeaders, setSeasonLeaders] = useState({});
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
    // Calculate season leaders
    const totals = {};
    playerStats.forEach(stat => {
      if (!totals[stat.PlayerID]) {
        totals[stat.PlayerID] = { ...stat };
      } else {
        totals[stat.PlayerID].Points += stat.Points || 0;
        totals[stat.PlayerID].Rebounds += stat.Rebounds || 0;
        totals[stat.PlayerID].Assists += stat.Assists || 0;
        totals[stat.PlayerID].Steals += stat.Steals || 0;
        totals[stat.PlayerID].Blocks += stat.Blocks || 0;
      }
    });

    const leaderByStat = (statName) => {
      return Object.values(totals).reduce((max, player) =>
        (player[statName] > (max[statName] || 0) ? player : max), {});
    };

    const leaders = {
      Points: leaderByStat('Points'),
      Rebounds: leaderByStat('Rebounds'),
      Assists: leaderByStat('Assists'),
      Steals: leaderByStat('Steals'),
      Blocks: leaderByStat('Blocks'),
    };

    setSeasonLeaders(leaders);
  }, [playerStats]);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(file => URL.createObjectURL(file));
    setUploadedPhotos(prev => [...prev, ...newPhotos]);
    // TODO: Send to backend/storage for review
  };

  const getPlayerName = (id) => {
    const player = players.find(p => p.PlayerID === id);
    return player ? `${player.FirstName} ${player.LastName}` : 'Unknown Player';
  };

  return (
    <div className="p-8 space-y-10 max-w-4xl mx-auto">
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

      <h2 className="text-2xl font-semibold mt-8">🏅 Season Leaders</h2>
      <ul className="list-disc list-inside text-lg">
        <li>Points: {getPlayerName(seasonLeaders.Points?.PlayerID)} ({seasonLeaders.Points?.Points} pts)</li>
        <li>Rebounds: {getPlayerName(seasonLeaders.Rebounds?.PlayerID)} ({seasonLeaders.Rebounds?.Rebounds} reb)</li>
        <li>Assists: {getPlayerName(seasonLeaders.Assists?.PlayerID)} ({seasonLeaders.Assists?.Assists} ast)</li>
        <li>Steals: {getPlayerName(seasonLeaders.Steals?.PlayerID)} ({seasonLeaders.Steals?.Steals} stl)</li>
        <li>Blocks: {getPlayerName(seasonLeaders.Blocks?.PlayerID)} ({seasonLeaders.Blocks?.Blocks} blk)</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8">📅 Season Schedule & Results</h2>
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

      <h2 className="text-2xl font-semibold mt-8">📸 Upload Your Photos</h2>
      <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="block mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {uploadedPhotos.map((src, idx) => (
          <img key={idx} src={src} alt={`Uploaded ${idx}`} className="w-full h-auto rounded shadow" />
        ))}
      </div>
      <p className="text-sm text-gray-600">Submitted photos will be reviewed before inclusion in the team’s online photobook.</p>
    </div>
  );
}

export default Season2024_25;
