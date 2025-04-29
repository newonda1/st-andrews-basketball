import React, { useEffect, useState } from "react";

function CareerRecords() {
  const [careerStats, setCareerStats] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const statsRes = await fetch("/data/playergamestats.json");
      const playersRes = await fetch("/data/players.json");
      const statsData = await statsRes.json();
      const playersData = await playersRes.json();

      // Create a map to accumulate career totals
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
          };
        }
        playerTotals[playerId].Points += stat.Points || 0;
        playerTotals[playerId].Rebounds += stat.Rebounds || 0;
        playerTotals[playerId].Assists += stat.Assists || 0;
        playerTotals[playerId].Steals += stat.Steals || 0;
        playerTotals[playerId].Blocks += stat.Blocks || 0;
        playerTotals[playerId].GamesPlayed += 1;
      });

      // Merge player names
      const fullCareerStats = Object.values(playerTotals).map(player => {
        const playerInfo = playersData.find(p => p.PlayerID === player.PlayerID);
        return {
          ...player,
          Name: playerInfo ? `${playerInfo.FirstName} ${playerInfo.LastName}` : "Unknown Player",
          GradYear: playerInfo ? playerInfo.GradYear : "Unknown",
        };
      });

      // Sort by total points scored
      fullCareerStats.sort((a, b) => b.Points - a.Points);

      setCareerStats(fullCareerStats);
    }

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Career Records</h1>
      <table className="w-full table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Player</th>
            <th className="px-4 py-2">Grad Year</th>
            <th className="px-4 py-2">Points</th>
            <th className="px-4 py-2">Rebounds</th>
            <th className="px-4 py-2">Assists</th>
            <th className="px-4 py-2">Steals</th>
            <th className="px-4 py-2">Blocks</th>
            <th className="px-4 py-2">Games Played</th>
          </tr>
        </thead>
        <tbody>
          {careerStats.map((player, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">{player.Name}</td>
              <td className="px-4 py-2 text-center">{player.GradYear}</td>
              <td className="px-4 py-2 text-center">{player.Points}</td>
              <td className="px-4 py-2 text-center">{player.Rebounds}</td>
              <td className="px-4 py-2 text-center">{player.Assists}</td>
              <td className="px-4 py-2 text-center">{player.Steals}</td>
              <td className="px-4 py-2 text-center">{player.Blocks}</td>
              <td className="px-4 py-2 text-center">{player.GamesPlayed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CareerRecords;
