import React, { useEffect, useState } from "react";

function SingleGameRecords() {
  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [topRecordsByStat, setTopRecordsByStat] = useState({});

  const statCategories = [
    "Points",
    "Rebounds",
    "Assists",
    "Steals",
    "TwoPM",
    "ThreePM",
    "FTM",
    "FTA",
  ];

  const formatDate = (ms) => {
    const date = new Date(ms);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
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

        const result = {};

        statCategories.forEach((stat) => {
          const sorted = [...playerStatsData]
            .filter((entry) => entry[stat] !== undefined && entry[stat] > 0)
            .sort((a, b) => b[stat] - a[stat])
            .slice(0, 5);

          const detailed = sorted.map((entry) => {
            const player = playersData.find(
              (p) => String(p.PlayerID) === String(entry.PlayerID)
            );
            const game = gamesData.find(
              (g) => String(g.GameID) === String(entry.GameID)
            );

            return {
              value: entry[stat],
              playerName: player ? `${player.FirstName} ${player.LastName}` : "Unknown Player",
              opponent: game ? game.Opponent : "Unknown Opponent",
              date: game ? formatDate(game.Date) : "Unknown Date",
            };
          });

          result[stat] = detailed;
        });

        setTopRecordsByStat(result);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Single Game Records</h1>
      {statCategories.map((stat) => (
        <div key={stat} className="mb-10">
          <h2 className="text-xl font-semibold mb-2">{stat}</h2>
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Value</th>
                <th className="p-2 text-left">Player</th>
                <th className="p-2 text-left">Opponent</th>
                <th className="p-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {(topRecordsByStat[stat] || []).map((record, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2">{record.value}</td>
                  <td className="p-2">{record.playerName}</td>
                  <td className="p-2">{record.opponent}</td>
                  <td className="p-2">{record.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default SingleGameRecords;
