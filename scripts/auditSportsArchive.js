const fs = require("fs");
const path = require("path");
const vm = require("vm");

const {
  SPORT_CONFIGS,
  TARGET_SCHOOL_YEAR_STARTS,
  isTargetSchoolYear,
  schoolYearLabel,
  schoolYearStartForRow,
} = require("./archiveSportsConfig");

const root = path.resolve(__dirname, "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readJsonOptional(relativePath, fallback = []) {
  const fullPath = path.join(root, relativePath);
  return fs.existsSync(fullPath) ? readJson(relativePath) : fallback;
}

function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function duplicateValues(items, getKey) {
  const counts = new Map();
  for (const item of items) {
    const key = getKey(item);
    if (!hasValue(key)) continue;
    counts.set(String(key), (counts.get(String(key)) || 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([key, count]) => ({ key, count }));
}

function buildSchoolIds() {
  return new Set(readJson("public/data/schools.json").map((school) => String(school.SchoolID)));
}

function buildPlayerIds(config) {
  const players = readJsonOptional("public/data/players.json", []);
  const ids = new Set(players.map((player) => String(player.PlayerID)));
  if (config.localPlayersFile) {
    for (const player of readJsonOptional(`${config.base}/${config.localPlayersFile}`, [])) {
      ids.add(String(player.PlayerID));
    }
  }
  return ids;
}

function getEventFileConfigs(config) {
  return config.eventFiles || [
    {
      file: config.eventFile,
      eventLabel: config.eventLabel,
      eventIdField: config.eventIdField,
      seasonField: config.seasonField,
      completenessField: config.completenessField,
    },
  ];
}

async function loadEvents(config) {
  if (config.jsData) {
    const module = loadJsSportModule(config);
    return [
      {
        ...config,
        file: config.eventFile,
        events: Array.isArray(module.softballGames) ? module.softballGames : [],
      },
    ];
  }

  return getEventFileConfigs(config)
    .map((eventConfig) => {
      const events = readJsonOptional(`${config.base}/${eventConfig.file}`, []);
      return { ...eventConfig, events };
    })
    .filter((entry) => Array.isArray(entry.events));
}

function loadJsSportModule(config) {
  if (config.key !== "girls-softball") {
    throw new Error(`No JS data loader configured for ${config.key}.`);
  }
  return loadSoftballDataFromSource();
}

async function loadSeasons(config) {
  if (config.jsData) {
    const module = loadJsSportModule(config);
    return Array.isArray(module.softballSeasons) ? module.softballSeasons : [];
  }
  return readJsonOptional(`${config.base}/seasons.json`, []);
}

function extractExportedArray(source, exportName) {
  const startToken = `export const ${exportName} = [`;
  const start = source.indexOf(startToken);
  if (start < 0) return [];

  const arrayStart = source.indexOf("[", start);
  let depth = 0;
  let quote = "";
  let escaped = false;

  for (let index = arrayStart; index < source.length; index += 1) {
    const char = source[index];

    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }

    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "[") depth += 1;
    if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        const arraySource = source.slice(arrayStart, index + 1);
        return vm.runInNewContext(arraySource, {}, { timeout: 1000 });
      }
    }
  }

  return [];
}

function softballSchoolYearLabel(season) {
  const springYear = Number(season);
  return Number.isFinite(springYear) ? `${springYear - 1}-${String(springYear).slice(-2)}` : "";
}

function loadSoftballDataFromSource() {
  const source = fs.readFileSync(path.join(root, "src/girls/softball/softballData.js"), "utf8");
  const softballGames = extractExportedArray(source, "softballGames");
  const softballSeasons = extractExportedArray(source, "softballSeasons");

  for (const game of softballGames) {
    if (!game.SourceSeasonLabel) game.SourceSeasonLabel = softballSchoolYearLabel(game.Season || game.season);
    if (game.isPlaceholder) {
      game.BoxScoreCompleteness = game.BoxScoreCompleteness || "placeholder";
      game.SourceNote = game.SourceNote || (game.notes || []).join(" ");
    } else {
      game.SourceCitation =
        game.SourceCitation ||
        "Savannah Morning News box scores recovered from the 2005-06 NewsBank sweep.";
      game.BoxScoreCompleteness = game.BoxScoreCompleteness || (game.lineScore ? "partial" : "missing");
      game.SourceNote =
        game.SourceNote ||
        "Published newspaper line scores and named leaders are preserved; complete pitch-by-pitch box score data was not published.";
    }
  }

  return { softballGames, softballSeasons };
}

function eventId(row, eventConfig, config) {
  return String(row?.[eventConfig.eventIdField || config.eventIdField] ?? "").trim();
}

function resultCounts(events) {
  return events.reduce(
    (counts, event) => {
      const result = String(event.Result || event.result || "").toUpperCase();
      if (result === "W") counts.wins += 1;
      else if (result === "L") counts.losses += 1;
      else if (result === "T") counts.ties += 1;
      return counts;
    },
    { wins: 0, losses: 0, ties: 0 }
  );
}

function recordString(wins, losses, ties = 0) {
  if (!Number.isFinite(Number(wins)) || !Number.isFinite(Number(losses))) return "";
  return Number(ties) ? `${wins}-${losses}-${ties}` : `${wins}-${losses}`;
}

function auditRecordReconciliation(config, seasons, targetEvents) {
  const rows = [];
  const seasonBySchoolYear = new Map(
    seasons
      .filter((season) => isTargetSchoolYear(season, config))
      .map((season) => [schoolYearStartForRow(season, config), season])
  );

  if (config.key === "tennis") {
    for (const [start, season] of seasonBySchoolYear.entries()) {
      for (const gender of ["Boys", "Girls"]) {
        const seasonEvents = targetEvents.filter(
          (event) =>
            schoolYearStartForRow(event, config) === start &&
            String(event.Gender || "").toLowerCase() === gender.toLowerCase()
        );
        const counts = resultCounts(seasonEvents);
        const expectedWins = Number(season[`${gender}OverallWins`]);
        const expectedLosses = Number(season[`${gender}OverallLosses`]);
        if (!Number.isFinite(expectedWins) || !Number.isFinite(expectedLosses)) continue;
        rows.push({
          season: schoolYearLabel(start),
          gender,
          eventRecord: recordString(counts.wins, counts.losses, counts.ties),
          seasonRecord: recordString(expectedWins, expectedLosses),
          reconciled: counts.wins === expectedWins && counts.losses === expectedLosses,
        });
      }
    }
    return rows;
  }

  for (const [start, season] of seasonBySchoolYear.entries()) {
    const expectedWins = Number(season.OverallWins);
    const expectedLosses = Number(season.OverallLosses);
    const expectedTies = Number(season.OverallTies || 0);
    if (!Number.isFinite(expectedWins) || !Number.isFinite(expectedLosses)) continue;

    const seasonEvents = targetEvents.filter((event) => schoolYearStartForRow(event, config) === start);
    const counts = resultCounts(seasonEvents);
    rows.push({
      season: schoolYearLabel(start),
      eventRecord: recordString(counts.wins, counts.losses, counts.ties),
      seasonRecord: recordString(expectedWins, expectedLosses, expectedTies),
      reconciled:
        counts.wins === expectedWins &&
        counts.losses === expectedLosses &&
        counts.ties === expectedTies,
    });
  }

  return rows;
}

function hasOpponent(row) {
  return hasValue(row.Opponent) || hasValue(row.OpponentSchoolID) || hasValue(row.OpponentID);
}

function isUnknownOpponent(row) {
  const opponent = String(row.Opponent || row.opponent || "").trim().toLowerCase();
  return !opponent || opponent === "unknown" || opponent === "unknown opponent";
}

function auditOpponents(targetEvents, schoolIds) {
  const missingOpponentIds = [];
  const invalidOpponentIds = [];

  for (const event of targetEvents) {
    if (!hasOpponent(event) || isUnknownOpponent(event)) continue;
    const id = String(event.OpponentID || event.OpponentSchoolID || "").trim();
    if (!id) {
      missingOpponentIds.push(`${event.GameID || event.MatchID || event.MeetID || event.TournamentID}:${event.Opponent || event.Name}`);
    } else if (!schoolIds.has(id)) {
      invalidOpponentIds.push(`${event.GameID || event.MatchID || event.MeetID || event.TournamentID}:${id}`);
    }
  }

  return { missingOpponentIds, invalidOpponentIds };
}

function auditSeasonSourceFields(config, seasons) {
  return seasons
    .filter((season) => isTargetSchoolYear(season, config))
    .map((season) => ({
      season: schoolYearLabel(schoolYearStartForRow(season, config)),
      missingRecordSource:
        (hasValue(season.OverallWins) ||
          hasValue(season.OverallRecord) ||
          hasValue(season.BoysOverallWins) ||
          hasValue(season.GirlsOverallWins)) &&
        !hasValue(season.RecordSource),
      missingArchiveStatus: !hasValue(season.ArchiveStatus),
      missingArchiveStatusNote:
        !hasValue(season.ArchiveStatusNote) &&
        !hasValue(season.StatusNote) &&
        !hasValue(season.HistoricalSummary),
      missingCoach: !hasValue(season.HeadCoach) && !["golf", "tennis", "cross-country", "swimming", "track"].includes(config.key),
      missingFinish:
        !hasValue(season.FinishLabel) &&
        !hasValue(season.RegionFinish) &&
        !hasValue(season.StateFinish) &&
        !hasValue(season.SeasonResult) &&
        !["cross-country", "swimming", "track"].includes(config.key),
    }))
    .filter((row) =>
      row.missingRecordSource ||
      row.missingArchiveStatus ||
      row.missingArchiveStatusNote ||
      row.missingCoach ||
      row.missingFinish
    );
}

function completenessValue(event, config, eventConfig = {}) {
  return (
    event?.[eventConfig.completenessField || config.completenessField] ||
    event?.BoxScoreCompleteness ||
    event?.ScoringCompleteness ||
    event?.ResultCompleteness ||
    ""
  );
}

function auditSourceCoverage(config, targetEventEntries) {
  const missingCompleteness = [];
  const missingSourceCitation = [];
  const sourceAliases = [];
  const incompleteWithoutNote = [];

  for (const { event, eventConfig } of targetEventEntries) {
    const id = eventId(event, eventConfig, config);
    const completeness = String(completenessValue(event, config, eventConfig) || "").toLowerCase();
    const placeholder = completeness === "placeholder" || event.IsPlaceholder || event.isPlaceholder;
    if (!hasValue(completeness)) missingCompleteness.push(id);
    if (hasValue(event.RecapSource) || hasValue(event.SourceLabel) || hasValue(event.Source)) sourceAliases.push(id);
    if (!placeholder && !hasValue(event.SourceCitation)) missingSourceCitation.push(id);
    if (
      ["partial", "placeholder", "missing"].includes(completeness) &&
      !hasValue(event.SourceNote) &&
      !hasValue(event.Notes) &&
      !hasValue(event.ArchiveNote) &&
      !hasValue(event.RecordNote)
    ) {
      incompleteWithoutNote.push(id);
    }
  }

  return {
    missingCompleteness,
    missingSourceCitation,
    sourceAliases,
    incompleteWithoutNote,
  };
}

function scoreNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function lineScoreMismatch(event) {
  const lineScore = event.LineScore || event.lineScore;
  if (!lineScore) return null;
  const teamTotal =
    lineScore?.StAndrewsTotals?.R ??
    lineScore?.stAndrewsTotals?.runs ??
    lineScore?.StAndrewsTotal;
  const opponentTotal =
    lineScore?.OpponentTotals?.R ??
    lineScore?.opponentTotals?.runs ??
    lineScore?.OpponentTotal;
  const teamScore = scoreNumber(event.TeamScore ?? event.teamScore);
  const opponentScore = scoreNumber(event.OpponentScore ?? event.opponentScore);
  if (teamScore === null || opponentScore === null) return null;
  if (!hasValue(teamTotal) || !hasValue(opponentTotal)) return null;
  if (Number(teamTotal) === teamScore && Number(opponentTotal) === opponentScore) return null;
  return { teamScore, opponentScore, lineTeam: teamTotal, lineOpponent: opponentTotal };
}

function volleyballMismatch(event) {
  const sets = Array.isArray(event.SetScores) ? event.SetScores : [];
  if (!sets.length) return null;
  const teamSets = sets.filter((set) => Number(set.Team) > Number(set.Opponent)).length;
  const opponentSets = sets.filter((set) => Number(set.Opponent) > Number(set.Team)).length;
  if (teamSets === Number(event.TeamScore) && opponentSets === Number(event.OpponentScore)) return null;
  return { teamScore: event.TeamScore, opponentScore: event.OpponentScore, setTeam: teamSets, setOpponent: opponentSets };
}

function soccerGoalMismatch(event) {
  if (!hasValue(event.TeamScore)) return null;
  const teamScore = Number(event.TeamScore);
  const goals = (event.GoalScorers || [])
    .filter((goal) => String(goal.Team || "").toLowerCase().includes("andrew") || hasValue(goal.PlayerID))
    .reduce((total, goal) => total + Number(goal.Goals || 0), 0);
  if (!goals || goals === teamScore) return null;
  return { teamScore, listedGoals: goals };
}

function auditScoreMismatches(config, targetEventEntries, statsByEvent) {
  const mismatches = [];
  const missingNote = [];

  for (const { event, eventConfig } of targetEventEntries) {
    const id = eventId(event, eventConfig, config);
    let mismatch = null;

    if (config.scoreStatCheck === "basketballPoints" && hasValue(event.TeamScore)) {
      const rows = statsByEvent.get(id) || [];
      if (rows.length) {
        const points = rows.reduce((total, row) => total + Number(row.Points || 0), 0);
        if (points !== Number(event.TeamScore)) {
          mismatch = { teamScore: Number(event.TeamScore), playerPoints: points };
        }
      }
    } else if (config.scoreStatCheck === "soccerGoals") {
      mismatch = soccerGoalMismatch(event);
    } else if (config.scoreStatCheck === "volleyballSets") {
      mismatch = volleyballMismatch(event);
    } else if (["baseballLineScore", "softballLineScore", "footballLineScore"].includes(config.scoreStatCheck)) {
      mismatch = lineScoreMismatch(event);
    }

    if (mismatch) {
      const issue = {
        id,
        opponent: event.Opponent || event.Name || "",
        completeness: completenessValue(event, config, eventConfig),
        ...mismatch,
      };
      mismatches.push(issue);
      if (!hasValue(event.SourceNote) && !hasValue(event.Notes) && !hasValue(event.RecordNote)) {
        missingNote.push(issue);
      }
    }
  }

  return { mismatches, missingNote };
}

function rosterPlayerIdsBySchoolYear(config) {
  const rosters = readJsonOptional(`${config.base}/${config.rosterFile}`, []);
  const map = new Map();

  for (const roster of Array.isArray(rosters) ? rosters : []) {
    const start = schoolYearStartForRow(roster, config);
    if (!Number.isFinite(start)) continue;
    const players = new Set((roster.Players || []).map((player) => String(player.PlayerID)).filter(Boolean));
    map.set(start, players);
  }

  return map;
}

function statHasPlayerId(row) {
  return hasValue(row.PlayerID);
}

function auditStats(config, allEvents, targetEvents, playerIds) {
  const result = {
    duplicateStatIds: [],
    statsMissingEvents: [],
    missingStatPlayers: [],
    rosterMembershipIssues: [],
    statIndexIssues: [],
    statsByEvent: new Map(),
    targetStatRows: 0,
  };
  const eventById = new Map(allEvents.map((event) => [String(event.GameID || event.MatchID || event.MeetID || event.TournamentID), event]));
  const targetEventIds = new Set(targetEvents.map((event) => String(event.GameID || event.MatchID || event.MeetID || event.TournamentID)));
  const rosterByYear = config.rosterFile ? rosterPlayerIdsBySchoolYear(config) : new Map();

  for (const statConfig of config.stats || []) {
    if (statConfig.teamStatsOnly) continue;
    const stats = readCombinedStatRows(config, statConfig);
    const targetStats = [];
    const statPlayersByYear = new Map();

    for (const row of Array.isArray(stats) ? stats : []) {
      const eventKey = String(row?.[statConfig.rowEventIdField] ?? "");
      const event = eventById.get(eventKey);
      if (!event) {
        result.statsMissingEvents.push(eventKey);
        continue;
      }
      if (!targetEventIds.has(eventKey)) continue;

      targetStats.push(row);
      if (!result.statsByEvent.has(eventKey)) result.statsByEvent.set(eventKey, []);
      result.statsByEvent.get(eventKey).push(row);

      if (statHasPlayerId(row) && !playerIds.has(String(row.PlayerID))) {
        result.missingStatPlayers.push(`${row.PlayerID}:${eventKey}`);
      }

      const start = schoolYearStartForRow(event, config);
      if (!statPlayersByYear.has(start)) statPlayersByYear.set(start, new Set());
      if (statHasPlayerId(row)) statPlayersByYear.get(start).add(String(row.PlayerID));
    }

    result.targetStatRows += targetStats.length;
    if (statConfig.rowIdField) {
      result.duplicateStatIds.push(...duplicateValues(targetStats, (row) => row[statConfig.rowIdField]));
    }

    for (const [start, statPlayerIds] of statPlayersByYear.entries()) {
      const rosterIds = rosterByYear.get(start);
      if (!rosterIds || !rosterIds.size) continue;
      const statsNotRoster = [...statPlayerIds].filter((id) => !rosterIds.has(id)).sort();
      if (statsNotRoster.length) {
        result.rosterMembershipIssues.push({
          season: schoolYearLabel(start),
          statsNotRoster,
        });
      }
    }

    auditStatIndex(config, statConfig, stats, eventById, result.statIndexIssues);
  }

  result.statsMissingEvents = [...new Set(result.statsMissingEvents)].filter(Boolean).sort();
  result.missingStatPlayers = [...new Set(result.missingStatPlayers)].sort();
  return result;
}

function readCombinedStatRows(config, statConfig) {
  const rows = readJsonOptional(`${config.base}/${statConfig.file}`, []);
  const combined = Array.isArray(rows) ? rows.slice() : [];
  const seen = new Set(combined.map((row) => stableRowKey(row, statConfig)));
  const splitDirectory = path.join(root, config.base, statConfig.directory || "");

  if (!statConfig.directory || !fs.existsSync(splitDirectory)) return combined;

  for (const entry of fs.readdirSync(splitDirectory)) {
    if (!entry.endsWith(".json") || entry === "index.json") continue;
    for (const row of readJsonOptional(`${config.base}/${statConfig.directory}/${entry}`, [])) {
      const key = stableRowKey(row, statConfig);
      if (seen.has(key)) continue;
      combined.push(row);
      seen.add(key);
    }
  }

  return combined;
}

function stableRowKey(row, statConfig) {
  if (statConfig.rowIdField && row?.[statConfig.rowIdField]) {
    return `${statConfig.rowIdField}:${row[statConfig.rowIdField]}`;
  }

  const eventId = row?.[statConfig.rowEventIdField] ?? "";
  const playerId = row?.PlayerID ?? row?.PlayerName ?? "";
  return `${eventId}:${playerId}:${JSON.stringify(row)}`;
}

function auditStatIndex(config, statConfig, stats, eventById, issues) {
  const indexPath = `${config.base}/${statConfig.directory}/index.json`;
  if (!fs.existsSync(path.join(root, indexPath))) {
    issues.push({ file: statConfig.file, issue: "missing-index-file" });
    return;
  }

  const index = readJsonOptional(indexPath, []);
  const expected = new Map();
  for (const row of Array.isArray(stats) ? stats : []) {
    const event = eventById.get(String(row?.[statConfig.rowEventIdField] ?? ""));
    const rowSeason = statConfig.rowSeasonField ? row?.[statConfig.rowSeasonField] : null;
    const season = hasValue(rowSeason) ? rowSeason : event?.[statConfig.eventSeasonField || config.seasonField || "Season"];
    if (!hasValue(season)) continue;
    const key = Number.isFinite(Number(season)) ? Number(season) : String(season);
    if (!expected.has(key)) expected.set(key, { rows: 0, events: new Set() });
    expected.get(key).rows += 1;
    expected.get(key).events.add(String(row?.[statConfig.rowEventIdField]));
  }

  const actual = new Map(index.map((row) => [Number.isFinite(Number(row.season ?? row.Season)) ? Number(row.season ?? row.Season) : String(row.season ?? row.Season), row]));
  for (const [season, bucket] of expected.entries()) {
    const row = actual.get(season);
    if (!row) {
      issues.push({ file: statConfig.file, season, issue: "missing-index-row" });
      continue;
    }
    const rows = Number(row.rows ?? row.Rows);
    const events = Number(row[statConfig.indexEventLabel] ?? row[capitalize(statConfig.indexEventLabel)] ?? row.events ?? row.Events);
    if (rows !== bucket.rows) {
      issues.push({ file: statConfig.file, season, issue: "row-count-mismatch", expected: bucket.rows, actual: rows });
    }
    if (events !== bucket.events.size) {
      issues.push({ file: statConfig.file, season, issue: "event-count-mismatch", expected: bucket.events.size, actual: events });
    }
  }
}

function capitalize(value) {
  const text = String(value || "");
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : text;
}

async function auditSport(config, schoolIds) {
  const seasons = await loadSeasons(config);
  const eventCollections = await loadEvents(config);
  const allEvents = eventCollections.flatMap((collection) => collection.events);
  const targetEventEntries = eventCollections.flatMap((collection) =>
    collection.events
      .filter((event) => isTargetSchoolYear(event, { ...config, seasonField: collection.seasonField }))
      .map((event) => ({ event, eventConfig: collection }))
  );
  const targetEvents = targetEventEntries.map((entry) => entry.event);
  const playerIds = buildPlayerIds(config);
  const stats = auditStats(config, allEvents, targetEvents, playerIds);
  const sourceCoverage = auditSourceCoverage(config, targetEventEntries);
  const scoreMismatches = auditScoreMismatches(config, targetEventEntries, stats.statsByEvent);
  const opponentAudit = auditOpponents(targetEvents, schoolIds);

  return {
    label: config.label,
    counts: {
      targetSeasons: seasons.filter((season) => isTargetSchoolYear(season, config)).length,
      targetEvents: targetEvents.length,
      targetStatRows: stats.targetStatRows,
    },
    seasonSourceOfTruth: auditSeasonSourceFields(config, seasons),
    duplicates: {
      eventIds: duplicateValues(targetEvents, (event) => event.GameID || event.MatchID || event.MeetID || event.TournamentID),
      statIds: stats.duplicateStatIds,
    },
    recordReconciliation: auditRecordReconciliation(config, seasons, targetEvents),
    integrity: {
      ...opponentAudit,
      statsMissingEvents: stats.statsMissingEvents,
      missingStatPlayers: stats.missingStatPlayers,
      rosterMembershipIssues: stats.rosterMembershipIssues,
      statIndexIssues: stats.statIndexIssues,
    },
    sourceCoverage,
    scoreMismatches,
  };
}

function parseSelectedSports() {
  const sportIndex = process.argv.indexOf("--sport");
  if (sportIndex < 0) return SPORT_CONFIGS;
  const requested = new Set(String(process.argv[sportIndex + 1] || "").split(",").filter(Boolean));
  return SPORT_CONFIGS.filter((config) => requested.has(config.key));
}

async function main() {
  const schoolIds = buildSchoolIds();
  const configs = parseSelectedSports();
  const report = {};
  for (const config of configs) {
    report[config.key] = await auditSport(config, schoolIds);
  }

  const jsonReport = JSON.stringify(report, null, 2);
  console.log(jsonReport);

  if (process.argv.includes("--strict")) {
    const strictFailures = Object.values(report).flatMap((sport) => [
      sport.duplicates.eventIds.length,
      sport.duplicates.statIds.length,
      sport.integrity.invalidOpponentIds.length,
      sport.integrity.statsMissingEvents.length,
      sport.integrity.missingStatPlayers.length,
      sport.integrity.statIndexIssues.length,
      sport.sourceCoverage.missingCompleteness.length,
      sport.scoreMismatches.missingNote.length,
    ]);

    if (strictFailures.some((count) => count > 0)) process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
