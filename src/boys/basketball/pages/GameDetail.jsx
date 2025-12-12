import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

// Safe date parsing (prevents blank-screen crashes if a date is ever malformed)
const parseDateSafe = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const s = String(value).trim();
  const d = /^\d+$/.test(s) ? new Date(Number(s)) : new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const formatDate = (value) => {
  const d = parseDateSafe(value);
  if (!d) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// If season is "2025-26" return "2025-26".
// If season is 2025 return "2025-26".
const formatSeasonLabel = (seasonKey) => {
  if (!seasonKey) return "";
  const s = String(seasonKey);
  if (s.includes("-")) return s;

  const yearNum = Number(s);
  if (Number.isNaN(yearNum)) return s;

  const next = (yearNum + 1).toString().slice(-2);
  return `${yearNum}-${next}`;
};

function GameDetail() {
  const { gameId } = useParams();

  const [game, setGame] = useState(null);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setLoadError("");

      try {
        const [gamesRes, statsRes, playersRes] = await Promise.all([
          fetch("/data/boys/basketball/games.json"),
          fetch("/data/boys/basketball/playergamestats.json"),
          fetch("/data/boys/basketball/players.json"),
        ]);

        if (!gamesRes.ok) throw new Error(`games.json ${gamesRes.status}`);
        if (!statsRes.ok) throw new Error(`playergamestats.json ${statsRes.status}`);
        if (!playersRes.ok) throw new Error(`players.json ${playersRes.status}`);

        const [gamesData, statsData, playersData] = await Promise.all([
          gamesRes.json(),
          statsRes.json(),
          playersRes.json(),
        ]);

        setPlayers(playersData);

        const gameObj = gamesData.find(
          (g) => String(g.GameID) === String(gameId)
        );
        setGame(gameObj || null);

        const statsForGame = statsData.filter(
          (s) => String(s.GameID) === String(gameId)
        );
        setPlayerStats(statsForGame);
      } catch (err) {
        console.error("Failed to load game detail:", err);
        setLoadError(String(err?.message || err));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [gameId]);

  // Map PlayerID -> name (robust to field differences)
  const playerNameById = useMemo(() => {
    const map = {};
    for (const p of players) {
      const id = String(p.PlayerID);
      map[id] =
        p.PlayerName ||
        (p.FirstName && p.LastName ? `${p.FirstName} ${p.LastName}` : id);
    }
    return map;
  }, [players]);

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <p className="text-center text-gray-700">Loading game data…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <p className="text-center text-red-700">
          Error loading game data: {loadError}
        </p>
        <div className="text-center">
          <Link
            to="/athletics/boys/basketball"
            className="text-blue-700 hover:underline"
          >
            ← Back to Boys Basketball
          </Link>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <p className="text-center text-gray-700">
          Game not found (GameID: {gameId})
        </p>
        <div className="text-center">
          <Link
            to="/athletics/boys/basketball"
            className="text-blue-700 hover:underline"
          >
            ← Back to Boys Basketball
          </Link>
        </div>
      </div>
    );
  }

  const teamScore = game.TeamScore ?? "-";
  const opponentScore = game.OpponentScore ?? "-";

  const seasonLabel = formatSeasonLabel(game.Season || game.Year || "");
  const seasonBackLink = seasonLabel
    ? `/athletics/boys/basketball/seasons/${seasonLabel}`
    : "/athletics/boys/basketball";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-blue-800">
          {game.Opponent} – Game Detail
        </h1>
        <p className="text-gray-700">
          {formatDate(game.Date)} • {game.LocationType} • {game.GameType}
        </p>
        <p className="text-lg font-semibold">
          Final: {teamScore}–{opponentScore} ({game.Result || "TBD"})
        </p>
      </header>

      {/* Box Score */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Box Score</h2>
        <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-xs border text-center">
            <thead className="bg-gray-200 font-bold">
              <tr>
                <th className="border px-2 py-1 text-left">Player</th>
                <th className="border px-2 py-1">MIN</th>
                <th className="border px-2 py-1">PTS</th>
                <th className="border px-2 py-1">REB</th>
                <th className="border px-2 py-1">AST</th>
                <th className="border px-2 py-1">STL</th>
                <th className="border px-2 py-1">BLK</th>
                <th className="border px-2 py-1">TOV</th>
                <th className="border px-2 py-1">2PM</th>
                <th className="border px-2 py-1">2PA</th>
                <th className="border px-2 py-1">3PM</th>
                <th className="border px-2 py-1">3PA</th>
                <th className="border px-2 py-1">FTM</th>
                <th className="border px-2 py-1">FTA</th>
              </tr>
            </thead>
            <tbody>
              {playerStats.length === 0 ? (
                <tr>
                  <td
                    colSpan={14}
                    className="border px-2 py-3 text-center text-gray-600"
                  >
                    No player statistics available for this game.
                  </td>
                </tr>
              ) : (
                playerStats.map((stat) => {
                  const pid = String(stat.PlayerID);
                  return (
                    <tr key={stat.ID ?? `${stat.GameID}-${pid}`} className="border-t">
                      <td className="border px-2 py-1 text-left whitespace-nowrap">
                        {/* Optional but recommended: click to player page */}
                        <Link
                          to={`/athletics/boys/basketball/players/${pid}`}
                          className="text-blue-700 hover:underline"
                        >
                          {playerNameById[pid] || "Unknown"}
                        </Link>
                      </td>
                      <td className="border px-2 py-1">{stat.MinutesPlayed ?? "-"}</td>
                      <td className="border px-2 py-1">{stat.Points ?? 0}</td>
                      <td className="border px-2 py-1">{stat.Rebounds ?? 0}</td>
                      <td className="border px-2 py-1">{stat.Assists ?? 0}</td>
                      <td className="border px-2 py-1">{stat.Steals ?? 0}</td>
                      <td className="border px-2 py-1">{stat.Blocks ?? 0}</td>
                      <td className="border px-2 py-1">{stat.Turnovers ?? 0}</td>
                      <td className="border px-2 py-1">{stat.TwoPM ?? 0}</td>
                      <td className="border px-2 py-1">{stat.TwoPA ?? 0}</td>
                      <td className="border px-2 py-1">{stat.ThreePM ?? 0}</td>
                      <td className="border px-2 py-1">{stat.ThreePA ?? 0}</td>
                      <td className="border px-2 py-1">{stat.FTM ?? 0}</td>
                      <td className="border px-2 py-1">{stat.FTA ?? 0}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="text-center">
        <Link
          to={seasonBackLink}
          className="inline-block mt-4 text-sm text-blue-700 hover:underline"
        >
          ← Back to {seasonLabel ? `${seasonLabel} Season` : "Boys Basketball"}
        </Link>
      </div>
    </div>
  );
}

export default GameDetail;
