const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "public", "data", "cross-country");
const TEAM_ID = 28890;
const TARGET_START_SEASON = 1997;
const TARGET_END_SEASON = 2018;
const SCHEDULE_YEARS = [2015, 2016, 2017];
const SCHEDULE_HOSTS = ["ga", "sc"];
const SCISA_HISTORY_SOURCE =
  "https://sc.milesplit.com/meets/291024-scisa-championships-2017/results";

const SCHOOL_PATTERNS = [
  /\bst\.?\s*andrew'?s\b/i,
  /\bst\.?\s*andrews\b/i,
];
const SCHOOL_NAME_SOURCE = String.raw`st\.?\s*andrew'?s|st\.?\s*andrews`;
const TIME_SOURCE = String.raw`\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?|\d{1,2}\.\d+`;

const MONTHS = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, fileName), "utf8"));
}

function writeJson(fileName, value) {
  fs.writeFileSync(
    path.join(DATA_DIR, fileName),
    `${JSON.stringify(value, null, 2)}\n`
  );
}

function decodeHtml(value = "") {
  return String(value)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x2F;/g, "/")
    .replace(/&#x3A;/g, ":")
    .replace(/&#x3D;/g, "=")
    .replace(/&#x20;/g, " ");
}

function stripTags(value = "") {
  return decodeHtml(String(value).replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSpace(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function ordinal(value) {
  const number = Number(String(value || "").match(/\d+/)?.[0]);
  if (!Number.isFinite(number)) return "";
  const mod100 = number % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${number}th`;
  const mod10 = number % 10;
  if (mod10 === 1) return `${number}st`;
  if (mod10 === 2) return `${number}nd`;
  if (mod10 === 3) return `${number}rd`;
  return `${number}th`;
}

function seasonIdFromDate(date) {
  const year = Number(String(date || "").slice(0, 4));
  const month = Number(String(date || "").slice(5, 7));
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null;
  return month >= 7 ? year + 1 : year;
}

function seasonLabel(seasonId) {
  return `${seasonId - 1}-${String(seasonId).slice(-2)}`;
}

function normalizeEventName(value = "") {
  const label = String(value).toLowerCase();
  if (/\bone\s*mile\b|\b1\s*mile\b|\b1600\b/.test(label)) return "One Mile Run";
  if (/\btwo\s*mile\b|\b2\s*mile\b/.test(label)) return "Two Mile Run";
  if (/\b3200\b/.test(label)) return "3200 Meter Run";
  if (/\b5\s*k\b|\b5k\b|\b5000\b/.test(label)) return "5K Run";
  return "5K Run";
}

function normalizeGender(value = "") {
  if (/\bgirls?\b|\bwomen\b|\bfemale\b/i.test(value)) return "Girls";
  if (/\bboys?\b|\bmen\b|\bmale\b/i.test(value)) return "Boys";
  return "";
}

function inferDivision(event, race, meetName) {
  const text = `${event || ""} ${race || ""} ${meetName || ""}`.toLowerCase();
  if (/\b(ms|middle school|middle)\b/.test(text)) return "Middle School";
  if (/one mile|two mile|2\.0|2 mile|3200/.test(text)) return "Middle School";
  return "High School";
}

function inferMeetType(name = "") {
  const label = String(name).toLowerCase();
  if (label.includes("state") || label.includes("championship")) return "State";
  if (label.includes("region")) return "Region";
  return "Regular Season";
}

function inferLevel(rows, meetName) {
  if (!rows.length) return /\b(ms|middle school|middle)\b/i.test(meetName)
    ? "Middle School"
    : "Varsity";

  const divisions = new Set(rows.map((row) => row.Division));
  if (divisions.size === 1 && divisions.has("Middle School")) return "Middle School";
  if (divisions.size === 1 && divisions.has("High School")) return "Varsity";
  return "Varsity/Middle School";
}

function locationFromJsonLd(jsonLd) {
  const location = jsonLd?.location;
  if (!location) return "";
  const parts = [];
  if (location.name) parts.push(location.name);
  const address = location.address || {};
  const city = address.addressLocality;
  const state = address.addressRegion;
  if (city && state) parts.push(`${city}, ${state}`);
  else if (city) parts.push(city);
  else if (state) parts.push(state);
  return parts.join(", ");
}

function parseJsonLd(html) {
  const scripts = Array.from(
    String(html).matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    )
  );

  for (const [, body] of scripts) {
    try {
      const parsed = JSON.parse(decodeHtml(body).trim());
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      // Some older MileSplit pages have malformed ancillary JSON-LD; skip it.
    }
  }

  return null;
}

function normalizeMeetUrl(url) {
  return String(url || "")
    .replace(/\/results\/?$/, "")
    .replace(/\/teams\/\d+\/?$/, "")
    .replace(/\/coverage\/?$/, "")
    .replace(/\/$/, "");
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; StAndrewsArchiveImporter/1.0; +https://st-andrews.local)",
      Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed ${response.status} for ${url}`);
  }

  return response.text();
}

async function fetchJson(url) {
  const text = await fetchText(url);
  return JSON.parse(text);
}

function extractResultLinks(html) {
  const links = [];
  const pattern =
    /<a\s+href=["']([^"']+\/results\/(\d+)\/formatted\/?)["'][^>]*>\s*([\s\S]*?)<i\b/gi;
  for (const match of String(html).matchAll(pattern)) {
    links.push({
      url: decodeHtml(match[1]).replace(/\/formatted\/?$/, "/raw"),
      resultId: Number(match[2]),
      label: stripTags(match[3]),
    });
  }
  return links;
}

function extractPastMeets(html) {
  const meets = new Map();
  const pattern =
    /<a\s+href=["'](https:\/\/sc\.milesplit\.com\/meets\/(\d+)-[^"']+)["']>\s*(\d{4}-\d{2}-\d{2})\s*<\/a>/gi;

  for (const match of String(html).matchAll(pattern)) {
    const date = match[3];
    const season = seasonIdFromDate(date);
    if (season < 2005 || season > TARGET_END_SEASON) continue;
    const meetId = Number(match[2]);
    meets.set(meetId, {
      meetId,
      url: normalizeMeetUrl(decodeHtml(match[1])),
      date,
    });
  }

  return Array.from(meets.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function extractPre(html) {
  const match = String(html).match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
  return match ? decodeHtml(match[1]).replace(/\r\n/g, "\n") : "";
}

function schoolMatches(line) {
  return SCHOOL_PATTERNS.some((pattern) => pattern.test(line));
}

function invertName(value = "") {
  const name = normalizeSpace(value.replace(/\s+--$/, ""));
  if (!name.includes(",")) return name;
  const [last, ...firstParts] = name.split(",");
  const first = normalizeSpace(firstParts.join(","));
  return normalizeSpace(`${first} ${last}`);
}

function parseRawLine(line) {
  const cleanLine = line.replace(/\s+$/, "");
  const fixedWidthMatch = cleanLine.match(
    new RegExp(
      String.raw`^\s*(\d+)\s+(?:\d+\s+)?\d+\s+(?:[A-Z]{1,4}|--)\s+(.+?)\s{2,}(?:${SCHOOL_NAME_SOURCE})\s+(${TIME_SOURCE})(?:\s+\d{1,2}:\d{2})?\s*$`,
      "i"
    )
  );
  if (fixedWidthMatch) {
    return {
      place: Number(fixedWidthMatch[1]),
      athleteName: normalizeSpace(fixedWidthMatch[2]),
      mark: fixedWidthMatch[3],
    };
  }

  const match = cleanLine.match(
    /^\s*(\d+)\s+(.+?)\s{2,}((?:--|\d{1,2})\s+)?(.+?)\s{2,}(\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?|\d{1,2}\.\d+)\s*(?:\d+)?\s*$/
  );
  if (!match) return null;

  const place = Number(match[1]);
  const athleteName = invertName(match[2]);
  const school = normalizeSpace(match[4]);
  const mark = match[5];

  if (!schoolMatches(school)) return null;

  return {
    place,
    athleteName,
    mark,
  };
}

function parseRawRows(pre, resultLabel, meetName) {
  const rows = [];
  let currentEvent = "";

  for (const line of pre.split("\n")) {
    if (/Team Scores/i.test(line)) break;

    const eventMatch = line.match(/^\s*Event\s+\d+\s+(.+?)\s*$/i);
    if (eventMatch) {
      currentEvent = normalizeSpace(eventMatch[1]);
      continue;
    }

    if (!schoolMatches(line)) continue;

    const parsed = parseRawLine(line);
    if (!parsed) continue;

    const raceSource = currentEvent || resultLabel;
    const gender = normalizeGender(raceSource || resultLabel);
    const event = normalizeEventName(raceSource || resultLabel);
    const label = normalizeSpace(resultLabel || raceSource || "Results");
    const race = gender && !new RegExp(`\\b${gender}\\b`, "i").test(label)
      ? `${gender} ${label}`
      : label || raceSource;

    rows.push({
      Gender: gender,
      Event: event,
      Race: race,
      Mark: parsed.mark,
      Place: ordinal(parsed.place),
      Round: "Finals",
      Status: "Complete",
      AthleteName: parsed.athleteName,
      Division: inferDivision(event, race, meetName),
    });
  }

  return rows;
}

function extractTeamRowsFromHtml(html, meetName) {
  const rows = [];
  let currentGender = "";
  let currentEvent = "";

  const rowPattern = /<tr\b([^>]*)>([\s\S]*?)<\/tr>/gi;
  for (const match of String(html).matchAll(rowPattern)) {
    const attrs = match[1] || "";
    const body = match[2] || "";

    if (/\bthead\b/.test(attrs)) {
      const heading = stripTags(body);
      if (/\bGirls\b/i.test(heading)) currentGender = "Girls";
      if (/\bBoys\b/i.test(heading)) currentGender = "Boys";
      if (/\btertiary\b/.test(attrs)) currentEvent = normalizeEventName(heading);
      continue;
    }

    if (!/<td\b/i.test(body)) continue;

    const mark = stripTags(
      body.match(/<td[^>]+class=["'][^"']*\bmark\b[^"']*["'][^>]*>([\s\S]*?)<\/td>/i)?.[1] ||
        ""
    );
    const athleteCell =
      body.match(/<td[^>]+class=["'][^"']*\bathlete\b[^"']*["'][^>]*>([\s\S]*?)<\/td>/i)?.[1] ||
      "";
    const athleteName = stripTags(
      athleteCell.match(/<a\b[^>]*>([\s\S]*?)<\/a>/i)?.[1] || athleteCell
    );
    const place = stripTags(
      body.match(/<td[^>]+class=["'][^"']*\bplace\b[^"']*["'][^>]*>([\s\S]*?)<\/td>/i)?.[1] ||
        ""
    );
    const resultsCell =
      body.match(/<td[^>]+class=["'][^"']*\bresults\b[^"']*["'][^>]*>([\s\S]*?)<\/td>/i)?.[1] ||
      "";
    const race = stripTags(
      resultsCell.match(/<a\b[^>]*>([\s\S]*?)<\/a>/i)?.[1] || resultsCell
    );

    if (!mark || !athleteName || /^No\b/i.test(athleteName)) continue;

    const event = currentEvent || normalizeEventName(race);
    const gender = currentGender || normalizeGender(race);

    rows.push({
      Gender: gender,
      Event: event,
      Race: race || `${gender} ${event}`.trim(),
      Mark: mark,
      Place: place,
      Round: "Finals",
      Status: "Complete",
      AthleteName: athleteName,
      Division: inferDivision(event, race, meetName),
    });
  }

  return rows;
}

function buildStatId(meetId, row, index) {
  return [
    meetId,
    String(index + 1).padStart(3, "0"),
    slugify(row.AthleteName || "runner"),
    slugify(row.Event || "event"),
    slugify(row.Race || "race").slice(0, 36),
  ]
    .filter(Boolean)
    .join("-");
}

function dateFromScheduleItem(item, year) {
  const [month, day] = String(item.dateScheduled || "").split("/");
  if (!month || !day) return "";
  const paddedMonth = month.padStart(2, "0");
  const paddedDay = day.padStart(2, "0");
  const seasonYear = Number(item.seasonYear || year);
  return `${seasonYear}-${paddedMonth}-${paddedDay}`;
}

function dateFromMeetHeader(html) {
  const time = String(html).match(/<time>\s*([A-Z][a-z]{2})\s+(\d{1,2}),\s+(\d{4})\s*<\/time>/);
  if (!time) return "";
  const [, month, day, year] = time;
  return `${year}-${MONTHS[month] || "01"}-${day.padStart(2, "0")}`;
}

async function collectScheduleMeets() {
  const byMeetId = new Map();

  for (const host of SCHEDULE_HOSTS) {
    for (const year of SCHEDULE_YEARS) {
      const url = `https://${host}.milesplit.com/api/v1/teams/${TEAM_ID}/schedules?season=cc&year=${year}`;
      const json = await fetchJson(url);
      const monthGroups = json?.data?.monthGroups || [];

      for (const group of monthGroups) {
        for (const item of group.items || []) {
          const meetId = Number(item.meetId);
          if (!Number.isFinite(meetId)) continue;

          const date = dateFromScheduleItem(item, group.seasonYear || year);
          const season = seasonIdFromDate(date);
          if (season < TARGET_START_SEASON || season > TARGET_END_SEASON) continue;

          const existing = byMeetId.get(meetId);
          const link = decodeHtml(item.link);
          const sourceHost = item.venueState === "SC" ? "sc" : host;
          const sourceUrl = link.replace(/^https:\/\/(?:ga|sc)\./, `https://${sourceHost}.`);

          if (!existing) {
            byMeetId.set(meetId, {
              MeetID: meetId,
              Season: season,
              Date: date,
              Name: decodeHtml(item.name || ""),
              Location: [item.venueCity, item.venueState].filter(Boolean).join(", "),
              SourceUrl: sourceUrl,
              hasResults: Boolean(item.hasResults),
              rows: [],
              sourceKind: "schedule",
            });
          }
        }
      }
    }
  }

  for (const meet of byMeetId.values()) {
    if (!meet.hasResults) continue;

    const teamUrl = `${normalizeMeetUrl(meet.SourceUrl)}/teams/${TEAM_ID}`;
    try {
      const html = await fetchText(teamUrl);
      const rows = extractTeamRowsFromHtml(html, meet.Name);
      meet.rows = rows;
      meet.SourceUrl = teamUrl;
    } catch (error) {
      console.warn(`Could not load team page for ${meet.MeetID}: ${error.message}`);
    }
  }

  return Array.from(byMeetId.values());
}

async function collectScisaHistoryMeets() {
  const historyHtml = await fetchText(SCISA_HISTORY_SOURCE);
  const pastMeets = extractPastMeets(historyHtml);
  const collected = [];

  for (const pastMeet of pastMeets) {
    if (pastMeet.date.startsWith("2018")) continue;

    const resultsUrl = `${pastMeet.url}/results`;
    let resultsHtml;
    try {
      resultsHtml = await fetchText(resultsUrl);
    } catch (error) {
      console.warn(`Could not load results list for ${pastMeet.meetId}: ${error.message}`);
      continue;
    }

    const jsonLd = parseJsonLd(resultsHtml) || {};
    const date = jsonLd.startDate || pastMeet.date || dateFromMeetHeader(resultsHtml);
    const season = seasonIdFromDate(date);
    if (season < TARGET_START_SEASON || season > TARGET_END_SEASON) continue;

    const meet = {
      MeetID: pastMeet.meetId,
      Season: season,
      Date: date,
      Name: jsonLd.name || "SCISA Championships",
      Location: locationFromJsonLd(jsonLd),
      SourceUrl: resultsUrl,
      hasResults: true,
      rows: [],
      sourceKind: "scisa-history",
    };

    for (const resultLink of extractResultLinks(resultsHtml)) {
      let rawHtml;
      try {
        rawHtml = await fetchText(resultLink.url);
      } catch (error) {
        console.warn(`Could not load raw result ${resultLink.url}: ${error.message}`);
        continue;
      }

      const rows = parseRawRows(extractPre(rawHtml), resultLink.label, meet.Name);
      if (rows.length) {
        meet.rows.push(...rows);
      }
    }

    collected.push(meet);
  }

  return collected;
}

function mergeMeetCollections(...collections) {
  const byMeetId = new Map();

  for (const collection of collections) {
    for (const meet of collection) {
      const existing = byMeetId.get(Number(meet.MeetID));
      if (!existing) {
        byMeetId.set(Number(meet.MeetID), { ...meet, rows: [...(meet.rows || [])] });
        continue;
      }

      const rowKeys = new Set(
        existing.rows.map((row) =>
          [row.AthleteName, row.Mark, row.Race, row.Place].join("|").toLowerCase()
        )
      );
      for (const row of meet.rows || []) {
        const key = [row.AthleteName, row.Mark, row.Race, row.Place]
          .join("|")
          .toLowerCase();
        if (!rowKeys.has(key)) {
          existing.rows.push(row);
          rowKeys.add(key);
        }
      }

      if (!existing.SourceUrl?.includes(`/teams/${TEAM_ID}`) && meet.SourceUrl) {
        existing.SourceUrl = meet.SourceUrl;
      }
      existing.hasResults = existing.hasResults || meet.hasResults;
    }
  }

  return Array.from(byMeetId.values()).sort((a, b) => {
    const dateDiff = String(a.Date || "").localeCompare(String(b.Date || ""));
    return dateDiff || Number(a.MeetID) - Number(b.MeetID);
  });
}

function toMeetRecord(meet) {
  const rows = meet.rows || [];
  const meetType = inferMeetType(meet.Name);
  const level = inferLevel(rows, meet.Name);
  const status = rows.length ? "Complete" : meet.hasResults ? "No Public Rows" : "Scheduled";

  const notes = rows.length
    ? `Results loaded from MileSplit ${meet.sourceKind === "scisa-history" ? "South Carolina raw result files" : "team results pages"}. The public source exposed ${rows.length} St. Andrew's cross country result rows.`
    : meet.hasResults
      ? "MileSplit lists a results page for this meet, but the St. Andrew's team results page or raw files exposed no St. Andrew's performances."
      : "MileSplit lists this meet on the St. Andrew's cross country schedule, but no public results link was available from the team schedule.";

  return {
    MeetID: Number(meet.MeetID),
    Season: Number(meet.Season),
    Date: meet.Date,
    Name: meet.Name,
    Location: meet.Location || "",
    Level: level,
    MeetType: meetType,
    Status: status,
    Notes: notes,
    SourceUrl: meet.SourceUrl,
  };
}

function toStatRecords(meets) {
  const records = [];

  for (const meet of meets) {
    const sortedRows = [...(meet.rows || [])].sort((a, b) => {
      const genderDiff = (a.Gender || "").localeCompare(b.Gender || "");
      if (genderDiff) return genderDiff;
      const eventDiff = (a.Event || "").localeCompare(b.Event || "");
      if (eventDiff) return eventDiff;
      const placeA = Number(String(a.Place || "").match(/\d+/)?.[0] || 9999);
      const placeB = Number(String(b.Place || "").match(/\d+/)?.[0] || 9999);
      return placeA - placeB || (a.AthleteName || "").localeCompare(b.AthleteName || "");
    });

    sortedRows.forEach((row, index) => {
      records.push({
        StatID: buildStatId(meet.MeetID, row, index),
        MeetID: Number(meet.MeetID),
        PlayerID: null,
        Gender: row.Gender || "",
        Event: row.Event || "5K Run",
        Race: row.Race || "Results",
        Mark: row.Mark || "",
        Place: row.Place || "",
        Round: row.Round || "Finals",
        Status: row.Status || "Complete",
        AthleteName: row.AthleteName || "St. Andrew's Runner",
        Division: row.Division || "High School",
      });
    });
  }

  return records;
}

function buildSeasons(existingSeasons, importedMeets, importedStats) {
  const existingModernSeasons = existingSeasons.filter(
    (season) => Number(season.SeasonID) > TARGET_END_SEASON
  );
  const importedMeetMap = new Map();
  for (const meet of importedMeets) {
    const season = Number(meet.Season);
    if (!importedMeetMap.has(season)) importedMeetMap.set(season, []);
    importedMeetMap.get(season).push(meet);
  }

  const statsByMeetId = new Map();
  for (const stat of importedStats) {
    const meetId = Number(stat.MeetID);
    if (!statsByMeetId.has(meetId)) statsByMeetId.set(meetId, []);
    statsByMeetId.get(meetId).push(stat);
  }

  const archiveSeasons = [];

  for (let seasonId = TARGET_START_SEASON; seasonId <= TARGET_END_SEASON; seasonId += 1) {
    const seasonMeets = importedMeetMap.get(seasonId) || [];
    const seasonStats = seasonMeets.flatMap((meet) => statsByMeetId.get(Number(meet.MeetID)) || []);
    const rowCount = seasonStats.length;
    const athleteCount = new Set(seasonStats.map((row) => row.AthleteName)).size;
    const resultMeetCount = seasonMeets.filter((meet) => meet.Status === "Complete").length;
    const firstMeet = seasonMeets
      .map((meet) => meet.Date)
      .filter(Boolean)
      .sort()[0];
    const stateMeet =
      seasonMeets.find((meet) => /scisa championships/i.test(meet.Name)) ||
      seasonMeets.find((meet) => meet.MeetType === "State");
    const regionMeet = seasonMeets.find((meet) => meet.MeetType === "Region");
    const topRows = seasonStats
      .filter((row) => row.Place)
      .sort((a, b) => {
        const placeA = Number(String(a.Place).match(/\d+/)?.[0] || 9999);
        const placeB = Number(String(b.Place).match(/\d+/)?.[0] || 9999);
        return placeA - placeB;
      })
      .slice(0, 4);

    const noData =
      "No public MileSplit Georgia or South Carolina result files were found for St. Andrew's during this crawl.";
    const statusNote = seasonMeets.length
      ? `MileSplit Georgia/South Carolina exposes ${seasonMeets.length} St. Andrew's cross country schedule or SCISA result entries for ${seasonLabel(seasonId)}, including ${resultMeetCount} meets with public St. Andrew's result rows.`
      : `${noData} Season shell retained for ${seasonLabel(seasonId)} so the SCISA-era range stays visible.`;

    archiveSeasons.push({
      SeasonID: seasonId,
      SeasonLabel: seasonLabel(seasonId),
      Classification: "SCISA",
      StatusBadge: rowCount ? "verified" : seasonMeets.length ? "partial" : "not-found",
      StatusNote: statusNote,
      FirstRegularSeasonMeet: firstMeet || "",
      RegionMeetDate: regionMeet?.Date || "",
      StateMeetStart: stateMeet?.Date || "",
      StateMeetEnd: stateMeet?.Date || "",
      StateMeetLocation: stateMeet?.Location || "",
      RecapParagraphs: rowCount
        ? [
            `The ${seasonLabel(seasonId)} cross country archive is built from MileSplit Georgia team schedule pages and MileSplit South Carolina SCISA raw result files where St. Andrew's appeared.`,
            `The loaded data includes ${seasonMeets.length} schedule/result entries, ${resultMeetCount} meets with public St. Andrew's performances, ${rowCount} result rows, and ${athleteCount} named athletes.`,
          ]
        : [
            `${noData} The season remains listed because the requested SCISA-era crawl covers ${seasonLabel(seasonId)}.`,
          ],
      HighlightNotes: [
        rowCount
          ? `${resultMeetCount} meets include public St. Andrew's performance rows on MileSplit.`
          : "No public St. Andrew's MileSplit result rows were found.",
        rowCount
          ? `${rowCount} athlete-result rows are loaded for ${athleteCount} named athletes.`
          : "Georgia and South Carolina MileSplit pages were checked for this crawl.",
        ...topRows.map(
          (row) =>
            `${row.AthleteName} placed ${row.Place} in ${row.Race} (${row.Mark}).`
        ),
      ],
    });
  }

  return [...archiveSeasons, ...existingModernSeasons].sort(
    (a, b) => Number(a.SeasonID) - Number(b.SeasonID)
  );
}

function validateData(seasons, meets, stats) {
  const errors = [];
  const meetIds = new Set(meets.map((meet) => Number(meet.MeetID)));
  const duplicateMeets = meets
    .map((meet) => Number(meet.MeetID))
    .filter((meetId, index, all) => all.indexOf(meetId) !== index);
  const duplicateStats = stats
    .map((row) => row.StatID)
    .filter((statId, index, all) => all.indexOf(statId) !== index);

  if (duplicateMeets.length) errors.push(`Duplicate meets: ${duplicateMeets.join(", ")}`);
  if (duplicateStats.length) errors.push(`Duplicate StatID values: ${duplicateStats.join(", ")}`);

  const orphanStats = stats.filter((row) => !meetIds.has(Number(row.MeetID)));
  if (orphanStats.length) errors.push(`${orphanStats.length} stat rows reference missing meets`);

  const badNames = stats.filter((row) => {
    const name = String(row.AthleteName || "").trim();
    return /^(SB|PR|SR|FR|SO|JR|--|\d+)$/i.test(name) || /\d+(st|nd|rd|th)/i.test(name);
  });
  if (badNames.length) errors.push(`${badNames.length} rows have suspicious athlete names`);

  const badPlaces = stats.filter((row) => SCHOOL_PATTERNS.some((pattern) => pattern.test(row.Place || "")));
  if (badPlaces.length) errors.push(`${badPlaces.length} rows have suspicious places`);

  const seasonIds = new Set(seasons.map((season) => Number(season.SeasonID)));
  for (let seasonId = TARGET_START_SEASON; seasonId <= TARGET_END_SEASON; seasonId += 1) {
    if (!seasonIds.has(seasonId)) errors.push(`Missing season ${seasonId}`);
  }

  if (errors.length) {
    throw new Error(errors.join("\n"));
  }
}

async function main() {
  const existingSeasons = readJson("seasons.json");
  const existingMeets = readJson("meets.json");
  const existingStats = readJson("playermeetstats.json");
  const overview = readJson("overview.json");

  const scheduleMeets = await collectScheduleMeets();
  const scisaHistoryMeets = await collectScisaHistoryMeets();
  const imported = mergeMeetCollections(scheduleMeets, scisaHistoryMeets);
  const importedMeetRecords = imported.map(toMeetRecord);
  const importedStats = toStatRecords(imported);

  const modernMeets = existingMeets.filter((meet) => Number(meet.Season) > TARGET_END_SEASON);
  const modernMeetIds = new Set(modernMeets.map((meet) => Number(meet.MeetID)));
  const modernStats = existingStats.filter((row) => modernMeetIds.has(Number(row.MeetID)));

  const nextMeets = [...importedMeetRecords, ...modernMeets].sort((a, b) => {
    const seasonDiff = Number(a.Season) - Number(b.Season);
    if (seasonDiff) return seasonDiff;
    const dateDiff = String(a.Date || "").localeCompare(String(b.Date || ""));
    return dateDiff || Number(a.MeetID) - Number(b.MeetID);
  });
  const nextStats = [...importedStats, ...modernStats];
  const nextSeasons = buildSeasons(existingSeasons, importedMeetRecords, importedStats);
  const nextOverview = {
    ...overview,
    trackedSince: "1996-97",
    sourceSummary:
      "Historical data now combines MileSplit South Carolina SCISA raw result files, MileSplit Georgia team schedules, and the existing MileSplit Georgia team ID 28890 archive through the current season.",
    pageIntro:
      "The St. Andrew's cross country archive is organized around MileSplit Georgia schedule entries, MileSplit South Carolina SCISA result files, meet pages, and team-filtered result rows for the St. Andrews School team profile.",
    dataNotes: Array.from(
      new Set([
        ...(overview.dataNotes || []),
        "SCISA-era seasons before the first public MileSplit result files are kept as visible season shells with no result rows.",
        "Older South Carolina result files sometimes list St. Andrew's as plain text rather than attaching rows to the current MileSplit team profile, so the importer reads raw files as well as team-filtered pages.",
      ])
    ),
  };

  validateData(nextSeasons, nextMeets, nextStats);

  writeJson("seasons.json", nextSeasons);
  writeJson("meets.json", nextMeets);
  writeJson("playermeetstats.json", nextStats);
  writeJson("overview.json", nextOverview);

  const importedCompleteMeets = importedMeetRecords.filter(
    (meet) => Number(meet.Season) <= TARGET_END_SEASON && meet.Status === "Complete"
  );
  console.log(
    JSON.stringify(
      {
        importedMeetEntries: importedMeetRecords.length,
        importedCompleteMeets: importedCompleteMeets.length,
        importedRows: importedStats.length,
        seasons: nextSeasons.length,
        totalMeets: nextMeets.length,
        totalRows: nextStats.length,
        emptyRequestedSeasonShells: nextSeasons.filter(
          (season) =>
            Number(season.SeasonID) >= TARGET_START_SEASON &&
            Number(season.SeasonID) <= TARGET_END_SEASON &&
            season.StatusBadge === "not-found"
        ).length,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
