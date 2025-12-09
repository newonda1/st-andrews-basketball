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
    "Blocks",
  ];

  const statLabels = {
    Points: "Points",
    Rebounds: "Rebounds",
    Assists: "Assists",
    Steals: "Steals",
    TwoPM: "2-Point FGs",
    ThreePM: "3-Point FGs",
    FTM: "Free Throws",
    Blocks: "Blocks",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playerStatsRes, playersRes, gamesRes] = await Promise.all([
          fetch("/data/boys/basketball/playergamestats.json"),
          fetch("/data/boys/basketball/players.json"),
          fetch("/data/boys/basketball/games.json"),
        ]);

        const [playerStatsData, playersData, gamesData] = await Promise.all([
          playerStatsRes.json(),
          playersRes.json(),
          gamesRes.json(),
        ]);

        setPlayerStats(playerStatsData);
        setPlayers(playersData);
        setGames(gamesData);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (playerStats.length && players.length && games.length) {
      const playerMap = new Map(
        players.map((p) => [p.PlayerID, `${p.FirstName} ${p.LastName}`])
      );
      const gameMap = new Map(
        games.map((g) => [g.GameID, { Opponent: g.Opponent, Date: g.Date }])
      );

      const recordsByStat = {};

      statCategories.forEach((stat) => {
        let topValue = -Infinity;
        let topRecords = [];

        playerStats.forEach((entry) => {
          const playerName = playerMap.get(entry.PlayerID) || "Unknown Player";
          const gameInfo = gameMap.get(entry.GameID) || {
            Opponent: "Unknown Opponent",
            Date: null,
          };

          const statValue = Number(entry[stat]) || 0;

          if (statValue > topValue && statValue > 0) {
            topValue = statValue;
            topRecords = [
              {
                statValue,
                playerName,
                ...gameInfo,
              },
            ];
          } else if (statValue === topValue && statValue > 0) {
            topRecords.push({
              statValue,
              playerName,
              ...gameInfo,
            });
          }
        });

        recordsByStat[stat] = topRecords;
      });

      setTopRecordsByStat(recordsByStat);
    }
  }, [playerStats, players, games]);

  const formatDate = (ms) => {
    if (!ms) return "";
    const date = new Date(ms);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-10 px-4">
      <h1 className="text-2xl font-bold text-center">
        Single-Game Records (Boys)
      </h1>

      <div className="space-y-6">
        {statCategories.map((stat) => {
          const records = topRecordsByStat[stat] || [];

          return (
            <div key={stat} className="border rounded-lg shadow-sm bg-white">
              <div className="bg-gray-200 px-4 py-2 font-semibold text-left">
                {statLabels[stat]}
              </div>
              <div className="p-4">
                {records.length === 0 ? (
                  <p className="text-gray-600 text-sm">
                    No records available for this stat yet.
                  </p>
                ) : (
                  <table className="min-w-full text-sm text-center">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-2 py-1">Value</th>
                        <th className="px-2 py-1">Player</th>
                        <th className="px-2 py-1">Opponent</th>
                        <th className="px-2 py-1">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-2 py-1">{record.statValue}</td>
                          <td className="px-2 py-1">{record.playerName}</td>
                          <td className="px-2 py-1">{record.Opponent}</td>
                          <td className="px-2 py-1">
                            {formatDate(record.Date)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SingleGameRecords;
