const fs = require("fs");
const path = require("path");

const { SPORT_CONFIGS } = require("./archiveSportsConfig");

const root = path.resolve(__dirname, "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readJsonOptional(relativePath, fallback = []) {
  const fullPath = path.join(root, relativePath);
  return fs.existsSync(fullPath) ? readJson(relativePath) : fallback;
}

function writeJson(relativePath, data) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`);
}

function removeGeneratedJsonFiles(relativeDirectory) {
  const fullPath = path.join(root, relativeDirectory);
  if (!fs.existsSync(fullPath)) return;

  for (const entry of fs.readdirSync(fullPath)) {
    if (entry.endsWith(".json")) fs.unlinkSync(path.join(fullPath, entry));
  }
}

function seasonFromEvent(event, statConfig, sportConfig) {
  const value = event?.[statConfig.eventSeasonField || sportConfig.seasonField || "Season"];
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
}

function buildEventSeasonMap(sportConfig, statConfig) {
  const events = readJsonOptional(`${sportConfig.base}/${statConfig.eventFile}`, []);
  const map = new Map();

  for (const event of events) {
    const eventId = String(event?.[statConfig.eventIdField] ?? "").trim();
    if (!eventId) continue;
    map.set(eventId, seasonFromEvent(event, statConfig, sportConfig));
  }

  return map;
}

function indexRow(base, directory, season, rows, statConfig) {
  const file = `${season}.json`;
  const eventCount = new Set(
    rows.map((row) => String(row?.[statConfig.rowEventIdField] ?? "")).filter(Boolean)
  ).size;
  const pathValue = `/data/${base.replace(/^public\/data\//, "")}/${directory}/${file}`;

  return {
    season,
    file,
    rows: rows.length,
    [statConfig.indexEventLabel || "events"]: eventCount,
    Season: season,
    Path: pathValue,
    Rows: rows.length,
    [capitalize(statConfig.indexEventLabel || "events")]: eventCount,
  };
}

function capitalize(value) {
  const text = String(value || "");
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : text;
}

function buildStatIndex(sportConfig, statConfig) {
  const statsPath = `${sportConfig.base}/${statConfig.file}`;
  if (!fs.existsSync(path.join(root, statsPath))) return null;

  const rows = readJson(statsPath);
  const eventSeasonById = buildEventSeasonMap(sportConfig, statConfig);
  const rowsBySeason = new Map();

  for (const row of Array.isArray(rows) ? rows : []) {
    const rowSeason = statConfig.rowSeasonField ? row?.[statConfig.rowSeasonField] : null;
    const season =
      rowSeason !== null && rowSeason !== undefined && rowSeason !== ""
        ? rowSeason
        : eventSeasonById.get(String(row?.[statConfig.rowEventIdField] ?? ""));

    if (season === null || season === undefined || season === "") continue;
    const seasonKey = Number.isFinite(Number(season)) ? Number(season) : String(season);
    if (!rowsBySeason.has(seasonKey)) rowsBySeason.set(seasonKey, []);
    rowsBySeason.get(seasonKey).push(row);
  }

  const outputDirectory = `${sportConfig.base}/${statConfig.directory}`;
  mergeExistingSplitOnlyRows(outputDirectory, rowsBySeason, statConfig);
  removeGeneratedJsonFiles(outputDirectory);

  const index = [...rowsBySeason.entries()]
    .sort(([a], [b]) => Number(a) - Number(b) || String(a).localeCompare(String(b)))
    .map(([season, seasonRows]) => {
      writeJson(`${outputDirectory}/${season}.json`, seasonRows);
      return indexRow(sportConfig.base, statConfig.directory, season, seasonRows, statConfig);
    });

  writeJson(`${outputDirectory}/index.json`, index);
  return index.length;
}

function stableRowKey(row, statConfig) {
  if (statConfig.rowIdField && row?.[statConfig.rowIdField]) {
    return `${statConfig.rowIdField}:${row[statConfig.rowIdField]}`;
  }

  const eventId = row?.[statConfig.rowEventIdField] ?? "";
  const playerId = row?.PlayerID ?? row?.PlayerName ?? "";
  if (eventId || playerId) return `${eventId}:${playerId}:${JSON.stringify(row)}`;
  return JSON.stringify(row);
}

function mergeExistingSplitOnlyRows(outputDirectory, rowsBySeason, statConfig) {
  const fullPath = path.join(root, outputDirectory);
  if (!fs.existsSync(fullPath)) return;

  for (const entry of fs.readdirSync(fullPath)) {
    if (!entry.endsWith(".json") || entry === "index.json") continue;

    const season = entry.replace(/\.json$/, "");
    const seasonKey = Number.isFinite(Number(season)) ? Number(season) : season;
    const existingRows = readJson(`${outputDirectory}/${entry}`);
    if (!Array.isArray(existingRows) || !existingRows.length) continue;

    if (!rowsBySeason.has(seasonKey)) rowsBySeason.set(seasonKey, []);
    const seasonRows = rowsBySeason.get(seasonKey);
    const seen = new Set(seasonRows.map((row) => stableRowKey(row, statConfig)));

    for (const row of existingRows) {
      const key = stableRowKey(row, statConfig);
      if (seen.has(key)) continue;
      seasonRows.push(row);
      seen.add(key);
    }
  }
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

  for (const sportConfig of configs) {
    for (const statConfig of sportConfig.stats || []) {
      const seasonCount = buildStatIndex(sportConfig, statConfig);
      if (seasonCount === null) continue;
      console.log(
        `Wrote ${seasonCount} ${sportConfig.label} ${statConfig.directory} season files.`
      );
    }
  }
}

main();
