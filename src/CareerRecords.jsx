import React, { useEffect, useState } from "react";

function CareerRecords() {
  const [careerStats, setCareerStats] = useState([]);
  const [sortField, setSortField] = useState('Points'); // Default sort
  const [sortDirection, setSortDirection] = useState('desc'); // desc = highest first

  useEffect(() => {
    async function fetchData() {
      const statsRes = await fetch("/data/playergamestats.json");
      const playersRes = await fetch("/data/players.json");
      const statsData = await statsRes.json();
      const playersData = await playersRes.json();

      const playerTotals = {};

      statsData.forEach(stat => {
        const playerId = stat.PlayerID;
        if (!playerTotals[playerId]) {
          playerTotals[playerId] = {
            PlayerID: playerId,
            Points: 0,
            Rebounds: 0,
            Assists: 0,
            Steals: 0,
            Blocks: 0,
            GamesPlayed: 0,
            ThreePM: 0,
            ThreePA: 0,
            TwoPM: 0,
            TwoPA: 0,
            FTM: 0,
            FTA: 0,
          };
        }
        playerTotals[playerId].Points += stat.Points || 0;
        playerTotals[playerId].Rebounds += stat.Rebounds || 0;
        playerTotals[playerId].Assists += stat.Assists || 0;
        playerTotals[playerId].Steals += stat.Steals || 0;
        playerTotals[playerId].Blocks += stat.Blocks || 0;
        playerTotals[playerId].GamesPlayed += 1;
        playerTotals[playerId].ThreePM += stat.ThreePM || 0;
        playerTotals[playerId].ThreePA += stat.ThreePA || 0;
        playerTotals[playerId].TwoPM += stat.TwoPM || 0;
        playerTotals[playerId].TwoPA += stat.TwoPA || 0;
        playerTotals[playerId].FTM += stat.FTM || 0;
        playerTotals[playerId].FTA += stat.FTA || 0;
      });

      const fullCareerStats = Object.values(playerTotals).map(player => {
        const playerInfo = playersData.find(p => p.PlayerID === player.PlayerID);
        return {
          ...player,
          Name: playerInfo ? `${playerInfo.FirstName} ${playerInfo.LastName}` : "Unknown Player",
          GradYear: playerInfo ? playerInfo.GradYear : "Unknown",
        };
      });

      setCareerStats(fullCareerStats);
    }

    fetchData();
  }, []);

  // Sorting function
  const sortedStats = [...careerStats].sort((a, b) => {
    if (sortDirection === 'asc') {
      return (a[sortField] ?? 0) - (b[sortField] ?? 0);
    } else {
      return (b[sortField] ?? 0) - (a[sortField] ?? 0);
    }
  });

  const handleSort = (field) => {
    if (field === sortField) {
      // If clicking the same field, toggle ascending/descending
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // New field = start with descending
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Career Records</h1>
      <table className="w-full table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Player</th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('GradYear')}>Grad Year</th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('Points')}>Points</th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('Rebounds')}>Rebounds</th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('Assists')}>Assists</th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('Steals')}>Steals</th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('Blocks')}>Blocks</th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('GamesPlayed')}>Games Played</th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('3PM')}>3PM</th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('3PA')}>3PA</th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('ThreePM')}>3P%</th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('2PM')}>2PM</th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('2PA')}>2PA</th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('TwoPM')}>2P%</th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('FTM')}>FTM</th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('FTA')}>FTA</th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('FTM')}>FT%</th>
          </tr>
        </thead>
        <tbody>
          {sortedStats.map((player, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">{player.Name}</td>
              <td className="px-4 py-2 text-center">{player.GradYear}</td>
              <td className="px-4 py-2 text-center">{player.Points}</td>
              <td className="px-4 py-2 text-center">{player.Rebounds}</td>
              <td className="px-4 py-2 text-center">{player.Assists}</td>
              <td className="px-4 py-2 text-center">{player.Steals}</td>
              <td className="px-4 py-2 text-center">{player.Blocks}</td>
              <td className="px-4 py-2 text-center">{player.GamesPlayed}</td>
              <td className="px-4 py-2 text-center">{player.ThreePM}</td>
              <td className="px-4 py-2 text-center">{player.ThreePA}</td>
              <td className="px-4 py-2 text-center">
                {player.ThreePA > 0 ? ((player.ThreePM / player.ThreePA) * 100).toFixed(1) + "%" : "—"}
              </td>

              <td className="px-4 py-2 text-center">{player.TwoPM}</td>
              <td className="px-4 py-2 text-center">{player.TwoPA}</td>
              <td className="px-4 py-2 text-center">
                {player.TwoPA > 0 ? ((player.TwoPM / player.TwoPA) * 100).toFixed(1) + "%" : "—"}
              </td>
              <td className="px-4 py-2 text-center">{player.FTM}</td>
              <td className="px-4 py-2 text-center">{player.FTA}</td>
              <td className="px-4 py-2 text-center">
                {player.FTA > 0 ? ((player.FTM / player.FTA) * 100).toFixed(1) + "%" : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CareerRecords;
