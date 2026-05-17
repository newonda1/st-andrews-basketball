const fs = require("fs");
const path = require("path");

const {
  SPORT_CONFIGS,
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

function writeJson(relativePath, data) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(data, null, 2)}\n`);
}

function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function buildSourceCitation(row) {
  const direct = String(
    row?.SourceCitation || row?.RecapSource || row?.Source || row?.SourceLabel || ""
  ).trim();
  if (direct) return direct;

  const author = row?.SourceAuthor || row?.SourceByline || row?.Author || row?.Byline;
  const title = row?.SourceTitle || row?.RecapTitle || row?.Title;
  const publication = row?.SourcePublication || row?.Publication;
  const date = row?.SourceDate || row?.PublicationDate;
  const page = row?.SourcePage ? `Page ${row.SourcePage}` : "";
  const section = row?.SourceSection || "";

  return [author, title ? `"${title}"` : "", publication, date, page, section]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(", ");
}

function removeSourceAliases(row) {
  delete row.RecapSource;
  delete row.Source;
  delete row.SourceLabel;
}

function buildArticleMap(articles) {
  const map = new Map();
  for (const article of Array.isArray(articles) ? articles : []) {
    for (const field of ["GameIDs", "MatchIDs", "MeetIDs"]) {
      for (const id of article?.[field] || []) {
        const key = String(id);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(article.ArticleID);
      }
    }
  }
  return map;
}

function applyArticleId(row, articleMap, idField) {
  if (hasValue(row.ArticleID)) return;
  const ids = [...new Set(articleMap.get(String(row?.[idField])) || [])].filter(Boolean);
  if (ids.length === 1) row.ArticleID = ids[0];
}

function setSeasonSourceOfTruthFields(season, config) {
  const sourceCitation = buildSourceCitation(season);
  if (sourceCitation) season.SourceCitation = sourceCitation;

  if (!hasValue(season.ArchiveStatus)) {
    if (hasValue(season.StatusBadge)) season.ArchiveStatus = season.StatusBadge;
    else if (season.ShowSeasonRecapPlaceholder || season.ShowSeasonImagesPlaceholder) {
      season.ArchiveStatus = "partial";
    } else if (hasValue(season.StatusNote) || hasValue(season.ArchiveStatusNote)) {
      season.ArchiveStatus = "archived";
    } else {
      season.ArchiveStatus = "partial";
    }
  }

  if (!hasValue(season.ArchiveStatusNote)) {
    const note =
      season.StatusNote ||
      season.ArchiveNote ||
      season.HistoricalSummary ||
      (Array.isArray(season.SeasonRecapParagraphs) ? season.SeasonRecapParagraphs.join(" ") : "");
    if (hasValue(note)) season.ArchiveStatusNote = note;
    else {
      const label = season.SourceSeasonLabel || schoolYearLabel(schoolYearStartForRow(season, config));
      season.ArchiveStatusNote = `${config.label} ${label} remains partial; recovered archive data is limited to the currently documented schedule, result, roster, and newspaper-source material.`;
    }
  }

  const hasRecord =
    hasValue(season.OverallRecord) ||
    (hasValue(season.OverallWins) && hasValue(season.OverallLosses)) ||
    (hasValue(season.BoysOverallWins) && hasValue(season.BoysOverallLosses)) ||
    (hasValue(season.GirlsOverallWins) && hasValue(season.GirlsOverallLosses));
  if (hasRecord && !hasValue(season.RecordSource)) {
    season.RecordSource = "seasons.json source-of-truth row; event pages reconcile to this record.";
  }

  if (!hasValue(season.FinishLabel)) {
    const finish = [season.RegionFinish, season.StateFinish, season.SeasonResult]
      .map((part) => String(part || "").trim())
      .filter(Boolean)
      .join(" / ");
    if (finish) season.FinishLabel = finish;
  }

  if (!hasValue(season.SourceSeasonLabel)) {
    const start = schoolYearStartForRow(season, config);
    if (Number.isFinite(start)) season.SourceSeasonLabel = schoolYearLabel(start);
  }
}

function hasScore(row) {
  return hasValue(row.TeamScore) && hasValue(row.OpponentScore);
}

function isPlaceholder(row) {
  return (
    row?.IsPlaceholder === true ||
    row?.isPlaceholder === true ||
    String(row?.Status || "").toLowerCase() === "placeholder" ||
    String(row?.Opponent || "").toLowerCase() === "unknown"
  );
}

function lineScoreTotalsMatch(row) {
  const lineScore = row?.LineScore || row?.lineScore;
  if (!lineScore) return false;

  const stTotal =
    lineScore?.StAndrewsTotals?.R ??
    lineScore?.stAndrewsTotals?.runs ??
    lineScore?.StAndrewsTotal ??
    lineScore?.TeamTotal;
  const oppTotal =
    lineScore?.OpponentTotals?.R ??
    lineScore?.opponentTotals?.runs ??
    lineScore?.OpponentTotal;

  return Number(stTotal) === Number(row.TeamScore) && Number(oppTotal) === Number(row.OpponentScore);
}

function volleyballSetTotalsMatch(row) {
  const sets = Array.isArray(row?.SetScores) ? row.SetScores : [];
  if (!sets.length || !hasScore(row)) return false;
  const teamSets = sets.filter((set) => Number(set.Team) > Number(set.Opponent)).length;
  const opponentSets = sets.filter((set) => Number(set.Opponent) > Number(set.Team)).length;
  return teamSets === Number(row.TeamScore) && opponentSets === Number(row.OpponentScore);
}

function deriveCompleteness(row, config, eventFileConfig = {}) {
  const existing =
    row?.[eventFileConfig.completenessField || config.completenessField] ||
    row?.BoxScoreCompleteness ||
    row?.ScoringCompleteness ||
    row?.ResultCompleteness;
  if (hasValue(existing)) return existing;

  if (isPlaceholder(row)) return "placeholder";

  if (config.scoreStatCheck === "soccerGoals") {
    if (!hasScore(row)) return hasValue(row.Result) ? "placeholder" : "missing";
    const goals = (row.GoalScorers || [])
      .filter((goal) => String(goal?.Team || "").toLowerCase().includes("andrew") || goal?.PlayerID)
      .reduce((total, goal) => total + Number(goal.Goals || 0), 0);
    if (Number(row.TeamScore) === 0) return "complete";
    if (!goals) return "missing";
    return goals === Number(row.TeamScore) ? "complete" : "partial";
  }

  if (config.scoreStatCheck === "volleyballSets") {
    if (!hasScore(row)) return hasValue(row.Result) ? "placeholder" : "missing";
    return volleyballSetTotalsMatch(row) ? "partial" : "partial";
  }

  if (config.scoreStatCheck === "tennisTeamScore") {
    if (row.TeamScore && hasValue(row.TeamScore.StAndrews) && hasValue(row.TeamScore.Opponent)) {
      return Array.isArray(row.LineMatches) && row.LineMatches.length ? "complete" : "partial";
    }
    return row.Status === "Scheduled" ? "missing" : "partial";
  }

  if (["baseballLineScore", "softballLineScore", "footballLineScore"].includes(config.scoreStatCheck)) {
    if (!hasScore(row)) return hasValue(row.Result) ? "placeholder" : "missing";
    return lineScoreTotalsMatch(row) ? "partial" : "partial";
  }

  if (!hasValue(row.Result) && !hasValue(row.Status) && !hasScore(row)) return "missing";
  return "partial";
}

function normalizeEventRow(row, config, eventFileConfig, articleMap) {
  const sourceCitation = buildSourceCitation(row);
  if (sourceCitation) row.SourceCitation = sourceCitation;
  removeSourceAliases(row);

  applyArticleId(row, articleMap, eventFileConfig.eventIdField || config.eventIdField);

  const completenessField =
    eventFileConfig.completenessField || config.completenessField || "ResultCompleteness";
  const completeness = deriveCompleteness(row, config, eventFileConfig);
  if (hasValue(completeness)) row[completenessField] = completeness;

  if (!hasValue(row.SourceNote)) {
    const isIncomplete = ["partial", "placeholder", "missing"].includes(
      String(completeness || "").toLowerCase()
    );
    if (isIncomplete && hasValue(row.Notes)) row.SourceNote = row.Notes;
    else if (isIncomplete && hasValue(row.ArchiveNote)) row.SourceNote = row.ArchiveNote;
    else if (isIncomplete && hasValue(row.RecordNote)) row.SourceNote = row.RecordNote;
    else if (isIncomplete) {
      const eventLabel = eventFileConfig.eventLabel || config.eventLabel || "event";
      row.SourceNote = `Archive ${eventLabel} data is ${String(completeness).toLowerCase()}; only recovered source details are shown.`;
    }
  }

  if (!hasValue(row.SourceSeasonLabel)) {
    const start = schoolYearStartForRow(row, config);
    if (Number.isFinite(start)) row.SourceSeasonLabel = schoolYearLabel(start);
  }
}

function normalizeSport(config) {
  if (config.jsData) return { sport: config.key, skipped: "js-data" };

  const seasonsPath = `${config.base}/seasons.json`;
  const hasSeasons = fs.existsSync(path.join(root, seasonsPath));
  if (hasSeasons) {
    const seasons = readJson(seasonsPath);
    for (const season of Array.isArray(seasons) ? seasons : []) {
      if (isTargetSchoolYear(season, config)) setSeasonSourceOfTruthFields(season, config);
    }
    writeJson(seasonsPath, seasons);
  }

  const articles = readJsonOptional(`${config.base}/articles.json`, []);
  const articleMap = buildArticleMap(articles);
  const eventFiles = config.eventFiles || [
    {
      file: config.eventFile,
      eventLabel: config.eventLabel,
      eventIdField: config.eventIdField,
      seasonField: config.seasonField,
      completenessField: config.completenessField,
    },
  ];

  const normalizedFiles = [];
  for (const eventFileConfig of eventFiles) {
    const eventPath = `${config.base}/${eventFileConfig.file}`;
    if (!fs.existsSync(path.join(root, eventPath))) continue;

    const rows = readJson(eventPath);
    for (const row of Array.isArray(rows) ? rows : []) {
      if (isTargetSchoolYear(row, { ...config, seasonField: eventFileConfig.seasonField })) {
        normalizeEventRow(row, config, eventFileConfig, articleMap);
      }
    }
    writeJson(eventPath, rows);
    normalizedFiles.push(eventFileConfig.file);
  }

  return { sport: config.key, normalizedFiles };
}

function parseSelectedSports() {
  const sportIndex = process.argv.indexOf("--sport");
  if (sportIndex < 0) return null;
  return new Set(String(process.argv[sportIndex + 1] || "").split(",").filter(Boolean));
}

function main() {
  const selectedSports = parseSelectedSports();
  const configs = selectedSports
    ? SPORT_CONFIGS.filter((config) => selectedSports.has(config.key))
    : SPORT_CONFIGS;
  const results = configs.map(normalizeSport);
  console.log(JSON.stringify(results, null, 2));
}

main();
