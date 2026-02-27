import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function Season2022_23() {
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

  const SEASON_ID = 2022; // 2022–23 season

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    async function fetchData() {
      const gamesRes = await fetch("/data/boys/basketball/games.json");
      const statsRes = await fetch("/data/boys/basketball/playergamestats.json");
      const playersRes = await fetch("/data/boys/basketball/players.json");

      const gamesData = await gamesRes.json();
      const statsData = await statsRes.json();
      const playersData = await playersRes.json();

      const seasonGames = gamesData
        .filter((g) => g.Season === SEASON_ID)
        .sort(
          (a, b) => (Number(a.GameID) || 0) - (Number(b.GameID) || 0)
        );

      const seasonGameIds = new Set(seasonGames.map((g) => g.GameID));
      const seasonStats = statsData.filter((s) => seasonGameIds.has(s.GameID));

      setGames(seasonGames);
      setPlayerStats(seasonStats);
      setPlayers(playersData);
    }

    fetchData();
  }, []);

  // ---------------- BUILD TOTALS ----------------
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

  // ---------------- HELPERS ----------------
  const formatDateFromGameID = (gameId) => {
    if (!gameId) return "";
    const n = Number(gameId);
    const year = Math.floor(n / 10000);
    const month = Math.floor(n / 100) % 100;
    const day = n % 100;

    const d = new Date(Date.UTC(year, month - 1, day));

    return d.toLocaleDateString("en-US", {
      timeZone: "UTC",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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

  // ---------------- RETURN ----------------
  return (
    <div className="pt-2 pb-4 space-y-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2">2022–23 Season</h1>

      {/* ---------------- SEASON OVERVIEW PLACEHOLDER ---------------- */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold mt-4 mb-3">Season Overview</h2>

        <div className="text-gray-600 italic">
          A full season recap will be added soon.
        </div>
      </section>

      {/* ---------------- SCHEDULE ---------------- */}
      <section>
        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-2xl font-semibold">📅 Schedule & Results</h2>
        </div>

        <div className="overflow-x-auto">
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
              {games.map((game, idx) => (
                <tr key={game.GameID} className={idx % 2 ? "bg-gray-50" : "bg-white"}>
                  <td className="border px-2 py-1">
                    {formatDateFromGameID(game.GameID)}
                  </td>
                  <td className="border px-2 py-1">
                    <Link
                      to={`/athletics/boys/basketball/games/${game.GameID}`}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {game.Opponent}
                    </Link>
                  </td>
                  <td className="border px-2 py-1">{formatResult(game)}</td>
                  <td className="border px-2 py-1 whitespace-nowrap">
                    {formatScore(game)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------- PLAYER STATS PLACEHOLDER ---------------- */}
      <section>
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          📊 Player Statistics for the Season
        </h2>

        {seasonTotals.length === 0 ? (
          <p className="text-gray-600">
            Player statistics for this season are still being entered.
          </p>
        ) : (
          <p>Statistics table will display here once data is complete.</p>
        )}
      </section>
    </div>
  );
}

export default Season2022_23;
