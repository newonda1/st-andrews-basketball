import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import RegionBracket5SVG from "../components/RegionBracket5SVG";
import StateBracket16SVG from "../components/StateBracket16SVG";
import {
  BOYS_BASKETBALL_ROSTERS_PATH,
  SCHOOLS_PATH,
  countsAsPlayerGame,
  getRosterEntriesForSeason,
  getRosterJerseyNumber,
  hydrateGamesWithSchools,
} from "../dataUtils";

const SEASON_ID = 2020;

function Season2020_21() {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [rosterEntries, setRosterEntries] = useState([]);
  const [bracketsData, setBracketsData] = useState(null);
  const [showPerGame, setShowPerGame] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [gamesRes, statsRes, playersRes, bracketsRes, rostersRes, schoolsRes] = await Promise.all([
        fetch("/data/boys/basketball/games.json"),
        fetch("/data/boys/basketball/playergamestats.json"),
        fetch("/data/players.json"),
        fetch("/data/boys/basketball/brackets.json"),
        fetch(BOYS_BASKETBALL_ROSTERS_PATH),
        fetch(SCHOOLS_PATH),
      ]);

      const [gamesData, statsData, playersData, bracketsJson, rostersData, schoolsData] = await Promise.all([
        gamesRes.json(),
        statsRes.json(),
        playersRes.json(),
        bracketsRes.json(),
        rostersRes.json(),
        schoolsRes.json(),
      ]);

      const seasonGames = hydrateGamesWithSchools(gamesData, schoolsData)
        .filter((game) => Number(game.Season) === SEASON_ID)
        .sort((a, b) => Number(a.GameID) - Number(b.GameID));
      const seasonGameIds = new Set(seasonGames.map((game) => Number(game.GameID)));

      setGames(seasonGames);
      setPlayerStats(statsData.filter((stat) => seasonGameIds.has(Number(stat.GameID))));
      setPlayers(playersData);
      setRosterEntries(getRosterEntriesForSeason(rostersData, SEASON_ID));
      setBracketsData(bracketsJson);
    }

    fetchData();
  }, []);

  const seasonSummary = useMemo(() => {
    return games.reduce(
      (summary, game) => {
        if (game.Result === "W") summary.wins += 1;
        if (game.Result === "L") summary.losses += 1;
        summary.pointsFor += Number(game.TeamScore || 0);
        summary.pointsAgainst += Number(game.OpponentScore || 0);
        if (game.RegionGame === "Yes" || game.GameType === "Region") {
          if (game.Result === "W") summary.regionWins += 1;
          if (game.Result === "L") summary.regionLosses += 1;
        }
        return summary;
      },
      { wins: 0, losses: 0, regionWins: 0, regionLosses: 0, pointsFor: 0, pointsAgainst: 0 }
    );
  }, [games]);

  const playerById = useMemo(() => {
    const map = new Map();
    for (const player of players) map.set(Number(player.PlayerID), player);
    return map;
  }, [players]);

  const seasonTotals = useMemo(() => {
    const totals = new Map();

    for (const stat of playerStats) {
      const playerId = Number(stat.PlayerID);
      if (!totals.has(playerId)) {
        totals.set(playerId, {
          PlayerID: playerId,
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
        });
      }

      const total = totals.get(playerId);
      total.Points += Number(stat.Points || 0);
      total.Rebounds += Number(stat.Rebounds || 0);
      total.Assists += Number(stat.Assists || 0);
      total.Turnovers += Number(stat.Turnovers || 0);
      total.Steals += Number(stat.Steals || 0);
      total.Blocks += Number(stat.Blocks || 0);
      total.ThreePM += Number(stat.ThreePM || 0);
      total.ThreePA += Number(stat.ThreePA || 0);
      total.TwoPM += Number(stat.TwoPM || 0);
      total.TwoPA += Number(stat.TwoPA || 0);
      total.FTM += Number(stat.FTM || 0);
      total.FTA += Number(stat.FTA || 0);
      if (countsAsPlayerGame(stat)) total.GamesPlayedSet.add(Number(stat.GameID));
    }

    return Array.from(totals.values())
      .map((total) => ({
        ...total,
        GamesPlayed: total.GamesPlayedSet.size,
      }))
      .sort((a, b) => {
        const jerseyA = getRosterJerseyNumber(rosterEntries, a.PlayerID);
        const jerseyB = getRosterJerseyNumber(rosterEntries, b.PlayerID);
        return Number(jerseyA ?? 999) - Number(jerseyB ?? 999);
      });
  }, [playerStats, rosterEntries]);

  const playerName = (playerId) => {
    const player = playerById.get(Number(playerId));
    return player ? `${player.FirstName} ${player.LastName}` : "Unknown Player";
  };

  const formatDate = (gameId) => {
    const value = Number(gameId);
    const year = Math.floor(value / 10000);
    const month = Math.floor(value / 100) % 100;
    const day = value % 100;
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toLocaleDateString("en-US", {
      timeZone: "UTC",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const pct = (made, attempts) => {
    if (!attempts) return "-";
    return ((Number(made || 0) / Number(attempts)) * 100).toFixed(1);
  };

  const valueFor = (player, key) => {
    const value = Number(player[key] || 0);
    if (!showPerGame) return value;
    if (!player.GamesPlayed) return "0.0";
    return (value / player.GamesPlayed).toFixed(1);
  };

  const statTotal = (key) => seasonTotals.reduce((sum, player) => sum + Number(player[key] || 0), 0);
  const bracket = bracketsData?.[String(SEASON_ID)];

  return (
    <div className="pt-2 pb-4 space-y-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2">2020–21 Season</h1>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold mt-4 mb-3">Season Recap</h2>

        <div className="text-gray-800 leading-relaxed">
          <p className="mb-3 leading-relaxed">
            The 2020–21 St. Andrew's boys basketball season was a compact,
            pandemic-shaped campaign that still carried the program into late
            February. Under head coach Mel Abrams Jr., the Lions finished{" "}
            {seasonSummary.wins}-{seasonSummary.losses} overall and went a perfect{" "}
            {seasonSummary.regionWins}-{seasonSummary.regionLosses} in regular-season
            region play.
          </p>

          <p className="mb-3 leading-relaxed">
            St. Andrew's entered the Region 2AAA tournament as the No. 1 seed and
            opened postseason play with a 53–49 win over Pinewood Christian. The
            Lions came up one point short in the region championship game against
            Bulloch Academy, but the run still earned them a spot in the GISA Class
            AAA state tournament.
          </p>

          <p className="mb-3 leading-relaxed">
            In state play, St. Andrew's beat Valwood 52–43 in the opening round
            before falling to eventual state champion John Milledge Academy in the
            quarterfinals. The season finished with {seasonSummary.pointsFor} points
            scored and {seasonSummary.pointsAgainst} allowed across 17 games.
          </p>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-2xl font-semibold">Schedule &amp; Results</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Date</th>
                <th className="border px-3 py-2 text-left">Opponent</th>
                <th className="border px-3 py-2">Result</th>
                <th className="border px-3 py-2">Score</th>
                <th className="border px-3 py-2">Type</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game, index) => (
                <tr key={game.GameID} className={index % 2 ? "bg-gray-50" : "bg-white"}>
                  <td className="border px-3 py-2">{formatDate(game.GameID)}</td>
                  <td className="border px-3 py-2">
                    <Link to={`/athletics/boys/basketball/games/${game.GameID}`} className="text-blue-700 underline hover:text-blue-900">
                      {game.Opponent}
                    </Link>
                  </td>
                  <td className={`border px-3 py-2 text-center font-bold ${game.Result === "W" ? "text-green-700" : "text-red-700"}`}>
                    {game.Result}
                  </td>
                  <td className="border px-3 py-2 text-center">{game.TeamScore}-{game.OpponentScore}</td>
                  <td className="border px-3 py-2 text-center">{game.Tournament || game.GameType || "Regular Season"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Region Tournament Bracket</h2>
        {bracketsData === null ? (
          <p className="text-gray-600">Loading region bracket...</p>
        ) : bracket?.region ? (
          <RegionBracket5SVG bracket={bracket.region} />
        ) : (
          <p className="text-gray-600">Region bracket data is not available for this season.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">State Tournament Bracket</h2>
        {bracketsData === null ? (
          <p className="text-gray-600">Loading state bracket...</p>
        ) : bracket?.state ? (
          <StateBracket16SVG bracket={bracket.state} />
        ) : (
          <p className="text-gray-600">State bracket data is not available for this season.</p>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-2xl font-semibold">Player Statistics</h2>

          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <span
              className={`${
                showPerGame ? "text-gray-400" : "text-gray-900 font-semibold"
              }`}
            >
              Season totals
            </span>
            <button
              type="button"
              onClick={() => setShowPerGame((value) => !value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                showPerGame ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  showPerGame ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`${
                showPerGame ? "text-gray-900 font-semibold" : "text-gray-400"
              }`}
            >
              Per game averages
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border text-xs sm:text-sm text-center whitespace-nowrap">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1 text-left sticky left-0 bg-gray-100 z-10">Player</th>
                <th className="border px-2 py-1">#</th>
                <th className="border px-2 py-1">GP</th>
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
                <th className="border px-2 py-1">FTM</th>
                <th className="border px-2 py-1">FTA</th>
                <th className="border px-2 py-1">FT%</th>
              </tr>
            </thead>
            <tbody>
              {seasonTotals.map((player, index) => (
                <tr key={player.PlayerID} className={index % 2 ? "bg-gray-50" : "bg-white"}>
                  <td className="border px-2 py-1 text-left sticky left-0 bg-inherit z-10">
                    <Link to={`/athletics/boys/basketball/players/${player.PlayerID}`} className="text-blue-700 underline hover:text-blue-900">
                      {playerName(player.PlayerID)}
                    </Link>
                  </td>
                  <td className="border px-2 py-1">{getRosterJerseyNumber(rosterEntries, player.PlayerID) ?? "-"}</td>
                  <td className="border px-2 py-1">{player.GamesPlayed}</td>
                  <td className="border px-2 py-1">{valueFor(player, "Points")}</td>
                  <td className="border px-2 py-1">{valueFor(player, "Rebounds")}</td>
                  <td className="border px-2 py-1">{valueFor(player, "Assists")}</td>
                  <td className="border px-2 py-1">{valueFor(player, "Turnovers")}</td>
                  <td className="border px-2 py-1">{valueFor(player, "Steals")}</td>
                  <td className="border px-2 py-1">{valueFor(player, "Blocks")}</td>
                  <td className="border px-2 py-1">{valueFor(player, "ThreePM")}</td>
                  <td className="border px-2 py-1">{valueFor(player, "ThreePA")}</td>
                  <td className="border px-2 py-1">{pct(player.ThreePM, player.ThreePA)}</td>
                  <td className="border px-2 py-1">{valueFor(player, "TwoPM")}</td>
                  <td className="border px-2 py-1">{valueFor(player, "TwoPA")}</td>
                  <td className="border px-2 py-1">{pct(player.TwoPM, player.TwoPA)}</td>
                  <td className="border px-2 py-1">{valueFor(player, "FTM")}</td>
                  <td className="border px-2 py-1">{valueFor(player, "FTA")}</td>
                  <td className="border px-2 py-1">{pct(player.FTM, player.FTA)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Season2020_21;
