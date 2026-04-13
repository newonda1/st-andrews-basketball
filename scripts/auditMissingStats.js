const fs = require("fs");

// Load files
const stats = JSON.parse(fs.readFileSync("./public/data/boys/baseball/playergamestats.json"));
const roster = [
  202305, 202502, 202302, 202207, 202415, 202414,
  202407, 202306, 202208, 202413, 202307, 202501
];

// Get all 2025 games
const games = [...new Set(
  stats
    .filter(s => String(s.GameID).startsWith("2025"))
    .map(s => s.GameID)
)];

games.sort();

for (const gameID of games) {
  const playersInGame = new Set(
    stats
      .filter(s => s.GameID === gameID)
      .map(s => s.PlayerID)
  );

  const missing = roster.filter(pid => !playersInGame.has(pid));

  if (missing.length > 0) {
    console.log(`\nGame ${gameID}`);
    console.log("Missing:", missing.join(", "));
  }
}