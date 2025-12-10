import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function GameDetail() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [gamesRes, statsRes, playersRes] = await Promise.all([
          fetch("/data/girls/basketball/games.json"),
          fetch("/data/girls/basketball/playergamestats.json"),
          fetch("/data/girls/basketball/players.json"),
        ]);

        const [gamesData, statsData, playersData] = await Promise.all([
          gamesRes.json(),
          statsRes.json(),
          playersRes.json(),
        ]);

        const idNum = Number(gameId);

        const thisGame = gamesData.find((g) => Number(g.GameID) === idNum);
        const thisStats = statsData.filter(
          (s) => Number(s.GameID) === idNum
        );

        setGame(thisGame || null);
        setPlayerStats(thisStats);
        setPlayers(playersData || []);
      } catch (err) {
        console.error("Failed to load girls game detail data:", err);
      }
    }

    fetchData();
  }, [gameId]);

  // Player name lookup for girls players.json
  const getPlayerName = (playerId) => {
    const idNum = Number(playerId);

    const p = players.find((pl) => Number(pl.PlayerID) === idNum);

    if (!p) {
      return `Player ${playerId}`;
    }

    if (p.FirstName && p.LastName) {
      return `${p.FirstName} ${p.LastName}`;
    }

    return `Player ${playerId}`;
  };

  // Girls photos: /images/girls/basketball/players/{PlayerID}.jpg
  const getPlayerPhotoUrl = (playerId) => {
    return `/images/girls/basketball/players/${playerId}.jpg`;
  };

  const formatDate = (ms) =>
    new Date(ms).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  // Helper for percentages like 3P%, 2P%, FT%
  const formatPct = (made, att) => {
    const m = Number(made);
    const a = Number(att);
    if (!a || a <= 0 || isNaN(m) || isNaN(a)) return "-";
    return ((m / a) * 100).toFixed(1);
  };

  // Effective FG% = (FGM + 0.5 * 3PM) / FGA * 100
  const calcEFG = (twoPM, threePM, twoPA, threePA) => {
    const tpm = Number(twoPM) || 0;
    const thpm = Number(threePM) || 0;
    const tpa = Number(twoPA) || 0;
    const thpa = Number(threePA) || 0;

    const fgm = tpm + thpm;
    const fga = tpa + thpa;

    if (!fga || fga <= 0) return "-";

    const efg = ((fgm + 0.5 * thpm) / fga) * 100;
    return efg.toFixed(1);
  };

  if (!game) {
    return <div className="p-4">Game not found.</div>;
  }

  const resultText =
    game.Result === "W"
      ? "Win"
      : game.Result === "L"
      ? "Loss"
      : "Result pending";

  const showScore = game.Result === "W" || game.Result === "L";

  return (
    <div className="p-4 space-y-6">
      {/* Back to girls 2025–26 season page */}
      <Link
        to="/athletics/girls/basketball"
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to 2025–26 Season
      </Link>

      <header>
        <h1 className="text-2xl font-bold mb-2">
          {formatDate(game.Date)} vs {game.Opponent}
        </h1>
        <p className="text-lg">
          {resultText}
          {showScore && (
            <>
              {" "}
              — {game.TeamScore}–{game.OpponentScore}
            </>
          )}
        </p>
        <p className="text-sm text-gray-600">
          {game.LocationType} • {game.GameType}
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-2">Game Recap</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {game.Recap && game.Recap.trim().length > 0
            ? game.Recap
            : "Recap coming soon."}
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Box Score</h2>
        {playerStats.length === 0 ? (
          <p className="text-gray-600">
            No player statistics recorded for this game yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-xs sm:text-sm text-center">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1 text-left">Player</th>
                  <th className="border px-2 py-1">PTS</th>
                  <th className="border px-2 py-1">REB</th>
                  <th className="border px-2 py-1">AST</th>
                  <th className="border px-2 py-1">TO</th>
                  <th className="border px-2 py-1">STL</th>
                  <th className="border px-2 py-1">BLK</th>
                  <th className="border px-2 py-1">3PM</th>
                  <th className="border px-2 py-1">3PA</th>
                  <th className="border px-2 py-1">3P%</th>
                  <th className="border px-2 py-1">2PM</th>
                  <th className="border px-2 py-1">2PA</th>
                  <th className="border px-2 py-1">2P%</th>
                  <th className="border px-2 py-1">eFG%</th>
                  <th className="border px-2 py-1">FTM</th>
                  <th className="border px-2 py-1">FTA</th>
                  <th className="border px-2 py-1">FT%</th>
                </tr>
              </thead>
              <tbody>
                {playerStats.map((s) => {
                  const threePct = formatPct(s.ThreePM, s.ThreePA);
                  const twoPct = formatPct(s.TwoPM, s.TwoPA);
                  const efgPct = calcEFG(
                    s.TwoPM,
                    s.ThreePM,
                    s.TwoPA,
                    s.ThreePA
                  );
                  const ftPct = formatPct(s.FTM, s.FTA);

                  return (
                    <tr key={s.StatID}>
                      {/* Player column: left-aligned with photo */}
                      <td className="border px-2 py-1 align-middle text-left">
                        <div className="flex items-center justify-start gap-2">
                          <img
                            src={getPlayerPhotoUrl(s.PlayerID)}
                            alt={getPlayerName(s.PlayerID)}
                            onError={(e) =>
                              (e.currentTarget.src =
                                "/images/girls/basketball/players/default.jpg")
                            }
                            className="w-8 h-8 rounded-full object-cover border"
                          />
                          <Link
                            to={`/athletics/girls/basketball/players/${s.PlayerID}`}
                            className="text-blue-600 underline hover:text-blue-800"
                          >
                            {getPlayerName(s.PlayerID)}
                          </Link>
                        </div>
                      </td>

                      {/* All other columns: centered */}
                      <td className="border px-2 py-1 align-middle">
                        {s.Points}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {s.Rebounds}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {s.Assists}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {s.Turnovers}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {s.Steals}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {s.Blocks}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {s.ThreePM}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {s.ThreePA}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {threePct}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {s.TwoPM}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {s.TwoPA}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {twoPct}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {efgPct}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {s.FTM}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {s.FTA}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {ftPct}
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

export default GameDetail;
