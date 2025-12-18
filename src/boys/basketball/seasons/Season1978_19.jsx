import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function Season1978_79() {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [seasonTotals, setSeasonTotals] = useState([]);

  const [sortConfig, setSortConfig] = useState({ key: "jersey", direction: "asc" });

  // Carousel
  const [slideIndex, setSlideIndex] = useState(0);

  const SEASON_ID = 1978; // 1978–79 season (games.json Season field should be 1978)

  const carouselImages = useMemo(() => {
    // Matches your filenames shown in Finder: 1978_79_01.png ... 1978_79_10.png
    const base = "/images/boys/basketball/seasons/1978-79";
    return Array.from({ length: 10 }, (_, i) => {
      const n = String(i + 1).padStart(2, "0");
      return `${base}/1978_79_${n}.png`;
    });
  }, []);

  // ---------- Fetch data ----------
  useEffect(() => {
    async function fetchData() {
      const gamesRes = await fetch("/data/boys/basketball/games.json");
      const statsRes = await fetch("/data/boys/basketball/playergamestats.json");
      const playersRes = await fetch("/data/boys/basketball/players.json");

      const gamesData = await gamesRes.json();
      const statsData = await statsRes.json();
      const playersData = await playersRes.json();

      const seasonGames = gamesData
        .filter((g) => Number(g.Season) === Number(SEASON_ID))
        .sort((a, b) => Number(a.Date) - Number(b.Date));

      const seasonGameIds = new Set(seasonGames.map((g) => Number(g.GameID)));
      const seasonStats = statsData.filter((s) => seasonGameIds.has(Number(s.GameID)));

      setGames(seasonGames);
      setPlayerStats(seasonStats);
      setPlayers(playersData);
    }

    fetchData();
  }, []);

  // ---------- Helpers ----------
  const getPlayer = (id) => players.find((p) => Number(p.PlayerID) === Number(id));

  const getPlayerName = (id) => {
    const p = getPlayer(id);
    return p ? `${p.FirstName} ${p.LastName}` : "Unknown Player";
  };

  const getJerseyNumber = (id) => {
    const p = getPlayer(id);
    return p && p.JerseyNumber != null ? p.JerseyNumber : "";
  };

  const getPlayerPhotoUrl = (playerId) => `/images/boys/basketball/players/${playerId}.jpg`;

  const safeNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

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
    if (game.IsComplete !== "Yes" || game.TeamScore == null || game.OpponentScore == null) return "";
    return `${game.TeamScore} - ${game.OpponentScore}`;
  };

  // ---------- Build season totals (PTS only) ----------
  useEffect(() => {
    if (!playerStats || playerStats.length === 0) {
      setSeasonTotals([]);
      return;
    }

    const totalsMap = {};

    for (const stat of playerStats) {
      const pid = Number(stat.PlayerID);
      if (!Number.isFinite(pid)) continue;

      if (!totalsMap[pid]) {
        totalsMap[pid] = {
          PlayerID: pid,
          Points: 0,
          GamesPlayedSet: new Set(),
        };
      }

      totalsMap[pid].Points += safeNum(stat.Points);

      if (stat.GameID != null) {
        totalsMap[pid].GamesPlayedSet.add(Number(stat.GameID));
      }
    }

    const totalsArray = Object.values(totalsMap).map((p) => ({
      PlayerID: p.PlayerID,
      Points: p.Points,
      GamesPlayed: p.GamesPlayedSet.size,
      PPG: p.GamesPlayedSet.size ? p.Points / p.GamesPlayedSet.size : 0,
    }));

    setSeasonTotals(totalsArray);
  }, [playerStats]);

  // ---------- Sorting ----------
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "desc" ? "asc" : "desc" };
      }
      // default direction for new sort keys:
      // jersey/name asc makes sense; stats desc makes sense
      const ascKeys = new Set(["name", "jersey"]);
      return { key, direction: ascKeys.has(key) ? "asc" : "desc" };
    });
  };

  const getSortValue = (player, key) => {
    switch (key) {
      case "name":
        return getPlayerName(player.PlayerID).toLowerCase();
      case "jersey":
        return Number(getJerseyNumber(player.PlayerID)) || 0;
      case "GP":
        return player.GamesPlayed || 0;
      case "PTS":
        return player.Points || 0;
      case "PPG":
        return player.PPG || 0;
      default:
        return 0;
    }
  };

  const sortedSeasonTotals = useMemo(() => {
    return seasonTotals.slice().sort((a, b) => {
      const aVal = getSortValue(a, sortConfig.key);
      const bVal = getSortValue(b, sortConfig.key);

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [seasonTotals, sortConfig]);

  const sortArrow = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "desc" ? " ↓" : " ↑";
  };

  // ---------- Carousel controls ----------
  const goPrev = () => setSlideIndex((i) => (i - 1 + carouselImages.length) % carouselImages.length);
  const goNext = () => setSlideIndex((i) => (i + 1) % carouselImages.length);

  return (
    <div className="pt-2 pb-4 space-y-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2">1978–79 Season</h1>

      {/* 1) SEASON OVERVIEW (Carousel) */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold mt-4 mb-3">Season Overview</h2>

        <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="relative">
            <img
              src={carouselImages[slideIndex]}
              alt={`1978–79 season photo ${slideIndex + 1}`}
              className="w-full max-h-[520px] object-contain bg-gray-50"
              loading="lazy"
            />

            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border border-gray-200 rounded-full w-10 h-10 flex items-center justify-center shadow"
              aria-label="Previous image"
              title="Previous"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border border-gray-200 rounded-full w-10 h-10 flex items-center justify-center shadow"
              aria-label="Next image"
              title="Next"
            >
              ›
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
              {slideIndex + 1} / {carouselImages.length}
            </div>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 py-3 bg-white">
            {carouselImages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSlideIndex(i)}
                className={`w-2.5 h-2.5 rounded-full ${
                  i === slideIndex ? "bg-gray-900" : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to image ${i + 1}`}
                title={`Image ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2) SCHEDULE (Game Results only) */}
      <section>
        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-2xl font-semibold">📅 Schedule &amp; Results</h2>
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
              {games.map((game, idx) => {
                const hasResult = game.Result === "W" || game.Result === "L";

                const opponentCell = hasResult ? (
                  <Link
                    to={`/athletics/boys/basketball/games/${game.GameID}`}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {game.Opponent}
                  </Link>
                ) : (
                  game.Opponent
                );

                return (
                  <tr key={game.GameID || idx} className={idx % 2 ? "bg-gray-50" : "bg-white"}>
                    <td className="border px-2 py-1">{formatDate(game.Date)}</td>
                    <td className="border px-2 py-1">{opponentCell}</td>
                    <td className="border px-2 py-1">{formatResult(game)}</td>
                    <td className="border px-2 py-1 whitespace-nowrap">{formatScore(game)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3) PLAYER POINTS TABLE */}
      <section>
        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-2xl font-semibold">📊 Player Statistics for the Season</h2>
        </div>

        {seasonTotals.length === 0 ? (
          <p className="text-gray-600">No player statistics are available yet for this season.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-xs sm:text-sm text-center whitespace-nowrap">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    className="border px-2 py-1 cursor-pointer sticky left-0 z-40 bg-gray-100 border-r text-center min-w-[220px]"
                    onClick={() => handleSort("name")}
                  >
                    Player{sortArrow("name")}
                  </th>
                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("jersey")}>
                    #{sortArrow("jersey")}
                  </th>
                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("GP")}>
                    GP{sortArrow("GP")}
                  </th>
                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("PTS")}>
                    PTS{sortArrow("PTS")}
                  </th>
                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("PPG")}>
                    PPG{sortArrow("PPG")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedSeasonTotals.map((p, idx) => {
                  const name = getPlayerName(p.PlayerID);
                  const jersey = getJerseyNumber(p.PlayerID);
                  const photoUrl = getPlayerPhotoUrl(p.PlayerID);
                  const rowBg = idx % 2 === 0 ? "bg-white" : "bg-gray-50";
                  const gp = Number(p.GamesPlayed || 0);
                  const ppg = gp ? (Number(p.Points || 0) / gp).toFixed(1) : "—";

                  return (
                    <tr key={p.PlayerID} className={rowBg}>
                      <td
                        className={`border px-2 py-1 text-left align-middle sticky left-0 z-20 ${rowBg} border-r min-w-[220px]`}
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
                            to={`/athletics/boys/basketball/players/${p.PlayerID}`}
                            className="text-blue-600 underline hover:text-blue-800"
                          >
                            {name}
                          </Link>
                        </div>
                      </td>

                      <td className="border px-2 py-1 align-middle">{jersey}</td>
                      <td className="border px-2 py-1 align-middle">{p.GamesPlayed}</td>
                      <td className="border px-2 py-1 align-middle">{p.Points}</td>
                      <td className="border px-2 py-1 align-middle">{ppg}</td>
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

export default Season1978_79;
