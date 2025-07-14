import React, { useEffect, useState } from "react";

function SeasonRecords() {
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

        // Group by (PlayerID, Season)
        const seasonTotals = {};

        playerStatsData.forEach((entry) => {
          const game = gamesData.find(
            (g) => String(g.GameID) === String(entry.GameID)
          );
          if (!game || !game.Season) return;

          const seasonKey = `${entry.PlayerID}_${game.Season}`;

          if (!seasonTotals[seasonKey]) {
            seasonTotals[seasonKey] = {
              PlayerID: entry.PlayerID,
              Season: game.Season,
              ...Object.fromEntries(statCategories.map((stat) => [stat, 0])),
            };
          }

          statCategories.forEach((stat) => {
            if (entry[stat] !== undefined && entry[stat] !== null) {
              seasonTotals[seasonKey][stat] += entry[stat];
            }
          });
        });

        const result = {};

        statCategories.forEach((stat) => {
          const sorted = Object.values(seasonTotals)
            .filter((record) => record[stat] > 0)
            .sort((a, b) => b[stat] - a[stat])
            .slice(0, 10);

          const detailed = sorted.map((record) => {
            const player = playersData.find(
              (p) => String(p.PlayerID) === String(record.PlayerID)
            );

            return {
              value: record[stat],
              playerName: player
                ? `${player.FirstName} ${player.LastName}`
                : "Unknown Player",
              season: record.Season || "Unknown Season",
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
      <h1 className="text-3xl font-bold mb-6">Single Season Records</h1>
      {statCategories.map((stat) => (
        <div key={stat} className="mb-10">
          <h2 className="text-xl font-semibold mb-2">{stat}</h2>
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Value</th>
                <th className="p-2 text-left">Player</th>
                <th className="p-2 text-left">Season</th>
              </tr>
            </thead>
            <tbody>
              {(topRecordsByStat[stat] || []).map((record, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2">{record.value}</td>
                  <td className="p-2">{record.playerName}</td>
                  <td className="p-2">{record.season}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default SeasonRecords;
