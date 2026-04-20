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

function Season1986_87() {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [rosterEntries, setRosterEntries] = useState([]);
  const [seasonTotals, setSeasonTotals] = useState([]);

  const [sortConfig, setSortConfig] = useState({ key: "jersey", direction: "asc" });

  const SEASON_ID = 1986; // 1986–87 season (games.json Season field should be 1986)

  useEffect(() => {
    async function fetchData() {
      const [gamesRes, statsRes, playersRes, rostersRes, schoolsRes] = await Promise.all([
        fetch("/data/boys/basketball/games.json"),
        fetch("/data/boys/basketball/playergamestats.json"),
        fetch("/data/players.json"),
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
        .sort((a, b) => (Number(a.GameID) || 0) - (Number(b.GameID) || 0));

      const seasonGameIds = new Set(seasonGames.map((g) => Number(g.GameID)));
      const seasonStats = statsData.filter((s) => seasonGameIds.has(Number(s.GameID)));

      setGames(seasonGames);
      setPlayerStats(seasonStats);
      setPlayers(playersData);
      setRosterEntries(getRosterEntriesForSeason(rostersData, SEASON_ID));
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

    for (const stat of playerStats) {
      if (stat.GameID != null && countsAsPlayerGame(stat)) gameSet.add(Number(stat.GameID));
      pts += safeNum(stat.Points);
    }

    const gp = gameSet.size;
    return {
      GP: gp,
      PTS: pts,
      PPG: gp ? pts / gp : 0,
    };
  }, [playerStats]);

  const sortArrow = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "desc" ? " ↓" : " ↑";
  };

  return (
    <div className="pt-1 pb-4 space-y-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-0">1986–87 Season</h1>

      <section className="max-w-4xl mx-auto space-y-3">
        <h2 className="text-2xl font-semibold">Season Recap</h2>
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
          <div className="space-y-3 text-gray-800 leading-relaxed">
            <p>
              The 1986-87 season closed Don Sherwood&apos;s three-year run as St.
              Andrew&apos;s head coach. The Saints finished 7-16, and the surviving
              record from that winter is more fragmented than the two seasons before
              it, with three opening games still unidentified and several later box
              scores only partially preserved.
            </p>
            <p>
              Even with those gaps, the outline of the season is clear. St.
              Andrew&apos;s beat Pathway Day twice, swept Robert Toombs Christian
              Academy, and added wins over David Emanuel Academy and Pinewood
              Christian Academy. A number of losses stayed within reach, including
              four-point, five-point, and six-point margins against region opponents,
              but the Saints never found the longer run they needed to climb back
              toward .500.
            </p>
            <p>
              Ed Johns and Scott Jarrett shared much of the scoring load, finishing
              with 112 and 111 points in the surviving records, while Stephen Goggans
              added 105 and Bennett Toole scored 89. Those totals do not tell the
              whole story of the season, but they do show the core that carried St.
              Andrew&apos;s through Sherwood&apos;s final year on the sideline.
            </p>
          </div>

          <dl className="grid grid-cols-3 gap-3 text-center md:w-64 md:grid-cols-1">
            <div className="border border-gray-200 rounded-lg px-3 py-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Record</dt>
              <dd className="text-xl font-bold text-gray-900">7-16</dd>
            </div>
            <div className="border border-gray-200 rounded-lg px-3 py-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Coach</dt>
              <dd className="text-lg font-semibold text-gray-900">Don Sherwood</dd>
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
                          <td className="border px-2 py-1 align-middle">{player.Points}</td>
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
                        <td className="border px-2 py-1">
                          {teamTotalsRow.GP ? teamTotalsRow.PPG.toFixed(1) : "—"}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
              <p className="mt-2 text-center text-xs leading-relaxed text-gray-600">
                GP reflects the number of games with surviving box score records for that player, not
                necessarily the total number of games played.
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default Season1986_87;
