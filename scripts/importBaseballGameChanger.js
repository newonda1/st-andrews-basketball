const fs = require("fs");
const path = require("path");

// ===== CONFIG =====
const PROJECT_ROOT = process.cwd();

const PLAYERS_PATH = path.join(
  PROJECT_ROOT,
  "public/data/boys/players.json"
);

const STATS_PATH = path.join(
  PROJECT_ROOT,
  "public/data/boys/baseball/playergamestats.json"
);

const GAMES_PATH = path.join(
  PROJECT_ROOT,
  "public/data/boys/baseball/games.json"
);

// ===== GET ARGUMENTS =====
const [, , gameId, filePath] = process.argv;

if (!gameId || !filePath) {
  console.log("Usage:");
  console.log("node scripts/importBaseballGameChanger.js <GameID> <csvPath>");
  process.exit(1);
}

function cleanCell(value) {
  return String(value ?? "")
    .replace(/^"|"$/g, "")
    .replace(/""/g, '"')
    .trim();
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const next = line[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      result.push(cleanCell(current));
      current = "";
      continue;
    }

    current += ch;
  }

  result.push(cleanCell(current));
  return result;
}

function toNumber(value) {
  const cleaned = cleanCell(value);
  if (cleaned === "" || cleaned === "-" || cleaned === "N/A") return 0;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function normalizeNamePart(value) {
  return cleanCell(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function expandFirstNameOptions(value) {
  const cleaned = normalizeNamePart(value);
  const options = new Set([cleaned]);

  const nicknameMap = {
    pat: ["patrick"],
    will: ["william"],
    bill: ["william"],
    mike: ["michael"],
    matt: ["matthew"],
    ben: ["benjamin"],
    jack: ["john"],
    jon: ["jonathan"],
    nate: ["nathan"],
    drew: ["andrew"],
  };

  if (nicknameMap[cleaned]) {
    nicknameMap[cleaned].forEach((name) => options.add(name));
  }

  return [...options];
}

function buildPlayerLookup(players) {
  const map = new Map();

  players.forEach((player) => {
    const first = normalizeNamePart(player.FirstName);
    const last = normalizeNamePart(player.LastName);
    const key = `${first}|${last}`;
    map.set(key, player);
  });

  return map;
}

function makeEmptyStats(gameIdValue, playerId) {
  return {
    StatID: Number(`${gameIdValue}${playerId}`),
    GameID: Number(gameIdValue),
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
    IP: 0.0,
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
    P_Innings: 0.0,
    C_Innings: 0.0,
    "1B_Innings": 0.0,
    "2B_Innings": 0.0,
    "3B_Innings": 0.0,
    SS_Innings: 0.0,
    LF_Innings: 0.0,
    CF_Innings: 0.0,
    RF_Innings: 0.0,
    SF_Innings: 0.0,
  };
}

function sumBy(rows, key) {
  return rows.reduce((sum, row) => sum + Number(row[key] || 0), 0);
}

function formatValidationLine(label, actual, expected) {
  const matches = Number(actual) === Number(expected);
  return {
    label,
    actual,
    expected,
    status: matches ? "OK" : "CHECK",
  };
}

// ===== LOAD FILES =====
const csvRaw = fs.readFileSync(filePath, "utf-8");
const players = JSON.parse(fs.readFileSync(PLAYERS_PATH, "utf-8"));
const games = JSON.parse(fs.readFileSync(GAMES_PATH, "utf-8"));
const existingStats = JSON.parse(fs.readFileSync(STATS_PATH, "utf-8"));

// ===== BASIC CSV PARSE =====
const rows = csvRaw
  .split(/\r?\n/)
  .map((r) => r.trim())
  .filter(Boolean);

const parsed = rows.map(parseCsvLine);
const playerLookup = buildPlayerLookup(players);

const dataRows = parsed.slice(2).filter((row) => {
  const number = cleanCell(row[0]);
  const first = cleanCell(row[2]);
  const last = cleanCell(row[1]);
  return number !== "" && first !== "" && last !== "";
});

const generatedRows = [];
const unmatchedRows = [];

for (const row of dataRows) {
  const first = cleanCell(row[2]);
  const last = cleanCell(row[1]);
  const lastKey = normalizeNamePart(last);
  const firstOptions = expandFirstNameOptions(first);

  let player = null;
  for (const firstKey of firstOptions) {
    const lookupKey = `${firstKey}|${lastKey}`;
    if (playerLookup.has(lookupKey)) {
      player = playerLookup.get(lookupKey);
      break;
    }
  }

  if (!player) {
    unmatchedRows.push({ Number: cleanCell(row[0]), First: first, Last: last });
    continue;
  }

  const stats = makeEmptyStats(gameId, player.PlayerID);

  // hitting
  stats.PA = toNumber(row[4]);
  stats.AB = toNumber(row[5]);
  stats.H = toNumber(row[10]);
  stats["1B"] = toNumber(row[11]);
  stats["2B"] = toNumber(row[12]);
  stats["3B"] = toNumber(row[13]);
  stats.HR = toNumber(row[14]);
  stats.RBI = toNumber(row[15]);
  stats.R = toNumber(row[16]);
  stats.BB = toNumber(row[17]);
  stats.SO = toNumber(row[18]);
  stats.HBP = toNumber(row[20]);
  stats.SAC = toNumber(row[21]);
  stats.SF = toNumber(row[22]);
  stats.ROE = toNumber(row[23]);
  stats.FC = toNumber(row[24]);
  stats.SB = toNumber(row[25]);
  stats.CS = toNumber(row[27]);
  stats.TB = toNumber(row[43]);

  // pitching
  stats.IP = toNumber(row[54]);
  stats.BF = toNumber(row[57]);
  stats.Pitches = toNumber(row[58]);
  stats.W = toNumber(row[59]);
  stats.L = toNumber(row[60]);
  stats.SV = toNumber(row[61]);
  stats.SVO = toNumber(row[62]);
  stats.BS = toNumber(row[63]);
  stats.H_Allowed = toNumber(row[65]);
  stats.R_Allowed = toNumber(row[66]);
  stats.ER = toNumber(row[67]);
  stats.BB_Allowed = toNumber(row[68]);
  stats.SO_Pitching = toNumber(row[69]);
  stats.HBP_Pitching = toNumber(row[71]);
  stats.BK = toNumber(row[75]);
  stats.PIK_Allowed = toNumber(row[76]);
  stats.CS_Pitching = toNumber(row[77]);
  stats.SB_Allowed = toNumber(row[78]);
  stats.WP = toNumber(row[80]);
  stats.P_Innings = toNumber(row[133]);

  // fielding
  stats.A = toNumber(row[149]);
  stats.PO = toNumber(row[150]);
  stats.E = toNumber(row[152]);
  stats.DP = toNumber(row[153]);
  stats.TP = toNumber(row[154]);
  stats.PB = toNumber(row[156]);
  stats.PIK_Fielding = toNumber(row[161]);
  stats.CI = toNumber(row[162]);
  stats.P_Innings = toNumber(row[163]);
  stats.C_Innings = toNumber(row[164]);
  stats["1B_Innings"] = toNumber(row[165]);
  stats["2B_Innings"] = toNumber(row[166]);
  stats["3B_Innings"] = toNumber(row[167]);
  stats.SS_Innings = toNumber(row[168]);
  stats.LF_Innings = toNumber(row[169]);
  stats.CF_Innings = toNumber(row[170]);
  stats.RF_Innings = toNumber(row[171]);
  stats.SF_Innings = toNumber(row[172]);

  generatedRows.push({
    jersey: cleanCell(row[0]),
    first,
    last,
    playerId: player.PlayerID,
    stats,
  });
}

const generatedStats = generatedRows.map((entry) => entry.stats);
const gameRecord = games.find((g) => Number(g.GameID) === Number(gameId)) || null;

const generatedTotals = {
  runs: sumBy(generatedStats, "R"),
  hits: sumBy(generatedStats, "H"),
  rbi: sumBy(generatedStats, "RBI"),
  walks: sumBy(generatedStats, "BB"),
  strikeouts: sumBy(generatedStats, "SO"),
  stolenBases: sumBy(generatedStats, "SB"),
  inningsPitched: sumBy(generatedStats, "IP"),
  runsAllowed: sumBy(generatedStats, "R_Allowed"),
  hitsAllowed: sumBy(generatedStats, "H_Allowed"),
  errors: sumBy(generatedStats, "E"),
};

const validationSummary = [];

if (gameRecord) {
  validationSummary.push(
    formatValidationLine("Team runs", generatedTotals.runs, gameRecord.TeamScore ?? 0)
  );

  if (gameRecord.LineScore?.StAndrewsTotals?.H != null) {
    validationSummary.push(
      formatValidationLine("Team hits", generatedTotals.hits, gameRecord.LineScore.StAndrewsTotals.H)
    );
  }

  if (gameRecord.LineScore?.StAndrewsTotals?.E != null) {
    validationSummary.push(
      formatValidationLine("Team errors", generatedTotals.errors, gameRecord.LineScore.StAndrewsTotals.E)
    );
  }

  if (gameRecord.OpponentScore != null) {
    validationSummary.push(
      formatValidationLine("Opponent runs allowed", generatedTotals.runsAllowed, gameRecord.OpponentScore)
    );
  }

  if (gameRecord.LineScore?.OpponentTotals?.H != null) {
    validationSummary.push(
      formatValidationLine("Opponent hits allowed", generatedTotals.hitsAllowed, gameRecord.LineScore.OpponentTotals.H)
    );
  }
}

const pitcherRows = generatedStats.filter((row) => Number(row.IP || 0) > 0);

const filteredExistingStats = existingStats.filter(
  (row) => Number(row.GameID) !== Number(gameId)
);

const updatedStats = [...filteredExistingStats, ...generatedStats].sort((a, b) => {
  const gameDiff = Number(a.GameID) - Number(b.GameID);
  if (gameDiff !== 0) return gameDiff;
  return Number(a.StatID) - Number(b.StatID);
});

console.log("GameID:", gameId);
console.log("Total raw rows:", parsed.length);
console.log("Player rows found:", dataRows.length);
console.log("Matched player rows:", generatedRows.length);
console.log("Unmatched rows:", unmatchedRows.length);
console.log("Games file exists:", fs.existsSync(GAMES_PATH));
console.log("Pitchers with IP > 0:", pitcherRows.length);
console.log("Generated totals:", generatedTotals);
console.log("Existing rows removed for this GameID:", existingStats.length - filteredExistingStats.length);

if (unmatchedRows.length) {
  console.log("\nUnmatched players:\n");
  console.log(unmatchedRows);
}

if (validationSummary.length) {
  console.log("\nValidation summary:\n");
  validationSummary.forEach((item) => console.log(item));
}

console.log("\nGenerated row preview:\n");
generatedRows.slice(0, 5).forEach((entry, idx) => {
  console.log(idx + 1, {
    jersey: entry.jersey,
    name: `${entry.first} ${entry.last}`,
    playerId: entry.playerId,
    PA: entry.stats.PA,
    AB: entry.stats.AB,
    H: entry.stats.H,
    RBI: entry.stats.RBI,
    R: entry.stats.R,
    IP: entry.stats.IP,
    W: entry.stats.W,
    L: entry.stats.L,
    SV: entry.stats.SV,
    A: entry.stats.A,
    PO: entry.stats.PO,
    E: entry.stats.E,
  });
});

console.log("\nFull JSON block for this game:\n");
console.log(JSON.stringify(generatedStats, null, 2));

fs.writeFileSync(STATS_PATH, JSON.stringify(updatedStats, null, 2) + "\n", "utf-8");

console.log("\nplayergamestats.json updated successfully.\n");
console.log(`Replaced rows for GameID ${gameId} with ${generatedStats.length} imported rows.`);