import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

// These must match the *field names* in playergamestats.json
const statKeys = [
  "Points",
  "Rebounds",
  "Assists",
  "Turnovers",
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
  Points: "PTS",
  Rebounds: "REB",
  Assists: "AST",
  Turnovers: "TO",
  Steals: "STL",
  Blocks: "BLK",
  ThreePM: "3PM",
  ThreePA: "3PA",
  TwoPM: "2PM",
  TwoPA: "2PA",
  FTM: "FTM",
  FTA: "FTA",
};

const formatDate = (ms) =>
  new Date(Number(ms)).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const getPlayerPhotoUrl = (playerId) => {
  return `/images/boys/basketball/players/${playerId}.jpg`;
};

const calcPct = (made, att) => {
  const m = Number(made) || 0;
  const a = Number(att) || 0;
  if (!a) return "-";
  return ((m / a) * 100).toFixed(1);
};

const calcEFG = (twoPM, threePM, twoPA, threePA) => {
  const tpm = Number(twoPM) || 0;
  const thpm = Number(threePM) || 0;
  const tpa = Number(twoPA) || 0;
  const thpa = Number(threePA) || 0;
  const denom = tpa + thpa;
  if (!denom) return "-";
  const efg = ((tpm + thpm) + 0.5 * thpm) / denom;
  return (efg * 100).toFixed(1);
};

// Format season like 2024 -> "2024-25". If already "2024-25", leave it.
const formatSeasonLabel = (seasonKey) => {
  if (!seasonKey) return "Unknown";
  const s = String(seasonKey);
  if (s.includes("-")) return s;

  const yearNum = Number(s);
  if (Number.isNaN(yearNum)) return s;

  const next = (yearNum + 1).toString().slice(-2);
  return `${yearNum}-${next}`;
};

const round1 = (n) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return "-";
  return x.toFixed(1);
};

function PlayerPage() {
  const { playerId } = useParams();

  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW: toggle state for career table
  const [showPerGame, setShowPerGame] = useState(false);

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
          fetch("/data/boys/basketball/players.json"),
          fetch("/data/boys/basketball/games.json"),
          fetch("/data/boys/basketball/playergamestats.json"),
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
  const seasonTotals = useMemo(() => {
    const seasonMap = {}; // { seasonKey: { season, gamesPlayed, Points, ... } }

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

    return Object.values(seasonMap).sort((a, b) =>
      String(a.season).localeCompare(String(b.season))
    );
  }, [statsWithGameInfo]);

  // 5. Career totals
  const careerTotals = useMemo(() => {
    const base = {
      season: "Career",
      gamesPlayed: seasonTotals.reduce(
        (total, s) => total + (s.gamesPlayed || 0),
        0
      ),
    };

    statKeys.forEach((key) => {
      base[key] = seasonTotals.reduce(
        (total, s) => total + (s[key] || 0),
        0
      );
    });

    return base;
  }, [seasonTotals]);

  // NEW: helper to display either totals or per-game averages (not for GP or % columns)
  const displayStat = (row, key) => {
    const val = Number(row[key]) || 0;

    if (!showPerGame) return val;

    const gp = Number(row.gamesPlayed) || 0;
    if (!gp) return "-";

    // per-game averages for counting stats and makes/attempts
    return round1(val / gp);
  };

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
    return String(b).localeCompare(String(a));
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
              (e.currentTarget.src =
                "/images/boys/basketball/players/default.jpg")
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

      {/* 2. Career Totals (season-by-season + career row) */}
      <section>
        {/* Title row with toggle on the right */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-semibold">Career Totals</h2>

          {/* Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">
              Totals
            </span>

            <button
              type="button"
              onClick={() => setShowPerGame((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showPerGame ? "bg-blue-600" : "bg-gray-300"
              }`}
              aria-pressed={showPerGame}
              aria-label="Toggle totals vs per-game"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  showPerGame ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>

            <span className="text-sm text-gray-600 whitespace-nowrap">
              Per Game
            </span>
          </div>
        </div>

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
                    <React.Fragment key={key}>
                      <th className="border px-2 py-1 text-center">
                        {statLabelMap[key] || key}
                      </th>

                      {/* % columns should NOT toggle */}
                      {key === "ThreePA" && (
                        <th className="border px-2 py-1 text-center">3P%</th>
                      )}
                      {key === "TwoPA" && (
                        <>
                          <th className="border px-2 py-1 text-center">2P%</th>
                          <th className="border px-2 py-1 text-center">eFG%</th>
                        </>
                      )}
                      {key === "FTA" && (
                        <th className="border px-2 py-1 text-center">FT%</th>
                      )}
                    </React.Fragment>
                  ))}
                </tr>
              </thead>

              <tbody>
                {seasonTotals.map((row) => (
                  <tr key={row.season}>
                    <td className="border px-2 py-1 text-center">
                      {formatSeasonLabel(row.season)}
                    </td>

                    {/* GP never toggles */}
                    <td className="border px-2 py-1 text-center">
                      {row.gamesPlayed}
                    </td>

                    {statKeys.map((key) => (
                      <React.Fragment key={key}>
                        <td className="border px-2 py-1 text-center">
                          {displayStat(row, key)}
                        </td>

                        {/* % columns (always computed from totals, regardless of toggle) */}
                        {key === "ThreePA" && (
                          <td className="border px-2 py-1 text-center">
                            {calcPct(row.ThreePM, row.ThreePA)}
                          </td>
                        )}
                        {key === "TwoPA" && (
                          <>
                            <td className="border px-2 py-1 text-center">
                              {calcPct(row.TwoPM, row.TwoPA)}
                            </td>
                            <td className="border px-2 py-1 text-center">
                              {calcEFG(
                                row.TwoPM,
                                row.ThreePM,
                                row.TwoPA,
                                row.ThreePA
                              )}
                            </td>
                          </>
                        )}
                        {key === "FTA" && (
                          <td className="border px-2 py-1 text-center">
                            {calcPct(row.FTM, row.FTA)}
                          </td>
                        )}
                      </React.Fragment>
                    ))}
                  </tr>
                ))}

                {/* Career row */}
                <tr className="bg-gray-50 font-semibold">
                  <td className="border px-2 py-1 text-center">
                    {careerTotals.season}
                  </td>

                  {/* Career GP never toggles */}
                  <td className="border px-2 py-1 text-center">
                    {careerTotals.gamesPlayed}
                  </td>

                  {statKeys.map((key) => (
                    <React.Fragment key={key}>
                      <td className="border px-2 py-1 text-center">
                        {(() => {
                          if (!showPerGame) return Number(careerTotals[key]) || 0;
                          const gp = Number(careerTotals.gamesPlayed) || 0;
                          if (!gp) return "-";
                          return round1((Number(careerTotals[key]) || 0) / gp);
                        })()}
                      </td>

                      {/* % columns (always computed from totals) */}
                      {key === "ThreePA" && (
                        <td className="border px-2 py-1 text-center">
                          {calcPct(careerTotals.ThreePM, careerTotals.ThreePA)}
                        </td>
                      )}
                      {key === "TwoPA" && (
                        <>
                          <td className="border px-2 py-1 text-center">
                            {calcPct(careerTotals.TwoPM, careerTotals.TwoPA)}
                          </td>
                          <td className="border px-2 py-1 text-center">
                            {calcEFG(
                              careerTotals.TwoPM,
                              careerTotals.ThreePM,
                              careerTotals.TwoPA,
                              careerTotals.ThreePA
                            )}
                          </td>
                        </>
                      )}
                      {key === "FTA" && (
                        <td className="border px-2 py-1 text-center">
                          {calcPct(careerTotals.FTM, careerTotals.FTA)}
                        </td>
                      )}
                    </React.Fragment>
                  ))}
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
                        <th className="border px-2 py-1 text-center">Date</th>
                        <th className="border px-2 py-1 text-center">
                          Opponent
                        </th>
                        <th className="border px-2 py-1 text-center">
                          Result
                        </th>
                        {statKeys.map((key) => (
                          <React.Fragment key={key}>
                            <th className="border px-2 py-1 text-center">
                              {statLabelMap[key] || key}
                            </th>
                            {key === "ThreePA" && (
                              <th className="border px-2 py-1 text-center">
                                3P%
                              </th>
                            )}
                            {key === "TwoPA" && (
                              <>
                                <th className="border px-2 py-1 text-center">
                                  2P%
                                </th>
                                <th className="border px-2 py-1 text-center">
                                  eFG%
                                </th>
                              </>
                            )}
                            {key === "FTA" && (
                              <th className="border px-2 py-1 text-center">
                                FT%
                              </th>
                            )}
                          </React.Fragment>
                        ))}
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
                              to={`/boys/basketball/games/${row.GameID}`}
                              className="text-blue-600 hover:underline"
                            >
                              {row.opponent}
                            </Link>
                          </td>
                          <td className="border px-2 py-1 text-center">
                            {row.result}
                          </td>
                          {statKeys.map((key) => (
                            <React.Fragment key={key}>
                              <td className="border px-2 py-1 text-center">
                                {row[key]}
                              </td>
                              {key === "ThreePA" && (
                                <td className="border px-2 py-1 text-center">
                                  {calcPct(row.ThreePM, row.ThreePA)}
                                </td>
                              )}
                              {key === "TwoPA" && (
                                <>
                                  <td className="border px-2 py-1 text-center">
                                    {calcPct(row.TwoPM, row.TwoPA)}
                                  </td>
                                  <td className="border px-2 py-1 text-center">
                                    {calcEFG(
                                      row.TwoPM,
                                      row.ThreePM,
                                      row.TwoPA,
                                      row.ThreePA
                                    )}
                                  </td>
                                </>
                              )}
                              {key === "FTA" && (
                                <td className="border px-2 py-1 text-center">
                                  {calcPct(row.FTM, row.FTA)}
                                </td>
                              )}
                            </React.Fragment>
                          ))}
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
