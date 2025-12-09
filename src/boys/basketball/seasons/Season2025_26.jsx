import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Season2025_26() {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [seasonTotals, setSeasonTotals] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  useEffect(() => {
    Promise.all([
      fetch("/data/boys/basketball/games.json").then((res) => res.json()),
      fetch("/data/boys/basketball/playergamestats.json").then((res) =>
        res.json()
      ),
      fetch("/data/boys/basketball/players.json").then((res) => res.json()),
    ])
      .then(([gamesData, playerStatsData, playersData]) => {
        const seasonGames = gamesData
          .filter((g) => g.Season === 2025)
          .sort((a, b) => a.Date - b.Date);
        setGames(seasonGames);

        const seasonGameIds = new Set(seasonGames.map((g) => g.GameID));

        const filteredStats = playerStatsData.filter((ps) =>
          seasonGameIds.has(ps.GameID)
        );
        setPlayerStats(filteredStats);
        setPlayers(playersData);
      })
      .catch((err) => console.error("Failed to load data:", err));
  }, []);

  useEffect(() => {
    if (playerStats.length && players.length) {
      const totalsMap = {};

      playerStats.forEach((stat) => {
        const key = stat.PlayerID;
        if (!totalsMap[key]) {
          totalsMap[key] = {
            PlayerID: stat.PlayerID,
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

        const entry = totalsMap[key];

        if (stat.MinutesPlayed != null && stat.MinutesPlayed > 0) {
          entry.GamesPlayed += 1;
        }

        entry.Points += stat.Points || 0;
        entry.Rebounds += stat.Rebounds || 0;
        entry.Assists += stat.Assists || 0;
        entry.Steals += stat.Steals || 0;
        entry.Blocks += stat.Blocks || 0;
        entry.Turnovers += stat.Turnovers || 0;
        entry.TwoPM += stat.TwoPM || 0;
        entry.TwoPA += stat.TwoPA || 0;
        entry.ThreePM += stat.ThreePM || 0;
        entry.ThreePA += stat.ThreePA || 0;
        entry.FTM += stat.FTM || 0;
        entry.FTA += stat.FTA || 0;
      });

      const totalsArray = Object.values(totalsMap).map((totals) => {
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

      setSeasonTotals(totalsArray);
    }
  }, [playerStats, players]);

  const formatDate = (ms) => {
    if (!ms) return "";
    const d = new Date(ms);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
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
    <div className="space-y-8 px-4">
      <header className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-blue-800">
          2025–26 Boys Varsity Basketball
        </h1>
        <p className="text-gray-700">
          Schedule, results, and season totals for each player.
        </p>
      </header>

      {/* Schedule */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-left">Schedule & Results</h2>
        <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Opponent</th>
                <th className="px-4 py-2 text-left">Location</th>
                <th className="px-4 py-2 text-center">Type</th>
                <th className="px-4 py-2 text-center">Result</th>
                <th className="px-4 py-2 text-center">Score</th>
              </tr>
            </thead>
            <tbody>
              {games.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-4 text-center text-gray-600"
                  >
                    No games have been entered yet for the 2025–26 season.
                  </td>
                </tr>
              )}

              {games.map((game) => (
                <tr key={game.GameID} className="border-t">
                  <td className="px-4 py-2 whitespace-nowrap">
                    {formatDate(game.Date)}
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      to={`/athletics/boys/basketball/games/${game.GameID}`}
                      className="text-blue-700 hover:underline"
                    >
                      {game.Opponent}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{game.LocationType}</td>
                  <td className="px-4 py-2 text-center">{game.GameType}</td>
                  <td className="px-4 py-2 text-center">
                    {game.Result || "-"}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {game.TeamScore != null && game.OpponentScore != null
                      ? `${game.TeamScore}–${game.OpponentScore}`
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Season Totals */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-left">Season Totals</h2>
        <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-xs border text-center">
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
              {sortedTotals.map((totals) => (
                <tr key={totals.PlayerID}>
                  <td className="border px-2 py-1 whitespace-nowrap text-left">
                    {totals.Name}
                  </td>
                  <td className="border px-2 py-1">{totals.GamesPlayed}</td>
                  <td className="border px-2 py-1">{totals.Points}</td>
                  <td className="border px-2 py-1">
                    {formatNumber(totals.PPG)}
                  </td>
                  <td className="border px-2 py-1">{totals.Rebounds}</td>
                  <td className="border px-2 py-1">
                    {formatNumber(totals.RPG)}
                  </td>
                  <td className="border px-2 py-1">{totals.Assists}</td>
                  <td className="border px-2 py-1">{totals.Steals}</td>
                  <td className="border px-2 py-1">{totals.Blocks}</td>
                  <td className="border px-2 py-1">{totals.Turnovers}</td>
                  <td className="border px-2 py-1">{totals.TwoPM}</td>
                  <td className="border px-2 py-1">{totals.TwoPA}</td>
                  <td className="border px-2 py-1">
                    {totals.TwoPtPct != null
                      ? `${formatNumber(totals.TwoPtPct, 1)}%`
                      : "–"}
                  </td>
                  <td className="border px-2 py-1">{totals.ThreePM}</td>
                  <td className="border px-2 py-1">{totals.ThreePA}</td>
                  <td className="border px-2 py-1">
                    {totals.ThreePtPct != null
                      ? `${formatNumber(totals.ThreePtPct, 1)}%`
                      : "–"}
                  </td>
                  <td className="border px-2 py-1">{totals.FTM}</td>
                  <td className="border px-2 py-1">{totals.FTA}</td>
                  <td className="border px-2 py-1">
                    {totals.FTPct != null
                      ? `${formatNumber(totals.FTPct, 1)}%`
                      : "–"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="text-center">
        <Link
          to="/athletics/boys/basketball/yearly-results"
          className="inline-block mt-4 text-sm text-blue-700 hover:underline"
        >
          ← Back to Yearly Results
        </Link>
      </div>
    </div>
  );
}

export default Season2025_26;
