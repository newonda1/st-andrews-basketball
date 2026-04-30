const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { JSDOM, VirtualConsole } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "public", "data", "girls", "volleyball");
const PLAYERS_PATH = path.join(ROOT, "public", "data", "players.json");
const SCHOOLS_PATH = path.join(ROOT, "public", "data", "schools.json");
const CACHE_DIR = process.env.MAXPREPS_VOLLEYBALL_CACHE_DIR || "/tmp/maxpreps-volleyball-archive";
const DRY_RUN = process.env.DRY_RUN === "1";
const INCLUDE_CURRENT_SEASON = process.env.INCLUDE_CURRENT_SEASON === "1";
const TEAM_ID = "1019c441-d956-4e70-a61c-6cbc2ba6e073";
const TEAM_KEY = "ga-savannah-st-andrews-lions-volleyball";
const TEAM_NAME = "St. Andrew's Lions";
const TEAM_URL = "https://www.maxpreps.com/ga/savannah/st-andrews-lions/volleyball/";
const CURL_MAX_BUFFER = 80 * 1024 * 1024;

const SEASONS = [
  { code: "07-08", seasonId: 2007, label: "2007-08" },
  { code: "08-09", seasonId: 2008, label: "2008-09" },
  { code: "09-10", seasonId: 2009, label: "2009-10" },
  { code: "10-11", seasonId: 2010, label: "2010-11" },
  { code: "11-12", seasonId: 2011, label: "2011-12" },
  { code: "12-13", seasonId: 2012, label: "2012-13" },
  { code: "13-14", seasonId: 2013, label: "2013-14" },
  { code: "14-15", seasonId: 2014, label: "2014-15" },
  { code: "15-16", seasonId: 2015, label: "2015-16" },
  { code: "16-17", seasonId: 2016, label: "2016-17" },
  { code: "17-18", seasonId: 2017, label: "2017-18" },
  { code: "18-19", seasonId: 2018, label: "2018-19" },
  { code: "19-20", seasonId: 2019, label: "2019-20" },
  { code: "20-21", seasonId: 2020, label: "2020-21" },
  { code: "21-22", seasonId: 2021, label: "2021-22" },
  { code: "22-23", seasonId: 2022, label: "2022-23" },
  { code: "23-24", seasonId: 2023, label: "2023-24" },
  { code: "24-25", seasonId: 2024, label: "2024-25" },
  { code: "25-26", seasonId: 2025, label: "2025-26", current: true },
];

const STAT_FIELDS = [
  "SetsPlayed",
  "Kills",
  "KillsPerSet",
  "KillPct",
  "AttackAttempts",
  "AttackErrors",
  "HittingPct",
  "Aces",
  "AcesPerSet",
  "AcePct",
  "ServeAttempts",
  "ServeErrors",
  "ServePct",
  "ServingPoints",
  "SoloBlocks",
  "BlockAssists",
  "TotalBlocks",
  "BlocksPerSet",
  "BlockErrors",
  "Digs",
  "DigErrors",
  "DigsPerSet",
  "Assists",
  "AssistsPerSet",
  "BallHandlingAttempts",
  "BallHandlingErrors",
  "Receptions",
  "ReceptionErrors",
  "ReceptionsPerSet",
];

const COUNTING_FIELDS = new Set([
  "SetsPlayed",
  "Kills",
  "AttackAttempts",
  "AttackErrors",
  "Aces",
  "ServeAttempts",
  "ServeErrors",
  "ServingPoints",
  "SoloBlocks",
  "BlockAssists",
  "TotalBlocks",
  "BlockErrors",
  "Digs",
  "DigErrors",
  "Assists",
  "BallHandlingAttempts",
  "BallHandlingErrors",
  "Receptions",
  "ReceptionErrors",
]);

const CATEGORY_FIELDS = {
  Attacking: {
    SP: "SetsPlayed",
    K: "Kills",
    "K/S": "KillsPerSet",
    "Kill %": "KillPct",
    "Kill%": "KillPct",
    Att: "AttackAttempts",
    E: "AttackErrors",
    "Hit %": "HittingPct",
    "Hit%": "HittingPct",
    "H%": "HittingPct",
    Pct: "HittingPct",
  },
  Serving: {
    SP: "SetsPlayed",
    A: "Aces",
    "A/S": "AcesPerSet",
    "Ace %": "AcePct",
    "Ace%": "AcePct",
    SA: "ServeAttempts",
    SE: "ServeErrors",
    "Serv %": "ServePct",
    "Serv%": "ServePct",
    PTS: "ServingPoints",
  },
  Blocking: {
    SP: "SetsPlayed",
    BS: "SoloBlocks",
    BA: "BlockAssists",
    "Tot Blks": "TotalBlocks",
    TB: "TotalBlocks",
    "B/S": "BlocksPerSet",
    BE: "BlockErrors",
  },
  Digging: {
    SP: "SetsPlayed",
    D: "Digs",
    DE: "DigErrors",
    "D/S": "DigsPerSet",
  },
  "Ball Handling": {
    SP: "SetsPlayed",
    Ast: "Assists",
    AST: "Assists",
    "Ast/S": "AssistsPerSet",
    "A/S": "AssistsPerSet",
    BHA: "BallHandlingAttempts",
    BHE: "BallHandlingErrors",
  },
  "Serve Receiving": {
    SP: "SetsPlayed",
    R: "Receptions",
    RE: "ReceptionErrors",
    "R/S": "ReceptionsPerSet",
  },
};

const TEAM_CATEGORY_FIELDS = {
  Attacking: [
    "SetsPlayed",
    "Kills",
    "KillsPerSet",
    "KillPct",
    "AttackAttempts",
    "AttackErrors",
    "HittingPct",
  ],
  Serving: [
    "SetsPlayed",
    "Aces",
    "AcesPerSet",
    "AcePct",
    "ServeAttempts",
    "ServeErrors",
    "ServePct",
    "ServingPoints",
  ],
  Blocking: [
    "SetsPlayed",
    "SoloBlocks",
    "BlockAssists",
    "TotalBlocks",
    "BlocksPerSet",
    "BlockErrors",
  ],
  Digging: ["SetsPlayed", "Digs", "DigErrors", "DigsPerSet"],
  "Ball Handling": [
    "SetsPlayed",
    "Assists",
    "AssistsPerSet",
    "BallHandlingAttempts",
    "BallHandlingErrors",
  ],
  "Serve Receiving": ["SetsPlayed", "Receptions", "ReceptionErrors", "ReceptionsPerSet"],
};

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath, fallback = []) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function normalizeWhitespace(value) {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(value) {
  return normalizeWhitespace(value)
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
  return decodeHtml(
    String(value ?? "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
}

function normalizeName(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const cleaned = normalizeWhitespace(value).replace(/,/g, "");
  if (!cleaned || cleaned === "-") return null;
  const normalized = cleaned.replace(/^(-?)\./, "$10.");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function numberOrZero(value) {
  const number = toNumber(value);
  return number === null ? 0 : number;
}

function toJersey(value) {
  const text = normalizeWhitespace(value);
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : text;
}

function roundTo(value, places) {
  if (!Number.isFinite(value)) return null;
  return Number(value.toFixed(places));
}

function percentage(numerator, denominator) {
  const divisor = Number(denominator || 0);
  return divisor > 0 ? roundTo((Number(numerator || 0) / divisor) * 100, 1) : null;
}

function perSet(value, sets) {
  const setCount = Number(sets || 0);
  return setCount > 0 ? roundTo(Number(value || 0) / setCount, 1) : null;
}

function perMatch(value, matches) {
  const matchCount = Number(matches || 0);
  return matchCount > 0 ? roundTo(Number(value || 0) / matchCount, 1) : null;
}

function hittingPct(kills, errors, attempts) {
  const attemptCount = Number(attempts || 0);
  return attemptCount > 0
    ? roundTo((Number(kills || 0) - Number(errors || 0)) / attemptCount, 3)
    : null;
}

function parseRecordText(recordText) {
  const [wins = 0, losses = 0, ties = 0] = normalizeWhitespace(recordText)
    .split("-")
    .map((part) => Number(part) || 0);
  return { wins, losses, ties };
}

function gradeLabelFromGrade(grade) {
  if (Number(grade) === 9) return "Fr.";
  if (Number(grade) === 10) return "So.";
  if (Number(grade) === 11) return "Jr.";
  if (Number(grade) === 12) return "Sr.";
  return "";
}

function inferGradYear(seasonId, grade) {
  const gradeNumber = Number(grade);
  if (!Number.isFinite(gradeNumber)) return null;
  return Number(seasonId) + 1 + (12 - gradeNumber);
}

function careerIdFromUrl(url) {
  const match = String(url || "").match(/[?&]careerid=([^&#]+)/i);
  return match ? decodeURIComponent(match[1]) : "";
}

function athleteIdFromUrl(url) {
  const match = String(url || "").match(/[?&]athleteid=([^&#]+)/i);
  return match ? decodeURIComponent(match[1]) : "";
}

function absolutizeMaxPrepsUrl(url) {
  const text = normalizeWhitespace(url);
  if (!text) return "";
  if (/^https?:\/\//i.test(text)) return text;
  return `https://www.maxpreps.com${text.startsWith("/") ? "" : "/"}${text}`;
}

function splitFullName(fullName) {
  const parts = normalizeWhitespace(fullName).split(" ").filter(Boolean);
  if (parts.length <= 1) return { firstName: parts[0] || "", lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function playerDisplayName(player) {
  return normalizeWhitespace(`${player?.FirstName || ""} ${player?.LastName || ""}`);
}

function shortPlayerName(player) {
  const first = normalizeWhitespace(player?.FirstName);
  const last = normalizeWhitespace(player?.LastName);
  if (!first) return last;
  return `${first[0]}. ${last}`.trim();
}

function fetchToCache(url, cacheName) {
  ensureDir(CACHE_DIR);
  const filePath = path.join(CACHE_DIR, cacheName);
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
    return fs.readFileSync(filePath, "utf8");
  }

  execFileSync("curl", ["-sL", "--compressed", "-o", filePath, url], {
    encoding: "utf8",
    maxBuffer: CURL_MAX_BUFFER,
  });

  return fs.readFileSync(filePath, "utf8");
}

function parseNextData(html, label) {
  const match = String(html).match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
  );
  if (!match) {
    throw new Error(`Could not locate __NEXT_DATA__ for ${label}.`);
  }
  return JSON.parse(match[1]);
}

function makeDom(html) {
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("error", () => {});
  return new JSDOM(html, { virtualConsole }).window.document;
}

function scheduleUrlForSeason(season) {
  return `${TEAM_URL}${season.code}/schedule/`;
}

function rosterUrlForSeason(season) {
  return `${TEAM_URL}${season.code}/roster/`;
}

function normalizeSchoolKey(school) {
  return [school?.Name || school?.name, school?.City || school?.city, school?.State || school?.state]
    .map((part) => normalizeName(part))
    .join("|");
}

function buildSchoolIndex(schools) {
  const byKey = new Map();
  const ids = new Set();
  for (const school of schools) {
    ids.add(String(school.SchoolID));
    const key = normalizeSchoolKey(school);
    if (key && !byKey.has(key)) byKey.set(key, school);
  }
  return { byKey, ids };
}

function getOrCreateSchool(teamRow, schools, schoolIndex) {
  const name = normalizeWhitespace(teamRow?.[14]);
  const city = normalizeWhitespace(teamRow?.[15]);
  const state = normalizeWhitespace(teamRow?.[16]);
  const mascot = normalizeWhitespace(teamRow?.[21]);
  const key = normalizeSchoolKey({ Name: name, City: city, State: state });

  const existing = schoolIndex.byKey.get(key);
  if (existing) return existing;

  const base = slugify([state, name, city].filter(Boolean).join("-")) || slugify(name);
  let schoolId = base;
  let suffix = 2;
  while (schoolIndex.ids.has(schoolId)) {
    schoolId = `${base}-${suffix}`;
    suffix += 1;
  }

  const school = { SchoolID: schoolId, Name: name, City: city, State: state };
  if (mascot) school.Mascot = mascot;
  schools.push(school);
  schoolIndex.ids.add(schoolId);
  schoolIndex.byKey.set(key, school);
  return school;
}

function buildExistingRosterLookups(rosters) {
  const byCareerId = new Map();
  const byAthleteId = new Map();

  for (const roster of rosters) {
    for (const player of roster?.Players || []) {
      const careerId = careerIdFromUrl(player.CanonicalUrl);
      if (careerId) byCareerId.set(careerId, Number(player.PlayerID));
      if (player.MaxPrepsAthleteID) {
        byAthleteId.set(String(player.MaxPrepsAthleteID), Number(player.PlayerID));
      }
    }
  }

  return { byCareerId, byAthleteId };
}

function buildPlayerLookup(players) {
  const byNameGrad = new Map();
  const byName = new Map();

  for (const player of players) {
    const name = normalizeName(playerDisplayName(player));
    if (!name) continue;
    const grad = player.GradYear == null ? "" : String(player.GradYear);
    const nameGradKey = `${name}|${grad}|${player.Gender || ""}`;
    if (!byNameGrad.has(nameGradKey)) byNameGrad.set(nameGradKey, []);
    byNameGrad.get(nameGradKey).push(player);
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name).push(player);
  }

  return { byNameGrad, byName };
}

function nextPlayerIdFactory(players) {
  const used = new Set(players.map((player) => Number(player.PlayerID)));
  let next = Math.max(...used, 2026222) + 1;
  return () => {
    while (used.has(next)) next += 1;
    used.add(next);
    return next++;
  };
}

function findExistingPlayer(entry, playersById, playerLookup, rosterLookups) {
  const careerId = careerIdFromUrl(entry.canonicalUrl);
  if (careerId && rosterLookups.byCareerId.has(careerId)) {
    const player = playersById.get(rosterLookups.byCareerId.get(careerId));
    if (player) return player;
  }

  if (entry.athleteId && rosterLookups.byAthleteId.has(entry.athleteId)) {
    const player = playersById.get(rosterLookups.byAthleteId.get(entry.athleteId));
    if (player) return player;
  }

  const name = normalizeName(entry.fullName);
  const grad = entry.gradYear == null ? "" : String(entry.gradYear);
  const exact = playerLookup.byNameGrad.get(`${name}|${grad}|Girls`);
  if (exact?.length) return exact[0];

  const sameNameGirls = (playerLookup.byName.get(name) || []).filter(
    (player) => player.Gender === "Girls"
  );
  if (sameNameGirls.length === 1) return sameNameGirls[0];
  if (sameNameGirls.length && entry.gradYear) {
    return (
      sameNameGirls.find((player) => Number(player.GradYear) === Number(entry.gradYear)) || null
    );
  }

  return null;
}

function upsertPlayer(entry, players, playersById, playerLookup, rosterLookups, nextPlayerId) {
  let player = findExistingPlayer(entry, playersById, playerLookup, rosterLookups);

  if (!player) {
    player = {
      PlayerID: nextPlayerId(),
      FirstName: entry.firstName || splitFullName(entry.fullName).firstName,
      LastName: entry.lastName || splitFullName(entry.fullName).lastName,
      GradYear: entry.gradYear,
      Gender: "Girls",
    };
    players.push(player);
    playersById.set(Number(player.PlayerID), player);
  } else {
    if (player.Gender == null) player.Gender = "Girls";
    if (player.GradYear == null && entry.gradYear) player.GradYear = entry.gradYear;
    if (!player.FirstName && entry.firstName) player.FirstName = entry.firstName;
    if (!player.LastName && entry.lastName) player.LastName = entry.lastName;
  }

  const name = normalizeName(playerDisplayName(player));
  const grad = player.GradYear == null ? "" : String(player.GradYear);
  const nameGradKey = `${name}|${grad}|${player.Gender || ""}`;
  if (name && !playerLookup.byName.has(name)) playerLookup.byName.set(name, []);
  if (name && !playerLookup.byName.get(name).some((item) => item.PlayerID === player.PlayerID)) {
    playerLookup.byName.get(name).push(player);
  }
  if (!playerLookup.byNameGrad.has(nameGradKey)) playerLookup.byNameGrad.set(nameGradKey, []);
  if (
    !playerLookup.byNameGrad
      .get(nameGradKey)
      .some((item) => Number(item.PlayerID) === Number(player.PlayerID))
  ) {
    playerLookup.byNameGrad.get(nameGradKey).push(player);
  }

  const careerId = careerIdFromUrl(entry.canonicalUrl);
  if (careerId) rosterLookups.byCareerId.set(careerId, Number(player.PlayerID));
  if (entry.athleteId) rosterLookups.byAthleteId.set(entry.athleteId, Number(player.PlayerID));

  return player;
}

function parseRoster(season, players, playersById, playerLookup, rosterLookups, nextPlayerId) {
  const html = fetchToCache(rosterUrlForSeason(season), `${season.code}-roster.html`);
  const data = parseNextData(html, `${season.label} roster`);
  const rows = data?.props?.pageProps?.athleteData || [];
  const athleteToPlayerId = new Map();
  const rosterEntries = [];

  for (const row of rows) {
    const athleteId = normalizeWhitespace(row?.[4]);
    const firstName = normalizeWhitespace(row?.[5]);
    const lastName = normalizeWhitespace(row?.[6]);
    const fullName = normalizeWhitespace(row?.[33] || `${firstName} ${lastName}`);
    if (!athleteId || !fullName) continue;

    const grade = toNumber(row?.[7]);
    const canonicalUrl = normalizeWhitespace(row?.[31]);
    const positions = [row?.[12], row?.[13], row?.[14]]
      .map(normalizeWhitespace)
      .filter(Boolean);
    const entry = {
      athleteId,
      firstName,
      lastName,
      fullName,
      grade,
      gradeLabel: normalizeWhitespace(row?.[36]) || gradeLabelFromGrade(grade),
      gradYear: inferGradYear(season.seasonId, grade),
      jersey: toJersey(row?.[8]),
      positions,
      canonicalUrl,
    };

    const player = upsertPlayer(
      entry,
      players,
      playersById,
      playerLookup,
      rosterLookups,
      nextPlayerId
    );
    athleteToPlayerId.set(athleteId, Number(player.PlayerID));

    const rosterEntry = {
      PlayerID: Number(player.PlayerID),
      JerseyNumber: entry.jersey,
      Grade: entry.grade,
      GradeLabel: entry.gradeLabel,
      Positions: entry.positions,
      MaxPrepsAthleteID: athleteId,
      CanonicalUrl: canonicalUrl,
    };

    if (!rosterEntry.Positions.length) delete rosterEntry.Positions;
    if (!rosterEntry.GradeLabel) delete rosterEntry.GradeLabel;
    if (!rosterEntry.CanonicalUrl) delete rosterEntry.CanonicalUrl;
    rosterEntries.push(rosterEntry);
  }

  rosterEntries.sort((a, b) => {
    const jerseyA = a.JerseyNumber == null ? 999 : Number(a.JerseyNumber);
    const jerseyB = b.JerseyNumber == null ? 999 : Number(b.JerseyNumber);
    if (Number.isFinite(jerseyA) && Number.isFinite(jerseyB) && jerseyA !== jerseyB) {
      return jerseyA - jerseyB;
    }
    return Number(a.PlayerID) - Number(b.PlayerID);
  });

  return { athleteToPlayerId, rosterEntries };
}

function gameDateFromStamp(stamp) {
  const match = String(stamp || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : "";
}

function timeFromStamp(stamp) {
  const match = String(stamp || "").match(/T(\d{2}):(\d{2})/);
  if (!match) return "";
  let hour = Number(match[1]);
  const minute = match[2];
  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${suffix}`;
}

function baseGameId(date) {
  return String(date || "").replace(/-/g, "");
}

function gameTypeFromContest(contest, teamRow) {
  const code = Number(teamRow?.[12]);
  const tournamentName = normalizeWhitespace(contest?.[5] || contest?.[27] || "");
  if (code === 0) return "Region";
  if (code === 2 || code === 5) return "Tournament";
  if (code === 4) return /region/i.test(tournamentName) ? "Region Tournament" : "State Tournament";
  if (/playoff|state/i.test(tournamentName)) return "State Tournament";
  if (/region/i.test(tournamentName)) return "Region Tournament";
  return "Regular Season";
}

function locationTypeFromCode(code) {
  if (Number(code) === 0) return "Home";
  if (Number(code) === 1) return "Away";
  if (Number(code) === 2) return "Neutral";
  return "Unknown";
}

function scheduleGameRows(season, scheduleData, schools, schoolIndex) {
  const contests = scheduleData?.props?.pageProps?.contests || [];
  const countsByDate = new Map();
  const games = [];

  const sorted = contests
    .slice()
    .sort((a, b) => String(a?.[11] || "").localeCompare(String(b?.[11] || "")));

  for (const contest of sorted) {
    const teams = Array.isArray(contest?.[0]) ? contest[0] : [];
    const teamRow = teams.find((row) => row?.[1] === TEAM_ID);
    const opponentRow = teams.find((row) => row?.[1] !== TEAM_ID);
    const date = gameDateFromStamp(contest?.[11]);
    const result = normalizeWhitespace(teamRow?.[5]).toUpperCase();
    const teamScore = toNumber(teamRow?.[6]);
    const opponentScore = toNumber(opponentRow?.[6]);
    const gameUrl = absolutizeMaxPrepsUrl(contest?.[18]);

    if (!teamRow || !opponentRow || !date || !["W", "L", "T"].includes(result)) continue;
    if (teamScore === null || opponentScore === null) continue;

    const baseId = baseGameId(date);
    const dateCount = countsByDate.get(baseId) || 0;
    countsByDate.set(baseId, dateCount + 1);
    const gameId = dateCount === 0 ? baseId : `${baseId}-${dateCount}`;
    const opponentSchool = getOrCreateSchool(opponentRow, schools, schoolIndex);
    const locationType = locationTypeFromCode(teamRow[11]);
    const venue =
      locationType === "Home"
        ? "St. Andrew's High School"
        : locationType === "Away"
          ? opponentSchool.Name
          : "";

    games.push({
      GameID: gameId,
      Season: season.seasonId,
      SeasonID: season.seasonId,
      DisplaySeason: String(season.seasonId),
      SourceSeasonLabel: season.label,
      Date: date,
      Time: timeFromStamp(contest?.[11]),
      TeamID: TEAM_KEY,
      Team: TEAM_NAME,
      OpponentID: opponentSchool.SchoolID,
      Opponent: opponentSchool.Name,
      OpponentLocation: [opponentSchool.City, opponentSchool.State].filter(Boolean).join(", "),
      OpponentUrl: absolutizeMaxPrepsUrl(opponentRow?.[13]),
      GameUrl: gameUrl,
      LocationType: locationType,
      Venue: venue,
      GameType: gameTypeFromContest(contest, teamRow),
      Result: result,
      TeamScore: teamScore,
      OpponentScore: opponentScore,
      Notes: normalizeWhitespace(contest?.[5]) || "",
      IsComplete: "Yes",
      SetScores: [],
    });
  }

  return games;
}

function tableTexts(row) {
  return [...row.querySelectorAll("th,td")].map((cell) =>
    normalizeWhitespace(cell.textContent)
  );
}

function parseSetScores(doc) {
  const table = doc.querySelector(".contest-header__boxscore table");
  if (!table) return [];

  const headers = [...table.querySelectorAll("thead th")].map((header) => ({
    text: normalizeWhitespace(header.textContent),
    title: normalizeWhitespace(header.getAttribute("title")),
  }));
  const setIndexes = headers
    .map((header, index) => ({ header, index }))
    .filter(({ header }) => /^S\d+$/i.test(header.text) || /^Set\s+\d+$/i.test(header.title));

  const rows = [...table.querySelectorAll("tbody tr")];
  const teamRow = rows.find((row) => /St\.?\s*Andrew/i.test(row.textContent));
  const opponentRow = rows.find((row) => row !== teamRow);
  if (!teamRow || !opponentRow) return [];

  const teamCells = tableTexts(teamRow);
  const opponentCells = tableTexts(opponentRow);

  return setIndexes
    .map(({ index }, setIndex) => {
      const team = toNumber(teamCells[index]);
      const opponent = toNumber(opponentCells[index]);
      if (team === null && opponent === null) return null;
      return { Set: setIndex + 1, Team: team || 0, Opponent: opponent || 0 };
    })
    .filter(Boolean);
}

function cleanAthleteName(value) {
  return normalizeWhitespace(value)
    .replace(/\((Fr|So|Jr|Sr|Freshman|Sophomore|Junior|Senior)\.?[^)]*\)/gi, "")
    .trim();
}

function ensureStatRow(statRowsByAthlete, athleteId, seed) {
  if (!statRowsByAthlete.has(athleteId)) {
    const row = {
      GameID: seed.gameId,
      Season: seed.seasonId,
      PlayerID: seed.playerId,
      JerseyNumber: seed.jersey,
      PlayerName: seed.playerName,
    };
    for (const field of STAT_FIELDS) row[field] = null;
    statRowsByAthlete.set(athleteId, row);
  }
  return statRowsByAthlete.get(athleteId);
}

function parseStatTables(
  doc,
  game,
  season,
  athleteToPlayerId,
  players,
  playersById,
  playerLookup,
  rosterLookups,
  nextPlayerId
) {
  const statRowsByAthlete = new Map();

  for (const section of doc.querySelectorAll(".team-list__team")) {
    const school = normalizeWhitespace(section.querySelector(".school")?.textContent);
    const category = normalizeWhitespace(section.querySelector("h4")?.textContent);
    const fieldMap = CATEGORY_FIELDS[category];
    if (!fieldMap || !/St\.?\s*Andrew/i.test(school)) continue;

    const headers = [...section.querySelectorAll("thead th")].map((header) =>
      normalizeWhitespace(header.textContent)
    );
    const rows = [...section.querySelectorAll("tbody tr")];

    for (const tableRow of rows) {
      const cells = [...tableRow.querySelectorAll("td,th")];
      if (cells.length < 2) continue;

      const jersey = toJersey(cells[0]?.textContent);
      const nameCell = cells[1];
      const fullName = cleanAthleteName(nameCell?.textContent);
      if (!fullName || /totals?/i.test(fullName)) continue;

      const link = nameCell.querySelector("a[href*='athleteid']");
      const athleteId =
        athleteIdFromUrl(link?.getAttribute("href")) || `${season.seasonId}-${normalizeName(fullName)}`;
      let playerId = athleteToPlayerId.get(athleteId);

      if (!playerId) {
        const gradeTitle = normalizeWhitespace(nameCell.querySelector("abbr")?.getAttribute("title"));
        const gradeText = normalizeWhitespace(nameCell.querySelector("abbr")?.textContent);
        const grade =
          /freshman|fr/i.test(gradeTitle || gradeText)
            ? 9
            : /sophomore|so/i.test(gradeTitle || gradeText)
              ? 10
              : /junior|jr/i.test(gradeTitle || gradeText)
                ? 11
                : /senior|sr/i.test(gradeTitle || gradeText)
                  ? 12
                  : null;
        const nameParts = splitFullName(fullName);
        const player = upsertPlayer(
          {
            athleteId,
            firstName: nameParts.firstName,
            lastName: nameParts.lastName,
            fullName,
            grade,
            gradYear: inferGradYear(season.seasonId, grade),
            jersey,
            canonicalUrl: "",
          },
          players,
          playersById,
          playerLookup,
          rosterLookups,
          nextPlayerId
        );
        playerId = Number(player.PlayerID);
        athleteToPlayerId.set(athleteId, playerId);
      }

      const player = playersById.get(Number(playerId));
      const statRow = ensureStatRow(statRowsByAthlete, athleteId, {
        gameId: game.GameID,
        seasonId: season.seasonId,
        playerId,
        jersey,
        playerName: shortPlayerName(player) || fullName,
      });

      if (statRow.JerseyNumber == null && jersey != null) statRow.JerseyNumber = jersey;
      if (!statRow.PlayerName) statRow.PlayerName = shortPlayerName(player) || fullName;

      for (let index = 2; index < cells.length; index += 1) {
        const header = headers[index];
        const field = fieldMap[header];
        if (!field) continue;

        const text = normalizeWhitespace(cells[index]?.textContent);
        if (field === "SetsPlayed") {
          statRow.SetsPlayed = Math.max(Number(statRow.SetsPlayed || 0), numberOrZero(text));
        } else if (COUNTING_FIELDS.has(field)) {
          statRow[field] = numberOrZero(text);
        } else {
          statRow[field] = toNumber(text);
        }
      }
    }
  }

  return [...statRowsByAthlete.values()].sort(
    (a, b) => Number(a.JerseyNumber || 999) - Number(b.JerseyNumber || 999)
  );
}

function emptyTeamCategory() {
  return {
    SetsPlayed: 0,
    Kills: 0,
    KillsPerSet: null,
    KillPct: null,
    AttackAttempts: 0,
    AttackErrors: 0,
    HittingPct: null,
    Aces: 0,
    AcesPerSet: null,
    AcePct: null,
    ServeAttempts: 0,
    ServeErrors: 0,
    ServePct: null,
    ServingPoints: 0,
    SoloBlocks: 0,
    BlockAssists: 0,
    TotalBlocks: 0,
    BlocksPerSet: null,
    BlocksPerMatch: null,
    BlockErrors: 0,
    Digs: 0,
    DigErrors: 0,
    DigsPerSet: null,
    DigsPerMatch: null,
    Assists: 0,
    AssistsPerSet: null,
    BallHandlingAttempts: 0,
    BallHandlingErrors: 0,
    Receptions: 0,
    ReceptionErrors: 0,
    ReceptionsPerSet: null,
    ReceptionsPerMatch: null,
  };
}

function deriveCategory(row, category, matchCount = 1) {
  if (category === "Attacking") {
    row.KillsPerSet = perSet(row.Kills, row.SetsPlayed);
    row.KillPct = percentage(row.Kills, row.AttackAttempts);
    row.HittingPct = hittingPct(row.Kills, row.AttackErrors, row.AttackAttempts);
  } else if (category === "Serving") {
    row.AcesPerSet = perSet(row.Aces, row.SetsPlayed);
    row.AcePct = percentage(row.Aces, row.ServeAttempts);
    row.ServePct = percentage(row.ServeAttempts - row.ServeErrors, row.ServeAttempts);
  } else if (category === "Blocking") {
    row.BlocksPerSet = perSet(row.TotalBlocks, row.SetsPlayed);
    row.BlocksPerMatch = perMatch(row.TotalBlocks, matchCount);
  } else if (category === "Digging") {
    row.DigsPerSet = perSet(row.Digs, row.SetsPlayed);
    row.DigsPerMatch = perMatch(row.Digs, matchCount);
  } else if (category === "Ball Handling") {
    row.AssistsPerSet = perSet(row.Assists, row.SetsPlayed);
  } else if (category === "Serve Receiving") {
    row.ReceptionsPerSet = perSet(row.Receptions, row.SetsPlayed);
    row.ReceptionsPerMatch = perMatch(row.Receptions, matchCount);
  }
  return row;
}

function derivePlayerRow(row) {
  row.KillsPerSet = row.KillsPerSet ?? perSet(row.Kills, row.SetsPlayed);
  row.KillPct = row.KillPct ?? percentage(row.Kills, row.AttackAttempts);
  row.HittingPct = row.HittingPct ?? hittingPct(row.Kills, row.AttackErrors, row.AttackAttempts);
  row.AcesPerSet = row.AcesPerSet ?? perSet(row.Aces, row.SetsPlayed);
  row.AcePct = row.AcePct ?? percentage(row.Aces, row.ServeAttempts);
  row.ServePct = row.ServePct ?? percentage(row.ServeAttempts - row.ServeErrors, row.ServeAttempts);
  row.BlocksPerSet = row.BlocksPerSet ?? perSet(row.TotalBlocks, row.SetsPlayed);
  row.DigsPerSet = row.DigsPerSet ?? perSet(row.Digs, row.SetsPlayed);
  row.AssistsPerSet = row.AssistsPerSet ?? perSet(row.Assists, row.SetsPlayed);
  row.ReceptionsPerSet = row.ReceptionsPerSet ?? perSet(row.Receptions, row.SetsPlayed);
  return row;
}

function deriveTeamMatchStats(game, statRows) {
  if (!statRows.length) return null;
  const categories = {};

  for (const [category, fields] of Object.entries(TEAM_CATEGORY_FIELDS)) {
    const teamCategory = emptyTeamCategory();

    for (const row of statRows) {
      for (const field of fields) {
        if (field === "SetsPlayed") {
          teamCategory.SetsPlayed = Math.max(
            Number(teamCategory.SetsPlayed || 0),
            Number(row.SetsPlayed || 0)
          );
        } else if (COUNTING_FIELDS.has(field)) {
          teamCategory[field] += Number(row[field] || 0);
        }
      }
    }

    categories[category] = deriveCategory(teamCategory, category);
  }

  return { GameID: game.GameID, Season: game.Season, Categories: categories };
}

function parseGameDetails(
  game,
  season,
  athleteToPlayerId,
  players,
  playersById,
  playerLookup,
  rosterLookups,
  nextPlayerId
) {
  if (!game.GameUrl) return { game, playerStats: [], teamMatchStats: null };

  const safeName = `${season.code}-game-${String(game.GameID).replace(/[^0-9a-z-]/gi, "_")}.html`;
  const html = fetchToCache(game.GameUrl, safeName);
  const doc = makeDom(html);
  const setScores = parseSetScores(doc);
  if (setScores.length) game.SetScores = setScores;

  const playerStats = parseStatTables(
    doc,
    game,
    season,
    athleteToPlayerId,
    players,
    playersById,
    playerLookup,
    rosterLookups,
    nextPlayerId
  ).map(derivePlayerRow);

  return {
    game,
    playerStats,
    teamMatchStats: deriveTeamMatchStats(game, playerStats),
  };
}

function aggregatePlayerSeasonStats(playerGameStats) {
  const bySeasonPlayer = new Map();

  for (const row of playerGameStats) {
    const key = `${row.Season}|${row.PlayerID}`;
    if (!bySeasonPlayer.has(key)) {
      bySeasonPlayer.set(key, {
        Season: row.Season,
        PlayerID: row.PlayerID,
        JerseyNumber: row.JerseyNumber,
        PlayerName: row.PlayerName,
        Games: new Set(),
        ...emptyTeamCategory(),
      });
    }
    const total = bySeasonPlayer.get(key);
    total.Games.add(String(row.GameID));
    if (total.JerseyNumber == null && row.JerseyNumber != null) total.JerseyNumber = row.JerseyNumber;
    if (!total.PlayerName && row.PlayerName) total.PlayerName = row.PlayerName;
    for (const field of COUNTING_FIELDS) {
      if (field === "SetsPlayed") total.SetsPlayed += Number(row.SetsPlayed || 0);
      else total[field] += Number(row[field] || 0);
    }
  }

  return [...bySeasonPlayer.values()]
    .map((row) => {
      const games = row.Games.size;
      delete row.Games;
      row.Games = games;
      deriveCategory(row, "Attacking", games);
      deriveCategory(row, "Serving", games);
      deriveCategory(row, "Blocking", games);
      deriveCategory(row, "Digging", games);
      deriveCategory(row, "Ball Handling", games);
      deriveCategory(row, "Serve Receiving", games);
      return row;
    })
    .sort(
      (a, b) =>
        Number(a.Season) - Number(b.Season) ||
        Number(a.JerseyNumber || 999) - Number(b.JerseyNumber || 999) ||
        Number(a.PlayerID) - Number(b.PlayerID)
    );
}

function aggregateTeamSeasonStats(teamMatchStats) {
  const bySeason = new Map();

  for (const row of teamMatchStats) {
    if (!bySeason.has(row.Season)) {
      bySeason.set(row.Season, { SeasonID: row.Season, Categories: {}, _matches: 0 });
      for (const category of Object.keys(TEAM_CATEGORY_FIELDS)) {
        bySeason.get(row.Season).Categories[category] = emptyTeamCategory();
      }
    }
    const season = bySeason.get(row.Season);
    season._matches += 1;
    for (const [category, fields] of Object.entries(TEAM_CATEGORY_FIELDS)) {
      const target = season.Categories[category];
      const source = row.Categories?.[category] || {};
      for (const field of fields) {
        if (field === "SetsPlayed") target.SetsPlayed += Number(source.SetsPlayed || 0);
        else if (COUNTING_FIELDS.has(field)) target[field] += Number(source[field] || 0);
      }
    }
  }

  return [...bySeason.values()]
    .map((season) => {
      for (const category of Object.keys(season.Categories)) {
        deriveCategory(season.Categories[category], category, season._matches);
      }
      delete season._matches;
      return season;
    })
    .sort((a, b) => Number(a.SeasonID) - Number(b.SeasonID));
}

function mergeByKey(existing, imported, keyFn, replaceSeasonIds, seasonField = "Season") {
  const next = existing.filter((row) => !replaceSeasonIds.has(Number(row[seasonField])));
  const keys = new Set(next.map(keyFn));
  for (const row of imported) {
    const key = keyFn(row);
    if (keys.has(key)) continue;
    next.push(row);
    keys.add(key);
  }
  return next;
}

function upsertBySeason(existing, imported, replaceSeasonIds, seasonField = "SeasonID") {
  const importedBySeason = new Map(imported.map((row) => [Number(row[seasonField]), row]));
  const next = existing.filter((row) => !replaceSeasonIds.has(Number(row[seasonField])));
  next.push(...importedBySeason.values());
  return next.sort((a, b) => Number(a[seasonField]) - Number(b[seasonField]));
}

function sortPlayers(players) {
  return players.sort((a, b) => Number(a.PlayerID) - Number(b.PlayerID));
}

function sortSchools(schools) {
  return schools.sort((a, b) => String(a.SchoolID).localeCompare(String(b.SchoolID)));
}

function buildSeasonRecord(season, scheduleData, games) {
  const teamData = scheduleData?.props?.pageProps?.teamContext?.data || {};
  const standings = scheduleData?.props?.pageProps?.teamContext?.standingsData || {};
  const overall = parseRecordText(standings?.overallStanding?.overallWinLossTies);
  const region = parseRecordText(standings?.leagueStanding?.conferenceWinLossTies);

  const fallbackOverall = games.reduce(
    (record, game) => {
      if (game.Result === "W") record.wins += 1;
      if (game.Result === "L") record.losses += 1;
      if (game.Result === "T") record.ties += 1;
      return record;
    },
    { wins: 0, losses: 0, ties: 0 }
  );

  return {
    SeasonID: season.seasonId,
    YearStart: season.seasonId,
    YearEnd: season.seasonId + 1,
    DisplaySeason: String(season.seasonId),
    SourceSeasonLabel: season.label,
    HeadCoach: normalizeWhitespace(teamData.coachName) || null,
    OverallWins: overall.wins || fallbackOverall.wins,
    OverallLosses: overall.losses || fallbackOverall.losses,
    RegionWins: region.wins,
    RegionLosses: region.losses,
    RegionFinish: normalizeWhitespace(standings?.leagueStanding?.conferenceStandingPlacement) || null,
    League: normalizeWhitespace(teamData.leagueName) || null,
    StateDivision: normalizeWhitespace(teamData.stateDivisionName) || null,
    SourceUrl: scheduleUrlForSeason(season),
  };
}

function main() {
  ensureDir(CACHE_DIR);

  const seasons = readJson(path.join(DATA_DIR, "seasons.json"));
  const games = readJson(path.join(DATA_DIR, "games.json"));
  const rosters = readJson(path.join(DATA_DIR, "seasonrosters.json"));
  const playerGameStats = readJson(path.join(DATA_DIR, "playergamestats.json"));
  const playerSeasonStats = readJson(path.join(DATA_DIR, "playerseasonstats.json"));
  const teamMatchStats = readJson(path.join(DATA_DIR, "teammatchstats.json"));
  const teamSeasonStats = readJson(path.join(DATA_DIR, "teamseasonstats.json"));
  const players = readJson(PLAYERS_PATH);
  const schools = readJson(SCHOOLS_PATH);

  const playersById = new Map(players.map((player) => [Number(player.PlayerID), player]));
  const playerLookup = buildPlayerLookup(players);
  const rosterLookups = buildExistingRosterLookups(rosters);
  const schoolIndex = buildSchoolIndex(schools);
  const nextPlayerId = nextPlayerIdFactory(players);

  const importedSeasons = [];
  const importedGames = [];
  const importedRosters = [];
  const importedPlayerGameStats = [];
  const importedTeamMatchStats = [];
  const summary = [];
  const replaceSeasonIds = new Set();

  const seasonsToImport = SEASONS.filter((season) => INCLUDE_CURRENT_SEASON || !season.current);

  for (const season of seasonsToImport) {
    const scheduleHtml = fetchToCache(scheduleUrlForSeason(season), `${season.code}-schedule.html`);
    const scheduleData = parseNextData(scheduleHtml, `${season.label} schedule`);
    const { athleteToPlayerId, rosterEntries } = parseRoster(
      season,
      players,
      playersById,
      playerLookup,
      rosterLookups,
      nextPlayerId
    );
    const seasonGames = scheduleGameRows(season, scheduleData, schools, schoolIndex);

    let statGames = 0;
    for (const game of seasonGames) {
      const result = parseGameDetails(
        game,
        season,
        athleteToPlayerId,
        players,
        playersById,
        playerLookup,
        rosterLookups,
        nextPlayerId
      );
      importedGames.push(result.game);
      importedPlayerGameStats.push(...result.playerStats);
      if (result.teamMatchStats) {
        importedTeamMatchStats.push(result.teamMatchStats);
        statGames += 1;
      }
    }

    importedRosters.push({
      SeasonID: season.seasonId,
      SourceSeasonLabel: season.label,
      Players: rosterEntries,
    });
    importedSeasons.push(buildSeasonRecord(season, scheduleData, seasonGames));
    replaceSeasonIds.add(season.seasonId);

    summary.push({
      season: season.label,
      matches: seasonGames.length,
      roster: rosterEntries.length,
      statRows: importedPlayerGameStats.filter((row) => Number(row.Season) === season.seasonId)
        .length,
      statGames,
    });
  }

  const importedPlayerSeasonStats = aggregatePlayerSeasonStats(importedPlayerGameStats);
  const importedTeamSeasonStats = aggregateTeamSeasonStats(importedTeamMatchStats);

  const nextSeasons = upsertBySeason(seasons, importedSeasons, replaceSeasonIds);
  const nextRosters = upsertBySeason(rosters, importedRosters, replaceSeasonIds);
  const nextGames = mergeByKey(
    games,
    importedGames,
    (row) => `${row.Season}|${row.GameID}`,
    replaceSeasonIds,
    "Season"
  ).sort(
    (a, b) =>
      Number(a.Season) - Number(b.Season) ||
      String(a.Date || "").localeCompare(String(b.Date || "")) ||
      String(a.GameID).localeCompare(String(b.GameID))
  );
  const nextPlayerGameStats = mergeByKey(
    playerGameStats,
    importedPlayerGameStats,
    (row) => `${row.Season}|${row.GameID}|${row.PlayerID}`,
    replaceSeasonIds,
    "Season"
  ).sort(
    (a, b) =>
      Number(a.Season) - Number(b.Season) ||
      String(a.GameID).localeCompare(String(b.GameID)) ||
      Number(a.PlayerID) - Number(b.PlayerID)
  );
  const nextTeamMatchStats = mergeByKey(
    teamMatchStats,
    importedTeamMatchStats,
    (row) => `${row.Season}|${row.GameID}`,
    replaceSeasonIds,
    "Season"
  ).sort(
    (a, b) =>
      Number(a.Season) - Number(b.Season) || String(a.GameID).localeCompare(String(b.GameID))
  );
  const nextPlayerSeasonStats = mergeByKey(
    playerSeasonStats,
    importedPlayerSeasonStats,
    (row) => `${row.Season}|${row.PlayerID}`,
    replaceSeasonIds,
    "Season"
  ).sort(
    (a, b) =>
      Number(a.Season) - Number(b.Season) ||
      Number(a.JerseyNumber || 999) - Number(b.JerseyNumber || 999) ||
      Number(a.PlayerID) - Number(b.PlayerID)
  );
  const nextTeamSeasonStats = upsertBySeason(
    teamSeasonStats,
    importedTeamSeasonStats,
    replaceSeasonIds
  );

  console.table(summary);
  console.log(
    `Imported ${importedSeasons.length} seasons, ${importedGames.length} matches, ${importedRosters.reduce(
      (sum, roster) => sum + roster.Players.length,
      0
    )} roster rows, ${importedPlayerGameStats.length} player stat rows.`
  );
  console.log(
    `Next totals: ${nextSeasons.length} seasons, ${nextGames.length} matches, ${nextRosters.length} rosters, ${nextPlayerGameStats.length} player game rows, ${players.length} players.`
  );

  if (DRY_RUN) {
    console.log("Dry run only; no files written.");
    return;
  }

  writeJson(path.join(DATA_DIR, "seasons.json"), nextSeasons);
  writeJson(path.join(DATA_DIR, "games.json"), nextGames);
  writeJson(path.join(DATA_DIR, "seasonrosters.json"), nextRosters);
  writeJson(path.join(DATA_DIR, "playergamestats.json"), nextPlayerGameStats);
  writeJson(path.join(DATA_DIR, "teammatchstats.json"), nextTeamMatchStats);
  writeJson(path.join(DATA_DIR, "playerseasonstats.json"), nextPlayerSeasonStats);
  writeJson(path.join(DATA_DIR, "teamseasonstats.json"), nextTeamSeasonStats);
  writeJson(PLAYERS_PATH, sortPlayers(players));
  writeJson(SCHOOLS_PATH, sortSchools(schools));
}

main();
