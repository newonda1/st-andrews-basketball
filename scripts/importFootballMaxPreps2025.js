const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "public", "data", "boys", "football");

const INPUTS = {
  schedule: "/tmp/football-schedule-print.html",
  roster: "/tmp/football-roster-print.html",
  stats: "/tmp/football-stats-print.html",
};

const SOURCE_URLS = {
  schedule:
    "https://www.maxpreps.com/print/schedule.aspx?schoolid=1019c441-d956-4e70-a61c-6cbc2ba6e073&ssid=d3f943a6-448f-4f26-8754-84299a3d7201&print=1",
  roster:
    "https://www.maxpreps.com/ga/savannah/st-andrews-lions/football/roster/print/?print=1",
  stats:
    "https://www.maxpreps.com/print/team_stats.aspx?admin=0&bygame=0&league=0&print=1&schoolid=1019c441-d956-4e70-a61c-6cbc2ba6e073&ssid=d3f943a6-448f-4f26-8754-84299a3d7201",
};

const TEAM_ID = "ga-savannah-st-andrews-lions-football";
const TEAM_NAME = "St. Andrew's Lions";
const TEAM_LEVEL = "Varsity";
const DISPLAY_SEASON = "2025";
const SOURCE_SEASON_LABEL = "2025-26";
const SEASON_ID = 2025;

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(fileName, value) {
  const outputPath = path.join(DATA_DIR, fileName);
  fs.writeFileSync(outputPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return outputPath;
}

function makeDom(html) {
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("error", () => {});
  return new JSDOM(html, { virtualConsole }).window.document;
}

function normalizeWhitespace(value) {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNextData(html) {
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
  );
  if (!match) {
    throw new Error("Could not locate __NEXT_DATA__ in roster print page.");
  }
  return JSON.parse(match[1]);
}

function isoDateFromMonthDay(monthDay, year = SEASON_ID) {
  const [monthText, dayText] = String(monthDay).split("/");
  const month = Number(monthText);
  const day = Number(dayText);

  if (!month || !day) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function slugify(text) {
  return normalizeWhitespace(text)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseRecord(recordText) {
  const [wins = "0", losses = "0", ties = "0"] = String(recordText)
    .split("-")
    .map((value) => Number(value) || 0);
  return { wins, losses, ties };
}

function parseNumberText(value) {
  const text = normalizeWhitespace(value);
  if (!text) return null;

  const cleaned = text.replace(/,/g, "");
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
}

function absolutizeMaxPrepsUrl(value) {
  const text = normalizeWhitespace(value);
  if (!text) return "";
  if (/^https?:\/\//i.test(text)) return text;
  return `https://www.maxpreps.com${text}`;
}

function parseSchedule(doc) {
  const overallRecord = normalizeWhitespace(
    doc.querySelector("#Team_highlight_info1_BottomRowOverallRecord")?.textContent
  );
  const regionRecord = normalizeWhitespace(
    doc.querySelector("#Team_highlight_info1_BottomRowLeagueRecord")?.textContent
  );
  const league = normalizeWhitespace(
    doc.querySelector("#Team_highlight_info1_LeagueNameDD")?.textContent
  );
  const division = normalizeWhitespace(
    doc.querySelector("#Team_highlight_info1_DivisionNameDD")?.textContent
  );

  const recordPairs = {};
  const recordsDl = doc.querySelector(".records dl");
  if (recordsDl) {
    const children = [...recordsDl.children];
    for (let index = 0; index < children.length; index += 2) {
      const term = normalizeWhitespace(children[index]?.textContent);
      const value = normalizeWhitespace(children[index + 1]?.textContent);
      if (term) recordPairs[term] = value;
    }
  }

  const topRecordValues = [...doc.querySelectorAll("#Team_highlight_info1_TeamRecord dd")]
    .map((node) => normalizeWhitespace(node.textContent))
    .filter(Boolean);
  const [topOverall, topRegion, nationalRankText, stateRankText] = topRecordValues;

  const games = [...doc.querySelectorAll("table.schedule tbody tr")].map((row) => {
    const eventDate = normalizeWhitespace(
      row.querySelector(".event-date")?.textContent
    );
    const eventTime = normalizeWhitespace(
      row.querySelector(".event-time")?.textContent
    );
    const titleTime = row.querySelector(".event-time")?.getAttribute("title") || "";
    const opponentLink = row.querySelector(".contest-name a");
    const opponentName = normalizeWhitespace(
      opponentLink?.childNodes?.[0]?.textContent || opponentLink?.textContent
    );
    const cityState = normalizeWhitespace(
      row.querySelector(".contest-city-state")?.textContent
    ).replace(/^\(|\)$/g, "");
    const locationDetail = normalizeWhitespace(
      row.querySelector(".contest-location")?.textContent
    );
    const scoreLink = row.querySelector(".result a.score");
    const scoreText = normalizeWhitespace(scoreLink?.textContent);
    const scoreMatch = scoreText.match(/\(([WL])\)\s*(\d+)\s*-\s*(\d+)/i);
    const result = scoreMatch?.[1] || "";
    const winnerScore = Number(scoreMatch?.[2] || 0);
    const loserScore = Number(scoreMatch?.[3] || 0);
    const isAway = Boolean(row.querySelector(".away-indicator"));
    const opponentTypeClasses = opponentLink?.className || "";
    const isRegionGame = opponentTypeClasses.includes("contest-type-conference");
    const opponentUrl = opponentLink?.getAttribute("href") || "";
    const gameUrl = scoreLink?.getAttribute("href") || "";

    let venue = "";
    let notes = "";
    if (locationDetail.startsWith("Location:")) {
      venue = normalizeWhitespace(locationDetail.replace(/^Location:/, ""));
    } else if (locationDetail.startsWith("Game Details:")) {
      notes = normalizeWhitespace(locationDetail.replace(/^Game Details:/, ""));
    } else {
      notes = locationDetail;
    }

    const isoDate = isoDateFromMonthDay(eventDate);
    const gameId = Number(isoDate.replace(/-/g, ""));

    return {
      GameID: gameId,
      Season: SEASON_ID,
      SeasonID: SEASON_ID,
      DisplaySeason: DISPLAY_SEASON,
      SourceSeasonLabel: SOURCE_SEASON_LABEL,
      Date: isoDate,
      Time: eventTime,
      SourceEventTime: titleTime,
      TeamID: TEAM_ID,
      Team: TEAM_NAME,
      Opponent: opponentName,
      OpponentLocation: cityState,
      OpponentSlug: slugify(`${opponentName} ${cityState}`),
      OpponentUrl: absolutizeMaxPrepsUrl(opponentUrl),
      GameUrl: absolutizeMaxPrepsUrl(gameUrl),
      LocationType: isAway ? "Away" : "Home",
      Venue: venue,
      Notes: notes,
      GameType: isRegionGame ? "Region" : "Regular Season",
      Result: result,
      TeamScore: result === "W" ? winnerScore : loserScore,
      OpponentScore: result === "W" ? loserScore : winnerScore,
    };
  });

  const homeRecord = parseRecord(recordPairs.Home || "0-0-0");
  const awayRecord = parseRecord(recordPairs.Away || "0-0-0");
  const neutralRecord = parseRecord(recordPairs.Neutral || "0-0-0");
  const overallParsed = parseRecord(overallRecord);
  const regionParsed = parseRecord(regionRecord);

  return {
    games,
    seasonMeta: {
      SeasonID: SEASON_ID,
      DisplaySeason: DISPLAY_SEASON,
      SourceSeasonLabel: SOURCE_SEASON_LABEL,
      TeamID: TEAM_ID,
      TeamName: TEAM_NAME,
      TeamLevel: TEAM_LEVEL,
      League: league,
      Division: division,
      OverallRecord: topOverall || overallRecord,
      RegionRecord: topRegion || regionRecord,
      OverallWins: overallParsed.wins,
      OverallLosses: overallParsed.losses,
      OverallTies: overallParsed.ties,
      RegionWins: regionParsed.wins,
      RegionLosses: regionParsed.losses,
      RegionTies: regionParsed.ties,
      HomeWins: homeRecord.wins,
      HomeLosses: homeRecord.losses,
      AwayWins: awayRecord.wins,
      AwayLosses: awayRecord.losses,
      NeutralWins: neutralRecord.wins,
      NeutralLosses: neutralRecord.losses,
      PointsFor: Number(recordPairs.PF || 0),
      PointsAgainst: Number(recordPairs.PA || 0),
      WinPct: parseNumberText(recordPairs["Win %"]),
      NationalRank: parseNumberText(nationalRankText),
      StateRank: parseNumberText(stateRankText),
      SourceUrls: SOURCE_URLS,
    },
  };
}

function gradeLabelFromClassYear(classYear) {
  switch (Number(classYear)) {
    case 9:
      return "Fr.";
    case 10:
      return "So.";
    case 11:
      return "Jr.";
    case 12:
      return "Sr.";
    default:
      return "";
  }
}

function heightLabel(player) {
  const feet = Number(player.heightFeet);
  const inches = Number(player.heightInches);
  if (!Number.isFinite(feet) || !Number.isFinite(inches)) return "";
  if (feet === 0 && inches === 0) return "";
  return `${feet}'${inches}"`;
}

function parseRoster(html) {
  const nextData = parseNextData(html);
  const pageProps = nextData?.props?.pageProps || {};
  const teamContext = pageProps.teamContext?.data || {};
  const roster = Array.isArray(pageProps.roster) ? pageProps.roster : [];
  const staffRoster = Array.isArray(pageProps.staffRoster) ? pageProps.staffRoster : [];

  const headCoachRecord = staffRoster.find((entry) => entry?.position === "Head Coach");
  const headCoach = headCoachRecord
    ? normalizeWhitespace(`${headCoachRecord.userFirstName} ${headCoachRecord.userLastName}`)
    : "";

  const players = roster.map((player) => {
    const playerId = String(player.athleteId);
    const fullName = normalizeWhitespace(`${player.firstName} ${player.lastName}`);
    return {
      PlayerID: playerId,
      FirstName: normalizeWhitespace(player.firstName),
      LastName: normalizeWhitespace(player.lastName),
      PlayerName: fullName,
      ClassYear: Number(player.classYear) || null,
      Grade: gradeLabelFromClassYear(player.classYear),
      CanonicalUrl: player.canonicalUrl || "",
      MaxPrepsAthleteId: playerId,
      Positions: [player.position1, player.position2, player.position3]
        .map(normalizeWhitespace)
        .filter(Boolean),
      Height: heightLabel(player),
      Weight: Number(player.weight) || null,
      Captain: Boolean(player.isCaptain),
      HasStats: Boolean(player.hasStats),
    };
  });

  const rosterEntries = players.map((player) => ({
    PlayerID: player.PlayerID,
    JerseyNumber:
      normalizeWhitespace(
        roster.find((entry) => String(entry.athleteId) === player.PlayerID)?.jersey
      ) || "",
    Grade: player.Grade,
    ClassYear: player.ClassYear,
    Positions: player.Positions,
    Height: player.Height,
    Weight: player.Weight,
    Captain: player.Captain,
    CanonicalUrl: player.CanonicalUrl,
    HasStats: player.HasStats,
  }));

  return {
    players,
    seasonRosters: [
      {
        SeasonID: String(SEASON_ID),
        DisplaySeason: DISPLAY_SEASON,
        SourceSeasonLabel: SOURCE_SEASON_LABEL,
        TeamLevel: TEAM_LEVEL,
        TeamID: TEAM_ID,
        TeamName: TEAM_NAME,
        HeadCoach: headCoach,
        Staff: staffRoster.map((entry) => ({
          Name: normalizeWhitespace(`${entry.userFirstName} ${entry.userLastName}`),
          Position: normalizeWhitespace(entry.position),
        })),
        Players: rosterEntries,
        School: {
          Name: "St. Andrew's High School",
          Mascot: teamContext.schoolMascot || "Lions",
          Colors: [teamContext.schoolColor1, teamContext.schoolColor2]
            .map((color) => (color ? `#${String(color).replace(/^#/, "")}` : ""))
            .filter(Boolean),
          Address: normalizeWhitespace(teamContext.schoolAddress),
          City: normalizeWhitespace(teamContext.schoolMailingCity || "Savannah"),
          State: normalizeWhitespace(teamContext.schoolMailingState || "GA"),
          PostalCode: normalizeWhitespace(teamContext.schoolZipCode || teamContext.schoolMailingZip),
          Phone: normalizeWhitespace(teamContext.schoolPhone),
          SchoolUrl: teamContext.schoolCanonicalUrl || "",
        },
      },
    ],
    headCoach,
    teamContext,
  };
}

function parseStatTable(table, playerMap) {
  const title = normalizeWhitespace(table.previousElementSibling?.textContent);
  const headingId = table.previousElementSibling?.id || slugify(title);

  const columns = [...table.querySelectorAll("thead th")].map((header) => {
    const key =
      [...header.classList].find(
        (className) =>
          !["first", "last", "sorted", "asc", "dw", "number", "string", "stat"].includes(
            className
          )
      ) || slugify(header.textContent);

    return {
      key,
      label: normalizeWhitespace(header.textContent),
    };
  });

  const totals = {};
  const totalCells = [
    ...table.querySelectorAll("tfoot tr:first-child th, tfoot tr:first-child td"),
  ];
  totalCells.forEach((cell, index) => {
    const column = columns[index];
    if (!column) return;
    totals[column.key] = normalizeWhitespace(cell.textContent);
  });

  const rows = [...table.querySelectorAll("tbody tr")].map((row) => {
    const jersey = normalizeWhitespace(row.querySelector("td.jersey")?.textContent);
    const nameLink = row.querySelector("th.name a");
    const fullName =
      normalizeWhitespace(nameLink?.getAttribute("title")) ||
      normalizeWhitespace(nameLink?.textContent);
    const href = nameLink?.getAttribute("href") || "";
    const athleteId =
      href.match(/athleteid=([0-9a-f-]+)/i)?.[1] ||
      [...playerMap.entries()].find(([, player]) => player.PlayerName === fullName)?.[0] ||
      "";
    const player = playerMap.get(athleteId);

    const values = {};
    const cells = [...row.querySelectorAll("td, th")];
    cells.forEach((cell, index) => {
      const column = columns[index];
      if (!column) return;
      values[column.key] = normalizeWhitespace(cell.textContent);
    });

    return {
      PlayerID: athleteId,
      PlayerName: player?.PlayerName || fullName,
      CanonicalUrl: player?.CanonicalUrl || "",
      JerseyNumber: jersey,
      Grade: player?.Grade || normalizeWhitespace(row.querySelector(".class-year")?.textContent).replace(/[()]/g, ""),
      Values: values,
    };
  });

  return {
    TableID: headingId,
    Title: title,
    Columns: columns,
    Totals: totals,
    Rows: rows,
  };
}

function parseStats(html, players) {
  const doc = makeDom(html);
  const playerMap = new Map(players.map((player) => [String(player.PlayerID), player]));
  const sections = [];

  const sectionHeadings = [...doc.querySelectorAll("h2")];
  sectionHeadings.forEach((sectionHeading) => {
    const sectionTitle = normalizeWhitespace(sectionHeading.textContent);
    const sectionId = sectionHeading.id || slugify(sectionTitle);
    const tables = [];
    let node = sectionHeading.nextElementSibling;

    while (node && node.tagName !== "H2") {
      if (node.tagName === "TABLE" && node.previousElementSibling?.tagName === "H3") {
        tables.push(parseStatTable(node, playerMap));
      }
      node = node.nextElementSibling;
    }

    sections.push({
      SectionID: sectionId,
      Title: sectionTitle,
      Tables: tables,
    });
  });

  return {
    SeasonID: SEASON_ID,
    DisplaySeason: DISPLAY_SEASON,
    SourceSeasonLabel: SOURCE_SEASON_LABEL,
    SourceUrl: SOURCE_URLS.stats,
    Sections: sections,
  };
}

function buildSeasonRecord(scheduleMeta, headCoach) {
  return [
    {
      SeasonID: SEASON_ID,
      DisplaySeason: DISPLAY_SEASON,
      SourceSeasonLabel: SOURCE_SEASON_LABEL,
      HeadCoach: headCoach || "",
      TeamLevel: TEAM_LEVEL,
      TeamName: TEAM_NAME,
      League: scheduleMeta.League,
      Division: scheduleMeta.Division,
      OverallRecord: scheduleMeta.OverallRecord,
      RegionRecord: scheduleMeta.RegionRecord,
      OverallWins: scheduleMeta.OverallWins,
      OverallLosses: scheduleMeta.OverallLosses,
      RegionWins: scheduleMeta.RegionWins,
      RegionLosses: scheduleMeta.RegionLosses,
      HomeWins: scheduleMeta.HomeWins,
      HomeLosses: scheduleMeta.HomeLosses,
      AwayWins: scheduleMeta.AwayWins,
      AwayLosses: scheduleMeta.AwayLosses,
      NeutralWins: scheduleMeta.NeutralWins,
      NeutralLosses: scheduleMeta.NeutralLosses,
      PointsFor: scheduleMeta.PointsFor,
      PointsAgainst: scheduleMeta.PointsAgainst,
      NationalRank: scheduleMeta.NationalRank,
      StateRank: scheduleMeta.StateRank,
      SeasonResult:
        `${scheduleMeta.League} • ${scheduleMeta.RegionRecord} region record`,
      SourceUrls: scheduleMeta.SourceUrls,
    },
  ];
}

function main() {
  ensureDir(DATA_DIR);

  const scheduleHtml = fs.readFileSync(INPUTS.schedule, "utf8");
  const rosterHtml = fs.readFileSync(INPUTS.roster, "utf8");
  const statsHtml = fs.readFileSync(INPUTS.stats, "utf8");

  const { games, seasonMeta } = parseSchedule(makeDom(scheduleHtml));
  const { players, seasonRosters, headCoach } = parseRoster(rosterHtml);
  const seasonStats = parseStats(statsHtml, players);
  const seasons = buildSeasonRecord(seasonMeta, headCoach);

  const outputs = [
    writeJson("games.json", games),
    writeJson("players.json", players),
    writeJson("seasonrosters.json", seasonRosters),
    writeJson("seasonstats.json", seasonStats),
    writeJson("seasons.json", seasons),
  ];

  console.log("Football data written:");
  outputs.forEach((outputPath) => console.log(`- ${path.relative(ROOT, outputPath)}`));
}

main();
