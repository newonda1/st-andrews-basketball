
import React, { useEffect, useState } from 'react';

function Season2023_24() {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [leadersByStat, setLeadersByStat] = useState({});
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const statLabels = {
    Points: 'Points',
    Rebounds: 'Rebounds',
    Assists: 'Assists',
    Steals: 'Steals',
    Blocks: 'Blocks',
    ThreePM: '3-pointers made',
    TwoPM: '2-pointers made',
    FTPercentage: 'Free Throw %'
  };

  useEffect(() => {
    async function fetchData() {
      const gamesRes = await fetch("/data/games.json");
      const statsRes = await fetch("/data/playergamestats.json");
      const playersRes = await fetch("/data/players.json");
      const gamesData = await gamesRes.json();
      const statsData = await statsRes.json();
      const playersData = await playersRes.json();

      setGames(gamesData.filter(g => g.Season === 2023));
      setPlayerStats(statsData.filter(s => {
        const game = gamesData.find(g => g.GameID === s.GameID);
        return game && game.Season === 2023;
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
      let allPlayers = Object.values(totals);

      if (isPercent && statName === 'FTM') {
        allPlayers = allPlayers.filter(p => p.FTA >= 25);
      }

      return allPlayers
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
  };

  return (
    <div className="bg-gray-100 p-8 rounded-lg shadow-md max-w-6xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold text-center mb-4">2023-24 Season Recap</h1>
      <p className="text-lg leading-relaxed space-y-4 text-justify">
        The 2023–24 St. Andrew’s basketball season was a campaign defined by growth, grit, and thrilling highs. Under the direction of Coach Mel Abrams Jr., the Lions captured their third straight region championship and returned to the state semifinals for the second consecutive year, coming just seconds away from advancing to the title game.
      </p>
      <p className="text-lg leading-relaxed space-y-4 text-justify">
        The Lions kicked off the year with high expectations, bolstered by a deep returning core and the leadership of standout juniors and seniors. Wins against strong non-region opponents set the tone early. The team showed poise in close games and firepower in decisive victories, including a dominant win over Portal and a thrilling overtime comeback against GISA rival Pinewood.
      </p>
      <p className="text-lg leading-relaxed space-y-4 text-justify">
        Region play brought out the team’s identity. Behind strong performances from key players like Zayden Edwards, Ja’Cari Glover, and Amari Cook, the Lions went unbeaten in region play, extending their region winning streak to 29 games by season’s end. Each matchup showed off the Lions’ signature pressure defense, fast-paced offense, and ability to adapt and close out games.
      </p>
      <p className="text-lg leading-relaxed space-y-4 text-justify">
        In the postseason, St. Andrew’s fought its way to the Final Four. In a back-and-forth semifinal clash against Lakeview Academy, the teams were tied at halftime (25–25), at the end of regulation (50–50), and again in overtime (54–54) with five seconds to go. In heartbreaking fashion, Lakeview scored a layup at the buzzer to end the Lions’ season just short of the championship game.
      </p>
      <p className="text-lg leading-relaxed space-y-4 text-justify">
        Despite the disappointing finish, the season cemented the Lions as one of the top programs in the state. They showed championship-level character, competed with heart every night, and laid the groundwork for future success with a strong returning group.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">🏅 Season Leaders</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(leadersByStat).map(([statName, topPlayers]) => (
          <div key={statName} className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold mb-2 text-center">{statLabels[statName]}</h3>
            <table className="w-full text-sm text-center">
              <thead>
                <tr>
                  <th className="border p-1">Player</th>
                  <th className="border p-1">{statLabels[statName]}</th>
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
            {statName === 'FTPercentage' && (
              <p className="text-xs text-gray-500 text-center italic mt-1">
                Minimum of 25 FT attempts
              </p>
            )}
          </div>
        ))}
      </div>

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

export default Season2023_24;
