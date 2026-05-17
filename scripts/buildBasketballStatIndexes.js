const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const SPORTS = [
  { key: "boys", base: "public/data/boys/basketball" },
  { key: "girls", base: "public/data/girls/basketball" },
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(relativePath, data) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`);
}

function removeJsonFiles(directory) {
  const fullPath = path.join(root, directory);
  if (!fs.existsSync(fullPath)) return;

  for (const entry of fs.readdirSync(fullPath)) {
    if (entry.endsWith(".json")) {
      fs.unlinkSync(path.join(fullPath, entry));
    }
  }
}

function buildSportIndex({ base }) {
  const games = readJson(`${base}/games.json`);
  const stats = readJson(`${base}/playergamestats.json`);
  const gameSeasonById = new Map(
    games.map((game) => [String(game.GameID), Number(game.Season)])
  );
  const statsBySeason = new Map();

  for (const stat of stats) {
    const season = gameSeasonById.get(String(stat.GameID));
    if (!Number.isFinite(season)) continue;
    if (!statsBySeason.has(season)) statsBySeason.set(season, []);
    statsBySeason.get(season).push(stat);
  }

  const outputDirectory = `${base}/playergamestats`;
  removeJsonFiles(outputDirectory);

  const index = [...statsBySeason.entries()]
    .sort(([a], [b]) => a - b)
    .map(([season, rows]) => {
      const file = `${season}.json`;
      writeJson(`${outputDirectory}/${file}`, rows);
      return {
        season,
        file,
        rows: rows.length,
        games: new Set(rows.map((row) => String(row.GameID))).size,
      };
    });

  writeJson(`${outputDirectory}/index.json`, index);
  return index.length;
}

function main() {
  for (const sport of SPORTS) {
    const seasons = buildSportIndex(sport);
    console.log(`Wrote ${seasons} ${sport.key} basketball stat season files.`);
  }
}

main();
