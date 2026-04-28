const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const ARCHIVE_DIR = process.env.MAXPREPS_ARCHIVE_DIR || "/tmp/maxpreps-boys-archive";
const TEAM_ID = "1019c441-d956-4e70-a61c-6cbc2ba6e073";

const DATA_PATHS = {
  games: path.join(PROJECT_ROOT, "public/data/boys/basketball/games.json"),
  playerStats: path.join(PROJECT_ROOT, "public/data/boys/basketball/playergamestats.json"),
  rosters: path.join(PROJECT_ROOT, "public/data/boys/basketball/seasonrosters.json"),
  players: path.join(PROJECT_ROOT, "public/data/players.json"),
  schools: path.join(PROJECT_ROOT, "public/data/schools.json"),
};

const SEASONS = [
  { short: "05-06", seasonId: 2005, label: "2005-06" },
  { short: "06-07", seasonId: 2006, label: "2006-07" },
  { short: "07-08", seasonId: 2007, label: "2007-08" },
  { short: "09-10", seasonId: 2009, label: "2009-10" },
  { short: "10-11", seasonId: 2010, label: "2010-11" },
  { short: "11-12", seasonId: 2011, label: "2011-12" },
  { short: "12-13", seasonId: 2012, label: "2012-13" },
  { short: "13-14", seasonId: 2013, label: "2013-14" },
  { short: "14-15", seasonId: 2014, label: "2014-15" },
  { short: "15-16", seasonId: 2015, label: "2015-16" },
  { short: "16-17", seasonId: 2016, label: "2016-17" },
  { short: "17-18", seasonId: 2017, label: "2017-18" },
];

const STAT_NAME_MAP = {
  MinutesPlayed: "Minutes",
  Points: "Points",
  Rebounds: "Rebounds",
  Assists: "Assists",
  Turnovers: "Turnovers",
  Steals: "Steals",
  BlockedShots: "Blocks",
  ThreePointsMade: "ThreePM",
  ThreePointAttempts: "ThreePA",
  TwoPointsMade: "TwoPM",
  TwoPointAttempts: "TwoPA",
  FreeThrowsMade: "FTM",
  FreeThrowAttempts: "FTA",
};

const PRINT_HEADER_MAP = {
  GP: "GamesPlayed",
  Min: "Minutes",
  Pts: "Points",
  "3FGM": "ThreePM",
  "3PM": "ThreePM",
  "3FGA": "ThreePA",
  "3PA": "ThreePA",
  "2FGM": "TwoPM",
  "2PM": "TwoPM",
  "2FGA": "TwoPA",
  "2PA": "TwoPA",
  FTM: "FTM",
  FTA: "FTA",
  "Tot Reb": "Rebounds",
  Reb: "Rebounds",
  Asst: "Assists",
  Ast: "Assists",
  Stls: "Steals",
  Stl: "Steals",
  "Blk Shts": "Blocks",
  Blk: "Blocks",
  TO: "Turnovers",
};

const STAT_FIELDS = [
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
];

const PLAYER_NAME_ALIASES = new Map([
  [normalizeName("Miles Mcdowell"), "Miles McDowell"],
  [normalizeName("Thomas Shappard"), "Thomas Shapard"],
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function readArchiveFile(short, suffix) {
  const filePath = path.join(ARCHIVE_DIR, `${short}-${suffix}.html`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing archive file: ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf8");
}

function parseNextData(html) {
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
  );
  if (!match) return null;
  return JSON.parse(match[1]);
}

function decodeHtml(value) {
  return String(value ?? "")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(value) {
  return decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanName(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeName(value) {
  return cleanName(value)
    .toLowerCase()
    .replace(/[.'"]/g, "")
    .replace(/\s+/g, " ");
}

function canonicalPlayerName(value) {
  const cleaned = cleanName(value);
  return PLAYER_NAME_ALIASES.get(normalizeName(cleaned)) || cleaned;
}

function normalizeSchoolKey(school) {
  const name = school?.name ?? school?.Name;
  const city = school?.city ?? school?.City;
  const state = school?.state ?? school?.State;
  return [name, city, state].map((part) => normalizeName(part)).join("|");
}

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(number) ? number : null;
}

function toJersey(value) {
  if (value === null || value === undefined || value === "") return null;
  const text = String(value).trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : text;
}

function gameIdFromStamp(stamp) {
  const match = String(stamp ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return Number(`${match[1]}${match[2]}${match[3]}`);
}

function locationTypeFromCode(code) {
  if (Number(code) === 0) return "Home";
  if (Number(code) === 1) return "Away";
  if (Number(code) === 2) return "Neutral";
  return "Unknown";
}

function gameTypeFromCode(code, gameId) {
  const typeCode = Number(code);
  const monthDay = Number(String(gameId).slice(4));

  if (typeCode === 0) return "Region";
  if (typeCode === 1) return "Non-Region";

  if (typeCode === 2) {
    if (monthDay >= 212 && monthDay <= 229) return "State Tournament";
    if (monthDay >= 201 && monthDay <= 211) return "Region Tournament";
    return "Tournament";
  }

  if (typeCode === 4) {
    return monthDay >= 212 ? "State Tournament" : "Region Tournament";
  }

  return "Non-Region";
}

function buildSchoolIndex(schools) {
  const byKey = new Map();
  const ids = new Set();

  for (const school of schools) {
    ids.add(String(school.SchoolID));
    const key = normalizeSchoolKey(school);
    if (!byKey.has(key)) byKey.set(key, school);
  }

  return { byKey, ids };
}

function getOrCreateSchool(teamRow, schools, schoolIndex) {
  const name = cleanName(teamRow?.[14]);
  const city = cleanName(teamRow?.[15]);
  const state = cleanName(teamRow?.[16]);
  const mascot = cleanName(teamRow?.[21]);
  const key = normalizeSchoolKey({ name, city, state });

  const existing = schoolIndex.byKey.get(key);
  if (existing) return existing;

  const stateSlug = slugify(state);
  const base = slugify([stateSlug, name, city].filter(Boolean).join("-"));
  let schoolId = base;
  let suffix = 2;

  while (schoolIndex.ids.has(schoolId)) {
    schoolId = `${base}-${suffix}`;
    suffix += 1;
  }

  const school = {
    SchoolID: schoolId,
    Name: name,
    City: city,
    State: state,
  };

  if (mascot) school.Mascot = mascot;

  schools.push(school);
  schoolIndex.ids.add(schoolId);
  schoolIndex.byKey.set(key, school);

  return school;
}

function dedupeSchools(schools) {
  const seen = new Set();
  return schools.filter((school) => {
    const key = normalizeSchoolKey(school);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseSchedule(short, seasonId, schools, schoolIndex) {
  const data = parseNextData(readArchiveFile(short, "schedule"));
  const contests = data?.props?.pageProps?.contests || [];
  const games = [];

  for (const contest of contests) {
    const teams = Array.isArray(contest?.[0]) ? contest[0] : [];
    const teamRow = teams.find((row) => row?.[1] === TEAM_ID);
    const opponentRow = teams.find((row) => row?.[1] !== TEAM_ID);
    const gameId = gameIdFromStamp(contest?.[11]);
    const result = String(teamRow?.[5] || "").toUpperCase();

    if (contest?.[3]) continue;
    if (!teamRow || !opponentRow || !gameId) continue;
    if (!["W", "L", "T"].includes(result)) continue;
    if (toNumber(teamRow[6]) === null || toNumber(opponentRow[6]) === null) continue;

    const opponentSchool = getOrCreateSchool(opponentRow, schools, schoolIndex);

    games.push({
      GameID: gameId,
      OpponentID: opponentSchool.SchoolID,
      Opponent: opponentSchool.Name,
      LocationType: locationTypeFromCode(teamRow[11]),
      GameType: gameTypeFromCode(teamRow[12], gameId),
      Result: result,
      TeamScore: toNumber(teamRow[6]),
      OpponentScore: toNumber(opponentRow[6]),
      Season: seasonId,
      IsComplete: "Yes",
    });
  }

  return games.sort((a, b) => Number(a.GameID) - Number(b.GameID));
}

function parseRoster(short) {
  const data = parseNextData(readArchiveFile(short, "roster"));
  const rows = data?.props?.pageProps?.athleteData || [];
  const roster = new Map();

  for (const row of rows) {
    if (!row?.[4] || row[15] === false || row[17] === true) continue;

    const positions = [row[12], row[13], row[14]].filter(Boolean).map(cleanName);
    const firstName = cleanName(row[5]);
    const lastName = cleanName(row[6]);
    if (!firstName || !lastName) continue;

    roster.set(row[4], {
      athleteId: row[4],
      firstName,
      lastName,
      fullName: cleanName(`${firstName} ${lastName}`),
      grade: toNumber(row[7]),
      jersey: toJersey(row[8]),
      positions,
    });
  }

  return roster;
}

function parsePrintTotals(short) {
  const html = readArchiveFile(short, "print");
  const tables = [...html.matchAll(/<table[\s\S]*?<\/table>/gi)].map((match) => match[0]);
  const totals = new Map();

  for (const table of tables) {
    const thead = table.match(/<thead[\s\S]*?<\/thead>/i)?.[0] || "";
    const headers = [...thead.matchAll(/<th\b[\s\S]*?<\/th>/gi)].map((match) =>
      stripTags(match[0])
    );
    if (!headers.length) continue;

    const tbody = table.match(/<tbody[\s\S]*?<\/tbody>/i)?.[0] || table;
    const rows = [...tbody.matchAll(/<tr\b[\s\S]*?<\/tr>/gi)].map((match) => match[0]);

    for (const row of rows) {
      if (/Season Totals/i.test(row)) continue;

      const athleteId = row.match(/athleteid=([a-f0-9-]+)/i)?.[1];
      const fullName = decodeHtml(row.match(/title="([^"]+)"/i)?.[1] || "");
      const cells = [...row.matchAll(/<t[dh]\b[\s\S]*?<\/t[dh]>/gi)].map((match) =>
        stripTags(match[0])
      );

      if (!athleteId || cells.length < 2) continue;

      if (!totals.has(athleteId)) {
        totals.set(athleteId, {
          athleteId,
          fullName: cleanName(fullName),
          jersey: null,
          totals: {},
        });
      }

      const entry = totals.get(athleteId);

      for (let index = 0; index < Math.min(headers.length, cells.length); index += 1) {
        const header = headers[index];
        const value = cells[index];

        if (header === "#") {
          entry.jersey = entry.jersey ?? toJersey(value);
          continue;
        }

        const field = PRINT_HEADER_MAP[header];
        if (!field) continue;

        const number = toNumber(value);
        if (number === null) continue;

        if (field === "GamesPlayed") {
          entry.gamesPlayed = number;
        } else {
          entry.totals[field] = number;
        }
      }
    }
  }

  return totals;
}

function splitFullName(fullName) {
  const parts = cleanName(fullName).split(" ").filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function inferGradYear(seasonId, grade) {
  const gradeNumber = Number(grade);
  if (!Number.isFinite(gradeNumber)) return null;
  return seasonId + 1 + (12 - gradeNumber);
}

function buildPlayerLookup(players) {
  const byName = new Map();

  for (const player of players) {
    const name = cleanName(`${player.FirstName || ""} ${player.LastName || ""}`);
    const key = normalizeName(name);
    if (!key) continue;
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(player);
  }

  return byName;
}

function pickExistingPlayer(matches, gradYear) {
  if (!matches?.length) return null;
  if (gradYear) {
    const gradMatch = matches.find((player) => Number(player.GradYear) === Number(gradYear));
    if (gradMatch) return gradMatch;
  }

  const boysMatch = matches.find((player) => player.Gender !== "Girls");
  return boysMatch || matches[0];
}

function playerForEntry(entry, seasonId, players, playerLookup, nextPlayerIdRef) {
  entry.fullName = canonicalPlayerName(entry.fullName);
  const gradYear = inferGradYear(seasonId, entry.grade);
  const key = normalizeName(entry.fullName);
  const existing = pickExistingPlayer(playerLookup.get(key), gradYear);

  if (existing) {
    if (existing.GradYear == null && gradYear) existing.GradYear = gradYear;
    if (!existing.Gender) existing.Gender = "Boys";
    const { firstName, lastName } = splitFullName(entry.fullName);
    if (normalizeName(`${existing.FirstName} ${existing.LastName}`) === key) {
      existing.FirstName = firstName || existing.FirstName;
      existing.LastName = lastName || existing.LastName;
    }
    return existing;
  }

  const { firstName, lastName } = splitFullName(entry.fullName);
  const player = {
    PlayerID: nextPlayerIdRef.value,
    FirstName: firstName,
    LastName: lastName,
    GradYear: gradYear,
    Gender: "Boys",
  };

  nextPlayerIdRef.value += 1;
  players.push(player);

  if (!playerLookup.has(key)) playerLookup.set(key, []);
  playerLookup.get(key).push(player);

  return player;
}

function mergedRosterEntries(short, seasonId, players, playerLookup, nextPlayerIdRef) {
  const roster = parseRoster(short);
  const totals = parsePrintTotals(short);
  const entries = new Map();

  for (const [athleteId, rosterEntry] of roster.entries()) {
    entries.set(athleteId, { ...rosterEntry });
  }

  for (const [athleteId, totalEntry] of totals.entries()) {
    if (entries.has(athleteId)) {
      const entry = entries.get(athleteId);
      entry.jersey = entry.jersey ?? totalEntry.jersey;
      entry.fullName = entry.fullName || totalEntry.fullName;
    } else {
      const { firstName, lastName } = splitFullName(totalEntry.fullName);
      entries.set(athleteId, {
        athleteId,
        firstName,
        lastName,
        fullName: totalEntry.fullName,
        grade: null,
        jersey: totalEntry.jersey,
        positions: [],
      });
    }
  }

  const playerIdByAthleteId = new Map();
  const seasonRosterPlayers = [];

  for (const entry of entries.values()) {
    if (!entry.fullName) continue;

    const player = playerForEntry(entry, seasonId, players, playerLookup, nextPlayerIdRef);
    const totalEntry = totals.get(entry.athleteId);
    playerIdByAthleteId.set(entry.athleteId, Number(player.PlayerID));

    const rosterPlayer = {
      PlayerID: Number(player.PlayerID),
      JerseyNumber: entry.jersey ?? totalEntry?.jersey ?? null,
    };

    if (entry.grade !== null) rosterPlayer.Grade = entry.grade;
    if (entry.positions?.length) rosterPlayer.Positions = entry.positions;
    if (totalEntry?.gamesPlayed !== undefined) rosterPlayer.GamesPlayed = totalEntry.gamesPlayed;
    if (totalEntry && Object.keys(totalEntry.totals).length) {
      rosterPlayer.SeasonTotals = totalEntry.totals;
    }

    seasonRosterPlayers.push(rosterPlayer);
  }

  seasonRosterPlayers.sort((a, b) => {
    const jerseyA = a.JerseyNumber == null ? 999 : Number(a.JerseyNumber);
    const jerseyB = b.JerseyNumber == null ? 999 : Number(b.JerseyNumber);
    if (jerseyA !== jerseyB) return jerseyA - jerseyB;
    return Number(a.PlayerID) - Number(b.PlayerID);
  });

  return { playerIdByAthleteId, seasonRosterPlayers };
}

function blankStatRow(playerId, gameId) {
  const row = {
    StatID: Number(`${gameId}${playerId}`),
    PlayerID: Number(playerId),
    GameID: Number(gameId),
    StatComplete: "Yes",
  };

  for (const field of STAT_FIELDS) row[field] = null;
  return row;
}

function parsePlayerGameStats(short, playerIdByAthleteId, validGameIds) {
  const rows = [];
  const files = fs
    .readdirSync(ARCHIVE_DIR)
    .filter((file) => file.startsWith(`${short}-player-`) && file.endsWith(".html"));

  for (const file of files) {
    const athleteId = file.match(/player-([a-f0-9-]+)\.html$/i)?.[1];
    const playerId = playerIdByAthleteId.get(athleteId);
    if (!athleteId || !playerId) continue;

    const data = parseNextData(fs.readFileSync(path.join(ARCHIVE_DIR, file), "utf8"));
    const groups = data?.props?.pageProps?.statsCardProps?.careerGameLogs?.groups || [];
    const byGameId = new Map();

    for (const group of groups) {
      for (const subgroup of group?.subgroups || []) {
        for (const game of subgroup?.stats || []) {
          const gameId = gameIdFromStamp(game?.stamp);
          if (!validGameIds.has(gameId)) continue;

          if (!byGameId.has(gameId)) byGameId.set(gameId, blankStatRow(playerId, gameId));
          const row = byGameId.get(gameId);

          for (const stat of game?.stats || []) {
            const field = STAT_NAME_MAP[stat?.name];
            if (!field) continue;
            const value = toNumber(stat.value);
            if (value === null) continue;
            row[field] = value;
          }
        }
      }
    }

    rows.push(...byGameId.values());
  }

  return rows.sort((a, b) => Number(a.GameID) - Number(b.GameID) || Number(a.PlayerID) - Number(b.PlayerID));
}

function upsertSeasonRoster(rosters, seasonLabel, players) {
  const nextRoster = { SeasonID: seasonLabel, Players: players };
  const index = rosters.findIndex((roster) => String(roster.SeasonID) === seasonLabel);

  if (index >= 0) {
    rosters[index] = nextRoster;
  } else {
    rosters.push(nextRoster);
  }
}

function sortSeasonRosters(rosters) {
  rosters.sort((a, b) => {
    const aYear = Number(String(a.SeasonID).slice(0, 4));
    const bYear = Number(String(b.SeasonID).slice(0, 4));
    if (Number.isFinite(aYear) && Number.isFinite(bYear) && aYear !== bYear) {
      return aYear - bYear;
    }
    return String(a.SeasonID).localeCompare(String(b.SeasonID));
  });
}

function pruneUnreferencedAliasPlayers(players, rosters, playerStats) {
  const referencedPlayerIds = new Set();

  for (const roster of rosters) {
    for (const player of roster?.Players || []) {
      referencedPlayerIds.add(Number(player.PlayerID));
    }
  }

  for (const stat of playerStats) {
    referencedPlayerIds.add(Number(stat.PlayerID));
  }

  return players.filter((player) => {
    const key = normalizeName(`${player.FirstName || ""} ${player.LastName || ""}`);
    return referencedPlayerIds.has(Number(player.PlayerID)) || !PLAYER_NAME_ALIASES.has(key);
  });
}

function main() {
  const games = readJson(DATA_PATHS.games);
  const playerStats = readJson(DATA_PATHS.playerStats);
  const rosters = readJson(DATA_PATHS.rosters);
  const players = readJson(DATA_PATHS.players);
  const schools = readJson(DATA_PATHS.schools);

  const seasonIds = new Set(SEASONS.map((season) => season.seasonId));
  const schoolIndex = buildSchoolIndex(schools);
  const playerLookup = buildPlayerLookup(players);
  const nextPlayerIdRef = {
    value: Math.max(...players.map((player) => Number(player.PlayerID) || 0)) + 1,
  };

  const importedGames = [];
  const importedStats = [];
  const summary = [];

  for (const season of SEASONS) {
    const seasonGames = parseSchedule(season.short, season.seasonId, schools, schoolIndex);
    const validGameIds = new Set(seasonGames.map((game) => Number(game.GameID)));
    const { playerIdByAthleteId, seasonRosterPlayers } = mergedRosterEntries(
      season.short,
      season.seasonId,
      players,
      playerLookup,
      nextPlayerIdRef
    );
    const seasonStats = parsePlayerGameStats(season.short, playerIdByAthleteId, validGameIds);

    importedGames.push(...seasonGames);
    importedStats.push(...seasonStats);
    upsertSeasonRoster(rosters, season.label, seasonRosterPlayers);

    const pointsFromSchedule = seasonGames.reduce((sum, game) => sum + Number(game.TeamScore || 0), 0);
    const pointsFromStats = seasonStats.reduce((sum, stat) => sum + Number(stat.Points || 0), 0);

    summary.push({
      season: season.label,
      games: seasonGames.length,
      roster: seasonRosterPlayers.length,
      statRows: seasonStats.length,
      statGames: new Set(seasonStats.map((stat) => Number(stat.GameID))).size,
      pointsFromSchedule,
      pointsFromStats,
    });
  }

  const importedGameIds = new Set(importedGames.map((game) => Number(game.GameID)));
  const nextGames = games
    .filter((game) => !seasonIds.has(Number(game.Season)))
    .concat(importedGames)
    .sort((a, b) => Number(a.GameID) - Number(b.GameID));

  const nextStats = playerStats
    .filter((stat) => !importedGameIds.has(Number(stat.GameID)))
    .concat(importedStats)
    .sort((a, b) => Number(a.GameID) - Number(b.GameID) || Number(a.PlayerID) - Number(b.PlayerID));

  sortSeasonRosters(rosters);
  const nextPlayers = pruneUnreferencedAliasPlayers(players, rosters, nextStats);
  const nextSchools = dedupeSchools(schools);

  writeJson(DATA_PATHS.games, nextGames);
  writeJson(DATA_PATHS.playerStats, nextStats);
  writeJson(DATA_PATHS.rosters, rosters);
  writeJson(DATA_PATHS.players, nextPlayers);
  writeJson(DATA_PATHS.schools, nextSchools);

  console.table(summary);
  console.log(`Added/updated ${importedGames.length} games and ${importedStats.length} player-game rows.`);
  console.log(`Player count is now ${nextPlayers.length}; school count is now ${nextSchools.length}.`);
}

main();
