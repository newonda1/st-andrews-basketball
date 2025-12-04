import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

// These must match the *field names* in playergamestats.json
const statKeys = [
  "Points",
  "Rebounds",
  "Assists",
  "Steals",
  "Blocks",
  "ThreePM",
  "ThreePA",
  "TwoPM",
  "TwoPA",
  "FTM",
  "FTA",
];

// Map data keys -> how we want them labeled in the tables
const statLabelMap = {
  ThreePM: "3PM",
  ThreePA: "3PA",
  TwoPM: "2PM",
  TwoPA: "2PA",
};

const formatDate = (ms) =>
  new Date(Number(ms)).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const getPlayerPhotoUrl = (playerId) => {
  return `/images/players/${playerId}.jpg`; // use .png if your files are PNG
};

const calcPct = (made, att) => {
  const m = Number(made) || 0;
  const a = Number(att) || 0;
  if (!a) return "-";
  return ((m / a) * 100).toFixed(1); // e.g. "45.0"
};

function PlayerPage() {
  const { playerId } = useParams();

  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to find the player by ID, handling numeric IDs and alternate field names
  const getPlayerById = (id) => {
    const idNum = Number(id);

    return (
      players.find((p) => Number(p.PlayerID) === idNum) ||
      players.find((p) => Number(p.PlayerId) === idNum) ||
      players.find((p) => Number(p.ID) === idNum) ||
      null
    );
  };

  // Load all the data we need
  useEffect(() => {
    async function loadData() {
      try {
        const [playersRes, gamesRes, statsRes] = await Promise.all([
          fetch("/data/players.json"),
          fetch("/data/games.json"),
          fetch("/data/playergamestats.json"),
        ]);

        const [playersData, gamesData, statsData] = await Promise.all([
          playersRes.json(),
          gamesRes.json(),
          statsRes.json(),
        ]);

        setPlayers(playersData);
        setGames(gamesData);
        setPlayerStats(statsData);
      } catch (err) {
        console.error("Error loading player page data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading player information...</div>;
  }

  // 1. Find player
  const player = getPlayerById(playerId);

  if (!player) {
    return <div className="p-6">Player not found.</div>;
  }

  const playerName =
    player.PlayerName ||
    player.Name ||
    (player.FirstName && player.LastName
      ? `${player.FirstName} ${player.LastName}`
      : `Player ${playerId}`);

  // Jersey number + class/year, trying several possible field names
  const jerseyNumber =
    player.JerseyNumber ?? player.Number ?? player.Jersey ?? null;

  const gradYear =
    player.ClassOf ??
    player.GradYear ??
    player.GraduationYear ??
    player.Class ??
    null;

  const yearsWithTeam = player.YearsWithTeam || "";
  const photoUrl = getPlayerPhotoUrl(playerId);

  // 2. Get all game stats for this player
  const statsForPlayer = playerStats.filter(
    (s) => Number(s.PlayerID) === Number(playerId)
  );

  // 3. Join with game info (date, opponent, result, season)
  const statsWithGameInfo = statsForPlayer
    .map((stat) => {
      const game = games.find(
        (g) => String(g.GameID) === String(stat.GameID)
      );
      return {
        ...stat,
        gameDate: game?.Date || "",
        opponent: game?.Opponent || "",
        result: game?.Result || "",
        season: game?.Season || game?.Year || "",
      };
    })
    .sort((a, b) => {
      if (!a.gameDate || !b.gameDate) return 0;
      return new Date(a.gameDate) - new Date(b.gameDate);
    });

  // 4. Build season totals
  const seasonMap = {}; // { "2025-26": { season, gamesPlayed, Points, ... } }

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

  // 5. Career totals
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

  // 6. Game logs grouped by season (most recent season first)
  const gameLogsBySeason = statsWithGameInfo.reduce((acc, row) => {
    const seasonKey = row.season || "Unknown";
    if (!acc[seasonKey]) acc[seasonKey] = [];
    acc[seasonKey].push(row);
    return acc;
  }, {});

  const orderedSeasonKeys = Object.keys(gameLogsBySeason).sort((a, b) => {
    if (a === "Unknown") return 1;
    if (b === "Unknown") return -1;
    return String(b).localeCompare(String(a)); // most recent (largest) first
  });

  return (
    <div className="player-page max-w-5xl mx-auto p-4 space-y-8">
      {/* 1. Header: name, jersey, class, years, picture */}
      <header className="flex items-center gap-4 mb-4">
        {photoUrl && (
          <img
            src={photoUrl}
            alt={playerName}
            onError={(e) =>
              (e.currentTarget.src = "/images/players/default.jpg")
            }
            className="w-24 h-24 object-cover rounded-full border"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold">{playerName}</h1>

          {(jerseyNumber || gradYear) && (
            <p className="text-gray-700 text-lg">
              {jerseyNumber && <span>#{jerseyNumber}</span>}
              {jerseyNumber && gradYear && <span> • </span>}
              {gradYear && <span>Class of {gradYear}</span>}
            </p>
          )}

          {yearsWithTeam && (
            <p className="text-gray-600 text-lg">
              St. Andrew&apos;s Lions • {yearsWithTeam}
            </p>
          )}
        </div>
      </header>

      {/* 2. Season-by-season stats table */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Season Totals</h2>
        {seasonTotals.length === 0 ? (
          <p>No stats available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1 text-center">Season</th>
                  <th className="border px-2 py-1 text-center">GP</th>
                  {statKeys.map((key) => (
                    <th
                      key={key}
                      className="border px-2 py-1 text-center"
                    >
                      {statLabelMap[key] || key}
                    </th>
                  ))}
                  {/* Percentage columns */}
                  <th className="border px-2 py-1 text-center">3P%</th>
                  <th className="border px-2 py-1 text-center">2P%</th>
                  <th className="border px-2 py-1 text-center">FT%</th>
                </tr>
              </thead>
              <tbody>
                {seasonTotals.map((row) => (
                  <tr key={row.season}>
                    <td className="border px-2 py-1 text-center">
                      {row.season}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {row.gamesPlayed}
                    </td>
                    {statKeys.map((key) => (
                      <td
                        key={key}
                        className="border px-2 py-1 text-center"
                      >
                        {row[key]}
                      </td>
                    ))}
                    <td className="border px-2 py-1 text-center">
                      {calcPct(row.ThreePM, row.ThreePA)}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {calcPct(row.TwoPM, row.TwoPA)}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {calcPct(row.FTM, row.FTA)}
                    </td>
                  </tr>
                ))}

                {/* Career row */}
                <tr className="bg-gray-50 font-semibold">
                  <td className="border px-2 py-1 text-center">
                    {careerTotals.season}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {careerTotals.gamesPlayed}
                  </td>
                  {statKeys.map((key) => (
                    <td
                      key={key}
                      className="border px-2 py-1 text-center"
                    >
                      {careerTotals[key]}
                    </td>
                  ))}
                  <td className="border px-2 py-1 text-center">
                    {calcPct(careerTotals.ThreePM, careerTotals.ThreePA)}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {calcPct(careerTotals.TwoPM, careerTotals.TwoPA)}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {calcPct(careerTotals.FTM, careerTotals.FTA)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 3. Game-by-game tables, split by season */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Game Logs</h2>
        {statsWithGameInfo.length === 0 ? (
          <p>No game logs available.</p>
        ) : (
          orderedSeasonKeys.map((seasonKey) => {
            const rows = gameLogsBySeason[seasonKey] || [];
            return (
              <div key={seasonKey} className="mb-6">
                <h3 className="text-xl font-semibold mb-1">
                  {seasonKey || "Unknown Season"}
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-2 py-1 text-center">
                          Date
                        </th>
                        <th className="border px-2 py-1 text-center">
                          Opponent
                        </th>
                        <th className="border px-2 py-1 text-center">
                          Result
                        </th>
                        {statKeys.map((key) => (
                          <th
                            key={key}
                            className="border px-2 py-1 text-center"
                          >
                            {statLabelMap[key] || key}
                          </th>
                        ))}
                        <th className="border px-2 py-1 text-center">
                          3P%
                        </th>
                        <th className="border px-2 py-1 text-center">
                          2P%
                        </th>
                        <th className="border px-2 py-1 text-center">
                          FT%
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, idx) => (
                        <tr key={`${row.GameID}-${idx}`}>
                          <td className="border px-2 py-1 text-center whitespace-nowrap">
                            {row.gameDate ? formatDate(row.gameDate) : ""}
                          </td>
                          <td className="border px-2 py-1 text-center whitespace-nowrap">
                            <Link
                              to={`/games/${row.GameID}`}
                              className="text-blue-600 hover:underline"
                            >
                              {row.opponent}
                            </Link>
                          </td>
                          <td className="border px-2 py-1 text-center">
                            {row.result}
                          </td>
                          {statKeys.map((key) => (
                            <td
                              key={key}
                              className="border px-2 py-1 text-center"
                            >
                              {row[key]}
                            </td>
                          ))}
                          <td className="border px-2 py-1 text-center">
                            {calcPct(row.ThreePM, row.ThreePA)}
                          </td>
                          <td className="border px-2 py-1 text-center">
                            {calcPct(row.TwoPM, row.TwoPA)}
                          </td>
                          <td className="border px-2 py-1 text-center">
                            {calcPct(row.FTM, row.FTA)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}

export default PlayerPage;
