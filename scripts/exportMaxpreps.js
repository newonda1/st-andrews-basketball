import fs from "fs";
import path from "path";

// Adjust paths if needed
const statsPath = "./public/data/boys/basketball/playergamestats.json";
const rosterPath = "./public/data/boys/basketball/seasonrosters.json";
const outputDir = "./public/data/boys/basketball/maxpreps_exports";

// Ensure output folder exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Load data
const stats = JSON.parse(fs.readFileSync(statsPath, "utf-8"));
const rosterData = JSON.parse(fs.readFileSync(rosterPath, "utf-8"));

// Build PlayerID → Jersey map
const jerseyMap = {};
rosterData.Players.forEach(p => {
  jerseyMap[p.PlayerID] = p.JerseyNumber;
});

// Group stats by GameID
const games = {};
stats.forEach(s => {
  if (!games[s.GameID]) {
    games[s.GameID] = [];
  }
  games[s.GameID].push(s);
});

// Header
const header = [
  "Jersey","Points","TwoPointsMade","TwoPointAttempts",
  "ThreePointsMade","ThreePointAttempts",
  "FreeThrowsMade","FreeThrowAttempts",
  "OffensiveRebounds","DefensiveRebounds",
  "Rebounds","Assists","BlockedShots","Steals","Turnovers",
  "PersonalFouls","Deflections","Charges"
].join("|");

// Build files
Object.keys(games).forEach(gameID => {
  const rows = games[gameID].map(s => {
    const jersey = jerseyMap[s.PlayerID] ?? "";

    return [
      jersey,
      s.Points,
      s.TwoPM,
      s.TwoPA,
      s.ThreePM,
      s.ThreePA,
      s.FTM,
      s.FTA,
      "", // OffensiveRebounds
      "", // DefensiveRebounds
      s.Rebounds,
      s.Assists,
      s.Blocks,
      s.Steals,
      s.Turnovers,
      "", // PersonalFouls
      "", // Deflections
      ""  // Charges
    ].join("|");
  });

  const content = header + "\n" + rows.join("\n");

  fs.writeFileSync(
    path.join(outputDir, `${gameID}_maxpreps.txt`),
    content
  );
});

console.log("✅ MaxPreps files generated!");
