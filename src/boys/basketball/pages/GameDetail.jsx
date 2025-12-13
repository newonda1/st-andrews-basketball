import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function GameDetail() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);

  // ✅ Update these two bases to match your new public folder organization
  // Common options you might be using:
  // 1) "/boys/basketball/data/"
  // 2) "/data/boys/basketball/"
  // 3) `${import.meta.env.BASE_URL}boys/basketball/data/`
  const DATA_BASE = `${import.meta.env.BASE_URL}boys/basketball/data/`;
  const PLAYER_IMG_BASE = `${import.meta.env.BASE_URL}boys/basketball/images/players/`;

  useEffect(() => {
    async function fetchData() {
      try {
        const [gamesRes, statsRes, playersRes] = await Promise.all([
          fetch(`${DATA_BASE}games.json`),
          fetch(`${DATA_BASE}playergamestats.json`),
          fetch(`${DATA_BASE}players.json`),
        ]);

        const [gamesData, statsData, playersData] = await Promise.all([
          gamesRes.json(),
          statsRes.json(),
          playersRes.json(),
        ]);

        const idNum = Number(gameId);

        const thisGame = gamesData.find((g) => Number(g.GameID) === idNum);
        const thisStats = statsData.filter((s) => Number(s.GameID) === idNum);

        setGame(thisGame || null);
        setPlayerStats(thisStats);
        setPlayers(playersData || []);
      } catch (err) {
        console.error("Failed to load game detail data:", err);
      }
    }

    fetchData();
  }, [gameId, DATA_BASE]);

  const getPlayerName = (playerId) => {
    const idNum = Number(playerId);

    const p =
      players.find((pl) => Number(pl.PlayerID) === idNum) ||
      players.find((pl) => Number(pl.PlayerId) === idNum) ||
      players.find((pl) => Number(pl.ID) === idNum);

    if (!p) return `Player ${playerId}`;

    const fullName =
      p.PlayerName ||
      p.Name ||
      (p.FirstName && p.LastName ? `${p.FirstName} ${p.LastName}` : null);

    return fullName || `Player ${playerId}`;
  };

  const getPlayerPhotoUrl = (playerId) => {
    return `${PLAYER_IMG_BASE}${playerId}.jpg`;
  };

  const formatDate = (ms) =>
    new Date(ms).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatPct = (made, att) => {
    const m = Number(made);
    const a = Number(att);
    if (!a || a <= 0 || isNaN(m) || isNaN(a)) return "-";
    return ((m / a) * 100).toFixed(1);
  };

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
    game.Result === "W" ? "Win" : game.Result === "L" ? "Loss" : "Result pending";

  const showScore = game.Result === "W" || game.Result === "L";

  // ✅ Dynamic season back-link (instead of hardcoding 2025–26)
  // Falls back to 2025-26 if SeasonID is missing in older data.
  const seasonPath = game.SeasonID
    ? `/boys/basketball/seasons/${game.SeasonID}`
    : `/boys/basketball/seasons/2025-26`;

  return (
    <div className="p-4 space-y-6">
      <Link to={seasonPath} className="text-sm text-blue-600 hover:underline">
        ← Back to Season
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
          {game.Recap && game.Recap.trim().length > 0 ? game.Recap : "Recap coming soon."}
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Box Score</h2>
        {playerStats.length === 0 ? (
          <p className="text-gray-600">No player statistics recorded for this game yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-xs sm:text-sm text-center">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1">Player</th>
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
                  const efgPct = calcEFG(s.TwoPM, s.ThreePM, s.TwoPA, s.ThreePA);
                  const ftPct = formatPct(s.FTM, s.FTA);

                  return (
                    <tr key={s.PlayerGameStatsID ?? `${s.GameID}-${s.PlayerID}`}>
                      <td className="border px-2 py-1 align-middle text-left">
                        <div className="flex items-center justify-start gap-2">
                          <img
                            src={getPlayerPhotoUrl(s.PlayerID)}
                            alt={getPlayerName(s.PlayerID)}
                            onError={(e) => {
                              e.currentTarget.src = `${PLAYER_IMG_BASE}default.jpg`;
                            }}
                            className="w-8 h-8 rounded-full object-cover border"
                          />
                          <Link
                            to={`/boys/basketball/players/${s.PlayerID}`}
                            className="text-blue-600 underline hover:text-blue-800"
                          >
                            {getPlayerName(s.PlayerID)}
                          </Link>
                        </div>
                      </td>

                      <td className="border px-2 py-1 align-middle">{s.Points}</td>
                      <td className="border px-2 py-1 align-middle">{s.Rebounds}</td>
                      <td className="border px-2 py-1 align-middle">{s.Assists}</td>
                      <td className="border px-2 py-1 align-middle">{s.Turnovers}</td>
                      <td className="border px-2 py-1 align-middle">{s.Steals}</td>
                      <td className="border px-2 py-1 align-middle">{s.Blocks}</td>
                      <td className="border px-2 py-1 align-middle">{s.ThreePM}</td>
                      <td className="border px-2 py-1 align-middle">{s.ThreePA}</td>
                      <td className="border px-2 py-1 align-middle">{threePct}</td>
                      <td className="border px-2 py-1 align-middle">{s.TwoPM}</td>
                      <td className="border px-2 py-1 align-middle">{s.TwoPA}</td>
                      <td className="border px-2 py-1 align-middle">{twoPct}</td>
                      <td className="border px-2 py-1 align-middle">{efgPct}</td>
                      <td className="border px-2 py-1 align-middle">{s.FTM}</td>
                      <td className="border px-2 py-1 align-middle">{s.FTA}</td>
                      <td className="border px-2 py-1 align-middle">{ftPct}</td>
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
