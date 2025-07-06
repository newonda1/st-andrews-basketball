import React, { useEffect, useState } from "react";

function CareerRecords() {
  const [careerStats, setCareerStats] = useState([]);
  const [sortField, setSortField] = useState('Points'); // Default sort
  const [sortDirection, setSortDirection] = useState('desc'); // desc = highest first

  useEffect(() => {
    async function fetchData() {
      const [statsRes, adjustmentsRes, playersRes] = await Promise.all([
        fetch("/data/playergamestats.json"),
        fetch("/data/adjustments.json"),
        fetch("/data/players.json")
      ]);

      const [statsData, adjustmentsData, playersData] = await Promise.all([
        statsRes.json(),
        adjustmentsRes.json(),
        playersRes.json()
      ]);

      const combinedStats = [...statsData, ...adjustmentsData];

      const playerTotals = {};

      combinedStats.forEach(stat => {
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
          ThreePPercentage: player.ThreePA > 0 ? (player.ThreePM / player.ThreePA) * 100 : 0,
          TwoPPercentage: player.TwoPA > 0 ? (player.TwoPM / player.TwoPA) * 100 : 0,
          FTPercentage: player.FTA > 0 ? (player.FTM / player.FTA) * 100 : 0,
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
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Full Career Stats</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm md:text-base table-auto whitespace-nowrap">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white px-2 py-1 text-left">Player</th>
              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort('GradYear')}>Grad Year{sortField === 'GradYear' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort('Points')}>Points{sortField === 'Points' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort('Rebounds')}>Rebounds{sortField === 'Rebounds' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort('Assists')}>Assists{sortField === 'Assists' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort('Steals')}>Steals{sortField === 'Steals' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort('Blocks')}>Blocks{sortField === 'Blocks' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort('GamesPlayed')}>Games Played{sortField === 'GamesPlayed' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort('ThreePM')}>3PM{sortField === 'ThreePM' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort('ThreePA')}>3PA{sortField === 'ThreePA' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort('ThreePPercentage')}>3P%{sortField === 'ThreePPercentage' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort('TwoPM')}>2PM{sortField === 'TwoPM' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort('TwoPA')}>2PA{sortField === 'TwoPA' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort('TwoPPercentage')}>2P%{sortField === 'TwoPPercentage' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort('FTM')}>FTM{sortField === 'FTM' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort('FTA')}>FTA{sortField === 'FTA' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
              <th className="px-2 py-1 cursor-pointer" onClick={() => handleSort('FTPercentage')}>FT%{sortField === 'FTPercentage' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedStats.map((player, index) => (
              <tr key={index} className="border-t odd:bg-white even:bg-gray-100">
                <td className="sticky left-0 z-0 px-2 py-1 bg-inherit">{player.Name}</td>
                <td className="px-2 py-1 text-center">{player.GradYear}</td>
                <td className="px-2 py-1 text-center">{player.Points}</td>
                <td className="px-2 py-1 text-center">{player.Rebounds}</td>
                <td className="px-2 py-1 text-center">{player.Assists}</td>
                <td className="px-2 py-1 text-center">{player.Steals}</td>
                <td className="px-2 py-1 text-center">{player.Blocks}</td>
                <td className="px-2 py-1 text-center">{player.GamesPlayed}</td>
                <td className="px-2 py-1 text-center">{player.ThreePM}</td>
                <td className="px-2 py-1 text-center">{player.ThreePA}</td>
                <td className="px-2 py-1 text-center">
                  {player.ThreePA > 0 ? ((player.ThreePM / player.ThreePA) * 100).toFixed(1) + "%" : "—"}
                </td>
                <td className="px-2 py-1 text-center">{player.TwoPM}</td>
                <td className="px-2 py-1 text-center">{player.TwoPA}</td>
                <td className="px-2 py-1 text-center">
                  {player.TwoPA > 0 ? ((player.TwoPM / player.TwoPA) * 100).toFixed(1) + "%" : "—"}
                </td>
                <td className="px-2 py-1 text-center">{player.FTM}</td>
                <td className="px-2 py-1 text-center">{player.FTA}</td>
                <td className="px-2 py-1 text-center">
                  {player.FTA > 0 ? ((player.FTM / player.FTA) * 100).toFixed(1) + "%" : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CareerRecords;
