const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const TARGET_YEARS = new Set([1999, 2000, 2001, 2002, 2003, 2004, 2005]);

const SPORTS = {
  boys: {
    label: "Boys Basketball",
    base: "public/data/boys/basketball",
    statFields: [
      "Minutes",
      "Points",
      "Rebounds",
      "Assists",
      "Turnovers",
      "Steals",
      "Blocks",
      "ThreePM",
      "ThreePA",
      "TwoPM",
      "TwoPA",
      "FTM",
      "FTA",
    ],
  },
  girls: {
    label: "Girls Basketball",
    base: "public/data/girls/basketball",
    statFields: [
      "MinutesPlayed",
      "Points",
      "Rebounds",
      "Assists",
      "Turnovers",
      "Steals",
      "Blocks",
      "ThreePM",
      "ThreePA",
      "TwoPM",
      "TwoPA",
      "FTM",
      "FTA",
      "OffensiveRebounds",
      "DefensiveRebounds",
      "PersonalFouls",
      "Deflections",
      "Charges",
    ],
  },
};

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readJsonOptional(relativePath, fallback = []) {
  const fullPath = path.join(root, relativePath);
  return fs.existsSync(fullPath) ? readJson(relativePath) : fallback;
}

function duplicateValues(items, getKey) {
  const counts = new Map();
  for (const item of items) {
    const key = getKey(item);
    if (key == null || key === "") continue;
    counts.set(String(key), (counts.get(String(key)) || 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([key, count]) => ({ key, count }));
}

function seasonLabel(year) {
  return `${year}-${String(year + 1).slice(-2)}`;
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function countsAsPlayerGame(stat, statFields) {
  return statFields.some((field) => {
    const value = Number(stat?.[field]);
    return Number.isFinite(value) && value !== 0;
  });
}

function auditSport(key, config) {
  const players = readJson("public/data/players.json");
  const schools = readJson("public/data/schools.json");
  const seasons = readJson(`${config.base}/seasons.json`);
  const games = readJson(`${config.base}/games.json`);
  const rosters = readJson(`${config.base}/seasonrosters.json`);
  const stats = readJson(`${config.base}/playergamestats.json`);
  const articles = readJsonOptional(`${config.base}/articles.json`);
  const adjustments = readJsonOptional(`${config.base}/adjustments.json`);

  const playerIds = new Set(players.map((player) => String(player.PlayerID)));
  const schoolIds = new Set(schools.map((school) => String(school.SchoolID)));
  const gamesById = new Map(games.map((game) => [String(game.GameID), game]));
  const targetGames = games.filter((game) => TARGET_YEARS.has(Number(game.Season)));
  const targetGameIds = new Set(targetGames.map((game) => String(game.GameID)));
  const targetStats = stats.filter((stat) => targetGameIds.has(String(stat.GameID)));
  const targetRosters = rosters.filter((roster) =>
    [...TARGET_YEARS].some((year) => String(roster.SeasonID) === seasonLabel(year))
  );

  const rosterPlayerIds = new Set(
    targetRosters.flatMap((roster) => roster.Players || []).map((entry) => String(entry.PlayerID))
  );
  const statPlayerIds = new Set(targetStats.map((stat) => String(stat.PlayerID)));

  const missingStatPlayers = [...statPlayerIds].filter((id) => !playerIds.has(id)).sort();
  const missingRosterPlayers = [...rosterPlayerIds].filter((id) => !playerIds.has(id)).sort();
  const statsMissingGames = [
    ...new Set(stats.map((stat) => String(stat.GameID)).filter((id) => id && !gamesById.has(id))),
  ].sort();

  const gamesMissingOpponentId = targetGames
    .filter((game) => {
      const opponent = String(game.Opponent || "").trim().toLowerCase();
      if (!opponent || opponent === "unknown" || opponent === "unknown opponent") return false;
      return !String(game.OpponentID || "").trim();
    })
    .map((game) => `${game.GameID}:${game.Opponent}`);

  const gamesWithInvalidOpponentId = targetGames
    .filter((game) => {
      const opponentId = String(game.OpponentID || "").trim();
      return opponentId && !schoolIds.has(opponentId);
    })
    .map((game) => `${game.GameID}:${game.OpponentID}`);

  const rosterMembershipIssues = [];
  for (const year of TARGET_YEARS) {
    const roster = rosters.find((row) => String(row.SeasonID) === seasonLabel(year));
    const seasonRosterIds = new Set((roster?.Players || []).map((entry) => String(entry.PlayerID)));
    const seasonGameIds = new Set(
      targetGames.filter((game) => Number(game.Season) === year).map((game) => String(game.GameID))
    );
    const seasonStatPlayerIds = new Set(
      stats
        .filter((stat) => seasonGameIds.has(String(stat.GameID)))
        .map((stat) => String(stat.PlayerID))
    );

    const statsNotRoster = [...seasonStatPlayerIds].filter((id) => !seasonRosterIds.has(id));
    const rosterNoStats = [...seasonRosterIds].filter((id) => !seasonStatPlayerIds.has(id));
    if (statsNotRoster.length || rosterNoStats.length) {
      rosterMembershipIssues.push({
        season: seasonLabel(year),
        statsNotRoster,
        rosterNoStats,
      });
    }
  }

  const scoreStatMismatches = [];
  const sourceNoteMissingForMismatch = [];
  const completenessMissing = [];
  for (const game of targetGames) {
    const rows = targetStats.filter((stat) => String(stat.GameID) === String(game.GameID));
    if (!game.ScoringCompleteness) completenessMissing.push(String(game.GameID));
    if (!rows.length || !hasValue(game.TeamScore)) continue;

    const pointTotal = rows.reduce((total, row) => total + Number(row.Points || 0), 0);
    if (pointTotal !== Number(game.TeamScore)) {
      const issue = {
        gameId: game.GameID,
        season: game.Season,
        opponent: game.Opponent,
        teamScore: game.TeamScore,
        playerPoints: pointTotal,
        scoringCompleteness: game.ScoringCompleteness || "",
      };
      scoreStatMismatches.push(issue);
      if (!String(game.SourceNote || "").trim()) sourceNoteMissingForMismatch.push(issue);
    }
  }

  const recordReconciliation = [];
  for (const year of TARGET_YEARS) {
    const season = seasons.find((row) => Number(row.SeasonID) === year);
    const seasonGames = targetGames.filter((game) => Number(game.Season) === year);
    const wins = seasonGames.filter((game) => game.Result === "W").length;
    const losses = seasonGames.filter((game) => game.Result === "L").length;
    const expectedWins = Number(season?.OverallWins);
    const expectedLosses = Number(season?.OverallLosses);
    const hasOverall = Number.isFinite(expectedWins) && Number.isFinite(expectedLosses);
    const reconciled = hasOverall ? wins === expectedWins && losses === expectedLosses : true;

    recordReconciliation.push({
      season: seasonLabel(year),
      scheduleRecord: `${wins}-${losses}`,
      seasonRecord: hasOverall ? `${expectedWins}-${expectedLosses}` : "",
      reconciled,
    });
  }

  const statIndexesPath = path.join(root, `${config.base}/playergamestats/index.json`);
  const statIndex = fs.existsSync(statIndexesPath)
    ? readJson(`${config.base}/playergamestats/index.json`)
    : [];
  const statsBySeason = new Map();
  for (const stat of stats) {
    const game = gamesById.get(String(stat.GameID));
    const season = Number(game?.Season);
    if (!Number.isFinite(season)) continue;

    if (!statsBySeason.has(season)) {
      statsBySeason.set(season, { rows: 0, gameIds: new Set() });
    }

    const bucket = statsBySeason.get(season);
    bucket.rows += 1;
    bucket.gameIds.add(String(stat.GameID));
  }

  const statIndexBySeason = new Map(
    statIndex.map((row) => [Number(row.season), row])
  );
  const statIndexIssues = [];
  for (const [season, bucket] of [...statsBySeason.entries()].sort(([a], [b]) => a - b)) {
    const indexRow = statIndexBySeason.get(season);
    if (!indexRow) {
      statIndexIssues.push({ season, issue: "missing-index-row" });
      continue;
    }

    if (Number(indexRow.rows) !== bucket.rows) {
      statIndexIssues.push({
        season,
        issue: "row-count-mismatch",
        expected: bucket.rows,
        actual: Number(indexRow.rows),
      });
    }

    if (Number(indexRow.games) !== bucket.gameIds.size) {
      statIndexIssues.push({
        season,
        issue: "game-count-mismatch",
        expected: bucket.gameIds.size,
        actual: Number(indexRow.games),
      });
    }
  }

  for (const row of statIndex) {
    const season = Number(row.season);
    if (!statsBySeason.has(season)) {
      statIndexIssues.push({ season, issue: "extra-index-row" });
    }
  }

  return {
    label: config.label,
    counts: {
      seasons: seasons.length,
      targetGames: targetGames.length,
      targetStats: targetStats.length,
      targetRosters: targetRosters.length,
      targetArticles: articles.filter((article) => TARGET_YEARS.has(Number(article.SeasonID))).length,
      targetAdjustments: adjustments.filter((row) => TARGET_YEARS.has(Number(row.SeasonID))).length,
      statIndexSeasons: statIndex.length,
      statIndexExpectedSeasons: statsBySeason.size,
    },
    duplicates: {
      gameIds: duplicateValues(targetGames, (game) => game.GameID),
      statIds: duplicateValues(targetStats, (stat) => stat.StatID),
    },
    integrity: {
      missingStatPlayers,
      missingRosterPlayers,
      statsMissingGames,
      gamesMissingOpponentId,
      gamesWithInvalidOpponentId,
      rosterMembershipIssues,
      statIndexIssues,
    },
    recordReconciliation,
    scoring: {
      scoreStatMismatches,
      sourceNoteMissingForMismatch,
      completenessMissing,
      complete: targetGames.filter((game) => game.ScoringCompleteness === "complete").length,
      partial: targetGames.filter((game) => game.ScoringCompleteness === "partial").length,
      missing: targetGames.filter((game) => game.ScoringCompleteness === "missing").length,
      placeholders: targetGames.filter((game) => game.ScoringCompleteness === "placeholder").length,
    },
  };
}

function parseSports() {
  const sportIndex = process.argv.indexOf("--sport");
  if (sportIndex >= 0) {
    const requested = process.argv[sportIndex + 1];
    if (!SPORTS[requested]) {
      throw new Error(`Unknown sport "${requested}". Use boys or girls.`);
    }
    return [requested];
  }

  return Object.keys(SPORTS);
}

function main() {
  const selectedSports = parseSports();
  const report = Object.fromEntries(
    selectedSports.map((sport) => [sport, auditSport(sport, SPORTS[sport])])
  );

  console.log(JSON.stringify(report, null, 2));

  if (process.argv.includes("--strict")) {
    const failures = Object.values(report).flatMap((sportReport) => [
      sportReport.duplicates.gameIds.length,
      sportReport.duplicates.statIds.length,
      sportReport.integrity.missingStatPlayers.length,
      sportReport.integrity.missingRosterPlayers.length,
      sportReport.integrity.statsMissingGames.length,
      sportReport.integrity.gamesMissingOpponentId.length,
      sportReport.integrity.gamesWithInvalidOpponentId.length,
      sportReport.integrity.statIndexIssues.length,
      sportReport.scoring.sourceNoteMissingForMismatch.length,
      sportReport.scoring.completenessMissing.length,
    ]);

    if (failures.some((count) => count > 0)) process.exitCode = 1;
  }
}

main();
