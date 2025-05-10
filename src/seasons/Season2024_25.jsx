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
  };

  return (
    <div className="p-8 space-y-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4">2024-25 Season Recap</h1>
      <p className="text-lg leading-relaxed space-y-4">
        The 2024–25 St. Andrew’s basketball season was one of dominance, resilience, and redemption — a year that will be remembered as one of the most complete campaigns in school history. Under the leadership of Coach Mel Abrams Jr., the team navigated a demanding schedule with a mix of veteran poise and youthful energy, ultimately claiming the school’s <strong>sixth state championship</strong> — and their <strong>third in the last four seasons</strong>.

        After graduating a large senior class, the team returned with only <strong>two players who had varsity experience</strong>. Despite the inexperience, the Lions showed flashes of promise behind standout leadership from returning <strong>all-state player Zayden Edwards</strong>. With several freshmen and new contributors stepping into big roles, the team focused on building chemistry and laying the foundation for future success. Among the newcomers were <strong>Ja'Cari Roberts, Page Getter, MJ Scott, Miles Cummings,</strong> and <strong>Deshaud Singleton</strong> — all of whom became vital pieces of the team’s identity and success.

        From the outset, <strong>senior captains Zayden Edwards</strong> and <strong>Ja'Cari Roberts</strong> set the tone, anchoring the team with their leadership and all-around production. Zayden, the reigning all-state player of the year, was again a force on both ends of the floor, while Ja'Cari brought an unmatched competitive fire that elevated the team in crucial moments. Their composure and intensity were vital as the Lions surged to a fast start in region play.

        The regular season featured a number of memorable battles. One of the most emphatic came in a statement win over longtime rival <strong>Beach High</strong>, where St. Andrew’s dismantled the Bulldogs with suffocating defense and transition offense, building a 30-point lead by the third quarter. However, not every night went the Lions’ way. In what was arguably their most humbling moment, the team suffered a <strong>heartbreaking blowout loss to Benedictine</strong>, exposing vulnerabilities and forcing the group to regroup mentally and physically. That setback proved to be a turning point.

        One of the most thrilling wins of the season came in a <strong>nail-biting victory against Lakeview Academy</strong>, where the Lions escaped with a one-point win thanks to clutch free throws in the final seconds and a last-second defensive stand. The emotional rollercoaster of that game exemplified the team’s ability to grind through adversity and maintain composure under pressure.

        <strong>Freshman guard Page Getter</strong> emerged as one of the surprise breakout stars of the season, showing maturity beyond his years and becoming a steady presence in the backcourt. His confidence and clutch shooting earned him a starting role by midseason. <strong>Sophomore MJ Scott</strong> built on his promise from the previous year, turning into one of the team’s best perimeter defenders and consistently igniting the team with high-energy plays.

        Seniors <strong>Deshaud Singleton</strong> and <strong>Miles Cummings</strong> also played pivotal roles, providing depth, experience, and reliability in big moments. <strong>Junior Amari Cook</strong> elevated his game throughout the year, showcasing improved decision-making and scoring ability, particularly in key region matchups.

        By season’s end, the Lions had captured their <strong>fourth straight region championship</strong>, extending their unbeaten streak against region opponents to an astonishing <strong>40 consecutive wins</strong>. Their playoff run was a blend of confidence and execution, culminating in a dominant performance in the state final to secure the title.

        In every sense, the 2024–25 season was a testament to balance: a blend of seasoned leadership, emerging stars, and unwavering commitment to team success. The Lions not only defended their region supremacy but also added another banner to the rafters, further cementing St. Andrew’s as one of the premier basketball programs in the state.
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
