import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SourceMeta from "../../archive/SourceMeta";
import { basketballPlayerPath, fetchBasketballStats } from "./seasonMeta";
import RecapImageGallery from "./RecapImageGallery";

function buildIdMap(items, key) {
  const map = new Map();
  for (const item of Array.isArray(items) ? items : []) {
    const value = item?.[key];
    if (value == null || value === "") continue;
    map.set(String(value), item);
  }
  return map;
}

function hydrateGamesWithSchools(games, schools) {
  const schoolMap = buildIdMap(schools, "SchoolID");

  return (Array.isArray(games) ? games : []).map((game) => {
    const opponentSchool = schoolMap.get(String(game?.OpponentID || ""));
    const opponentLocation = [opponentSchool?.City, opponentSchool?.State]
      .map((part) => String(part || "").trim())
      .filter(Boolean)
      .join(", ");

    return {
      ...game,
      Opponent: opponentSchool?.Name || game?.Opponent || "Unknown",
      OpponentLocation: opponentLocation || game.OpponentLocation,
      OpponentSchool: opponentSchool || game.OpponentSchool,
    };
  });
}

function getPlayerName(players, playerId) {
  const idNum = Number(playerId);
  const player =
    players.find((entry) => Number(entry.PlayerID) === idNum) ||
    players.find((entry) => Number(entry.PlayerId) === idNum) ||
    players.find((entry) => Number(entry.ID) === idNum);

  if (!player) return `Player ${playerId}`;

  return (
    player.PlayerName ||
    player.Name ||
    [player.FirstName, player.LastName].filter(Boolean).join(" ") ||
    `Player ${playerId}`
  );
}

function dateFromGameId(gameId) {
  const raw = String(gameId || "");
  if (!/^\d{8}/.test(raw)) return "";
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

function formatDate(game) {
  if (game?.DisplayDate) return game.DisplayDate;

  const raw = game?.Date || game?.SortDate || dateFromGameId(game?.GameID);
  if (!raw) return "";

  const date = new Date(`${String(raw).slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return String(raw);

  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function seasonSlugFromYearStart(yearStart) {
  const year = Number(yearStart);
  if (!Number.isFinite(year)) return null;
  return `${year}-${String(year + 1).slice(-2)}`;
}

function isNumberLike(value) {
  if (value == null || value === "") return false;
  return Number.isFinite(Number(value));
}

function cellOrDash(value) {
  return isNumberLike(value) ? value : "-";
}

function safeNum(value) {
  return isNumberLike(value) ? Number(value) : 0;
}

export default function HistoricalGameDetail({ config }) {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    basePath,
    dataBase,
    playerImageBase,
    schoolsPath = "/data/schools.json",
    sportKey,
  } = config;

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);

      try {
        const [gamesRes, playersRes, schoolsRes] = await Promise.all([
          fetch(`${dataBase}games.json`),
          fetch("/data/players.json"),
          fetch(schoolsPath),
        ]);

        if (!gamesRes.ok || !playersRes.ok || !schoolsRes.ok) {
          throw new Error(
            `Fetch failed: games(${gamesRes.status}) players(${playersRes.status}) schools(${schoolsRes.status})`
          );
        }

        const [gamesDataRaw, playersData, schoolsData] = await Promise.all([
          gamesRes.json(),
          playersRes.json(),
          schoolsRes.json(),
        ]);

        const gamesData = hydrateGamesWithSchools(gamesDataRaw, schoolsData);
        const idNum = Number(gameId);
        const thisGame = gamesData.find((entry) => Number(entry.GameID) === idNum);
        const statsData = thisGame
          ? await fetchBasketballStats(dataBase, thisGame.Season)
          : [];
        const thisStats = statsData.filter((entry) => Number(entry.GameID) === idNum);

        if (!cancelled) {
          setGame(thisGame || null);
          setPlayerStats(thisStats || []);
          setPlayers(playersData || []);
        }
      } catch (error) {
        console.error("Failed to load historical game detail data:", error);
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
  }, [dataBase, gameId, schoolsPath]);

  const teamTotals = useMemo(() => {
    if (!playerStats.length) return null;

    const anyMissingInColumn = (key) => playerStats.some((stat) => !isNumberLike(stat?.[key]));

    return {
      Points: playerStats.reduce((total, stat) => total + safeNum(stat.Points), 0),
      Rebounds: anyMissingInColumn("Rebounds")
        ? "-"
        : playerStats.reduce((total, stat) => total + safeNum(stat.Rebounds), 0),
      Assists: anyMissingInColumn("Assists")
        ? "-"
        : playerStats.reduce((total, stat) => total + safeNum(stat.Assists), 0),
      Steals: anyMissingInColumn("Steals")
        ? "-"
        : playerStats.reduce((total, stat) => total + safeNum(stat.Steals), 0),
    };
  }, [playerStats]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!game) return <div className="p-4">Game not found.</div>;

  const resultText =
    game.Result === "W" ? "Win" : game.Result === "L" ? "Loss" : "Result pending";
  const showScore = game.Result === "W" || game.Result === "L";
  const seasonSlug = seasonSlugFromYearStart(game.Season);
  const seasonPath = seasonSlug ? `${basePath}/seasons/${seasonSlug}` : `${basePath}/seasons`;
  const recapTitle =
    game.RecapTitle && String(game.RecapTitle).trim().length > 0
      ? game.RecapTitle
      : "Game Recap";
  const recapText =
    game.Recap && String(game.Recap).trim().length > 0
      ? game.Recap
      : "Newspaper clipping hopefully coming soon.";
  const recapImages = Array.isArray(game.RecapImages) ? game.RecapImages : [];
  return (
    <div className="space-y-6 p-4">
      <Link to={seasonPath} className="text-sm text-blue-600 hover:underline">
        {seasonSlug ? `< Back to the ${seasonSlug} Season` : "< Back to Seasons"}
      </Link>

      <header>
        <h1 className="mb-2 text-2xl font-bold">
          {formatDate(game)} vs {game.Opponent}
        </h1>
        <p className="text-lg">
          {resultText}
          {showScore ? ` - ${game.TeamScore}-${game.OpponentScore}` : ""}
        </p>
        <p className="text-sm text-gray-600">
          {[game.LocationType, game.GameType].filter(Boolean).join(" • ")}
        </p>
      </header>

      <section>
        <h2 className="mb-2 text-xl font-semibold">{recapTitle}</h2>
        <SourceMeta record={game} className="mb-3" />
        <p className="whitespace-pre-line leading-relaxed text-gray-700">{recapText}</p>
        {game.ArticleID ? (
          <p className="mt-3 text-sm">
            <Link
              to={`${basePath}/articles/${encodeURIComponent(String(game.ArticleID))}`}
              className="text-blue-700 underline hover:text-blue-900"
            >
              Read the source article
            </Link>
          </p>
        ) : null}
        <RecapImageGallery images={recapImages} title={recapTitle} />
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold">Box Score</h2>

        {playerStats.length === 0 ? (
          <p className="text-gray-600">No player statistics recorded for this game yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="mx-auto w-auto whitespace-nowrap border text-center text-xs sm:text-sm">
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
                {playerStats.map((stat) => (
                  <tr key={stat.PlayerGameStatsID ?? `${stat.GameID}-${stat.PlayerID}`}>
                    <td className="border px-2 py-1 align-middle text-left">
                      <div className="flex items-center gap-2">
                        <img
                          src={`${playerImageBase}${stat.PlayerID}.jpg`}
                          alt={getPlayerName(players, stat.PlayerID)}
                          onError={(event) => {
                            event.currentTarget.src = "/images/common/logo.png";
                          }}
                          className="h-8 w-8 shrink-0 rounded-full border object-cover"
                        />
                        <Link
                          to={basketballPlayerPath({
                            playerId: stat.PlayerID,
                            seasonId: game.Season,
                            basePath,
                            sportKey,
                          })}
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          {getPlayerName(players, stat.PlayerID)}
                        </Link>
                      </div>
                    </td>

                    <td className="border px-1.5 py-1">{cellOrDash(stat.Points)}</td>
                    <td className="border px-1.5 py-1">{cellOrDash(stat.Rebounds)}</td>
                    <td className="border px-1.5 py-1">{cellOrDash(stat.Assists)}</td>
                    <td className="border px-1.5 py-1">{cellOrDash(stat.Steals)}</td>
                  </tr>
                ))}

                {teamTotals ? (
                  <tr className="bg-gray-100 font-semibold">
                    <td className="border px-2 py-1 text-center">Team Totals</td>
                    <td className="border px-1.5 py-1">{teamTotals.Points}</td>
                    <td className="border px-1.5 py-1">{teamTotals.Rebounds}</td>
                    <td className="border px-1.5 py-1">{teamTotals.Assists}</td>
                    <td className="border px-1.5 py-1">{teamTotals.Steals}</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
