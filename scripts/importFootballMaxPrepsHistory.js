const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { JSDOM, VirtualConsole } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "public", "data", "boys", "football");

const TEAM_ID = "ga-savannah-st-andrews-lions-football";
const TEAM_NAME = "St. Andrew's Lions";
const TEAM_LEVEL = "Varsity";
const HOME_URL = "https://www.maxpreps.com/ga/savannah/st-andrews-lions/football/";
const CURL_MAX_BUFFER = 50 * 1024 * 1024;

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(fileName, value) {
  const outputPath = path.join(DATA_DIR, fileName);
  fs.writeFileSync(outputPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return outputPath;
}

function fetchHtml(url) {
  return execFileSync("curl", ["-sL", "--compressed", url], {
    encoding: "utf8",
    maxBuffer: CURL_MAX_BUFFER,
  });
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

function parseNextData(html, label) {
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
  );

  if (!match) {
    throw new Error(`Could not locate __NEXT_DATA__ in ${label}.`);
  }

  return JSON.parse(match[1]);
}

function slugify(text) {
  return normalizeWhitespace(text)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseRecord(recordText) {
  const [wins = 0, losses = 0, ties = 0] = String(recordText)
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

function isNotFoundHtml(html) {
  const sample = String(html ?? "").slice(0, 2000).toLowerCase();
  return sample.includes("<title>404 - not found</title>") || sample.includes(">404 - not found<");
}

function parseSeasonYearCode(yearCode) {
  const match = String(yearCode).match(/^(\d{2})-(\d{2})$/);
  if (!match) {
    throw new Error(`Unexpected MaxPreps season code: ${yearCode}`);
  }

  const startSuffix = Number(match[1]);
  const startYear = startSuffix >= 90 ? 1900 + startSuffix : 2000 + startSuffix;

  return {
    seasonId: startYear,
    displaySeason: String(startYear),
    sourceSeasonLabel: `${startYear}-${match[2]}`,
    yearCode: `${match[1]}-${match[2]}`,
  };
}

function seasonContextFromEntry(entry) {
  const yearInfo = parseSeasonYearCode(entry.year);

  return {
    seasonId: yearInfo.seasonId,
    displaySeason: yearInfo.displaySeason,
    sourceSeasonLabel: yearInfo.sourceSeasonLabel,
    yearCode: yearInfo.yearCode,
    schoolId: entry.schoolId,
    sportSeasonId: entry.sportSeasonId,
    canonicalUrl: entry.canonicalUrl,
  };
}

function buildSchedulePrintUrl(context) {
  return `https://www.maxpreps.com/print/schedule.aspx?schoolid=${context.schoolId}&ssid=${context.sportSeasonId}&print=1`;
}

function buildStatsPrintUrl(context) {
  return `https://www.maxpreps.com/print/team_stats.aspx?admin=0&bygame=0&league=0&print=1&schoolid=${context.schoolId}&ssid=${context.sportSeasonId}`;
}

function buildPlayerStatsUrl(context, playerId) {
  return `https://www.maxpreps.com/local/player/stats.aspx?athleteid=${encodeURIComponent(
    playerId
  )}&ssid=${encodeURIComponent(context.sportSeasonId)}`;
}

function buildRosterPrintUrl(context) {
  const canonicalUrl = String(context.canonicalUrl || "");
  const withTrailingSlash = canonicalUrl.endsWith("/") ? canonicalUrl : `${canonicalUrl}/`;

  if (withTrailingSlash.endsWith("/schedule/")) {
    return `${withTrailingSlash.replace(/schedule\/$/, "roster/print/")}?print=1`;
  }

  return `${withTrailingSlash}roster/print/?print=1`;
}

function isoDateFromMonthDay(monthDay, year) {
  const [monthText, dayText] = String(monthDay).split("/");
  const month = Number(monthText);
  const day = Number(dayText);

  if (!month || !day) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isoDateFromStamp(stamp) {
  const text = normalizeWhitespace(stamp);
  return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : "";
}

function gameIdFromIsoDate(isoDate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(isoDate))) {
    return 0;
  }

  return Number(String(isoDate).replace(/-/g, "")) || 0;
}

function careerIdFromCanonicalUrl(canonicalUrl) {
  const match = String(canonicalUrl || "").match(/[?&]careerid=([^&#]+)/i);
  return match ? decodeURIComponent(match[1]) : "";
}

function schedulePageFallbackMeta(html) {
  const nextData = parseNextData(html, "schedule page");
  const pageProps = nextData?.props?.pageProps || {};
  const teamContext = pageProps.teamContext || {};
  const teamData = teamContext.data || {};
  const standingsData = teamContext.standingsData || {};
  const overallStanding = standingsData.overallStanding || {};
  const leagueStanding = standingsData.leagueStanding || {};

  return {
    coachName: normalizeWhitespace(teamData.coachName),
    leagueName: normalizeWhitespace(teamData.leagueName || leagueStanding.leagueName),
    divisionName: normalizeWhitespace(teamData.stateDivisionName),
    overallRecord: normalizeWhitespace(overallStanding.overallWinLossTies),
    regionRecord: normalizeWhitespace(leagueStanding.conferenceWinLossTies),
    homeRecord: normalizeWhitespace(overallStanding.homeWinLossTies),
    awayRecord: normalizeWhitespace(overallStanding.awayWinLossTies),
    neutralRecord: normalizeWhitespace(overallStanding.neutralWinLossTies),
    pointsFor: parseNumberText(overallStanding.points),
    pointsAgainst: parseNumberText(overallStanding.pointsAgainst),
    conferencePlacement: normalizeWhitespace(leagueStanding.conferenceStandingPlacement),
  };
}

function parseSchedule(doc, context, fallbackMeta) {
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
    const eventDate = normalizeWhitespace(row.querySelector(".event-date")?.textContent);
    const eventTime = normalizeWhitespace(row.querySelector(".event-time")?.textContent);
    const titleTime = row.querySelector(".event-time")?.getAttribute("title") || "";
    const opponentLink = row.querySelector(".contest-name a");
    const opponentName = normalizeWhitespace(
      opponentLink?.childNodes?.[0]?.textContent || opponentLink?.textContent
    );
    const cityState = normalizeWhitespace(
      row.querySelector(".contest-city-state")?.textContent
    ).replace(/^\(|\)$/g, "");
    const locationDetail = normalizeWhitespace(row.querySelector(".contest-location")?.textContent);
    const scoreLink = row.querySelector(".result a.score");
    const scoreText = normalizeWhitespace(scoreLink?.textContent);
    const scoreMatch = scoreText.match(/\(([WLT])\)\s*(\d+)\s*-\s*(\d+)/i);
    const result = scoreMatch?.[1] || "";
    const scoreA = Number(scoreMatch?.[2] || 0);
    const scoreB = Number(scoreMatch?.[3] || 0);
    const isAway = Boolean(row.querySelector(".away-indicator"));
    const isNeutral = Boolean(row.querySelector(".neutral-indicator"));
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

    const isoDate = isoDateFromMonthDay(eventDate, context.seasonId);
    const gameId = Number(isoDate.replace(/-/g, ""));
    const locationType = isNeutral ? "Neutral" : isAway ? "Away" : "Home";

    return {
      GameID: gameId,
      Season: context.seasonId,
      SeasonID: context.seasonId,
      DisplaySeason: context.displaySeason,
      SourceSeasonLabel: context.sourceSeasonLabel,
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
      LocationType: locationType,
      Venue: venue,
      Notes: notes,
      GameType: isRegionGame ? "Region" : "Regular Season",
      Result: result,
      TeamScore: result === "W" ? scoreA : result === "L" ? scoreB : scoreA || null,
      OpponentScore: result === "W" ? scoreB : result === "L" ? scoreA : scoreB || null,
    };
  });

  const overallParsed = parseRecord(topOverall || overallRecord || fallbackMeta.overallRecord || "0-0-0");
  const regionParsed = parseRecord(topRegion || regionRecord || fallbackMeta.regionRecord || "0-0-0");
  const homeParsed = parseRecord(recordPairs.Home || fallbackMeta.homeRecord || "0-0-0");
  const awayParsed = parseRecord(recordPairs.Away || fallbackMeta.awayRecord || "0-0-0");
  const neutralParsed = parseRecord(recordPairs.Neutral || fallbackMeta.neutralRecord || "0-0-0");

  return {
    games,
    seasonMeta: {
      SeasonID: context.seasonId,
      DisplaySeason: context.displaySeason,
      SourceSeasonLabel: context.sourceSeasonLabel,
      TeamID: TEAM_ID,
      TeamName: TEAM_NAME,
      TeamLevel: TEAM_LEVEL,
      League: league || fallbackMeta.leagueName || "",
      Division: division || fallbackMeta.divisionName || "",
      OverallRecord: topOverall || overallRecord || fallbackMeta.overallRecord || "",
      RegionRecord: topRegion || regionRecord || fallbackMeta.regionRecord || "",
      OverallWins: overallParsed.wins,
      OverallLosses: overallParsed.losses,
      OverallTies: overallParsed.ties,
      RegionWins: regionParsed.wins,
      RegionLosses: regionParsed.losses,
      RegionTies: regionParsed.ties,
      HomeWins: homeParsed.wins,
      HomeLosses: homeParsed.losses,
      HomeTies: homeParsed.ties,
      AwayWins: awayParsed.wins,
      AwayLosses: awayParsed.losses,
      AwayTies: awayParsed.ties,
      NeutralWins: neutralParsed.wins,
      NeutralLosses: neutralParsed.losses,
      NeutralTies: neutralParsed.ties,
      PointsFor: parseNumberText(recordPairs.PF) ?? fallbackMeta.pointsFor ?? 0,
      PointsAgainst: parseNumberText(recordPairs.PA) ?? fallbackMeta.pointsAgainst ?? 0,
      NationalRank: parseNumberText(nationalRankText),
      StateRank: parseNumberText(stateRankText),
      ConferencePlacement: fallbackMeta.conferencePlacement || "",
      SourceUrls: {
        schedule: buildSchedulePrintUrl(context),
        roster: buildRosterPrintUrl(context),
        stats: buildStatsPrintUrl(context),
      },
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

function parseRoster(html, context) {
  const nextData = parseNextData(html, `roster page for ${context.sourceSeasonLabel}`);
  const pageProps = nextData?.props?.pageProps || {};
  const teamContext = pageProps.teamContext?.data || {};
  const roster = Array.isArray(pageProps.roster) ? pageProps.roster : [];
  const hasSeasonRoster = roster.length > 0;
  const staffRoster = hasSeasonRoster && Array.isArray(pageProps.staffRoster) ? pageProps.staffRoster : [];

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
    seasonRoster: {
      SeasonID: String(context.seasonId),
      DisplaySeason: context.displaySeason,
      SourceSeasonLabel: context.sourceSeasonLabel,
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
        Name: normalizeWhitespace(teamContext.schoolFormattedName || "St. Andrew's High School"),
        Mascot: normalizeWhitespace(teamContext.schoolMascot || "Lions"),
        Colors: [teamContext.schoolColor1, teamContext.schoolColor2]
          .map((color) => (color ? `#${String(color).replace(/^#/, "")}` : ""))
          .filter(Boolean),
        Address: normalizeWhitespace(teamContext.schoolAddress),
        City: normalizeWhitespace(teamContext.schoolCity || teamContext.schoolMailingCity || "Savannah"),
        State: normalizeWhitespace(teamContext.stateCode || teamContext.schoolMailingState || "GA"),
        PostalCode: normalizeWhitespace(teamContext.schoolZipCode || teamContext.schoolMailingZip),
        Phone: normalizeWhitespace(teamContext.schoolPhone),
        SchoolUrl: teamContext.schoolCanonicalUrl || "",
      },
    },
    trustedHeadCoach: headCoach,
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
      Grade:
        player?.Grade ||
        normalizeWhitespace(row.querySelector(".class-year")?.textContent).replace(/[()]/g, ""),
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

function parseStats(html, players, context) {
  if (isNotFoundHtml(html)) {
    return null;
  }

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

    if (tables.length > 0) {
      sections.push({
        SectionID: sectionId,
        Title: sectionTitle,
        Tables: tables,
      });
    }
  });

  if (sections.length === 0) {
    return null;
  }

  return {
    SeasonID: context.seasonId,
    DisplaySeason: context.displaySeason,
    SourceSeasonLabel: context.sourceSeasonLabel,
    SourceUrl: buildStatsPrintUrl(context),
    Sections: sections,
  };
}

function collectSeasonStatPlayerIds(statsRecord) {
  const playerIds = new Set();

  (statsRecord?.Sections || []).forEach((section) => {
    (section?.Tables || []).forEach((table) => {
      (table?.Rows || []).forEach((row) => {
        const playerId = String(row?.PlayerID || "");
        if (playerId) {
          playerIds.add(playerId);
        }
      });
    });
  });

  return playerIds;
}

function parsePlayerGameLogs(html, player, context) {
  if (isNotFoundHtml(html)) {
    return [];
  }

  const nextData = parseNextData(
    html,
    `player stats page for ${player?.PlayerName || player?.PlayerID || "unknown player"}`
  );
  const statsCardProps = nextData?.props?.pageProps?.statsCardProps || {};
  const groups = Array.isArray(statsCardProps?.careerGameLogs?.groups)
    ? statsCardProps.careerGameLogs.groups
    : [];

  if (groups.length === 0) {
    return [];
  }

  const canonicalUrl =
    player?.CanonicalUrl || normalizeWhitespace(statsCardProps.careerCanonicalUrl);
  const careerId = careerIdFromCanonicalUrl(canonicalUrl);
  const playerName =
    player?.PlayerName ||
    normalizeWhitespace(`${statsCardProps.firstName || ""} ${statsCardProps.lastName || ""}`) ||
    "Unknown";

  const rowsByGameKey = new Map();

  groups.forEach((group) => {
    const subgroups = Array.isArray(group?.subgroups) ? group.subgroups : [];

    subgroups.forEach((subgroup) => {
      const games = Array.isArray(subgroup?.stats) ? subgroup.stats : [];

      games.forEach((game) => {
        const isoDate =
          isoDateFromStamp(game?.stamp) || isoDateFromMonthDay(game?.date, context.seasonId);
        const gameUrl = absolutizeMaxPrepsUrl(game?.contestUrl);
        const opponentUrl = absolutizeMaxPrepsUrl(game?.opponentUrl);
        const opponentName = normalizeWhitespace(game?.opponentSchoolName || game?.opponent);
        const gameKey = gameUrl || `${isoDate}|${opponentName}|${normalizeWhitespace(game?.score)}`;

        if (!gameKey) {
          return;
        }

        if (!rowsByGameKey.has(gameKey)) {
          rowsByGameKey.set(gameKey, {
            SeasonID: context.seasonId,
            DisplaySeason: context.displaySeason,
            SourceSeasonLabel: context.sourceSeasonLabel,
            PlayerID: String(player?.PlayerID || ""),
            PlayerName: playerName,
            CanonicalUrl: canonicalUrl,
            CareerID: careerId,
            Date: isoDate,
            GameID: gameIdFromIsoDate(isoDate),
            Stamp: normalizeWhitespace(game?.stamp),
            Result: normalizeWhitespace(game?.result),
            Score: normalizeWhitespace(game?.score),
            OpponentShortName: normalizeWhitespace(game?.opponent),
            Opponent: opponentName,
            OpponentUrl: opponentUrl,
            GameUrl: gameUrl,
            SourceUrl: buildPlayerStatsUrl(context, player?.PlayerID || ""),
          });
        }

        const row = rowsByGameKey.get(gameKey);
        const statItems = Array.isArray(game?.stats) ? game.stats : [];

        statItems.forEach((stat) => {
          const statName = normalizeWhitespace(stat?.name);
          if (!statName) return;

          const parsedValue = parseNumberText(stat?.value);
          if (parsedValue === null) return;

          row[statName] = parsedValue;
        });
      });
    });
  });

  return Array.from(rowsByGameKey.values()).filter((row) =>
    Object.keys(row).some(
      (key) =>
        ![
          "SeasonID",
          "DisplaySeason",
          "SourceSeasonLabel",
          "PlayerID",
          "PlayerName",
          "CanonicalUrl",
          "CareerID",
          "Date",
          "GameID",
          "Stamp",
          "Result",
          "Score",
          "OpponentShortName",
          "Opponent",
          "OpponentUrl",
          "GameUrl",
          "SourceUrl",
        ].includes(key)
    )
  );
}

function mergePlayer(existing, incoming) {
  if (!existing) {
    return {
      ...incoming,
      Positions: Array.isArray(incoming.Positions) ? [...incoming.Positions] : [],
    };
  }

  const mergedPositions = Array.from(
    new Set([...(existing.Positions || []), ...(incoming.Positions || [])].filter(Boolean))
  );

  return {
    ...existing,
    ...incoming,
    FirstName: existing.FirstName || incoming.FirstName,
    LastName: existing.LastName || incoming.LastName,
    PlayerName: existing.PlayerName || incoming.PlayerName,
    Grade: existing.Grade || incoming.Grade,
    ClassYear: existing.ClassYear ?? incoming.ClassYear ?? null,
    CanonicalUrl: existing.CanonicalUrl || incoming.CanonicalUrl,
    MaxPrepsAthleteId: existing.MaxPrepsAthleteId || incoming.MaxPrepsAthleteId,
    Height: existing.Height || incoming.Height,
    Weight: existing.Weight ?? incoming.Weight ?? null,
    Captain: existing.Captain || incoming.Captain,
    HasStats: existing.HasStats || incoming.HasStats,
    Positions: mergedPositions,
  };
}

function buildSeasonResult(scheduleMeta) {
  const detailParts = [];

  if (scheduleMeta.ConferencePlacement) {
    detailParts.push(`${scheduleMeta.ConferencePlacement} in region`);
  }

  if (scheduleMeta.RegionRecord) {
    detailParts.push(`${scheduleMeta.RegionRecord} region record`);
  }

  if (scheduleMeta.League) {
    return detailParts.length > 0
      ? `${scheduleMeta.League} • ${detailParts.join(" • ")}`
      : scheduleMeta.League;
  }

  return detailParts.join(" • ");
}

function buildSeasonRecord(context, scheduleMeta, headCoach) {
  return {
    SeasonID: context.seasonId,
    DisplaySeason: context.displaySeason,
    SourceSeasonLabel: context.sourceSeasonLabel,
    HeadCoach: headCoach || "",
    TeamLevel: TEAM_LEVEL,
    TeamName: TEAM_NAME,
    League: scheduleMeta.League,
    Division: scheduleMeta.Division,
    OverallRecord: scheduleMeta.OverallRecord,
    RegionRecord: scheduleMeta.RegionRecord,
    OverallWins: scheduleMeta.OverallWins,
    OverallLosses: scheduleMeta.OverallLosses,
    OverallTies: scheduleMeta.OverallTies,
    RegionWins: scheduleMeta.RegionWins,
    RegionLosses: scheduleMeta.RegionLosses,
    RegionTies: scheduleMeta.RegionTies,
    HomeWins: scheduleMeta.HomeWins,
    HomeLosses: scheduleMeta.HomeLosses,
    HomeTies: scheduleMeta.HomeTies,
    AwayWins: scheduleMeta.AwayWins,
    AwayLosses: scheduleMeta.AwayLosses,
    AwayTies: scheduleMeta.AwayTies,
    NeutralWins: scheduleMeta.NeutralWins,
    NeutralLosses: scheduleMeta.NeutralLosses,
    NeutralTies: scheduleMeta.NeutralTies,
    PointsFor: scheduleMeta.PointsFor,
    PointsAgainst: scheduleMeta.PointsAgainst,
    NationalRank: scheduleMeta.NationalRank,
    StateRank: scheduleMeta.StateRank,
    SeasonResult: buildSeasonResult(scheduleMeta),
    SourceUrls: scheduleMeta.SourceUrls,
  };
}

function main() {
  ensureDir(DATA_DIR);

  const homeHtml = fetchHtml(HOME_URL);
  const homeData = parseNextData(homeHtml, "football home page");
  const rawSeasonEntries = homeData?.props?.pageProps?.teamContext?.teamSeasonPickerData;

  if (!Array.isArray(rawSeasonEntries) || rawSeasonEntries.length === 0) {
    throw new Error("Could not locate football season picker data on MaxPreps.");
  }

  const seasonEntries = rawSeasonEntries
    .filter(
      (entry) =>
        entry?.sport === "Football" &&
        entry?.teamLevel === TEAM_LEVEL &&
        entry?.isPublished
    )
    .map((entry) => ({ ...entry, context: seasonContextFromEntry(entry) }))
    .sort((a, b) => a.context.seasonId - b.context.seasonId);

  const games = [];
  const seasons = [];
  const seasonRosters = [];
  const seasonStats = [];
  const playerGameLogs = [];
  const playersById = new Map();

  seasonEntries.forEach((entry) => {
    const { context } = entry;
    console.log(`Importing football season ${context.sourceSeasonLabel}...`);

    const schedulePageHtml = context.canonicalUrl === HOME_URL ? homeHtml : fetchHtml(context.canonicalUrl);
    const scheduleFallbackMeta = schedulePageFallbackMeta(schedulePageHtml);
    const scheduleHtml = fetchHtml(buildSchedulePrintUrl(context));
    const { games: seasonGames, seasonMeta } = parseSchedule(
      makeDom(scheduleHtml),
      context,
      scheduleFallbackMeta
    );

    const rosterHtml = fetchHtml(buildRosterPrintUrl(context));
    const { players: seasonPlayers, seasonRoster, trustedHeadCoach } = parseRoster(rosterHtml, context);

    seasonPlayers.forEach((player) => {
      const key = String(player.PlayerID);
      playersById.set(key, mergePlayer(playersById.get(key), player));
    });

    const resolvedHeadCoach =
      scheduleFallbackMeta.coachName || trustedHeadCoach || seasonRoster.HeadCoach || "";

    seasonRoster.HeadCoach = resolvedHeadCoach;
    seasonRosters.push(seasonRoster);

    const statsHtml = fetchHtml(buildStatsPrintUrl(context));
    const statsRecord = parseStats(statsHtml, seasonPlayers, context);
    if (statsRecord) {
      seasonStats.push(statsRecord);

      const seasonPlayersById = new Map(
        seasonPlayers.map((seasonPlayer) => [String(seasonPlayer.PlayerID), seasonPlayer])
      );
      const playerIds = Array.from(collectSeasonStatPlayerIds(statsRecord)).sort((a, b) =>
        String(seasonPlayersById.get(a)?.PlayerName || a).localeCompare(
          String(seasonPlayersById.get(b)?.PlayerName || b)
        )
      );

      playerIds.forEach((playerId) => {
        const player =
          seasonPlayersById.get(playerId) ||
          playersById.get(playerId) || {
            PlayerID: playerId,
            PlayerName: "Unknown",
            CanonicalUrl: "",
          };

        const playerStatsHtml = fetchHtml(buildPlayerStatsUrl(context, playerId));
        const seasonGameLogs = parsePlayerGameLogs(playerStatsHtml, player, context);
        playerGameLogs.push(...seasonGameLogs);
      });
    }

    games.push(...seasonGames);
    seasons.push(buildSeasonRecord(context, seasonMeta, resolvedHeadCoach));
  });

  const playerList = Array.from(playersById.values()).sort((a, b) =>
    String(a.PlayerName || "").localeCompare(String(b.PlayerName || ""))
  );

  games.sort((a, b) => {
    if (Number(a.SeasonID) !== Number(b.SeasonID)) {
      return Number(a.SeasonID) - Number(b.SeasonID);
    }
    return Number(a.GameID) - Number(b.GameID);
  });

  seasonRosters.sort((a, b) => Number(a.SeasonID) - Number(b.SeasonID));
  seasonStats.sort((a, b) => Number(a.SeasonID) - Number(b.SeasonID));
  seasons.sort((a, b) => Number(a.SeasonID) - Number(b.SeasonID));
  playerGameLogs.sort((a, b) => {
    if (Number(a.SeasonID) !== Number(b.SeasonID)) {
      return Number(a.SeasonID) - Number(b.SeasonID);
    }

    if (String(a.Date) !== String(b.Date)) {
      return String(a.Date).localeCompare(String(b.Date));
    }

    return String(a.PlayerName || "").localeCompare(String(b.PlayerName || ""));
  });

  const outputs = [
    writeJson("games.json", games),
    writeJson("players.json", playerList),
    writeJson("seasonrosters.json", seasonRosters),
    writeJson("seasonstats.json", seasonStats),
    writeJson("playergamelogs.json", playerGameLogs),
    writeJson("seasons.json", seasons),
  ];

  console.log("Football data written:");
  outputs.forEach((outputPath) => console.log(`- ${path.relative(ROOT, outputPath)}`));
  console.log(
    `Imported ${seasons.length} seasons, ${games.length} games, ${seasonRosters.length} rosters, ${seasonStats.length} stat seasons, ${playerGameLogs.length} player game-log rows, and ${playerList.length} unique players.`
  );
}

main();
