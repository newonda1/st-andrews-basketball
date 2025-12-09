import React, { useEffect, useState } from "react";

function FullCareerStats() {
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [careerTotals, setCareerTotals] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "Points",
    direction: "desc",
  });

  useEffect(() => {
    Promise.all([
      fetch("/data/boys/basketball/playergamestats.json").then((res) =>
        res.json()
      ),
      fetch("/data/boys/basketball/players.json").then((res) => res.json()),
    ])
      .then(([playerStatsData, playersData]) => {
        setPlayerStats(playerStatsData);
        setPlayers(playersData);
      })
      .catch((err) => console.error("Failed to load data:", err));
  }, []);

  useEffect(() => {
    if (playerStats.length && players.length) {
      const careerMap = {};

      playerStats.forEach((game) => {
        const id = game.PlayerID;

        if (!careerMap[id]) {
          careerMap[id] = {
            PlayerID: id,
            GamesPlayed: 0,
            Points: 0,
            Rebounds: 0,
            Assists: 0,
            Steals: 0,
            Blocks: 0,
            Turnovers: 0,
            TwoPM: 0,
            TwoPA: 0,
            ThreePM: 0,
            ThreePA: 0,
            FTM: 0,
            FTA: 0,
          };
        }

        const entry = careerMap[id];

        if (game.MinutesPlayed != null && game.MinutesPlayed > 0) {
          entry.GamesPlayed += 1;
        }

        entry.Points += game.Points || 0;
        entry.Rebounds += game.Rebounds || 0;
        entry.Assists += game.Assists || 0;
        entry.Steals += game.Steals || 0;
        entry.Blocks += game.Blocks || 0;
        entry.Turnovers += game.Turnovers || 0;
        entry.TwoPM += game.TwoPM || 0;
        entry.TwoPA += game.TwoPA || 0;
        entry.ThreePM += game.ThreePM || 0;
        entry.ThreePA += game.ThreePA || 0;
        entry.FTM += game.FTM || 0;
        entry.FTA += game.FTA || 0;
      });

      const merged = Object.values(careerMap).map((totals) => {
        const player = players.find((p) => p.PlayerID === totals.PlayerID);
        const gamesPlayed = totals.GamesPlayed || 0;

        const twoPtPct =
          totals.TwoPA > 0 ? (totals.TwoPM / totals.TwoPA) * 100 : null;
        const threePtPct =
          totals.ThreePA > 0 ? (totals.ThreePM / totals.ThreePA) * 100 : null;
        const ftPct =
          totals.FTA > 0 ? (totals.FTM / totals.FTA) * 100 : null;

        return {
          ...totals,
          Name: player ? `${player.FirstName} ${player.LastName}` : "Unknown",
          TwoPtPct: twoPtPct,
          ThreePtPct: threePtPct,
          FTPct: ftPct,
          PPG: gamesPlayed > 0 ? totals.Points / gamesPlayed : 0,
          RPG: gamesPlayed > 0 ? totals.Rebounds / gamesPlayed : 0,
          APG: gamesPlayed > 0 ? totals.Assists / gamesPlayed : 0,
          SPG: gamesPlayed > 0 ? totals.Steals / gamesPlayed : 0,
          BPG: gamesPlayed > 0 ? totals.Blocks / gamesPlayed : 0,
          TPG: gamesPlayed > 0 ? totals.Turnovers / gamesPlayed : 0,
        };
      });

      setCareerTotals(merged);
    }
  }, [playerStats, players]);

  const sortData = (data) => {
    const sorted = [...data];
    sorted.sort((a, b) => {
      const { key, direction } = sortConfig;
      let valA = a[key];
      let valB = b[key];

      if (valA == null) valA = -Infinity;
      if (valB == null) valB = -Infinity;

      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? "▲" : "▼";
  };

  const formatNumber = (value, decimals = 1) =>
    value != null ? value.toFixed(decimals) : "–";

  const sortedTotals = sortData(careerTotals);

  return (
    <div className="space-y-6 px-4">
      <h1 className="text-2xl font-bold text-center">Career Stats (Boys)</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-xs border text-center">
          <thead className="bg-gray-200 font-bold">
            <tr>
              <th className="border px-2 py-1">Player</th>
              <th
                className="border px-2 py-1 cursor-pointer"
                onClick={() => handleSort("GamesPlayed")}
              >
                GP {getSortIndicator("GamesPlayed")}
              </th>
              <th
                className="border px-2 py-1 cursor-pointer"
                onClick={() => handleSort("Points")}
              >
                PTS {getSortIndicator("Points")}
              </th>
              <th
                className="border px-2 py-1 cursor-pointer"
                onClick={() => handleSort("PPG")}
              >
                PPG {getSortIndicator("PPG")}
              </th>
              <th
                className="border px-2 py-1 cursor-pointer"
                onClick={() => handleSort("Rebounds")}
              >
                REB {getSortIndicator("Rebounds")}
              </th>
              <th
                className="border px-2 py-1 cursor-pointer"
                onClick={() => handleSort("RPG")}
              >
                RPG {getSortIndicator("RPG")}
              </th>
              <th
                className="border px-2 py-1 cursor-pointer"
                onClick={() => handleSort("Assists")}
              >
                AST {getSortIndicator("Assists")}
              </th>
              <th
                className="border px-2 py-1 cursor-pointer"
                onClick={() => handleSort("APG")}
              >
                APG {getSortIndicator("APG")}
              </th>
              <th className="border px-2 py-1">STL</th>
              <th className="border px-2 py-1">SPG</th>
              <th className="border px-2 py-1">BLK</th>
              <th className="border px-2 py-1">BPG</th>
              <th className="border px-2 py-1">TOV</th>
              <th className="border px-2 py-1">TPG</th>
              <th className="border px-2 py-1">2PM</th>
              <th className="border px-2 py-1">2PA</th>
              <th className="border px-2 py-1">2P%</th>
              <th className="border px-2 py-1">3PM</th>
              <th className="border px-2 py-1">3PA</th>
              <th className="border px-2 py-1">3P%</th>
              <th className="border px-2 py-1">FTM</th>
              <th className="border px-2 py-1">FTA</th>
              <th className="border px-2 py-1">FT%</th>
            </tr>
          </thead>
          <tbody>
            {sortedTotals.map((player) => (
              <tr key={player.PlayerID}>
                <td className="border px-2 py-1 whitespace-nowrap text-left">
                  {player.Name}
                </td>
                <td className="border px-2 py-1">{player.GamesPlayed}</td>
                <td className="border px-2 py-1">{player.Points}</td>
                <td className="border px-2 py-1">
                  {formatNumber(player.PPG)}
                </td>
                <td className="border px-2 py-1">{player.Rebounds}</td>
                <td className="border px-2 py-1">
                  {formatNumber(player.RPG)}
                </td>
                <td className="border px-2 py-1">{player.Assists}</td>
                <td className="border px-2 py-1">
                  {formatNumber(player.APG)}
                </td>
                <td className="border px-2 py-1">{player.Steals}</td>
                <td className="border px-2 py-1">
                  {formatNumber(player.SPG)}
                </td>
                <td className="border px-2 py-1">{player.Blocks}</td>
                <td className="border px-2 py-1">
                  {formatNumber(player.BPG)}
                </td>
                <td className="border px-2 py-1">{player.Turnovers}</td>
                <td className="border px-2 py-1">
                  {formatNumber(player.TPG)}
                </td>
                <td className="border px-2 py-1">{player.TwoPM}</td>
                <td className="border px-2 py-1">{player.TwoPA}</td>
                <td className="border px-2 py-1">
                  {player.TwoPtPct != null
                    ? `${formatNumber(player.TwoPtPct, 1)}%`
                    : "–"}
                </td>
                <td className="border px-2 py-1">{player.ThreePM}</td>
                <td className="border px-2 py-1">{player.ThreePA}</td>
                <td className="border px-2 py-1">
                  {player.ThreePtPct != null
                    ? `${formatNumber(player.ThreePtPct, 1)}%`
                    : "–"}
                </td>
                <td className="border px-2 py-1">{player.FTM}</td>
                <td className="border px-2 py-1">{player.FTA}</td>
                <td className="border px-2 py-1">
                  {player.FTPct != null
                    ? `${formatNumber(player.FTPct, 1)}%`
                    : "–"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FullCareerStats;
