
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
      <h1 className="text-3xl font-bold text-center mb-4">2023–24 Season Recap</h1>

<p className="text-lg leading-relaxed space-y-4 text-justify">
  The 2023–24 St. Andrew’s basketball season was a campaign defined by <strong>perseverance, growth, and grit</strong>. 
  Under the leadership of <strong>Coach Mel Abrams Jr.</strong>, the Lions weathered early adversity, rallied through a dominant region performance, 
  and came within seconds of reaching the state championship for a third consecutive year — ultimately falling in heartbreaking fashion in the <strong>state semifinal</strong>.
</p>

<p className="text-lg leading-relaxed space-y-4 text-justify">
  After graduating a core of veteran players, the Lions entered the season with a blend of returning talent and emerging contributors. 
  The transition wasn’t seamless though. The team lost <strong>three of its first four games</strong> and sat at <strong>7–7</strong> midway through the season, 
  searching for rhythm and consistency. But as region play began, the Lions refocused, rediscovered their identity, and <strong>reeled off 15 straight wins</strong>, 
  sweeping all 8 regular season region games and claiming their <strong>third consecutive region tournament title</strong>.
</p>

<p className="text-lg leading-relaxed space-y-4 text-justify">
  Throughout the ups and downs, <strong>junior guard Zayden Edwards</strong> remained the team’s steady anchor. 
  His two-way dominance, highlighted by scoring bursts and lockdown defense, earned him a reputation as one of the most feared players in the region. 
  He surpassed <strong>1,000 career points</strong>, finished the season with multiple 30-point games, and consistently delivered in the clutch.
</p>

<p className="text-lg leading-relaxed space-y-4 text-justify">
  Joining him in the backcourt was <strong>senior Will Thompson</strong>, who lit up defenses with his perimeter shooting and 
  broke the school’s all-time record for <strong>three-pointers in a season</strong>. 
  He finished the year with over 100 made threes and was a constant threat to opposing defenses. 
  Meanwhile, <strong>point guard Jaylen Sheppard</strong> orchestrated the offense with poise and precision, notching a <strong>triple-double</strong> 
  during region play and surpassing the school’s <strong>single-season assist record with 139</strong>.
</p>

<p className="text-lg leading-relaxed space-y-4 text-justify">
  Other key contributors included <strong>RaKari Harrison</strong>, a force in the paint on both ends of the court, known for his rebounding tenacity and timely scoring. While <strong>Amari Cook</strong> and <strong>Richaard Williams</strong> provided energy off the bench and <strong>Rhys Baillie</strong> capped off his senior year with his <strong>career-high 25-point performance</strong> in a win over Pinewood.
</p>

<p className="text-lg leading-relaxed space-y-4 text-justify">
  The regular season featured several signature wins. A <strong>buzzer-beater by Zayden Edwards</strong> stunned Savannah High, capping off a thrilling <strong>51–50 road win</strong>. 
  In the region semifinals, the Lions cruised past Pinewood Christian by nearly 40 points before capturing the region title in dominant fashion 
  with a <strong>67–42 win over Frederica Academy</strong>, marking their <strong>30th consecutive region win</strong>, a streak that extended over <strong>three full seasons</strong>.
</p>

<p className="text-lg leading-relaxed space-y-4 text-justify">
  In the state playoffs, the Lions continued their run, eventually meeting <strong>Lakeview Academy</strong> in the <strong>Final Four</strong>. 
  The game was close throughout and included scores of <strong>25-25</strong> at halftime, <strong>50-50</strong> at the end of regulation, and <strong>54-54</strong> 
  with 5 seconds left in overtime. However, the Lions fell just short as Lakeview converted a contested layup as time expired to seal the victory. 
  The defeat ended St. Andrew’s quest for a <strong>third straight state championship</strong>, but not before the team had further cemented its place among the program’s elite eras.
</p>

<p className="text-lg leading-relaxed space-y-4 text-justify">
  In every sense, the 2023–24 season was a testament to <strong>resilience and belief</strong> as the team overcame a rocky start, grew stronger with every game, 
  and battled their way to the brink of another championship appearance. 
  The players’ dedication and chemistry continued to add to the foundation of the program being built by Coach Abrams and added another proud chapter to the tradition of St. Andrew’s basketball.
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
