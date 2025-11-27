import React from "react";
import { useParams, Link } from "react-router-dom";

// Adjust these import paths to match your project
import players from "../data/players.json";
import games from "../data/games.json";
import playerGameStats from "../data/playerGameStats.json";

const statKeys = [
  "Points",
  "Rebounds",
  "Assists",
  "Steals",
  "Blocks",
  "FGM",
  "FGA",
  "TPM",   // 3PM if you name it that way
  "TPA",
  "FTM",
  "FTA"
  // Add/remove to match your JSON fields
];

function sumStats(statsArray) {
  const result = {};
  statKeys.forEach((key) => {
    result[key] = statsArray.reduce(
      (total, s) => total + (Number(s[key]) || 0),
      0
    );
  });
  return result;
}

function PlayerPage() {
  const { playerId } = useParams();

  // 1. Find player
  const player = players.find(
    (p) => String(p.PlayerID) === String(playerId)
  );

  if (!player) {
    return <div className="p-4">Player not found.</div>;
  }

  // OPTIONAL: Years with team & photo URL from players.json
  const yearsWithTeam = player.YearsWithTeam || ""; // e.g. "2023–25"
  const photoUrl = player.PhotoUrl || null; // you can add this field later

  // 2. Get all game stats for this player
  const playerStats = playerGameStats.filter(
    (s) => String(s.PlayerID) === String(playerId)
  );

  // 3. Join with game info (date, opponent, etc.)
  const statsWithGameInfo = playerStats
    .map((stat) => {
      const game = games.find((g) => String(g.GameID) === String(stat.GameID));
      return {
        ...stat,
        gameDate: game?.Date || "",
        opponent: game?.Opponent || "",
        result: game?.Result || "",      // e.g. "W 68–50"
        season: game?.Season || game?.Year || "" // adjust to match your data
      };
    })
    .sort((a, b) => {
      // sort by date if available
      if (!a.gameDate || !b.gameDate) return 0;
      return new Date(a.gameDate) - new Date(b.gameDate);
    });

  // 4. Build season totals
  const seasonMap = {}; // { "2024-25": { season: "2024-25", gamesPlayed: 0, ...stats } }

  statsWithGameInfo.forEach((stat) => {
    const seasonKey = stat.season || "Unknown";

    if (!seasonMap[seasonKey]) {
      seasonMap[seasonKey] = {
        season: seasonKey,
        gamesPlayed: 0,
      };
      statKeys.forEach((key) => {
        seasonMap[seasonKey][key] = 0;
      });
    }

    seasonMap[seasonKey].gamesPlayed += 1;
    statKeys.forEach((key) => {
      seasonMap[seasonKey][key] += Number(stat[key]) || 0;
    });
  });

  const seasonTotals = Object.values(seasonMap).sort((a, b) =>
    String(a.season).localeCompare(String(b.season))
  );

  // 5. Career totals (sum of season totals)
  const careerTotals = {
    season: "Career",
    gamesPlayed: seasonTotals.reduce(
      (total, s) => total + (s.gamesPlayed || 0),
      0
    ),
  };

  statKeys.forEach((key) => {
    careerTotals[key] = seasonTotals.reduce(
      (total, s) => total + (s[key] || 0),
      0
    );
  });

  return (
    <div className="player-page max-w-5xl mx-auto p-4">
      {/* 1. Header: name, years, picture */}
      <header className="flex items-center gap-4 mb-6">
        {photoUrl && (
          <img
            src={photoUrl}
            alt={player.PlayerName}
            className="w-24 h-24 object-cover rounded-full border"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold">
            {player.PlayerName}
          </h1>
          {yearsWithTeam && (
            <p className="text-gray-600 text-lg">
              St. Andrew&apos;s Lions &bull; {yearsWithTeam}
            </p>
          )}
        </div>
      </header>

      {/* 2. Season-by-season stats table */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          Season Totals
        </h2>
        {seasonTotals.length === 0 ? (
          <p>No stats available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1 text-left">Season</th>
                  <th className="border px-2 py-1 text-right">GP</th>
                  {statKeys.map((key) => (
                    <th key={key} className="border px-2 py-1 text-right">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {seasonTotals.map((row) => (
                  <tr key={row.season}>
                    <td className="border px-2 py-1">
                      {row.season}
                    </td>
                    <td className="border px-2 py-1 text-right">
                      {row.gamesPlayed}
                    </td>
                    {statKeys.map((key) => (
                      <td key={key} className="border px-2 py-1 text-right">
                        {row[key]}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Career row */}
                <tr className="bg-gray-50 font-semibold">
                  <td className="border px-2 py-1">
                    {careerTotals.season}
                  </td>
                  <td className="border px-2 py-1 text-right">
                    {careerTotals.gamesPlayed}
                  </td>
                  {statKeys.map((key) => (
                    <td key={key} className="border px-2 py-1 text-right">
                      {careerTotals[key]}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 3. Game-by-game table */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">
          Game Logs
        </h2>
        {statsWithGameInfo.length === 0 ? (
          <p>No game logs available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1 text-left">Date</th>
                  <th className="border px-2 py-1 text-left">Opponent</th>
                  <th className="border px-2 py-1 text-left">Result</th>
                  {statKeys.map((key) => (
                    <th key={key} className="border px-2 py-1 text-right">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {statsWithGameInfo.map((row) => (
                  <tr key={row.GameID}>
                    <td className="border px-2 py-1">
                      {row.gameDate}
                    </td>
                    <td className="border px-2 py-1">
                      {/* Link to game recap page if you have /games/:gameId */}
                      <Link
                        to={`/games/${row.GameID}`}
                        className="underline"
                      >
                        {row.opponent}
                      </Link>
                    </td>
                    <td className="border px-2 py-1">
                      {row.result}
                    </td>
                    {statKeys.map((key) => (
                      <td key={key} className="border px-2 py-1 text-right">
                        {row[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default PlayerPage;
