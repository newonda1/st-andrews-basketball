// fixGameDates.js
// One-time script to align each game's Date with its GameID (YYYYMMDD).

const fs = require("fs");
const path = require("path");

// ✅ Path to games.json in this project
const GAMES_PATH = path.join(
  __dirname,
  "public",
  "data",
  "boys",
  "basketball",
  "games.json"
);

function dateFromGameId(gameId) {
  const n = Number(gameId);
  if (!Number.isFinite(n)) return null;

  const year = Math.floor(n / 10000);
  const month = Math.floor(n / 100) % 100;
  const day = n % 100;

  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  return Date.UTC(year, month - 1, day);
}

function main() {
  console.log("Fixing dates in:", GAMES_PATH);

  const raw = fs.readFileSync(GAMES_PATH, "utf8");
  const games = JSON.parse(raw);

  // Create backup
  const backupPath = GAMES_PATH.replace(
    /\.json$/,
    `_backup_${Date.now()}.json`
  );
  fs.writeFileSync(backupPath, raw);
  console.log("Backup created:", backupPath);

  let updated = 0;

  for (const g of games) {
    const correctMs = dateFromGameId(g.GameID);
    if (correctMs === null) continue;

    if (g.Date !== correctMs) {
      g.Date = correctMs;
      updated++;
    }
  }

  fs.writeFileSync(GAMES_PATH, JSON.stringify(games, null, 2));
  console.log(`Done. Updated ${updated} games.`);
}

main();