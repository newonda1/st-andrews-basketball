import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

function GameDetailHistorical() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // public/data/boys/basketball/...
  const DATA_BASE = "/data/boys/basketball/";
  const PLAYER_IMG_BASE = "/images/boys/basketball/players/";

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);

      try {
        const [gamesRes, statsRes, playersRes] = await Promise.all([
          fetch(`${DATA_BASE}games.json`),
          fetch(`${DATA_BASE}playergamestats.json`),
          fetch(`${DATA_BASE}players.json`),
        ]);

        if (!gamesRes.ok || !statsRes.ok || !playersRes.ok) {
          throw new Error(
            `Fetch failed: games(${gamesRes.status}) stats(${statsRes.status}) players(${playersRes.status})`
          );
        }

        const [gamesData, statsData, playersData] = await Promise.all([
          gamesRes.json(),
          statsRes.json(),
          playersRes.json(),
        ]);

        const idNum = Number(gameId);

        const thisGame = gamesData.find((g) => Number(g.GameID) === idNum);
        const thisStats = statsData.filter((s) => Number(s.GameID) === idNum);

        if (!cancelled) {
          setGame(thisGame || null);
          setPlayerStats(thisStats || []);
          setPlayers(playersData || []);
        }
      } catch (err) {
        console.error("Failed to load historical game detail data:", err);
        if (!cancelled) {
          setGame(null);
          setPlayerStats([]);
          setPlayers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [gameId]);

  // ---------- helpers ----------
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

  const getPlayerPhotoUrl = (playerId) => `${PLAYER_IMG_BASE}${playerId}.jpg`;

  const formatDate = (gameId) => {
    if (!gameId) return "";

    const n = Number(gameId);
   if (!Number.isFinite(n)) return "";

   const year = Math.floor(n / 10000);
   const month = Math.floor(n / 100) % 100;
   const day = n % 100;

   if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) {
    return "";
   }

   const d = new Date(Date.UTC(year, month - 1, day));

   return d.toLocaleDateString(undefined, {
     timeZone: "UTC",
      month: "short",
     day: "numeric",
     year: "numeric",
   });
  };

  // Build a season slug like "2025-26" from the start year in your games.json ("Season": 2025)
  const seasonSlugFromYearStart = (yearStart) => {
    const ys = Number(yearStart);
    if (!ys || isNaN(ys)) return null;
    const ye2 = String(ys + 1).slice(-2);
    return `${ys}-${ye2}`;
  };

  const isNumberLike = (v) => {
    if (v == null || v === "") return false;
    const n = Number(v);
    return Number.isFinite(n);
  };

  // Cell display:
  // - if missing OR not numeric -> "—"
  // - else show the original value (so you keep integers as stored)
  const cellOrDash = (v) => (isNumberLike(v) ? v : "—");

  const safeNum = (v) => (isNumberLike(v) ? Number(v) : 0);

  // For totals rule:
  // If ANY player row is missing a stat for a column, totals for that column should be "—"
  const anyMissingInColumn = (key) => playerStats.some((s) => !isNumberLike(s?.[key]));

  // ✅ Team totals row for historical (PTS always calculated)
  const teamTotals = useMemo(() => {
    if (!playerStats || playerStats.length === 0) return null;

    const totals = {
      Points: playerStats.reduce((acc, s) => acc + safeNum(s?.Points), 0), // always computed
      Rebounds: anyMissingInColumn("Rebounds")
        ? "—"
        : playerStats.reduce((acc, s) => acc + safeNum(s?.Rebounds), 0),
      Assists: anyMissingInColumn("Assists")
        ? "—"
        : playerStats.reduce((acc, s) => acc + safeNum(s?.Assists), 0),
      Steals: anyMissingInColumn("Steals")
        ? "—"
        : playerStats.reduce((acc, s) => acc + safeNum(s?.Steals), 0),
    };

    return totals;
  }, [playerStats]);

  if (loading) {
    return <div className="p-4">Loading…</div>;
  }

  if (!game) {
    return <div className="p-4">Game not found.</div>;
  }

  const resultText =
    game.Result === "W" ? "Win" : game.Result === "L" ? "Loss" : "Result pending";

  const showScore = game.Result === "W" || game.Result === "L";

  // ✅ Dynamic “Back to Season” link + label (no hard-coded season)
  const seasonSlug = seasonSlugFromYearStart(game.Season);
  const seasonPath = seasonSlug
    ? `/athletics/boys/basketball/seasons/${seasonSlug}`
    : "/athletics/boys/basketball/seasons";

  // ✅ Recap title from games.json
  const recapTitle =
    game.RecapTitle && String(game.RecapTitle).trim().length > 0
      ? game.RecapTitle
      : "Game Recap";

  // ✅ Historical fallback text
  const recapText =
    game.Recap && String(game.Recap).trim().length > 0
      ? game.Recap
      : "Newspaper clipping hopefully coming soon.";

  return (
    <div className="p-4 space-y-6">
      <Link to={seasonPath} className="text-sm text-blue-600 hover:underline">
        {seasonSlug ? `← Back to the ${seasonSlug} Season` : "← Back to Seasons"}
      </Link>

      {/* 1) Keep the top part */}
      <header>
        <h1 className="text-2xl font-bold mb-2">
          {formatDate(game.GameID)} vs {game.Opponent}
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

      {/* 2) Keep recap, change fallback */}
      <section>
        <h2 className="text-xl font-semibold mb-2">{recapTitle}</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{recapText}</p>
      </section>

      {/* 3) Trimmed box score columns */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Box Score</h2>

        {playerStats.length === 0 ? (
          <p className="text-gray-600">No player statistics recorded for this game yet.</p>
        ) : (
          <div className="overflow-x-auto">
  <table className="w-auto mx-auto border text-xs sm:text-sm text-center whitespace-nowrap">
    <thead className="bg-gray-100">
      <tr>
        <th className="border px-2 py-1 text-left">Player</th>
        <th className="border px-1.5 py-1">PTS</th>
        <th className="border px-1.5 py-1">REB</th>
        <th className="border px-1.5 py-1">AST</th>
        <th className="border px-1.5 py-1">STL</th>
      </tr>
    </thead>

    <tbody>
      {playerStats.map((s) => (
        <tr key={s.PlayerGameStatsID ?? `${s.GameID}-${s.PlayerID}`}>
          <td className="border px-2 py-1 align-middle text-left">
            <div className="flex items-center gap-2">
              <img
                src={getPlayerPhotoUrl(s.PlayerID)}
                alt={getPlayerName(s.PlayerID)}
                onError={(e) => {
                  e.currentTarget.src = "/images/common/logo.png";
                }}
                className="w-8 h-8 rounded-full object-cover border shrink-0"
              />
              <Link
                to={`/athletics/boys/basketball/players/${s.PlayerID}`}
                className="text-blue-600 underline hover:text-blue-800"
              >
                {getPlayerName(s.PlayerID)}
              </Link>
            </div>
          </td>

          <td className="border px-1.5 py-1">{cellOrDash(s.Points)}</td>
          <td className="border px-1.5 py-1">{cellOrDash(s.Rebounds)}</td>
          <td className="border px-1.5 py-1">{cellOrDash(s.Assists)}</td>
          <td className="border px-1.5 py-1">{cellOrDash(s.Steals)}</td>
        </tr>
      ))}

      {teamTotals && (
        <tr className="bg-gray-100 font-semibold">
          <td className="border px-2 py-1 text-center">Team Totals</td>
          <td className="border px-1.5 py-1">{teamTotals.Points}</td>
          <td className="border px-1.5 py-1">{teamTotals.Rebounds}</td>
          <td className="border px-1.5 py-1">{teamTotals.Assists}</td>
          <td className="border px-1.5 py-1">{teamTotals.Steals}</td>
        </tr>
      )}
    </tbody>
  </table>
</div>
        )}
      </section>
    </div>
  );
}

export default GameDetailHistorical;
