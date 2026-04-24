const fs = require("fs");
const path = require("path");

function extractTopLevelObjects(jsonText) {
  const objects = [];
  let depth = 0;
  let inString = false;
  let escaped = false;
  let start = -1;

  for (let i = 0; i < jsonText.length; i += 1) {
    const ch = jsonText[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === "\"") {
        inString = false;
      }
      continue;
    }

    if (ch === "\"") {
      inString = true;
      continue;
    }

    if (ch === "{") {
      if (depth === 0) start = i;
      depth += 1;
      continue;
    }

    if (ch === "}") {
      depth -= 1;
      if (depth === 0 && start !== -1) {
        objects.push(jsonText.slice(start, i + 1).trim());
        start = -1;
      }
    }
  }

  if (depth !== 0 || inString) {
    throw new Error("playergamestats.json appears to have unbalanced JSON structure.");
  }

  return objects;
}

function getGameId(objectText) {
  const match = objectText.match(/"GameID"\s*:\s*(\d+)/);
  return match ? Number(match[1]) : null;
}

function writeJsonArray(filePath, objectTexts) {
  const body = objectTexts.length ? `\n${objectTexts.join(",\n")}\n` : "";
  fs.writeFileSync(filePath, `[${body}]\n`, "utf8");
}

function splitBaseballPlayerGameStats({ projectRoot = path.resolve(__dirname, ".."), log = console.log } = {}) {
  const statsPath = path.join(projectRoot, "public/data/boys/baseball/playergamestats.json");
  const gamesPath = path.join(projectRoot, "public/data/boys/baseball/games.json");
  const outputDir = path.join(projectRoot, "public/data/boys/baseball/playergamestats");
  const indexPath = path.join(outputDir, "index.json");
  const statsText = fs.readFileSync(statsPath, "utf8");
  const games = JSON.parse(fs.readFileSync(gamesPath, "utf8"));
  const gameSeasonMap = new Map(games.map((game) => [Number(game.GameID), Number(game.Season)]));
  const seasonGameCounts = new Map();

  games.forEach((game) => {
    const season = Number(game.Season);
    if (!Number.isFinite(season)) return;
    seasonGameCounts.set(season, (seasonGameCounts.get(season) || 0) + 1);
  });

  const grouped = new Map();
  const unknownGameIds = new Set();

  extractTopLevelObjects(statsText).forEach((objectText) => {
    const gameId = getGameId(objectText);
    const season = gameSeasonMap.get(gameId);

    if (!Number.isFinite(season)) {
      unknownGameIds.add(gameId);
      return;
    }

    if (!grouped.has(season)) grouped.set(season, []);
    grouped.get(season).push(objectText);
  });

  if (unknownGameIds.size) {
    throw new Error(
      `Unable to resolve seasons for GameID(s): ${Array.from(unknownGameIds).join(", ")}`
    );
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const index = Array.from(grouped.entries())
    .sort(([a], [b]) => a - b)
    .map(([season, rows]) => {
      const fileName = `${season}.json`;
      writeJsonArray(path.join(outputDir, fileName), rows);
      return {
        Season: season,
        Path: `/data/boys/baseball/playergamestats/${fileName}`,
        Rows: rows.length,
        Games: seasonGameCounts.get(season) || 0,
      };
    });

  fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");

  log(
    `Split ${index.reduce((total, item) => total + item.Rows, 0)} rows into ${index.length} season files.`
  );
}

if (require.main === module) {
  splitBaseballPlayerGameStats();
}

module.exports = {
  splitBaseballPlayerGameStats,
};
