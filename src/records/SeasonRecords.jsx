import React, { useEffect, useState } from "react";

function SeasonRecords() {
  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
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

  const formatSeason = (season) => {
    if (!season || isNaN(season)) return "Unknown Season";
    const startYear = parseInt(season);
    const endYear = String((startYear + 1) % 100).padStart(2, "0");
    return `${startYear}-${endYear}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playerStatsRes, playersRes, gamesRes, adjustmentsRes] = await Promise.all([
          fetch("/data/playergamestats.json"),
          fetch("/data/players.json"),
          fetch("/data/games.json"),
          fetch("/data/adjustments.json"),
        ]);

        const [playerStatsData, playersData, gamesData, adjustmentsData] = await Promise.all([
          playerStatsRes.json(),
          playersRes.json(),
          gamesRes.json(),
          adjustmentsRes.json(),
        ]);

        setPlayers(playersData);
        setGames(gamesData);

        // Map GameID to Season
        const gameIdToSeason = Object.fromEntries(
          gamesData.map((g) => [String(g.GameID), g.Season])
        );

        // Combine regular stats and adjustments
        const allStats = [
          ...playerStatsData.map((entry) => ({
            ...entry,
            Season: gameIdToSeason[String(entry.GameID)] || null,
          })),
          ...adjustmentsData.map((entry) => ({
            ...entry,
            Season: entry.SeasonID,
          })),
        ];

        // Group and sum by (PlayerID, Season)
        const seasonTotals = {};

        allStats.forEach((entry) => {
          if (!entry.PlayerID || !entry.Season) return;

          const key = `${entry.PlayerID}_${entry.Season}`;

          if (!seasonTotals[key]) {
            seasonTotals[key] = {
              PlayerID: entry.PlayerID,
              Season: entry.Season,
              ...Object.fromEntries(statCategories.map((stat) => [stat, 0])),
            };
          }

          statCategories.forEach((stat) => {
            if (entry[stat] !== undefined && entry[stat] !== null) {
              seasonTotals[key][stat] += entry[stat];
            }
          });
        });

        // Sort and extract top 10 for each stat
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
              season: formatSeason(record.Season),
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
      {Object.entries(topRecordsByStat).map(([stat, records]) => (
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
              {records.map((record, index) => (
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
