import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Season2025_26_Girls() {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [seasonTotals, setSeasonTotals] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "jersey",
    direction: "asc",
  });

  const SEASON_ID = 2025; // 2025–26 season

  // 1. Fetch data
  useEffect(() => {
    async function fetchData() {
      const gamesRes = await fetch("/data/girls/basketball/games.json");
      const statsRes = await fetch(
        "/data/girls/basketball/playergamestats.json"
      );
      const playersRes = await fetch("/data/girls/basketball/players.json");

      const gamesData = await gamesRes.json();
      const statsData = await statsRes.json();
      const playersData = await playersRes.json();

      // Filter to just 2025–26 games and sort by date
      const seasonGames = gamesData
        .filter((g) => g.Season === SEASON_ID)
        .sort((a, b) => a.Date - b.Date);

      const seasonGameIds = new Set(seasonGames.map((g) => g.GameID));

      // Only stats from games in this season
      const seasonStats = statsData.filter((s) => seasonGameIds.has(s.GameID));

      setGames(seasonGames);
      setPlayerStats(seasonStats);
      setPlayers(playersData);
    }

    fetchData();
  }, []);

  // 2. Build season totals including shooting stats
  useEffect(() => {
    if (playerStats.length === 0) {
      setSeasonTotals([]);
      return;
    }

    const totalsMap = {};

    playerStats.forEach((stat) => {
      const id = stat.PlayerID;

      if (!totalsMap[id]) {
        totalsMap[id] = {
          PlayerID: id,
          Points: 0,
          Rebounds: 0,
          Assists: 0,
          Turnovers: 0,
          Steals: 0,
          Blocks: 0,
          ThreePM: 0,
          ThreePA: 0,
          TwoPM: 0,
          TwoPA: 0,
          FTM: 0,
          FTA: 0,
        };
      }

      const t = totalsMap[id];

      t.Points += stat.Points || 0;
      t.Rebounds += stat.Rebounds || 0;
      t.Assists += stat.Assists || 0;
      t.Turnovers += stat.Turnovers || 0;
      t.Steals += stat.Steals || 0;
      t.Blocks += stat.Blocks || 0;

      t.ThreePM += stat.ThreePM || 0;
      t.ThreePA += stat.ThreePA || 0;
      t.TwoPM += stat.TwoPM || 0;
      t.TwoPA += stat.TwoPA || 0;
      t.FTM += stat.FTM || 0;
      t.FTA += stat.FTA || 0;
    });

    setSeasonTotals(Object.values(totalsMap));
  }, [playerStats]);

  // -------- Helper functions --------
  const getPlayerName = (id) => {
    const player = players.find((p) => p.PlayerID === id);
    return player ? `${player.FirstName} ${player.LastName}` : "Unknown Player";
  };

  const getJerseyNumber = (id) => {
    const player = players.find((p) => p.PlayerID === id);
    return player && player.JerseyNumber != null ? player.JerseyNumber : "";
  };

  // Girls photos: /images/girls/basketball/players/{PlayerID}.jpg
  const getPlayerPhotoUrl = (playerId) => {
    return `/images/girls/basketball/players/${playerId}.jpg`;
  };

  const rawPct = (made, att) => {
    if (!att || att === 0) return 0;
    return (made / att) * 100;
  };

  const formatPct = (made, att) => {
    if (!att || att === 0) return "-";
    return rawPct(made, att).toFixed(1);
  };

  const rawEFG = (player) => {
    const made = (player.TwoPM || 0) + (player.ThreePM || 0);
    const att = (player.TwoPA || 0) + (player.ThreePA || 0);
    if (!att || att === 0) return 0;
    return ((made + 0.5 * (player.ThreePM || 0)) / att) * 100;
  };

  const formatEFG = (player) => {
    const att = (player.TwoPA || 0) + (player.ThreePA || 0);
    if (!att || att === 0) return "-";
    return rawEFG(player).toFixed(1);
  };

  const formatDate = (ms) => {
    if (!ms || ms < 0) return "";
    return new Date(ms).toLocaleDateString();
  };

  const formatResult = (game) => {
    if (game.IsComplete !== "Yes" || !game.Result) return "";
    return game.Result;
  };

  const formatScore = (game) => {
    if (
      game.IsComplete !== "Yes" ||
      game.TeamScore == null ||
      game.OpponentScore == null
    ) {
      return "";
    }
    return `${game.TeamScore} - ${game.OpponentScore}`;
  };

  // -------- Sorting logic for season totals --------
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "desc" ? "asc" : "desc",
        };
      }
      // Default: highest → lowest on first click
      return { key, direction: "desc" };
    });
  };

  const getSortValue = (player, key) => {
    switch (key) {
      case "name":
        return getPlayerName(player.PlayerID).toLowerCase();
      case "jersey":
        return Number(getJerseyNumber(player.PlayerID)) || 0;
      case "Points":
        return player.Points || 0;
      case "Rebounds":
        return player.Rebounds || 0;
      case "Assists":
        return player.Assists || 0;
      case "Turnovers":
        return player.Turnovers || 0;
      case "Steals":
        return player.Steals || 0;
      case "Blocks":
        return player.Blocks || 0;
      case "ThreePM":
        return player.ThreePM || 0;
      case "ThreePA":
        return player.ThreePA || 0;
      case "ThreePct":
        return rawPct(player.ThreePM, player.ThreePA);
      case "TwoPM":
        return player.TwoPM || 0;
      case "TwoPA":
        return player.TwoPA || 0;
      case "TwoPct":
        return rawPct(player.TwoPM, player.TwoPA);
      case "FTM":
        return player.FTM || 0;
      case "FTA":
        return player.FTA || 0;
      case "FTPct":
        return rawPct(player.FTM, player.FTA);
      case "eFG":
        return rawEFG(player);
      default:
        return 0;
    }
  };

  const sortedSeasonTotals = seasonTotals.slice().sort((a, b) => {
    const aVal = getSortValue(a, sortConfig.key);
    const bVal = getSortValue(b, sortConfig.key);

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const sortArrow = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "desc" ? " ↓" : " ↑";
  };

  return (
    <div className="bg-gray-100 p-8 rounded-lg shadow-md max-w-6xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold text-center mb-4">
        2025–26 Season – Girls Basketball
      </h1>

      {/* 1. SEASON OVERVIEW */}
      <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="text-2xl font-semibold mt-4 mb-3">Season Overview</h2>

        <div className="text-gray-800 leading-relaxed">
          <a
            href="https://www.flipsnack.com/6D6FD76F8D6/girls-basketball-media-guide-2025-2026.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/girls/basketball/seasons/2025-26/Season2025_26_1.PNG"
              alt="2025–26 St. Andrew's girls' basketball roster"
              className="float-left mr-4 mb-3 w-full max-w-xs rounded-lg shadow cursor-pointer"
            />
          </a>

          <h3 className="text-xl font-semibold mb-4">
            Village Mindset Fuels St. Andrew’s Girls Basketball Season Outlook
          </h3>

          <p className="mb-4 leading-relaxed">
            St. Andrew’s enters the 2025–2026 season grounded in the philosophy
            of its signature Basketball Village, an approach built on collective
            commitment and shared purpose. The program emphasizes that sustained
            success comes from alignment across the entire community—athletes,
            coaches, and supporters—all contributing to an environment that
            nurtures growth, resilience, and excellence. Individual development
            remains central to the program’s identity, with the belief that when
            each athlete progresses in a healthy and intentional way, the team
            strengthens as a whole and continues its steady rise toward
            long-term powerhouse potential.
          </p>

          <p className="mb-4 leading-relaxed">
            The program’s core principles continue to shape its competitive and
            developmental framework. Effort is the bedrock of the culture, with
            athletes expected to bring full intensity to every practice,
            warm-up, and game. St. Andrew’s also maintains a strong team-first
            identity, blending diverse skill sets and playing styles into a
            cohesive system while still honoring each athlete’s strengths and
            aspirations. The program values joy and connection as competitive
            advantages, encouraging players to be energetic, vocal, and deeply
            supportive of one another. Skill development remains a top priority,
            with fundamentals—ball-handling, shooting, defending,
            decision-making, and basketball IQ—serving as the foundation for
            advancement. The emphasis on returning to the basics aligns with the
            program’s long-term player-development model.
          </p>

          <img
            src="/images/girls/basketball/seasons/2025-26/Season2025_26_2.PNG"
            alt="St. Andrew's girls' basketball action collage"
            className="float-right ml-4 mt-4 mb-3 w-full max-w-sm rounded-lg shadow"
          />

          <p className="mb-4 leading-relaxed">
            The coaching staff continues to foster a positive, empowering
            atmosphere where athletes are challenged to expand their
            capabilities and explore leadership roles. The Village philosophy
            guides the team environment, creating a space built on trust,
            communication, and shared responsibility. Practices and games are
            structured to encourage freedom, confidence, and growth, while the
            coaching staff remains focused on cultivating a culture that
            supports athletes both on and off the court.
          </p>

          <p className="mb-4 leading-relaxed">
            The program’s seasonal objectives—Learn, Improve, Thrive—capture its
            developmental mission. The JV and Varsity structures are
            intentionally designed to support players from 8th through 11th
            grade, offering age-appropriate roles and opportunities. Some
            athletes will benefit from extended game exposure through the
            six-quarter rule, allowing them to gain valuable experience that
            aligns with their development path. Preseason participation played a
            meaningful role in early-season readiness, offering athletes clarity
            on how offseason preparation influences their in-season progression.
          </p>

          <p className="mb-4 leading-relaxed">
            Recruitment education continues to be a key component of the St.
            Andrew’s basketball experience. The coaching staff provides insight
            into modern evaluation criteria, emphasizing intangible qualities
            such as attitude, competitiveness, motor, defensive ability, skill
            versatility, and basketball IQ. The program aims to ensure its
            athletes understand the far-reaching factors that shape
            opportunities at the next level, supported by real-world examples
            and current trends.
          </p>

          <p className="mb-4 leading-relaxed">
            With a clear vision, established cultural pillars, and a unified
            community behind it, St. Andrew’s Girls Basketball enters the
            2025–2026 season poised for meaningful growth. The blend of high
            standards, player development, and a connected team environment
            positions the program to continue evolving—and to do so with
            purpose, identity, and pride.
          </p>

          <div className="clear-both" />
        </div>
      </section>

      {/* 2. FULL SCHEDULE – future games have blank result/score */}
      <section>
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          📅 Schedule &amp; Results
        </h2>
        <div className="overflow-x-auto px-1">
          <table className="w-full border text-center text-xs sm:text-sm md:text-base">
            <thead>
              <tr>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Opponent</th>
                <th className="border px-2 py-1">Result</th>
                <th className="border px-2 py-1">Score</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game, idx) => {
                const hasResult = game.Result === "W" || game.Result === "L";

                const opponentCell = hasResult ? (
                  <Link
                    to={`/athletics/girls/basketball/games/${game.GameID}`}
                    className="text-blue-700 hover:underline"
                  >
                    {game.Opponent}
                  </Link>
                ) : (
                  game.Opponent
                );

                return (
                  <tr key={game.GameID || idx}>
                    <td className="border px-2 py-1 text-center">
                      {formatDate(game.Date)}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {opponentCell}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {formatResult(game)}
                    </td>
                    <td className="border px-2 py-1 whitespace-nowrap text-center">
                      {formatScore(game)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. SEASON PLAYER TOTALS (sortable, with photos & jersey column) */}
      <section>
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          📊 Season Player Totals
        </h2>

        {seasonTotals.length === 0 ? (
          <p className="text-gray-600">
            No player statistics are available yet for this season.
          </p>
        ) : (
          <div className="overflow-x-auto px-1">
            <table className="w-full border text-center text-xs sm:text-sm md:text-base table-auto">
              <thead className="bg-gray-400 text-black">
                <tr>
                  <th
                    className="border px-2 py-1 text-left cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    Player{sortArrow("name")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("jersey")}
                  >
                    #{sortArrow("jersey")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("Points")}
                  >
                    PTS{sortArrow("Points")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("Rebounds")}
                  >
                    REB{sortArrow("Rebounds")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("Assists")}
                  >
                    AST{sortArrow("Assists")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("Turnovers")}
                  >
                    TO{sortArrow("Turnovers")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("Steals")}
                  >
                    STL{sortArrow("Steals")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("Blocks")}
                  >
                    BLK{sortArrow("Blocks")}
                  </th>

                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("ThreePM")}
                  >
                    3PM{sortArrow("ThreePM")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("ThreePA")}
                  >
                    3PA{sortArrow("ThreePA")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("ThreePct")}
                  >
                    3P%{sortArrow("ThreePct")}
                  </th>

                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("TwoPM")}
                  >
                    2PM{sortArrow("TwoPM")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("TwoPA")}
                  >
                    2PA{sortArrow("TwoPA")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("TwoPct")}
                  >
                    2P%{sortArrow("TwoPct")}
                  </th>

                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("eFG")}
                  >
                    eFG%{sortArrow("eFG")}
                  </th>

                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("FTM")}
                  >
                    FTM{sortArrow("FTM")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("FTA")}
                  >
                    FTA{sortArrow("FTA")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("FTPct")}
                  >
                    FT%{sortArrow("FTPct")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedSeasonTotals.map((player) => {
                  const name = getPlayerName(player.PlayerID);
                  const jersey = getJerseyNumber(player.PlayerID);
                  const photoUrl = getPlayerPhotoUrl(player.PlayerID);

                  return (
                    <tr key={player.PlayerID}>
                      <td className="border px-2 py-1 text-left align-middle min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <img
                            src={photoUrl}
                            alt={name}
                            onError={(e) => {
                              e.currentTarget.src =
                                "/images/girls/basketball/players/default.jpg";
                            }}
                            className="w-8 h-8 rounded-full object-cover border"
                          />
                          <Link
                            to={`/athletics/girls/basketball/players/${player.PlayerID}`}
                            className="text-blue-600 underline hover:text-blue-800"
                          >
                            {name}
                          </Link>
                        </div>
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {jersey}
                      </td>

                      <td className="border px-2 py-1 align-middle">
                        {player.Points}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {player.Rebounds}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {player.Assists}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {player.Turnovers}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {player.Steals}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {player.Blocks}
                      </td>

                      <td className="border px-2 py-1 align-middle">
                        {player.ThreePM}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {player.ThreePA}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {formatPct(player.ThreePM, player.ThreePA)}
                      </td>

                      <td className="border px-2 py-1 align-middle">
                        {player.TwoPM}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {player.TwoPA}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {formatPct(player.TwoPM, player.TwoPA)}
                      </td>

                      <td className="border px-2 py-1 align-middle">
                        {formatEFG(player)}
                      </td>

                      <td className="border px-2 py-1 align-middle">
                        {player.FTM}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {player.FTA}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {formatPct(player.FTM, player.FTA)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Season2025_26_Girls;
