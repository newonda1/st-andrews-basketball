const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const ARCHIVE_DIR = process.env.MAXPREPS_ARCHIVE_DIR || "/tmp/maxpreps-girls-archive";
const DRY_RUN = process.env.DRY_RUN === "1";
const TEAM_ID = "1019c441-d956-4e70-a61c-6cbc2ba6e073";

const DATA_PATHS = {
  seasons: path.join(PROJECT_ROOT, "public/data/girls/basketball/seasons.json"),
  games: path.join(PROJECT_ROOT, "public/data/girls/basketball/games.json"),
  playerStats: path.join(
    PROJECT_ROOT,
    "public/data/girls/basketball/playergamestats.json"
  ),
  rosters: path.join(PROJECT_ROOT, "public/data/girls/basketball/seasonrosters.json"),
  players: path.join(PROJECT_ROOT, "public/data/girls/basketball/players.json"),
  schools: path.join(PROJECT_ROOT, "public/data/schools.json"),
};

const SEASONS = [
  { short: "06-07", seasonId: 2006, label: "2006-07" },
  { short: "07-08", seasonId: 2007, label: "2007-08" },
  { short: "08-09", seasonId: 2008, label: "2008-09" },
  { short: "09-10", seasonId: 2009, label: "2009-10" },
  { short: "10-11", seasonId: 2010, label: "2010-11" },
  { short: "11-12", seasonId: 2011, label: "2011-12" },
  { short: "12-13", seasonId: 2012, label: "2012-13" },
  { short: "13-14", seasonId: 2013, label: "2013-14" },
  { short: "14-15", seasonId: 2014, label: "2014-15" },
  { short: "15-16", seasonId: 2015, label: "2015-16" },
  { short: "16-17", seasonId: 2016, label: "2016-17" },
  { short: "17-18", seasonId: 2017, label: "2017-18" },
  { short: "18-19", seasonId: 2018, label: "2018-19" },
  { short: "19-20", seasonId: 2019, label: "2019-20" },
  { short: "20-21", seasonId: 2020, label: "2020-21" },
  { short: "21-22", seasonId: 2021, label: "2021-22" },
  { short: "22-23", seasonId: 2022, label: "2022-23" },
  { short: "23-24", seasonId: 2023, label: "2023-24" },
  { short: "24-25", seasonId: 2024, label: "2024-25" },
  { short: "25-26", seasonId: 2025, label: "2025-26" },
];

const NEW_SEASON_CUTOFF = 2020;

const STAT_NAME_MAP = {
  MinutesPlayed: "MinutesPlayed",
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
  OffensiveRebounds: "OffensiveRebounds",
  DefensiveRebounds: "DefensiveRebounds",
  PersonalFouls: "PersonalFouls",
  Deflections: "Deflections",
  Charges: "Charges",
};

const PRINT_HEADER_MAP = {
  GP: "GamesPlayed",
  Min: "MinutesPlayed",
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
  OReb: "OffensiveRebounds",
  DReb: "DefensiveRebounds",
  "Tot Reb": "Rebounds",
  Reb: "Rebounds",
  Ast: "Assists",
  Asst: "Assists",
  Stl: "Steals",
  Stls: "Steals",
  Blk: "Blocks",
  "Blk Shts": "Blocks",
  TO: "Turnovers",
  PF: "PersonalFouls",
  Chr: "Charges",
  Defl: "Deflections",
};

const STAT_FIELDS = [
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
];

const PLAYER_NAME_ALIASES = new Map([
  [normalizeName("Molly Fox-marrs"), "Molly Fox-Marrs"],
  [normalizeName("Molly Fox Marrs"), "Molly Fox-Marrs"],
  [normalizeName("Arianna Moshouris"), "Ariana Moshouris"],
  [normalizeName("Camille Wixom"), "Camille Wixon"],
  [normalizeName("Rececca Suh"), "Rebecca Suh"],
  [normalizeName("lizzy Thoni"), "Lizzy Thoni"],
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
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function datePartsFromStamp(stamp) {
  const match = String(stamp ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function baseGameIdFromStamp(stamp) {
  const parts = datePartsFromStamp(stamp);
  if (!parts) return null;
  return Number(
    `${parts.year}${String(parts.month).padStart(2, "0")}${String(parts.day).padStart(2, "0")}`
  );
}

function dateMsFromStamp(stamp) {
  const parts = datePartsFromStamp(stamp);
  if (!parts) return null;
  return Date.UTC(parts.year, parts.month - 1, parts.day);
}

function withDuplicateDateSuffix(baseGameId, countsByDate) {
  const count = countsByDate.get(baseGameId) || 0;
  countsByDate.set(baseGameId, count + 1);
  return count === 0 ? baseGameId : Number(`${baseGameId}.${count}`);
}

function locationTypeFromCode(code) {
  if (Number(code) === 0) return "Home";
  if (Number(code) === 1) return "Away";
  if (Number(code) === 2) return "Neutral";
  return "Unknown";
}

function gameTypeFromCode(code, gameId) {
  const typeCode = Number(code);
  const monthDay = Number(String(Math.trunc(Number(gameId))).slice(4));

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

function recapTitleForGame(game) {
  const verb =
    game.Result === "W" ? "defeats" : game.Result === "L" ? "falls to" : "ties";
  return `St. Andrew's ${verb} ${game.Opponent}, ${game.TeamScore}-${game.OpponentScore}`;
}

function parseSchedule(short, seasonId, schools, schoolIndex) {
  const data = parseNextData(readArchiveFile(short, "schedule"));
  const contests = data?.props?.pageProps?.contests || [];
  const games = [];
  const countsByDate = new Map();

  for (const contest of contests) {
    const teams = Array.isArray(contest?.[0]) ? contest[0] : [];
    const teamRow = teams.find((row) => row?.[1] === TEAM_ID);
    const opponentRow = teams.find((row) => row?.[1] !== TEAM_ID);
    const baseGameId = baseGameIdFromStamp(contest?.[11]);
    const result = String(teamRow?.[5] || "").toUpperCase();

    if (contest?.[3]) continue;
    if (!teamRow || !opponentRow || !baseGameId) continue;
    if (!["W", "L", "T"].includes(result)) continue;
    if (toNumber(teamRow[6]) === null || toNumber(opponentRow[6]) === null) continue;

    const gameId = withDuplicateDateSuffix(baseGameId, countsByDate);
    const opponentSchool = getOrCreateSchool(opponentRow, schools, schoolIndex);
    const game = {
      GameID: gameId,
      Date: dateMsFromStamp(contest?.[11]),
      OpponentID: opponentSchool.SchoolID,
      Opponent: opponentSchool.Name,
      LocationType: locationTypeFromCode(teamRow[11]),
      GameType: gameTypeFromCode(teamRow[12], gameId),
      Result: result,
      TeamScore: toNumber(teamRow[6]),
      OpponentScore: toNumber(opponentRow[6]),
      Season: seasonId,
      IsComplete: "Yes",
      Recap: "Recap coming soon.",
    };

    game.ResultMargin = Number(game.TeamScore) - Number(game.OpponentScore);
    game.RecapTitle = recapTitleForGame(game);
    games.push(game);
  }

  return games.sort((a, b) => Number(a.Date ?? a.GameID) - Number(b.Date ?? b.GameID));
}

function parseRoster(short) {
  const data = parseNextData(readArchiveFile(short, "roster"));
  const rows = data?.props?.pageProps?.athleteData || [];
  const activeRows = rows.filter((row) => row?.[4] && row[15] !== false && row[17] !== true);
  const rowsToUse = activeRows.length ? activeRows : rows.filter((row) => row?.[4]);
  const roster = new Map();

  for (const row of rowsToUse) {
    const positions = [row[12], row[13], row[14]].filter(Boolean).map(cleanName);
    const firstName = cleanName(row[5]);
    const lastName = cleanName(row[6]);
    if (!firstName || !lastName) continue;

    const athleteId = row[4];
    const dedupeKey = `${normalizeName(`${firstName} ${lastName}`)}|${toJersey(row[8]) ?? ""}`;
    if ([...roster.values()].some((entry) => entry.dedupeKey === dedupeKey)) continue;

    roster.set(athleteId, {
      athleteId,
      firstName,
      lastName,
      fullName: cleanName(`${firstName} ${lastName}`),
      grade: toNumber(row[7]),
      jersey: toJersey(row[8]),
      positions,
      dedupeKey,
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
      const fullName = decodeHtml(
        row.match(/<a\b[^>]*athleteid=[^>]*title="([^"]+)"/i)?.[1] || ""
      );
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

        if (header === "Athlete Name") continue;

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
  if (grade === null || grade === undefined || grade === "") return null;
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

  return (
    matches.find((player) => player.GradYear === null || player.GradYear === undefined) ||
    matches[0]
  );
}

function nextPlayerIdForSeason(seasonId, usedPlayerIds, nextBySeason) {
  if (!nextBySeason.has(seasonId)) nextBySeason.set(seasonId, seasonId * 100 + 1);
  let nextId = nextBySeason.get(seasonId);

  while (usedPlayerIds.has(nextId)) nextId += 1;

  nextBySeason.set(seasonId, nextId + 1);
  usedPlayerIds.add(nextId);
  return nextId;
}

function playerForEntry(entry, seasonId, players, playerLookup, idState) {
  entry.fullName = canonicalPlayerName(entry.fullName);
  const gradYear = inferGradYear(seasonId, entry.grade);
  const key = normalizeName(entry.fullName);
  const existing = pickExistingPlayer(playerLookup.get(key), gradYear);

  if (existing) {
    if (existing.GradYear == null && gradYear) existing.GradYear = gradYear;
    if (Number(existing.GradYear) > 2030 && !gradYear) existing.GradYear = null;
    if (existing.JerseyNumber == null && entry.jersey != null) {
      existing.JerseyNumber = entry.jersey;
    }
    const { firstName, lastName } = splitFullName(entry.fullName);
    if (normalizeName(`${existing.FirstName} ${existing.LastName}`) === key) {
      existing.FirstName = firstName || existing.FirstName;
      existing.LastName = lastName || existing.LastName;
    }
    return existing;
  }

  const { firstName, lastName } = splitFullName(entry.fullName);
  const player = {
    PlayerID: nextPlayerIdForSeason(seasonId, idState.usedPlayerIds, idState.nextBySeason),
    FirstName: firstName,
    LastName: lastName,
    GradYear: gradYear,
  };

  if (entry.jersey != null) player.JerseyNumber = entry.jersey;

  players.push(player);

  if (!playerLookup.has(key)) playerLookup.set(key, []);
  playerLookup.get(key).push(player);

  return player;
}

function mergedRosterEntries(short, seasonId, players, playerLookup, idState) {
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

    const player = playerForEntry(entry, seasonId, players, playerLookup, idState);
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
    if (Number.isFinite(jerseyA) && Number.isFinite(jerseyB) && jerseyA !== jerseyB) {
      return jerseyA - jerseyB;
    }
    return Number(a.PlayerID) - Number(b.PlayerID);
  });

  return { playerIdByAthleteId, seasonRosterPlayers };
}

function blankStatRow(playerId, gameId) {
  const row = {
    StatID: Number(`${String(gameId).replace(".", "")}${playerId}`),
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
          const gameId = baseGameIdFromStamp(game?.stamp);
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

  return rows.sort(
    (a, b) => Number(a.GameID) - Number(b.GameID) || Number(a.PlayerID) - Number(b.PlayerID)
  );
}

function upsertSeasonRoster(rosters, seasonLabel, players, replace) {
  const index = rosters.findIndex((roster) => String(roster.SeasonID) === seasonLabel);

  if (index < 0) {
    rosters.push({ SeasonID: seasonLabel, Players: players });
    return;
  }

  if (replace) {
    rosters[index] = { SeasonID: seasonLabel, Players: players };
    return;
  }

  const existingPlayers = Array.isArray(rosters[index].Players) ? rosters[index].Players : [];
  const byPlayerId = new Map(
    existingPlayers.map((player) => [Number(player.PlayerID), { ...player }])
  );

  for (const imported of players) {
    const playerId = Number(imported.PlayerID);
    if (!byPlayerId.has(playerId)) {
      byPlayerId.set(playerId, imported);
      continue;
    }

    const existing = byPlayerId.get(playerId);
    byPlayerId.set(playerId, {
      ...imported,
      ...existing,
      JerseyNumber: existing.JerseyNumber ?? imported.JerseyNumber ?? null,
      Grade: existing.Grade ?? imported.Grade,
      Positions: existing.Positions ?? imported.Positions,
      GamesPlayed: existing.GamesPlayed ?? imported.GamesPlayed,
      SeasonTotals: existing.SeasonTotals ?? imported.SeasonTotals,
    });
  }

  rosters[index] = {
    ...rosters[index],
    Players: [...byPlayerId.values()].sort((a, b) => {
      const jerseyA = a.JerseyNumber == null ? 999 : Number(a.JerseyNumber);
      const jerseyB = b.JerseyNumber == null ? 999 : Number(b.JerseyNumber);
      if (Number.isFinite(jerseyA) && Number.isFinite(jerseyB) && jerseyA !== jerseyB) {
        return jerseyA - jerseyB;
      }
      return Number(a.PlayerID) - Number(b.PlayerID);
    }),
  };
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

function upsertSeasons(seasons) {
  const bySeasonId = new Map(seasons.map((season) => [Number(season.SeasonID), season]));

  for (const season of SEASONS) {
    if (bySeasonId.has(season.seasonId)) continue;
    seasons.push({
      SeasonID: season.seasonId,
      YearStart: season.seasonId,
      YearEnd: season.seasonId + 1,
      HeadCoach: null,
      RegionSeed: null,
      RegionFinish: null,
      StateSeed: null,
      StateFinish: null,
    });
  }

  seasons.sort((a, b) => Number(a.SeasonID) - Number(b.SeasonID));
}

function mergeGames(existingGames, importedGames, importedSeasonIds) {
  const historicalSeasonIds = new Set(
    [...importedSeasonIds].filter((seasonId) => seasonId < NEW_SEASON_CUTOFF)
  );
  const nextGames = existingGames.filter(
    (game) => !historicalSeasonIds.has(Number(game.Season))
  );
  const existingKeys = new Set(
    nextGames.map((game) => `${Number(game.Season)}|${Number(game.GameID)}`)
  );

  for (const game of importedGames) {
    const key = `${Number(game.Season)}|${Number(game.GameID)}`;
    if (existingKeys.has(key)) continue;
    nextGames.push(game);
    existingKeys.add(key);
  }

  return nextGames.sort(
    (a, b) =>
      Number(a.Season) - Number(b.Season) ||
      Number(a.Date ?? a.GameID) - Number(b.Date ?? b.GameID) ||
      Number(a.GameID) - Number(b.GameID)
  );
}

function mergeStats(existingStats, importedStats, importedHistoricalGameIds) {
  const nextStats = existingStats.filter(
    (stat) => !importedHistoricalGameIds.has(Number(stat.GameID))
  );
  const byKey = new Map(
    nextStats.map((stat) => [`${Number(stat.GameID)}|${Number(stat.PlayerID)}`, stat])
  );

  for (const stat of importedStats) {
    const key = `${Number(stat.GameID)}|${Number(stat.PlayerID)}`;
    const existing = byKey.get(key);
    if (existing) {
      Object.assign(existing, stat);
    } else {
      nextStats.push(stat);
      byKey.set(key, stat);
    }
  }

  return nextStats.sort(
    (a, b) => Number(a.GameID) - Number(b.GameID) || Number(a.PlayerID) - Number(b.PlayerID)
  );
}

function pruneUnreferencedPlayers(players, rosters, playerStats) {
  const referencedPlayerIds = new Set();

  for (const roster of rosters) {
    for (const player of roster?.Players || []) {
      referencedPlayerIds.add(Number(player.PlayerID));
    }
  }

  for (const stat of playerStats) {
    referencedPlayerIds.add(Number(stat.PlayerID));
  }

  return players.filter((player) => referencedPlayerIds.has(Number(player.PlayerID)));
}

function main() {
  const seasons = readJson(DATA_PATHS.seasons);
  const games = readJson(DATA_PATHS.games);
  const playerStats = readJson(DATA_PATHS.playerStats);
  const rosters = readJson(DATA_PATHS.rosters);
  const players = readJson(DATA_PATHS.players);
  const schools = readJson(DATA_PATHS.schools);

  const schoolIndex = buildSchoolIndex(schools);
  const playerLookup = buildPlayerLookup(players);
  const usedPlayerIds = new Set(players.map((player) => Number(player.PlayerID)));
  const idState = { usedPlayerIds, nextBySeason: new Map() };

  const importedGames = [];
  const importedStats = [];
  const importedSeasonIds = new Set();
  const importedHistoricalGameIds = new Set();
  const summary = [];

  for (const season of SEASONS) {
    const seasonGames = parseSchedule(season.short, season.seasonId, schools, schoolIndex);
    const validBaseGameIds = new Set(
      seasonGames.map((game) => Math.trunc(Number(game.GameID)))
    );
    const { playerIdByAthleteId, seasonRosterPlayers } = mergedRosterEntries(
      season.short,
      season.seasonId,
      players,
      playerLookup,
      idState
    );
    const seasonStats = parsePlayerGameStats(
      season.short,
      playerIdByAthleteId,
      validBaseGameIds
    );

    importedGames.push(...seasonGames);
    importedStats.push(...seasonStats);
    importedSeasonIds.add(season.seasonId);

    if (season.seasonId < NEW_SEASON_CUTOFF) {
      for (const game of seasonGames) importedHistoricalGameIds.add(Number(game.GameID));
    }

    upsertSeasonRoster(
      rosters,
      season.label,
      seasonRosterPlayers,
      season.seasonId < NEW_SEASON_CUTOFF
    );

    const pointsFromSchedule = seasonGames.reduce(
      (sum, game) => sum + Number(game.TeamScore || 0),
      0
    );
    const pointsFromStats = seasonStats.reduce(
      (sum, stat) => sum + Number(stat.Points || 0),
      0
    );

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

  upsertSeasons(seasons);
  sortSeasonRosters(rosters);

  const nextGames = mergeGames(games, importedGames, importedSeasonIds);
  const nextStats = mergeStats(playerStats, importedStats, importedHistoricalGameIds);
  const nextPlayers = pruneUnreferencedPlayers(players, rosters, nextStats).sort(
    (a, b) => Number(a.PlayerID) - Number(b.PlayerID)
  );
  const nextSchools = dedupeSchools(schools);

  console.table(summary);
  console.log(`Imported source rows: ${importedGames.length} games, ${importedStats.length} stat rows.`);
  console.log(
    `Next totals: ${seasons.length} seasons, ${nextGames.length} games, ${nextStats.length} stat rows, ${nextPlayers.length} players, ${nextSchools.length} schools.`
  );

  if (DRY_RUN) {
    console.log("Dry run only; no files written.");
    return;
  }

  writeJson(DATA_PATHS.seasons, seasons);
  writeJson(DATA_PATHS.games, nextGames);
  writeJson(DATA_PATHS.playerStats, nextStats);
  writeJson(DATA_PATHS.rosters, rosters);
  writeJson(DATA_PATHS.players, nextPlayers);
  writeJson(DATA_PATHS.schools, nextSchools);
}

main();
