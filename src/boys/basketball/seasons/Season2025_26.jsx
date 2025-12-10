import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Season2025_26() {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [seasonTotals, setSeasonTotals] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "jersey",
    direction: "asc",
  });
  const [showPerGame, setShowPerGame] = useState(false);

  const SEASON_ID = 2025; // 2025–26 season

  // 1. Fetch data
  useEffect(() => {
    async function fetchData() {
      const gamesRes = await fetch("/data/boys/basketball/games.json");
      const statsRes = await fetch(
        "/data/boys/basketball/playergamestats.json"
      );
      const playersRes = await fetch("/data/boys/basketball/players.json");

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

  // 2. Build season totals including shooting stats + games played (GP)
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
          GamesPlayedSet: new Set(),
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

      if (stat.GameID != null) {
        t.GamesPlayedSet.add(stat.GameID);
      }
    });

    const totalsArray = Object.values(totalsMap).map((p) => ({
      PlayerID: p.PlayerID,
      Points: p.Points,
      Rebounds: p.Rebounds,
      Assists: p.Assists,
      Turnovers: p.Turnovers,
      Steals: p.Steals,
      Blocks: p.Blocks,
      ThreePM: p.ThreePM,
      ThreePA: p.ThreePA,
      TwoPM: p.TwoPM,
      TwoPA: p.TwoPA,
      FTM: p.FTM,
      FTA: p.FTA,
      GamesPlayed: p.GamesPlayedSet.size,
    }));

    setSeasonTotals(totalsArray);
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

  // Match new folder structure: /images/boys/basketball/players/{PlayerID}.jpg
  const getPlayerPhotoUrl = (playerId) => {
    return `/images/boys/basketball/players/${playerId}.jpg`;
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

  const formatPerGame = (player, key) => {
    const gp = player.GamesPlayed || 0;
    if (!gp) return 0;
    const total = player[key] || 0;
    return (total / gp).toFixed(1);
  };

  // Assist/Turnover ratio (always from season totals)
  const formatAssistToTurnover = (player) => {
    const ast = player.Assists || 0;
    const tov = player.Turnovers || 0;
    if (!tov) {
      // No turnovers → undefined/∞ ratio; show "-" for cleanliness
      return "-";
    }
    return (ast / tov).toFixed(2);
  };

  // -------- Sorting logic for season totals --------
  const countingStatKeys = new Set([
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
  ]);

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
    // For counting stats, respect the toggle between totals and per-game
    if (countingStatKeys.has(key)) {
      if (showPerGame) {
        const gp = player.GamesPlayed || 0;
        if (!gp) return 0;
        return (player[key] || 0) / gp;
      }
    }

    switch (key) {
      case "name":
        return getPlayerName(player.PlayerID).toLowerCase();
      case "jersey":
        return Number(getJerseyNumber(player.PlayerID)) || 0;
      case "GamesPlayed":
        return player.GamesPlayed || 0;
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
      case "AST_TO": {
        const ast = player.Assists || 0;
        const tov = player.Turnovers || 0;
        if (!tov) return 0;
        return ast / tov;
      }
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
      <h1 className="text-3xl font-bold text-center mb-4">2025–26 Season</h1>

      {/* 1. SEASON OVERVIEW */}
      <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="text-2xl font-semibold mt-4 mb-3">Season Overview</h2>

        <div className="text-gray-800 leading-relaxed">
          <a
            href="https://www.flipsnack.com/6D6FD76F8D6/boys-basketball-media-guide-2025-2026.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/boys/basketball/seasons/2025-26/Season2025_26_1.PNG"
              alt="2025–26 St. Andrew's boys' basketball roster"
              className="float-left mr-4 mb-3 w-full max-w-xs rounded-lg shadow cursor-pointer"
            />
          </a>

          <p className="mb-5 leading-relaxed">
            After winning three state championships in the past four years, the
            St. Andrew’s Lions enter the 2025-26 basketball season carrying both
            high expectations and a new identity. For the first time in five
            years, the Lions will take the court without an Edwards brother in
            the lineup, a symbolic turning of the page for one of Georgia’s most
            dominant small-school programs.
          </p>

          <p className="mb-6 leading-relaxed">
            Head coach Mel Abrams, now in his 11th season, guided last year’s
            team to a 26-3 overall record and a perfect 10-0 record in region
            play, which extended their region winning streak to 40 straight
            games over the past four years. But as Abrams looks ahead, he knows
            maintaining that standard will require new voices and new leadership
            to emerge. “Our ability to defend individually and collectively will
            be an area the coaches are observing closely,” Abrams said. “How we
            defend and rebound as a group will determine how far we go.”
          </p>

          <p className="mb-5 leading-relaxed">
            The Lions return a solid core led by Ja’Cari Glover (6’5, F, class
            of ’26), who established himself as one of the region’s most
            versatile forwards last season. Glover’s ability to score, rebound,
            and guard multiple positions will once again anchor the Lions’
            attack. Supporting him is a talented backcourt featuring Page Getter
            (6’3, G, ’28) and Chase Brown (6’3, G, ’28), both young guards who
            gained valuable experience during last year’s playoff run. Guus Blom
            (6’0, SG, ’26), will also be a crucial contributor as a steady
            perimeter shooter and a two-way player.
          </p>

          <img
            src="/images/boys/basketball/seasons/2025-26/Season2025_26_2.PNG"
            alt="St. Andrew's boys' basketball action collage"
            className="float-right ml-4 mt-4 mb-3 w-full max-w-sm rounded-lg shadow"
          />

          <p className="mb-3 leading-relaxed">
            Replacing Zayden Edwards (6’1, G), last year’s all-state performer
            and team captain, along with Miles Cummings (6’8, C), the Lions’
            interior anchor, will be no small task. Their graduation marks the
            end of an era defined by dominance and chemistry but also opens the
            door for new contributors to shape the team’s future. One promising
            addition is Milos Copic (6’6, SG, ’26), a newcomer from Serbia whose
            perimeter shooting and rebounding could provide an immediate boost.
            His versatility gives St. Andrew’s another dimension on offense
            while helping to fill the void left by last year’s senior class.
          </p>

          <p className="mb-4 leading-relaxed">
            St. Andrew’s has built a demanding non-region schedule, designed to
            test the Lions early and prepare them for another deep postseason
            run. For Abrams and his staff, the focus remains on growth,
            particularly on the defensive end as this new-look roster learns to
            play together. “Ja’Cari needs to build on what he did last year,”
            Abrams noted. “If our key returners can take the next step on both
            ends of the court, we have a chance to be very good again.”
          </p>

          <p className="mb-3 leading-relaxed">
            Even amid change, the culture of St. Andrew’s basketball remains
            unmistakable as it will continue to focus on unselfish play,
            relentless defense, and a commitment to excellence that has made the
            program a powerhouse. The names on the roster may be new, but the
            goal is unchanged. As the Lions open a new chapter without an
            Edwards leading the way, the question isn’t whether they can sustain
            their success. Instead, it’s on how they’ll redefine it.
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
                    to={`/athletics/boys/basketball/games/${game.GameID}`}
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
        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-2xl font-semibold">
            📊 Player Statistics for the Season
          </h2>

          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <span
              className={`${
                showPerGame ? "text-gray-400" : "text-gray-900 font-semibold"
              }`}
            >
              Season totals
            </span>
            <button
              type="button"
              onClick={() => setShowPerGame((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                showPerGame ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  showPerGame ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`${
                showPerGame ? "text-gray-900 font-semibold" : "text-gray-400"
              }`}
            >
              Per game averages
            </span>
          </div>
        </div>

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
                    className="border px-2 py-1 text-left cursor-pointer bg-gray-400 sticky left-0 z-40 border-r-4 border-gray-400"
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
                    onClick={() => handleSort("GamesPlayed")}
                  >
                    GP{sortArrow("GamesPlayed")}
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
                    onClick={() => handleSort("AST_TO")}
                  >
                    A/T{sortArrow("AST_TO")}
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
                      <td className="border px-2 py-1 text-left align-middle min-w-[200px] bg-gray-100 sticky left-0 z-20 border-r-4 border-gray-100">
                        <div className="flex items-center gap-2">
                          <img
                            src={photoUrl}
                            alt={name}
                            onError={(e) => {
                              e.currentTarget.src =
                                "/images/boys/basketball/players/default.jpg";
                            }}
                            className="w-8 h-8 rounded-full object-cover border"
                          />
                          <Link
                            to={`/athletics/boys/basketball/players/${player.PlayerID}`}
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
                        {player.GamesPlayed}
                      </td>

                      <td className="border px-2 py-1 align-middle">
                        {showPerGame
                          ? formatPerGame(player, "Points")
                          : player.Points}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {showPerGame
                          ? formatPerGame(player, "Rebounds")
                          : player.Rebounds}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {showPerGame
                          ? formatPerGame(player, "Assists")
                          : player.Assists}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {showPerGame
                          ? formatPerGame(player, "Turnovers")
                          : player.Turnovers}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {formatAssistToTurnover(player)}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {showPerGame
                          ? formatPerGame(player, "Steals")
                          : player.Steals}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {showPerGame
                          ? formatPerGame(player, "Blocks")
                          : player.Blocks}
                      </td>

                      <td className="border px-2 py-1 align-middle">
                        {showPerGame
                          ? formatPerGame(player, "ThreePM")
                          : player.ThreePM}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {showPerGame
                          ? formatPerGame(player, "ThreePA")
                          : player.ThreePA}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {formatPct(player.ThreePM, player.ThreePA)}
                      </td>

                      <td className="border px-2 py-1 align-middle">
                        {showPerGame
                          ? formatPerGame(player, "TwoPM")
                          : player.TwoPM}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {showPerGame
                          ? formatPerGame(player, "TwoPA")
                          : player.TwoPA}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {formatPct(player.TwoPM, player.TwoPA)}
                      </td>

                      <td className="border px-2 py-1 align-middle">
                        {formatEFG(player)}
                      </td>

                      <td className="border px-2 py-1 align-middle">
                        {showPerGame
                          ? formatPerGame(player, "FTM")
                          : player.FTM}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {showPerGame
                          ? formatPerGame(player, "FTA")
                          : player.FTA}
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

export default Season2025_26;
