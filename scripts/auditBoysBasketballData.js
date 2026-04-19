const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  return JSON.parse(fs.readFileSync(fullPath, "utf8"));
}

function duplicateValues(items, getKey) {
  const counts = new Map();
  for (const item of items) {
    const key = getKey(item);
    if (key == null || key === "") continue;
    counts.set(String(key), (counts.get(String(key)) || 0) + 1);
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([key, count]) => ({ key, count }));
}

function seasonYearFromRosterId(seasonId) {
  const match = String(seasonId ?? "").match(/^(\d{4})/);
  return match ? match[1] : String(seasonId ?? "");
}

function main() {
  const players = readJson("public/data/boys/players.json");
  const schools = readJson("public/data/schools.json");
  const games = readJson("public/data/boys/basketball/games.json");
  const rosters = readJson("public/data/boys/basketball/seasonrosters.json");
  const stats = readJson("public/data/boys/basketball/playergamestats.json");

  const playerIds = new Set(players.map((player) => String(player.PlayerID)));
  const schoolIds = new Set(schools.map((school) => String(school.SchoolID)));
  const gameIds = new Set(games.map((game) => String(game.GameID)));

  const statPlayerIds = new Set(
    stats.map((stat) => String(stat.PlayerID)).filter((id) => id && id !== "undefined")
  );
  const rosterPlayerIds = new Set(
    rosters.flatMap((roster) => roster.Players || []).map((entry) => String(entry.PlayerID))
  );

  const missingStatPlayers = Array.from(statPlayerIds)
    .filter((id) => !playerIds.has(id))
    .sort();
  const missingRosterPlayers = Array.from(rosterPlayerIds)
    .filter((id) => !playerIds.has(id))
    .sort();

  const rosterEntriesMissingJersey = [];
  for (const roster of rosters) {
    for (const entry of roster.Players || []) {
      if (entry.JerseyNumber == null || entry.JerseyNumber === "") {
        rosterEntriesMissingJersey.push(`${roster.SeasonID}:${entry.PlayerID}`);
      }
    }
  }

  const statsMissingGames = Array.from(
    new Set(stats.map((stat) => String(stat.GameID)).filter((id) => id && !gameIds.has(id)))
  ).sort();

  const gamesMissingOpponentId = games
    .filter((game) => {
      const opponent = String(game.Opponent ?? "").trim().toLowerCase();
      if (!opponent || opponent === "unknown") return false;
      return !String(game.OpponentID ?? "").trim();
    })
    .map((game) => String(game.GameID));

  const gamesWithInvalidOpponentId = games
    .filter((game) => {
      const opponentId = String(game.OpponentID ?? "").trim();
      if (!opponentId) return false;
      return !schoolIds.has(opponentId);
    })
    .map((game) => `${game.GameID}:${game.OpponentID}`);

  const rosterYears = new Set(rosters.map((roster) => seasonYearFromRosterId(roster.SeasonID)));
  const statYears = new Set();
  const gameSeasonById = new Map(games.map((game) => [String(game.GameID), String(game.Season)]));
  for (const stat of stats) {
    const season = gameSeasonById.get(String(stat.GameID));
    if (season) statYears.add(season);
  }

  const statSeasonsMissingRoster = Array.from(statYears)
    .filter((season) => !rosterYears.has(season))
    .sort();

  const report = {
    counts: {
      players: players.length,
      schools: schools.length,
      games: games.length,
      rosters: rosters.length,
      playerGameStats: stats.length,
    },
    duplicates: {
      playerIds: duplicateValues(players, (player) => player.PlayerID),
      schoolIds: duplicateValues(schools, (school) => school.SchoolID),
      schoolNames: duplicateValues(schools, (school) => school.Name),
    },
    playerIntegrity: {
      missingStatPlayers,
      missingRosterPlayers,
    },
    rosterIntegrity: {
      rosterEntriesMissingJersey,
      statSeasonsMissingRoster,
    },
    gameIntegrity: {
      statsMissingGames,
      gamesMissingOpponentIdCount: gamesMissingOpponentId.length,
      gamesMissingOpponentIdSample: gamesMissingOpponentId.slice(0, 20),
      gamesWithInvalidOpponentId,
    },
  };

  console.log(JSON.stringify(report, null, 2));

  const failures = [
    report.duplicates.playerIds.length,
    report.duplicates.schoolIds.length,
    missingStatPlayers.length,
    missingRosterPlayers.length,
    statsMissingGames.length,
    gamesMissingOpponentId.length,
    gamesWithInvalidOpponentId.length,
  ];

  if (process.argv.includes("--strict") && failures.some((count) => count > 0)) {
    process.exitCode = 1;
  }
}

main();
