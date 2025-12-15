import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

function GameDetailGirls() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Girls basketball paths
  const DATA_BASE = "/data/girls/basketball/";
  const PLAYER_IMG_BASE = "/images/girls/basketball/players/";

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
        console.error("Failed to load girls game detail data:", err);
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

    return (((fgm + 0.5 * thpm) / fga) * 100).toFixed(1);
  };

  const seasonSlugFromYearStart = (yearStart) => {
    const ys = Number(yearStart);
    if (!ys || isNaN(ys)) return null;
    const ye2 = String(ys + 1).slice(-2);
    return `${ys}-${ye2}`;
  };

  const teamTotals = useMemo(() => {
    const sum = (key) =>
      playerStats.reduce((acc, s) => acc + (Number(s?.[key]) || 0), 0);

    const totals = {
      Points: sum("Points"),
      Rebounds: sum("Rebounds"),
      Assists: sum("Assists"),
      Turnovers: sum("Turnovers"),
      Steals: sum("Steals"),
      Blocks: sum("Blocks"),
      ThreePM: sum("ThreePM"),
      ThreePA: sum("ThreePA"),
      TwoPM: sum("TwoPM"),
      TwoPA: sum("TwoPA"),
      FTM: sum("FTM"),
      FTA: sum("FTA"),
    };

    return {
      ...totals,
      ThreePct: formatPct(totals.ThreePM, totals.ThreePA),
      TwoPct: formatPct(totals.TwoPM, totals.TwoPA),
      EfgPct: calcEFG(totals.TwoPM, totals.ThreePM, totals.TwoPA, totals.ThreePA),
      FtPct: formatPct(totals.FTM, totals.FTA),
    };
  }, [playerStats]);

  if (loading) return <div className="p-4">Loading…</div>;
  if (!game) return <div className="p-4">Game not found.</div>;

  const seasonSlug = seasonSlugFromYearStart(game.Season);
  const seasonPath = seasonSlug
    ? `/athletics/girls/basketball/seasons/${seasonSlug}`
    : "/athletics/girls/basketball/seasons";

  const recapTitle =
    game.RecapTitle && String(game.RecapTitle).trim().length > 0
      ? game.RecapTitle
      : "Game Recap";

  return (
    <div className="p-4 space-y-6">
      <Link to={seasonPath} className="text-sm text-blue-600 hover:underline">
        {seasonSlug ? `← Back to the ${seasonSlug} Season` : "← Back to Seasons"}
      </Link>

      <section>
        <h2 className="text-xl font-semibold mb-2">{recapTitle}</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {game.Recap && game.Recap.trim().length > 0
            ? game.Recap
            : "Recap coming soon."}
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Box Score</h2>
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
              {playerStats.map((s) => (
                <tr key={s.PlayerGameStatsID ?? `${s.GameID}-${s.PlayerID}`}>
                  <td className="border px-2 py-1 align-middle text-left">
                    <div className="flex items-center justify-start gap-2">
                      <img
                        src={getPlayerPhotoUrl(s.PlayerID)}
                        alt={getPlayerName(s.PlayerID)}
                        onError={(e) => {
                          e.currentTarget.src = "/images/common/logo.png";
                        }}
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
                  <td className="border px-2 py-1">{s.Points}</td>
                  <td className="border px-2 py-1">{s.Rebounds}</td>
                  <td className="border px-2 py-1">{s.Assists}</td>
                  <td className="border px-2 py-1">{s.Turnovers}</td>
                  <td className="border px-2 py-1">{s.Steals}</td>
                  <td className="border px-2 py-1">{s.Blocks}</td>
                  <td className="border px-2 py-1">{s.ThreePM}</td>
                  <td className="border px-2 py-1">{s.ThreePA}</td>
                  <td className="border px-2 py-1">
                    {formatPct(s.ThreePM, s.ThreePA)}
                  </td>
                  <td className="border px-2 py-1">{s.TwoPM}</td>
                  <td className="border px-2 py-1">{s.TwoPA}</td>
                  <td className="border px-2 py-1">
                    {formatPct(s.TwoPM, s.TwoPA)}
                  </td>
                  <td className="border px-2 py-1">
                    {calcEFG(s.TwoPM, s.ThreePM, s.TwoPA, s.ThreePA)}
                  </td>
                  <td className="border px-2 py-1">{s.FTM}</td>
                  <td className="border px-2 py-1">{s.FTA}</td>
                  <td className="border px-2 py-1">
                    {formatPct(s.FTM, s.FTA)}
                  </td>
                </tr>
              ))}

              <tr className="bg-gray-100 font-semibold">
                <td className="border px-2 py-1 text-left">Team Totals</td>
                <td className="border px-2 py-1">{teamTotals.Points}</td>
                <td className="border px-2 py-1">{teamTotals.Rebounds}</td>
                <td className="border px-2 py-1">{teamTotals.Assists}</td>
                <td className="border px-2 py-1">{teamTotals.Turnovers}</td>
                <td className="border px-2 py-1">{teamTotals.Steals}</td>
                <td className="border px-2 py-1">{teamTotals.Blocks}</td>
                <td className="border px-2 py-1">{teamTotals.ThreePM}</td>
                <td className="border px-2 py-1">{teamTotals.ThreePA}</td>
                <td className="border px-2 py-1">{teamTotals.ThreePct}</td>
                <td className="border px-2 py-1">{teamTotals.TwoPM}</td>
                <td className="border px-2 py-1">{teamTotals.TwoPA}</td>
                <td className="border px-2 py-1">{teamTotals.TwoPct}</td>
                <td className="border px-2 py-1">{teamTotals.EfgPct}</td>
                <td className="border px-2 py-1">{teamTotals.FTM}</td>
                <td className="border px-2 py-1">{teamTotals.FTA}</td>
                <td className="border px-2 py-1">{teamTotals.FtPct}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default GameDetailGirls;
