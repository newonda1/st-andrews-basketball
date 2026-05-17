const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const TARGET_YEARS = new Set([1999, 2000, 2001, 2002, 2003, 2004, 2005]);

const seasonMetadata = {
  boys: {
    1999: { wins: 21, losses: 9, archiveStatus: "Recovered with record-path placeholders" },
    2000: { wins: 16, losses: 11, archiveStatus: "Recovered" },
    2001: { wins: 16, losses: 7, archiveStatus: "Recovered with record-path placeholders" },
    2002: { wins: 19, losses: 5, archiveStatus: "Recovered" },
    2003: { wins: 19, losses: 8, archiveStatus: "Recovered" },
    2004: { wins: 1, losses: 23, archiveStatus: "Recovered" },
    2005: { wins: 8, losses: 16, archiveStatus: "Recovered" },
  },
  girls: {
    1999: { wins: 11, losses: 13, archiveStatus: "Recovered with record-path placeholders" },
    2000: { wins: 15, losses: 6, archiveStatus: "Recovered with record-path placeholders" },
    2001: { wins: 17, losses: 7, archiveStatus: "Recovered with record-path placeholders" },
    2002: { wins: 23, losses: 3, archiveStatus: "Recovered with record-path gaps" },
    2003: { wins: 21, losses: 5, archiveStatus: "Recovered with record-path gaps" },
    2004: { wins: 22, losses: 7, archiveStatus: "Recovered" },
    2005: { wins: 24, losses: 4, archiveStatus: "Recovered" },
  },
};

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(relativePath, data) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(data, null, 2)}\n`);
}

function buildSourceCitation(game) {
  const direct = String(game.SourceCitation || game.RecapSource || "").trim();
  if (direct) return direct;

  const parts = [
    game.SourcePublication,
    game.SourceAuthor || game.SourceByline ? `By ${game.SourceAuthor || game.SourceByline}` : "",
    game.SourceDate,
    game.SourcePage ? `Page ${game.SourcePage}` : "",
    game.SourceSection,
  ].filter((part) => part && String(part).trim());

  return parts.join(" • ");
}

function ensureWestGeorgiaSchool() {
  const schoolsPath = "public/data/schools.json";
  const schools = readJson(schoolsPath);
  const schoolId = "ga-west-georgia-christian";

  if (!schools.some((school) => school.SchoolID === schoolId)) {
    const insertIndex = schools.findIndex(
      (school) => String(school.SchoolID) > schoolId && String(school.State || "") === "GA"
    );
    const school = {
      SchoolID: schoolId,
      Name: "West Georgia Christian",
      City: "",
      State: "GA",
    };

    if (insertIndex >= 0) {
      schools.splice(insertIndex, 0, school);
    } else {
      schools.push(school);
    }

    writeJson(schoolsPath, schools);
  }

  return schoolId;
}

function updateSeasons(gender) {
  const seasonsPath = `public/data/${gender}/basketball/seasons.json`;
  const seasons = readJson(seasonsPath);
  const records = seasonMetadata[gender];

  for (const season of seasons) {
    const metadata = records[Number(season.SeasonID)];
    if (!metadata) continue;

    season.OverallWins = metadata.wins;
    season.OverallLosses = metadata.losses;
    season.ArchiveStatus = metadata.archiveStatus;
    season.RecordSource = "Archive schedule, published final record, and season-page reconciliation";
  }

  writeJson(seasonsPath, seasons);
}

function articleMapByGameId(articles) {
  const map = new Map();

  for (const article of Array.isArray(articles) ? articles : []) {
    for (const gameId of article.GameIDs || []) {
      const key = String(gameId);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(article.ArticleID);
    }
  }

  return map;
}

function normalizeGames(gender, westGeorgiaSchoolId) {
  const base = `public/data/${gender}/basketball`;
  const games = readJson(`${base}/games.json`);
  const stats = readJson(`${base}/playergamestats.json`);
  const articles = fs.existsSync(path.join(root, `${base}/articles.json`))
    ? readJson(`${base}/articles.json`)
    : [];
  const articlesByGame = articleMapByGameId(articles);
  const statsByGame = new Map();

  for (const stat of stats) {
    const key = String(stat.GameID);
    if (!statsByGame.has(key)) statsByGame.set(key, []);
    statsByGame.get(key).push(stat);
  }

  for (const game of games) {
    if (!TARGET_YEARS.has(Number(game.Season))) continue;

    if (game.Opponent === "West Georgia Christian" && !game.OpponentID) {
      game.OpponentID = westGeorgiaSchoolId;
    }

    const sourceCitation = buildSourceCitation(game);
    if (sourceCitation) game.SourceCitation = sourceCitation;

    const articleIds = articlesByGame.get(String(game.GameID)) || [];
    const uniqueArticleIds = [...new Set(articleIds)].filter(Boolean);
    if (!game.ArticleID && uniqueArticleIds.length === 1) {
      game.ArticleID = uniqueArticleIds[0];
    }

    const gameStats = statsByGame.get(String(game.GameID)) || [];
    const teamScore = Number(game.TeamScore);
    const hasTeamScore = Number.isFinite(teamScore);

    if (game.IsComplete !== "Yes" || !hasTeamScore) {
      game.ScoringCompleteness = "placeholder";
      continue;
    }

    if (!gameStats.length) {
      game.ScoringCompleteness = "missing";
      continue;
    }

    const playerPoints = gameStats.reduce((total, stat) => total + Number(stat.Points || 0), 0);
    if (playerPoints === teamScore) {
      game.ScoringCompleteness = "complete";
    } else {
      game.ScoringCompleteness = "partial";
      if (!String(game.SourceNote || "").trim()) {
        game.SourceNote =
          `Named St. Andrew's scoring rows total ${playerPoints} points against the reported team score of ${teamScore}; the reported team score is preserved.`;
      }
    }
  }

  writeJson(`${base}/games.json`, games);
}

function ensureRosterPlayer(gender, seasonId, entry) {
  const rostersPath = `public/data/${gender}/basketball/seasonrosters.json`;
  const rosters = readJson(rostersPath);
  const roster = rosters.find((row) => String(row.SeasonID) === seasonId);
  if (!roster) throw new Error(`Missing ${gender} roster ${seasonId}`);

  roster.Players = Array.isArray(roster.Players) ? roster.Players : [];
  if (!roster.Players.some((player) => String(player.PlayerID) === String(entry.PlayerID))) {
    roster.Players.push(entry);
  }

  writeJson(rostersPath, rosters);
}

function main() {
  const westGeorgiaSchoolId = ensureWestGeorgiaSchool();

  updateSeasons("boys");
  updateSeasons("girls");
  normalizeGames("boys", westGeorgiaSchoolId);
  normalizeGames("girls", westGeorgiaSchoolId);

  ensureRosterPlayer("boys", "2004-05", {
    PlayerID: 2026161,
    JerseyNumber: null,
    Grade: 10,
    Subline: "Scored in a recovered Dec. 16, 2004 box score; jersey number not recovered.",
  });

  ensureRosterPlayer("girls", "2004-05", {
    PlayerID: 200429,
    JerseyNumber: null,
    Grade: 10,
    Subline: "Scored in a recovered Dec. 10, 2004 box score; jersey number not recovered.",
  });
}

main();
