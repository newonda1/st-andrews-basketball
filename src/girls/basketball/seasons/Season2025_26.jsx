import React, { useEffect, useMemo, useState } from "react";
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
  const [showTeamTotals, setShowTeamTotals] = useState(false);

  const SEASON_ID = 2025; // 2025–26 season

  // 1. Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const gamesRes = await fetch("/data/girls/basketball/games.json");
        const statsRes = await fetch("/data/girls/basketball/playergamestats.json");
        const playersRes = await fetch("/data/girls/basketball/players.json");

        const gamesData = await gamesRes.json();
        const statsData = await statsRes.json();
        const playersData = await playersRes.json();

        const seasonGames = gamesData
          .filter((g) => g.Season === SEASON_ID)
          .sort((a, b) => a.Date - b.Date);

        const seasonGameIds = new Set(seasonGames.map((g) => g.GameID));
        const seasonStats = statsData.filter((s) => seasonGameIds.has(s.GameID));

        setGames(seasonGames);
        setPlayerStats(seasonStats);
        setPlayers(playersData);
      } catch (err) {
        console.error("Error loading girls basketball data", err);
      }
    }

    fetchData();
  }, []);

  // 2. Build season totals + games played
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

  // -------- Helpers --------
  const getPlayerName = (id) => {
    const player = players.find((p) => p.PlayerID === id);
    return player ? `${player.FirstName} ${player.LastName}` : "Unknown Player";
  };

  const getJerseyNumber = (id) => {
    const player = players.find((p) => p.PlayerID === id);
    return player && player.JerseyNumber != null ? player.JerseyNumber : "";
  };

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
    if (ms == null) return "";
    const d = new Date(Number(ms));
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString();
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

  const formatAssistToTurnover = (player) => {
    const ast = player.Assists || 0;
    const tov = player.Turnovers || 0;
    if (!tov) return "-";
    return (ast / tov).toFixed(2);
  };

  // ---------- TEAM TOTALS ----------
  const teamGamesPlayed = useMemo(() => {
    const set = new Set();
    for (const s of playerStats) {
      if (s?.GameID != null) set.add(Number(s.GameID));
    }
    return set.size;
  }, [playerStats]);

  const teamTotalsRow = useMemo(() => {
    const t = {
      PlayerID: "TEAM_TOTALS",
      GamesPlayed: teamGamesPlayed,

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

    for (const p of seasonTotals) {
      t.Points += Number(p.Points || 0);
      t.Rebounds += Number(p.Rebounds || 0);
      t.Assists += Number(p.Assists || 0);
      t.Turnovers += Number(p.Turnovers || 0);
      t.Steals += Number(p.Steals || 0);
      t.Blocks += Number(p.Blocks || 0);

      t.ThreePM += Number(p.ThreePM || 0);
      t.ThreePA += Number(p.ThreePA || 0);

      t.TwoPM += Number(p.TwoPM || 0);
      t.TwoPA += Number(p.TwoPA || 0);

      t.FTM += Number(p.FTM || 0);
      t.FTA += Number(p.FTA || 0);
    }

    return t;
  }, [seasonTotals, teamGamesPlayed]);

  const formatTeamPerGame = (value) => {
    if (!teamGamesPlayed) return "—";
    return (Number(value || 0) / teamGamesPlayed).toFixed(1);
  };

  const formatTeamAssistToTurnover = (t) => {
    const ast = Number(t.Assists || 0);
    const tov = Number(t.Turnovers || 0);
    if (!tov) return "-";
    return (ast / tov).toFixed(2);
  };

  // -------- Sorting --------
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
        return { key, direction: prev.direction === "desc" ? "asc" : "desc" };
      }
      return { key, direction: "desc" };
    });
  };

  const getSortValue = (player, key) => {
    if (countingStatKeys.has(key) && showPerGame) {
      const gp = player.GamesPlayed || 0;
      if (!gp) return 0;
      return (player[key] || 0) / gp;
    }

    switch (key) {
      case "name":
        return getPlayerName(player.PlayerID).toLowerCase();
      case "jersey":
        return Number(getJerseyNumber(player.PlayerID)) || 0;
      case "GamesPlayed":
        return player.GamesPlayed || 0;
      case "ThreePct":
        return rawPct(player.ThreePM, player.ThreePA);
      case "TwoPct":
        return rawPct(player.TwoPM, player.TwoPA);
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
        return player[key] || 0;
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
    <div className="p-4 space-y-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4">2025–26 Season</h1>

      {/* 1. SEASON OVERVIEW (kept the same as your current girls page) */}
      <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="text-2xl font-semibold mt-4 mb-3">Season Overview</h2>

        <div className="text-gray-800 leading-relaxed">
          <a
            href="https://www.flipsnack.com/6D6FD76F8D6/2025-2026-girl-s-basketball-media-guide"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/girls/basketball/seasons/2025-26/Season2025_26_1.png"
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
            strengthens as a whole and continues its steady rise toward long-term
            powerhouse potential.
          </p>

          <p className="mb-4 leading-relaxed">
            The program’s core principles continue to shape its competitive and
            developmental framework. Effort is the bedrock of the culture, with
            athletes expected to bring full intensity to every practice, warm-up,
            and game. St. Andrew’s also maintains a strong team-first identity,
            blending diverse skill sets and playing styles into a cohesive system
            while still honoring each athlete’s strengths and aspirations. The
            program values joy and connection as competitive advantages,
            encouraging players to be energetic, vocal, and deeply supportive of
            one another. Skill development remains a top priority, with
            fundamentals—ball-handling, shooting, defending, decision-making, and
            basketball IQ—serving as the foundation for advancement. The emphasis
            on returning to the basics aligns with the program’s long-term
            player-development model.
          </p>

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
            The program’s seasonal objectives—Learn, Improve, Thrive—capture
            its developmental mission. The JV and Varsity structures are
            intentionally designed to support players from 8th through 11th
            grade, offering age-appropriate roles and opportunities. Some
            athletes will benefit from extended game exposure through the
            six-quarter rule, allowing them to gain valuable experience that
            aligns with their development path. Preseason participation played
            a meaningful role in early-season readiness, offering athletes
            clarity on how offseason preparation influences their in-season
            progression.
          </p>

          <p className="mb-4 leading-relaxed">
            Recruitment education continues to be a key component of the St.
            Andrew’s basketball experience. The coaching staff provides
            insight into modern evaluation criteria, emphasizing intangible
            qualities such as attitude, competitiveness, motor, defensive
            ability, skill versatility, and basketball IQ. The program aims to
            ensure its athletes understand the far-reaching factors that shape
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

      {/* 2. SCHEDULE (matches boys page + toggle) */}
      <section>
        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-2xl font-semibold">📅 Schedule &amp; Results</h2>

          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span
              className={`${
                showTeamTotals ? "text-gray-400" : "text-gray-900 font-semibold"
              }`}
            >
              Game Result
            </span>

            <button
              type="button"
              onClick={() => setShowTeamTotals((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                showTeamTotals ? "bg-green-500" : "bg-gray-300"
              }`}
              aria-label="Toggle Game Result / Team Totals"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  showTeamTotals ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>

            <span
              className={`${
                showTeamTotals ? "text-gray-900 font-semibold" : "text-gray-400"
              }`}
            >
              Team Totals
            </span>
          </div>
        </div>

        {(() => {
          const safeNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

          const pct = (made, att) => {
            const m = safeNum(made);
            const a = safeNum(att);
            if (a <= 0) return "—";
            return `${((m / a) * 100).toFixed(1)}%`;
          };

          const assistTo = (ast, to) => {
            const a = safeNum(ast);
            const t = safeNum(to);
            if (t <= 0) return "—";
            return (a / t).toFixed(2);
          };

          const teamTotalsByGameId = new Map();

          for (const g of games) {
            const gid = g.GameID;
            const rows = playerStats.filter(
              (s) => Number(s.GameID) === Number(gid)
            );

            const totals = {
              REB: 0,
              AST: 0,
              TO: 0,
              STL: 0,
              BLK: 0,
              ThreePM: 0,
              ThreePA: 0,
              TwoPM: 0,
              TwoPA: 0,
              FTM: 0,
              FTA: 0,
            };

            for (const r of rows) {
              totals.REB += safeNum(r.Rebounds);
              totals.AST += safeNum(r.Assists);
              totals.TO += safeNum(r.Turnovers);
              totals.STL += safeNum(r.Steals);
              totals.BLK += safeNum(r.Blocks);

              totals.ThreePM += safeNum(r.ThreePM);
              totals.ThreePA += safeNum(r.ThreePA);

              totals.TwoPM += safeNum(r.TwoPM);
              totals.TwoPA += safeNum(r.TwoPA);

              totals.FTM += safeNum(r.FTM);
              totals.FTA += safeNum(r.FTA);
            }

            teamTotalsByGameId.set(Number(gid), totals);
          }

          return (
            <div className="overflow-x-auto">
              {!showTeamTotals ? (
                <table className="min-w-full border text-xs sm:text-sm text-center">
                  <thead className="bg-gray-100">
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
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          {game.Opponent}
                        </Link>
                      ) : (
                        game.Opponent
                      );

                      return (
                        <tr
                          key={game.GameID || idx}
                          className={idx % 2 ? "bg-gray-50" : "bg-white"}
                        >
                          <td className="border px-2 py-1">{formatDate(game.Date)}</td>
                          <td className="border px-2 py-1">{opponentCell}</td>
                          <td className="border px-2 py-1">{formatResult(game)}</td>
                          <td className="border px-2 py-1 whitespace-nowrap">
                            {formatScore(game)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <table className="min-w-full border text-xs sm:text-sm text-center whitespace-nowrap">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-2 py-1">Date</th>
                      <th className="border px-2 py-1">Opponent</th>

                      <th className="border px-2 py-1">REB</th>
                      <th className="border px-2 py-1">AST</th>
                      <th className="border px-2 py-1">TO</th>
                      <th className="border px-2 py-1">A/T</th>
                      <th className="border px-2 py-1">STL</th>
                      <th className="border px-2 py-1">BLK</th>

                      <th className="border px-2 py-1">3PM</th>
                      <th className="border px-2 py-1">3PA</th>
                      <th className="border px-2 py-1">3P%</th>

                      <th className="border px-2 py-1">2PM</th>
                      <th className="border px-2 py-1">2PA</th>
                      <th className="border px-2 py-1">2P%</th>

                      <th className="border px-2 py-1">FTM</th>
                      <th className="border px-2 py-1">FTA</th>
                      <th className="border px-2 py-1">FT%</th>
                    </tr>
                  </thead>

                  <tbody>
                    {games.map((game, idx) => {
                      const totals = teamTotalsByGameId.get(Number(game.GameID)) || null;
                      const hasResult = game.Result === "W" || game.Result === "L";

                      const opponentCell = hasResult ? (
                        <Link
                          to={`/athletics/girls/basketball/games/${game.GameID}`}
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          {game.Opponent}
                        </Link>
                      ) : (
                        game.Opponent
                      );

                      return (
                        <tr
                          key={game.GameID || idx}
                          className={idx % 2 ? "bg-gray-50" : "bg-white"}
                        >
                          <td className="border px-2 py-1">{formatDate(game.Date)}</td>
                          <td className="border px-2 py-1">{opponentCell}</td>

                          <td className="border px-2 py-1">{totals ? totals.REB : "—"}</td>
                          <td className="border px-2 py-1">{totals ? totals.AST : "—"}</td>
                          <td className="border px-2 py-1">{totals ? totals.TO : "—"}</td>
                          <td className="border px-2 py-1">
                            {totals ? assistTo(totals.AST, totals.TO) : "—"}
                          </td>
                          <td className="border px-2 py-1">{totals ? totals.STL : "—"}</td>
                          <td className="border px-2 py-1">{totals ? totals.BLK : "—"}</td>

                          <td className="border px-2 py-1">{totals ? totals.ThreePM : "—"}</td>
                          <td className="border px-2 py-1">{totals ? totals.ThreePA : "—"}</td>
                          <td className="border px-2 py-1">
                            {totals ? pct(totals.ThreePM, totals.ThreePA) : "—"}
                          </td>

                          <td className="border px-2 py-1">{totals ? totals.TwoPM : "—"}</td>
                          <td className="border px-2 py-1">{totals ? totals.TwoPA : "—"}</td>
                          <td className="border px-2 py-1">
                            {totals ? pct(totals.TwoPM, totals.TwoPA) : "—"}
                          </td>

                          <td className="border px-2 py-1">{totals ? totals.FTM : "—"}</td>
                          <td className="border px-2 py-1">{totals ? totals.FTA : "—"}</td>
                          <td className="border px-2 py-1">
                            {totals ? pct(totals.FTM, totals.FTA) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          );
        })()}
      </section>

      {/* 3. PLAYER STATS TABLE (matches boys page + toggle + GP + Team Totals row) */}
      <section>
        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-2xl font-semibold">📊 Player Statistics for the Season</h2>

          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <span className={`${showPerGame ? "text-gray-400" : "text-gray-900 font-semibold"}`}>
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
            <span className={`${showPerGame ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
              Per game averages
            </span>
          </div>
        </div>

        {seasonTotals.length === 0 ? (
          <p className="text-gray-600">No player statistics are available yet for this season.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-xs sm:text-sm text-center whitespace-nowrap">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    className="border px-2 py-1 cursor-pointer sticky left-0 z-40 bg-gray-100 border-r text-center min-w-[200px]"
                    onClick={() => handleSort("name")}
                  >
                    Player{sortArrow("name")}
                  </th>

                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("jersey")}>
                    #{sortArrow("jersey")}
                  </th>
                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("GamesPlayed")}>
                    GP{sortArrow("GamesPlayed")}
                  </th>

                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("Points")}>
                    PTS{sortArrow("Points")}
                  </th>
                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("Rebounds")}>
                    REB{sortArrow("Rebounds")}
                  </th>
                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("Assists")}>
                    AST{sortArrow("Assists")}
                  </th>
                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("Turnovers")}>
                    TO{sortArrow("Turnovers")}
                  </th>
                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("AST_TO")}>
                    A/T{sortArrow("AST_TO")}
                  </th>
                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("Steals")}>
                    STL{sortArrow("Steals")}
                  </th>
                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("Blocks")}>
                    BLK{sortArrow("Blocks")}
                  </th>

                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("ThreePM")}>
                    3PM{sortArrow("ThreePM")}
                  </th>
                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("ThreePA")}>
                    3PA{sortArrow("ThreePA")}
                  </th>
                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("ThreePct")}>
                    3P%{sortArrow("ThreePct")}
                  </th>

                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("TwoPM")}>
                    2PM{sortArrow("TwoPM")}
                  </th>
                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("TwoPA")}>
                    2PA{sortArrow("TwoPA")}
                  </th>
                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("TwoPct")}>
                    2P%{sortArrow("TwoPct")}
                  </th>

                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("eFG")}>
                    eFG%{sortArrow("eFG")}
                  </th>

                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("FTM")}>
                    FTM{sortArrow("FTM")}
                  </th>
                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("FTA")}>
                    FTA{sortArrow("FTA")}
                  </th>
                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("FTPct")}>
                    FT%{sortArrow("FTPct")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedSeasonTotals.map((player, idx) => {
                  const name = getPlayerName(player.PlayerID);
                  const jersey = getJerseyNumber(player.PlayerID);
                  const photoUrl = getPlayerPhotoUrl(player.PlayerID);
                  const rowBg = idx % 2 === 0 ? "bg-white" : "bg-gray-50";

                  return (
                    <tr key={player.PlayerID} className={rowBg}>
                      <td
                        className={`border px-2 py-1 text-left align-middle sticky left-0 z-20 ${rowBg} border-r min-w-[200px]`}
                      >
                        <div className="flex items-center justify-start gap-2">
                          <img
                            src={photoUrl}
                            alt={name}
                            onError={(e) => {
                              e.currentTarget.src = "/images/common/logo.png";
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

                      <td className="border px-2 py-1 align-middle">{jersey}</td>
                      <td className="border px-2 py-1 align-middle">{player.GamesPlayed}</td>

                      <td className="border px-2 py-1 align-middle">
                        {showPerGame ? formatPerGame(player, "Points") : player.Points}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {showPerGame ? formatPerGame(player, "Rebounds") : player.Rebounds}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {showPerGame ? formatPerGame(player, "Assists") : player.Assists}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {showPerGame ? formatPerGame(player, "Turnovers") : player.Turnovers}
                      </td>
                      <td className="border px-2 py-1 align-middle">{formatAssistToTurnover(player)}</td>
                      <td className="border px-2 py-1 align-middle">
                        {showPerGame ? formatPerGame(player, "Steals") : player.Steals}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {showPerGame ? formatPerGame(player, "Blocks") : player.Blocks}
                      </td>

                      <td className="border px-2 py-1 align-middle">
                        {showPerGame ? formatPerGame(player, "ThreePM") : player.ThreePM}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {showPerGame ? formatPerGame(player, "ThreePA") : player.ThreePA}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {formatPct(player.ThreePM, player.ThreePA)}
                      </td>

                      <td className="border px-2 py-1 align-middle">
                        {showPerGame ? formatPerGame(player, "TwoPM") : player.TwoPM}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {showPerGame ? formatPerGame(player, "TwoPA") : player.TwoPA}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {formatPct(player.TwoPM, player.TwoPA)}
                      </td>

                      <td className="border px-2 py-1 align-middle">{formatEFG(player)}</td>

                      <td className="border px-2 py-1 align-middle">
                        {showPerGame ? formatPerGame(player, "FTM") : player.FTM}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {showPerGame ? formatPerGame(player, "FTA") : player.FTA}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {formatPct(player.FTM, player.FTA)}
                      </td>
                    </tr>
                  );
                })}

                {/* TEAM TOTALS ROW */}
                <tr className="bg-gray-100 font-semibold">
                  <td className="border px-2 py-1 sticky left-0 z-30 bg-gray-100 border-r text-center min-w-[200px]">
                    Team Totals
                  </td>

                  <td className="border px-2 py-1">{""}</td>
                  <td className="border px-2 py-1">{teamTotalsRow.GamesPlayed || 0}</td>

                  <td className="border px-2 py-1">
                    {showPerGame ? formatTeamPerGame(teamTotalsRow.Points) : teamTotalsRow.Points}
                  </td>
                  <td className="border px-2 py-1">
                    {showPerGame ? formatTeamPerGame(teamTotalsRow.Rebounds) : teamTotalsRow.Rebounds}
                  </td>
                  <td className="border px-2 py-1">
                    {showPerGame ? formatTeamPerGame(teamTotalsRow.Assists) : teamTotalsRow.Assists}
                  </td>
                  <td className="border px-2 py-1">
                    {showPerGame ? formatTeamPerGame(teamTotalsRow.Turnovers) : teamTotalsRow.Turnovers}
                  </td>
                  <td className="border px-2 py-1">{formatTeamAssistToTurnover(teamTotalsRow)}</td>
                  <td className="border px-2 py-1">
                    {showPerGame ? formatTeamPerGame(teamTotalsRow.Steals) : teamTotalsRow.Steals}
                  </td>
                  <td className="border px-2 py-1">
                    {showPerGame ? formatTeamPerGame(teamTotalsRow.Blocks) : teamTotalsRow.Blocks}
                  </td>

                  <td className="border px-2 py-1">
                    {showPerGame ? formatTeamPerGame(teamTotalsRow.ThreePM) : teamTotalsRow.ThreePM}
                  </td>
                  <td className="border px-2 py-1">
                    {showPerGame ? formatTeamPerGame(teamTotalsRow.ThreePA) : teamTotalsRow.ThreePA}
                  </td>
                  <td className="border px-2 py-1">{formatPct(teamTotalsRow.ThreePM, teamTotalsRow.ThreePA)}</td>

                  <td className="border px-2 py-1">
                    {showPerGame ? formatTeamPerGame(teamTotalsRow.TwoPM) : teamTotalsRow.TwoPM}
                  </td>
                  <td className="border px-2 py-1">
                    {showPerGame ? formatTeamPerGame(teamTotalsRow.TwoPA) : teamTotalsRow.TwoPA}
                  </td>
                  <td className="border px-2 py-1">{formatPct(teamTotalsRow.TwoPM, teamTotalsRow.TwoPA)}</td>

                  <td className="border px-2 py-1">{formatEFG(teamTotalsRow)}</td>

                  <td className="border px-2 py-1">
                    {showPerGame ? formatTeamPerGame(teamTotalsRow.FTM) : teamTotalsRow.FTM}
                  </td>
                  <td className="border px-2 py-1">
                    {showPerGame ? formatTeamPerGame(teamTotalsRow.FTA) : teamTotalsRow.FTA}
                  </td>
                  <td className="border px-2 py-1">{formatPct(teamTotalsRow.FTM, teamTotalsRow.FTA)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Season2025_26;
