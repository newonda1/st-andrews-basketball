import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BOYS_BASKETBALL_ROSTERS_PATH,
  SCHOOLS_PATH,
  countsAsPlayerGame,
  getRosterEntriesForSeason,
  getRosterJerseyNumber,
  hydrateGamesWithSchools,
} from "../dataUtils";

function Season1978_79() {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [rosterEntries, setRosterEntries] = useState([]);
  const [seasonTotals, setSeasonTotals] = useState([]);

  const [sortConfig, setSortConfig] = useState({ key: "jersey", direction: "asc" });

  const [slideIndex, setSlideIndex] = useState(0);

  const SEASON_ID = 1978; // 1978–79 season (games.json Season field should be 1978)

  const galleryImages = useMemo(() => {
    const base = "/images/boys/basketball/seasons/1978-79";
    const seasonPhotos = Array.from({ length: 10 }, (_, i) => {
      const n = String(i + 1).padStart(2, "0");
      return {
        src: `${base}/1978_79_${n}.png`,
        alt: `1978-79 season archive image ${i + 1}`,
        caption: `Archive image ${i + 1}`,
      };
    });

    return [
      {
        src: `${base}/first_team_1978.png`,
        alt: "1978-79 St. Andrew's boys basketball team",
        caption: "First St. Andrew's boys basketball team",
      },
      ...seasonPhotos,
    ];
  }, []);

  // ---------- Fetch data ----------
  useEffect(() => {
    async function fetchData() {
      const [gamesRes, statsRes, playersRes, rostersRes, schoolsRes] = await Promise.all([
        fetch("/data/boys/basketball/games.json"),
        fetch("/data/boys/basketball/playergamestats.json"),
        fetch("/data/boys/players.json"),
        fetch(BOYS_BASKETBALL_ROSTERS_PATH),
        fetch(SCHOOLS_PATH),
      ]);

      const [gamesDataRaw, statsData, playersData, rostersData, schoolsData] = await Promise.all([
        gamesRes.json(),
        statsRes.json(),
        playersRes.json(),
        rostersRes.json(),
        schoolsRes.json(),
      ]);

      const seasonGames = hydrateGamesWithSchools(gamesDataRaw, schoolsData)
        .filter((g) => Number(g.Season) === Number(SEASON_ID))
        .sort(
          (a, b) => (Number(a.GameID) || 0) - (Number(b.GameID) || 0)
        );

      const seasonGameIds = new Set(seasonGames.map((g) => Number(g.GameID)));
      const seasonStats = statsData.filter((s) => seasonGameIds.has(Number(s.GameID)));

      setGames(seasonGames);
      setPlayerStats(seasonStats);
      setPlayers(playersData);
      setRosterEntries(getRosterEntriesForSeason(rostersData, SEASON_ID));
    }

    fetchData();
  }, []);

  // ---------- Helpers ----------
  const getPlayer = (id) => players.find((p) => Number(p.PlayerID) === Number(id));

  const getPlayerName = (id) => {
    const p = getPlayer(id);
    return p ? `${p.FirstName} ${p.LastName}` : "Unknown Player";
  };

  const getJerseyNumber = (id) => getRosterJerseyNumber(rosterEntries, id);

  const getPlayerPhotoUrl = (playerId) => `/images/boys/basketball/players/${playerId}.jpg`;

  const safeNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

  const formatDateFromGameID = (gameId) => {
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

      if (stat.GameID != null && countsAsPlayerGame(stat)) {
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

    const teamTotalsRow = useMemo(() => {
    if (!playerStats || playerStats.length === 0) return null;

    const gameSet = new Set();
    let pts = 0;

    for (const s of playerStats) {
      if (s.GameID != null && countsAsPlayerGame(s)) gameSet.add(Number(s.GameID));
      pts += safeNum(s.Points);
    }

    const gp = gameSet.size;
    return {
      GP: gp,
      PTS: pts,
      PPG: gp ? (pts / gp) : 0,
    };
  }, [playerStats]);

  const selectedImage = galleryImages[slideIndex] || galleryImages[0];

  const sortArrow = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "desc" ? " ↓" : " ↑";
  };

  const goPrev = () => setSlideIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length);
  const goNext = () => setSlideIndex((i) => (i + 1) % galleryImages.length);

  return (
    <div className="pt-1 pb-4 space-y-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-0">1978–79 Season</h1>

      <section className="max-w-4xl mx-auto space-y-3">
        <h2 className="text-2xl font-semibold">Season Recap</h2>
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
          <div className="space-y-3 text-gray-800 leading-relaxed">
            <p>
              The 1978-79 season was the first boys basketball season played under the
              St. Andrew's name. The program began in the gym on the new Wilmington Island
              campus after the previous school dissolved, and the team competed as the
              Saints in this early chapter of the school's history.
            </p>
            <p>
              Dave Clay's first St. Andrew's team finished 10-11, opening with promise
              before the schedule turned more difficult in the second half. The Saints
              were 8-4 after a Jan. 13 win over Robert Toombs Christian Academy, but
              dropped seven of their final nine games.
            </p>
            <p>
              Jim Sharpley gave the new program its first major scoring benchmark,
              finishing with 420 points. That season total stood as the school record
              for more than a decade before Ray Rogers surpassed it during the 1988-89
              season.
            </p>
          </div>

          <dl className="grid grid-cols-3 gap-3 text-center md:w-64 md:grid-cols-1">
            <div className="border border-gray-200 rounded-lg px-3 py-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Record</dt>
              <dd className="text-xl font-bold text-gray-900">10-11</dd>
            </div>
            <div className="border border-gray-200 rounded-lg px-3 py-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Coach</dt>
              <dd className="text-lg font-semibold text-gray-900">Dave Clay</dd>
            </div>
            <div className="border border-gray-200 rounded-lg px-3 py-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Mascot</dt>
              <dd className="text-lg font-semibold text-gray-900">Saints</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold mt-2 mb-2">Season Images</h2>

        <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
          <div className="relative bg-gray-50">
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="w-full max-h-[620px] object-contain"
              loading="lazy"
            />

            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 shadow hover:bg-white"
              aria-label="Previous image"
              title="Previous"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 shadow hover:bg-white"
              aria-label="Next image"
              title="Next"
            >
              ›
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-3 py-1 text-xs text-white">
              {slideIndex + 1} / {galleryImages.length}
            </div>
          </div>

          <div className="border-t border-gray-200 bg-white px-4 py-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-900">{selectedImage.caption}</p>
              <p className="text-xs text-gray-500">
                Image {slideIndex + 1} of {galleryImages.length}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-11">
              {galleryImages.map((image, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSlideIndex(i)}
                  className={`aspect-square overflow-hidden rounded-md border bg-gray-50 ${
                    i === slideIndex
                      ? "border-gray-900 ring-2 ring-gray-900"
                      : "border-gray-200 hover:border-gray-500"
                }`}
                aria-label={`Go to image ${i + 1}`}
                  title={image.caption}
              >
                  <img src={image.src} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mt-6 mb-3">
          <h2 className="text-2xl font-semibold">Schedule &amp; Results</h2>
        </div>

        <div className="overflow-x-auto max-w-3xl mx-auto">
          <table className="w-full border text-xs sm:text-sm text-center">
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
                    <td className="border px-2 py-1">
                      {formatDateFromGameID(game.GameID)}
                    </td>
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

      <section>
        <div className="flex items-center justify-between mt-6 mb-3">
          <h2 className="text-2xl font-semibold">Player Statistics for the Season</h2>
        </div>

        {seasonTotals.length === 0 ? (
          <p className="text-gray-600 text-center">No player statistics are available yet for this season.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="mx-auto w-fit">
              <table className="w-auto table-auto border text-xs sm:text-sm text-center whitespace-nowrap">
                <thead className="bg-gray-100">
                  <tr>
                    <th
                      className="border px-2 py-1 cursor-pointer sticky left-0 z-40 bg-gray-100 border-r text-center"
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
                        <td className={`border px-2 py-1 text-left align-middle sticky left-0 z-20 ${rowBg} border-r`}>
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

                {teamTotalsRow && (
                  <tfoot>
                    <tr className="bg-gray-200 font-semibold">
                      <td className="border px-2 py-1 text-left sticky left-0 z-30 bg-gray-200 border-r">
                        Team Totals
                      </td>
                      <td className="border px-2 py-1">—</td>
                      <td className="border px-2 py-1">{teamTotalsRow.GP}</td>
                      <td className="border px-2 py-1">{teamTotalsRow.PTS}</td>
                      <td className="border px-2 py-1">{teamTotalsRow.GP ? teamTotalsRow.PPG.toFixed(1) : "—"}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Season1978_79;
