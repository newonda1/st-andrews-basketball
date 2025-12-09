import React, { useEffect, useState } from "react";

function SeasonRecords() {
  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [seasonTotals, setSeasonTotals] = useState([]);
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
      fetch("/data/boys/basketball/games.json").then((res) => res.json()),
    ])
      .then(([playerStatsData, playersData, gamesData]) => {
        setPlayerStats(playerStatsData);
        setPlayers(playersData);
        setGames(gamesData);
      })
      .catch((err) => console.error("Failed to load data:", err));
  }, []);

  useEffect(() => {
    if (playerStats.length && players.length && games.length) {
      const seasonMap = {};

      playerStats.forEach((game) => {
        const key = `${game.PlayerID}-${game.Season}`;

        if (!seasonMap[key]) {
          seasonMap[key] = {
            PlayerID: game.PlayerID,
            Season: game.Season,
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

        const entry = seasonMap[key];

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

      const merged = Object.values(seasonMap).map((totals) => {
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
        };
      });

      setSeasonTotals(merged);
    }
  }, [playerStats, players, games]);

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

  const sortedTotals = sortData(seasonTotals);

  return (
    <div className="space-y-6 px-4">
      <h1 className="text-2xl font-bold text-center">
        Single-Season Records (Boys)
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-xs border text-center">
          <thead className="bg-gray-200 font-bold">
            <tr>
              <th className="border px-2 py-1">Player</th>
              <th className="border px-2 py-1">Season</th>
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
              <th className="border px-2 py-1">STL</th>
              <th className="border px-2 py-1">BLK</th>
              <th className="border px-2 py-1">TOV</th>
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
            {sortedTotals.map((season) => (
              <tr key={`${season.PlayerID}-${season.Season}`}>
                <td className="border px-2 py-1 whitespace-nowrap text-left">
                  {season.Name}
                </td>
                <td className="border px-2 py-1">{season.Season}</td>
                <td className="border px-2 py-1">{season.Points}</td>
                <td className="border px-2 py-1">
                  {formatNumber(season.PPG)}
                </td>
                <td className="border px-2 py-1">{season.Rebounds}</td>
                <td className="border px-2 py-1">
                  {formatNumber(season.RPG)}
                </td>
                <td className="border px-2 py-1">{season.Assists}</td>
                <td className="border px-2 py-1">{season.Steals}</td>
                <td className="border px-2 py-1">{season.Blocks}</td>
                <td className="border px-2 py-1">{season.Turnovers}</td>
                <td className="border px-2 py-1">{season.TwoPM}</td>
                <td className="border px-2 py-1">{season.TwoPA}</td>
                <td className="border px-2 py-1">
                  {season.TwoPtPct != null
                    ? `${formatNumber(season.TwoPtPct, 1)}%`
                    : "–"}
                </td>
                <td className="border px-2 py-1">{season.ThreePM}</td>
                <td className="border px-2 py-1">{season.ThreePA}</td>
                <td className="border px-2 py-1">
                  {season.ThreePtPct != null
                    ? `${formatNumber(season.ThreePtPct, 1)}%`
                    : "–"}
                </td>
                <td className="border px-2 py-1">{season.FTM}</td>
                <td className="border px-2 py-1">{season.FTA}</td>
                <td className="border px-2 py-1">
                  {season.FTPct != null
                    ? `${formatNumber(season.FTPct, 1)}%`
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

export default SeasonRecords;
