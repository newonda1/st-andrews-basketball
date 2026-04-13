const fs = require("fs");
const path = require("path");

const STATS_PATH = path.join(
  process.cwd(),
  "public",
  "data",
  "boys",
  "baseball",
  "playergamestats.json"
);

const GAMES_PATH = path.join(
  process.cwd(),
  "public",
  "data",
  "boys",
  "baseball",
  "games.json"
);

const ROSTER_2025 = [
  { PlayerID: 202305, JerseyNumber: 2 },
  { PlayerID: 202502, JerseyNumber: 5 },
  { PlayerID: 202302, JerseyNumber: 6 },
  { PlayerID: 202207, JerseyNumber: 7 },
  { PlayerID: 202415, JerseyNumber: 10 },
  { PlayerID: 202414, JerseyNumber: 13 },
  { PlayerID: 202407, JerseyNumber: 15 },
  { PlayerID: 202306, JerseyNumber: 16 },
  { PlayerID: 202208, JerseyNumber: 22 },
  { PlayerID: 202413, JerseyNumber: 23 },
  { PlayerID: 202307, JerseyNumber: 24 },
  { PlayerID: 202501, JerseyNumber: 32 }
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function num(value) {
  return Number(value);
}

function compareByGameThenPlayer(a, b) {
  if (num(a.GameID) !== num(b.GameID)) {
    return num(a.GameID) - num(b.GameID);
  }
  return num(a.PlayerID) - num(b.PlayerID);
}

function makeZeroEntry(gameId, playerId) {
  return {
    StatID: Number(`${gameId}${playerId}`),
    GameID: Number(gameId),
    PlayerID: Number(playerId),
    PA: 0,
    AB: 0,
    R: 0,
    H: 0,
    "1B": 0,
    "2B": 0,
    "3B": 0,
    HR: 0,
    RBI: 0,
    BB: 0,
    SO: 0,
    HBP: 0,
    SAC: 0,
    SF: 0,
    ROE: 0,
    FC: 0,
    SB: 0,
    CS: 0,
    TB: 0,
    IP: 0,
    BF: 0,
    Pitches: 0,
    W: 0,
    L: 0,
    SV: 0,
    SVO: 0,
    BS: 0,
    H_Allowed: 0,
    R_Allowed: 0,
    ER: 0,
    BB_Allowed: 0,
    SO_Pitching: 0,
    HBP_Pitching: 0,
    BK: 0,
    PIK_Allowed: 0,
    CS_Pitching: 0,
    SB_Allowed: 0,
    WP: 0,
    A: 0,
    PO: 0,
    E: 0,
    DP: 0,
    TP: 0,
    PB: 0,
    PIK_Fielding: 0,
    CI: 0,
    P_Innings: 0,
    C_Innings: 0,
    "1B_Innings": 0,
    "2B_Innings": 0,
    "3B_Innings": 0,
    SS_Innings: 0,
    LF_Innings: 0,
    CF_Innings: 0,
    RF_Innings: 0,
    SF_Innings: 0
  };
}

function main() {
  const stats = readJson(STATS_PATH);
  const games = readJson(GAMES_PATH);

  const games2025 = games
    .filter((game) => Number(game.Season) === 2025)
    .map((game) => Number(game.GameID))
    .sort((a, b) => a - b);

  const existingStatIds = new Set(stats.map((entry) => Number(entry.StatID)));

  const playersByGame = new Map();
  for (const entry of stats) {
    const gameId = Number(entry.GameID);
    const playerId = Number(entry.PlayerID);

    if (!playersByGame.has(gameId)) {
      playersByGame.set(gameId, new Set());
    }
    playersByGame.get(gameId).add(playerId);
  }

  const additions = [];

  for (const gameId of games2025) {
    const existingPlayers = playersByGame.get(gameId) || new Set();

    for (const player of ROSTER_2025) {
      const playerId = Number(player.PlayerID);
      const statId = Number(`${gameId}${playerId}`);

      if (existingPlayers.has(playerId)) {
        continue;
      }

      if (existingStatIds.has(statId)) {
        continue;
      }

      const zeroEntry = makeZeroEntry(gameId, playerId);
      additions.push(zeroEntry);
      existingStatIds.add(statId);
    }
  }

  if (additions.length === 0) {
    console.log("No missing 2025 entries found.");
    return;
  }

  const updatedStats = [...stats, ...additions].sort(compareByGameThenPlayer);

  writeJson(STATS_PATH, updatedStats);

  console.log(`Added ${additions.length} zero entries.\n`);
  for (const entry of additions) {
    console.log(`Game ${entry.GameID}: added PlayerID ${entry.PlayerID}`);
  }
}

main();