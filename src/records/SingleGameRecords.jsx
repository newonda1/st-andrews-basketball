import React, { useEffect, useState } from "react";

function SingleGameRecords() {
  const [records, setRecords] = useState([]);
  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [playerStatsRes, playersRes, gamesRes] = await Promise.all([
        fetch("/data/playergamestats.json"),
        fetch("/data/players.json"),
        fetch("/data/games.json"),
      ]);

      const [playerStatsData, playersData, gamesData] = await Promise.all([
        playerStatsRes.json(),
        playersRes.json(),
        gamesRes.json(),
      ]);

      setPlayerStats(playerStatsData);
      setPlayers(playersData);
      setGames(gamesData);

      const statCategories = ["points", "rebounds", "assists"];
      const topPerformances = [];

      statCategories.forEach((stat) => {
        const maxStat = Math.max(...playerStatsData.map((entry) => entry[stat] || 0));

        const topEntries = playerStatsData.filter((entry) => entry[stat] === maxStat);

        topEntries.forEach((entry) => {
          const player = playersData.find((p) => p.id === entry.playerID);
          const game = gamesData.find((g) => g.id === entry.gameID);

          topPerformances.push({
            stat,
            value: entry[stat],
            playerName: player ? player.name : "Unknown Player",
            opponent: game ? game.opponent : "Unknown Opponent",
            date: game ? game.date : "Unknown Date",
          });
        });
      });

      setRecords(topPerformances);
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Single Game Records</h1>
      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Stat</th>
            <th className="p-2 text-left">Value</th>
            <th className="p-2 text-left">Player</th>
            <th className="p-2 text-left">Opponent</th>
            <th className="p-2 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => (
            <tr key={index} className="border-t">
              <td className="p-2 capitalize">{record.stat}</td>
              <td className="p-2">{record.value}</td>
              <td className="p-2">{record.playerName}</td>
              <td className="p-2">{record.opponent}</td>
              <td className="p-2">{record.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SingleGameRecords;


