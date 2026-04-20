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

function Season1995_96() {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [rosterEntries, setRosterEntries] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [seasonTotals, setSeasonTotals] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "jersey", direction: "asc" });

  const SEASON_ID = 1995; // 1995–96 season (games.json Season field should be 1995)

  useEffect(() => {
    async function fetchData() {
      const [gamesRes, statsRes, playersRes, rostersRes, schoolsRes, adjustmentsRes] =
        await Promise.all([
          fetch("/data/boys/basketball/games.json"),
          fetch("/data/boys/basketball/playergamestats.json"),
          fetch("/data/players.json"),
          fetch(BOYS_BASKETBALL_ROSTERS_PATH),
          fetch(SCHOOLS_PATH),
          fetch("/data/boys/basketball/adjustments.json").catch(() => null),
        ]);

      const [gamesDataRaw, statsData, playersData, rostersData, schoolsData, adjustmentsData] =
        await Promise.all([
          gamesRes.json(),
          statsRes.json(),
          playersRes.json(),
          rostersRes.json(),
          schoolsRes.json(),
          adjustmentsRes?.ok ? adjustmentsRes.json() : [],
        ]);

      const seasonGames = hydrateGamesWithSchools(gamesDataRaw, schoolsData)
        .filter((g) => Number(g.Season) === Number(SEASON_ID))
        .sort((a, b) => (Number(a.GameID) || 0) - (Number(b.GameID) || 0));

      const seasonGameIds = new Set(seasonGames.map((g) => Number(g.GameID)));
      const seasonStats = statsData.filter((s) => seasonGameIds.has(Number(s.GameID)));
      const seasonAdjustments = (Array.isArray(adjustmentsData) ? adjustmentsData : []).filter(
        (row) => Number(row?.SeasonID) === Number(SEASON_ID)
      );

      setGames(seasonGames);
      setPlayerStats(seasonStats);
      setPlayers(playersData);
      setRosterEntries(getRosterEntriesForSeason(rostersData, SEASON_ID));
      setAdjustments(seasonAdjustments);
    }

    fetchData();
  }, []);

  const getPlayer = (id) => players.find((p) => Number(p.PlayerID) === Number(id));

  const getPlayerName = (id) => {
    const player = getPlayer(id);
    return player ? [player.FirstName, player.LastName].filter(Boolean).join(" ") : "Unknown Player";
  };

  const getJerseyNumber = (id) => getRosterJerseyNumber(rosterEntries, id);

  const getPlayerPhotoUrl = (playerId) => `/images/boys/basketball/players/${playerId}.jpg`;

  const safeNum = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);

  const adjustmentMap = useMemo(() => {
    const map = new Map();

    for (const row of adjustments) {
      const playerId = Number(row?.PlayerID);
      if (!Number.isFinite(playerId)) continue;

      if (!map.has(playerId)) {
        map.set(playerId, { Points: 0, Rebounds: 0 });
      }

      const entry = map.get(playerId);
      entry.Points += safeNum(row.Points);
      entry.Rebounds += safeNum(row.Rebounds);
    }

    return map;
  }, [adjustments]);

  const getDisplayedPoints = (playerId, rawPoints) =>
    safeNum(rawPoints) + safeNum(adjustmentMap.get(Number(playerId))?.Points);

  const formatDateFromGameID = (gameId) => {
    if (!gameId) return "";

    const n = Number(gameId);
    if (!Number.isFinite(n)) return "";

    const year = Math.floor(n / 10000);
    const month = Math.floor(n / 100) % 100;
    const day = n % 100;

    if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) {
      return "Unknown";
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

    const totalsArray = Object.values(totalsMap).map((player) => ({
      PlayerID: player.PlayerID,
      Points: player.Points,
      GamesPlayed: player.GamesPlayedSet.size,
      PPG: player.GamesPlayedSet.size ? player.Points / player.GamesPlayedSet.size : 0,
    }));

    setSeasonTotals(totalsArray);
  }, [playerStats]);

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
        return getDisplayedPoints(player.PlayerID, player.Points || 0);
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
  }, [seasonTotals, sortConfig, adjustments]);

  const teamTotalsRow = useMemo(() => {
    if (!playerStats || playerStats.length === 0) return null;

    const rawPoints = playerStats.reduce((sum, stat) => sum + safeNum(stat.Points), 0);
    const adjustedPoints = adjustments.reduce((sum, row) => sum + safeNum(row.Points), 0);
    const displayedPoints = rawPoints + adjustedPoints;

    return {
      GP: null,
      PTS: displayedPoints,
      PPG: null,
    };
  }, [playerStats, adjustments]);

  const sortArrow = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "desc" ? " ↓" : " ↑";
  };

  return (
    <div className="pt-1 pb-4 space-y-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-0">1995–96 Season</h1>

      <section className="max-w-4xl mx-auto space-y-3">
        <h2 className="text-2xl font-semibold">Season Recap</h2>
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
          <div className="space-y-3 text-gray-800 leading-relaxed">
            <p>
              Frank Dickson&apos;s first season as head coach marked the beginning of a
              four-year run that would eventually leave him as the winningest coach
              in program history at the time he stepped away. The 1995-96 team
              still lives in a very incomplete archive, but even through the missing
              dates and missing box scores, it is clear that the program took a step
              forward in his first winter on the sideline and finished 11-13.
            </p>
            <p>
              Kareem Beasley was still the center of nearly everything St.
              Andrew&apos;s did offensively. The surviving box scores alone do not get
              him all the way there, but newspaper tallies push his displayed season
              total to 591 points, another huge scoring year in a career that was
              already turning historic. Josh Rozier also emerges much more fully
              when the newspaper material is folded back in, lifting him to a
              displayed 351 points and 54 rebounds for the season.
            </p>
            <p>
              That combination gave the Lions a much more dangerous offensive core
              than the previous year&apos;s record might have suggested. Beasley and
              Rozier carried the largest loads, while players like Alex Aldrich,
              Andrew Alexander, Brian Covington, Ben Mahany, and Patrick Spivey gave
              the team enough support to scratch back toward the middle of the
              standings despite all the gaps in the surviving record.
            </p>
            <p>
              In hindsight, the season reads like an early foundation for what came
              next. Dickson&apos;s first team did not yet produce a winning record, but
              it moved the program forward, stabilized things after a difficult
              stretch, and introduced the first chapter of a coaching tenure that
              would soon reshape the standard for success in St. Andrew&apos;s boys
              basketball.
            </p>
          </div>

          <dl className="grid grid-cols-3 gap-3 text-center md:w-64 md:grid-cols-1">
            <div className="border border-gray-200 rounded-lg px-3 py-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Record</dt>
              <dd className="text-xl font-bold text-gray-900">11-13</dd>
            </div>
            <div className="border border-gray-200 rounded-lg px-3 py-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Coach</dt>
              <dd className="text-lg font-semibold text-gray-900">Frank Dickson</dd>
            </div>
            <div className="border border-gray-200 rounded-lg px-3 py-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Notable</dt>
              <dd className="text-lg font-semibold text-gray-900">Beasley 591</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold mt-2 mb-2">Season Images</h2>
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
          <div className="mx-auto max-w-2xl">
            <p className="text-base font-semibold text-gray-900">Archive images coming soon</p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)] xl:items-start">
        <section className="min-w-0">
          <div className="mb-3 mt-6">
            <h2 className="text-2xl font-semibold">Schedule &amp; Results</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border text-xs sm:text-sm text-center">
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
                      <td className="border px-2 py-1">{formatDateFromGameID(game.GameID)}</td>
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

        <section className="min-w-0">
          <div className="mb-3 mt-6">
            <h2 className="text-2xl font-semibold">Player Statistics for the Season</h2>
          </div>

          {seasonTotals.length === 0 ? (
            <p className="text-gray-600">No player statistics are available yet for this season.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] table-auto border text-xs sm:text-sm text-center whitespace-nowrap">
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
                    {sortedSeasonTotals.map((player, idx) => {
                      const name = getPlayerName(player.PlayerID);
                      const jersey = getJerseyNumber(player.PlayerID);
                      const photoUrl = getPlayerPhotoUrl(player.PlayerID);
                      const rowBg = idx % 2 === 0 ? "bg-white" : "bg-gray-50";
                      const gp = Number(player.GamesPlayed || 0);
                      const displayedPoints = getDisplayedPoints(player.PlayerID, Number(player.Points || 0));
                      const ppg = gp ? (Number(player.Points || 0) / gp).toFixed(1) : "—";

                      return (
                        <tr key={player.PlayerID} className={rowBg}>
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
                                to={`/athletics/boys/basketball/players/${player.PlayerID}`}
                                className="text-blue-600 underline hover:text-blue-800"
                              >
                                {name}
                              </Link>
                            </div>
                          </td>

                          <td className="border px-2 py-1 align-middle">{jersey}</td>
                          <td className="border px-2 py-1 align-middle">{player.GamesPlayed}</td>
                          <td className="border px-2 py-1 align-middle">{displayedPoints}</td>
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
                        <td className="border px-2 py-1">{teamTotalsRow.GP ?? "—"}</td>
                        <td className="border px-2 py-1">{teamTotalsRow.PTS}</td>
                        <td className="border px-2 py-1">{teamTotalsRow.PPG != null ? teamTotalsRow.PPG.toFixed(1) : "—"}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
              <p className="mt-2 text-center text-xs leading-relaxed text-gray-600">
                GP reflects the number of games with surviving box score records for that player, not
                necessarily the total number of games played.
              </p>
              <p className="mt-1 text-center text-xs leading-relaxed text-gray-600">
                Displayed season totals reflect the full archival summary sheet for 1995-96,
                including newspaper-adjusted scoring totals for Kareem Beasley and Josh Rozier.
                Points per game still uses only the surviving game-by-game box score data, so the
                displayed scoring totals do not reconcile directly to the visible box-score points
                for this season.
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default Season1995_96;
