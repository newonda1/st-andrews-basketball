const TARGET_SCHOOL_YEAR_STARTS = [1999, 2000, 2001, 2002, 2003, 2004, 2005];
const TARGET_SCHOOL_YEARS = new Set(TARGET_SCHOOL_YEAR_STARTS);

const SPORT_CONFIGS = [
  {
    key: "boys-baseball",
    label: "Boys Baseball",
    base: "public/data/boys/baseball",
    timing: "spring",
    eventFile: "games.json",
    eventLabel: "games",
    eventIdField: "GameID",
    seasonField: "Season",
    rosterFile: "seasonrosters.json",
    completenessField: "BoxScoreCompleteness",
    scoreStatCheck: "baseballLineScore",
    stats: [
      {
        file: "playergamestats.json",
        directory: "playergamestats",
        eventFile: "games.json",
        eventIdField: "GameID",
        rowEventIdField: "GameID",
        rowIdField: "StatID",
        indexEventLabel: "games",
      },
    ],
  },
  {
    key: "boys-basketball",
    label: "Boys Basketball",
    base: "public/data/boys/basketball",
    timing: "fall",
    eventFile: "games.json",
    eventLabel: "games",
    eventIdField: "GameID",
    seasonField: "Season",
    rosterFile: "seasonrosters.json",
    completenessField: "ScoringCompleteness",
    scoreStatCheck: "basketballPoints",
    stats: [
      {
        file: "playergamestats.json",
        directory: "playergamestats",
        eventFile: "games.json",
        eventIdField: "GameID",
        rowEventIdField: "GameID",
        rowIdField: "StatID",
        indexEventLabel: "games",
      },
    ],
  },
  {
    key: "girls-basketball",
    label: "Girls Basketball",
    base: "public/data/girls/basketball",
    timing: "fall",
    eventFile: "games.json",
    eventLabel: "games",
    eventIdField: "GameID",
    seasonField: "Season",
    rosterFile: "seasonrosters.json",
    completenessField: "ScoringCompleteness",
    scoreStatCheck: "basketballPoints",
    stats: [
      {
        file: "playergamestats.json",
        directory: "playergamestats",
        eventFile: "games.json",
        eventIdField: "GameID",
        rowEventIdField: "GameID",
        rowIdField: "StatID",
        indexEventLabel: "games",
      },
    ],
  },
  {
    key: "boys-football",
    label: "Boys Football",
    base: "public/data/boys/football",
    timing: "fall",
    eventFile: "games.json",
    eventLabel: "games",
    eventIdField: "GameID",
    seasonField: "SeasonID",
    rosterFile: "seasonrosters.json",
    localPlayersFile: "players.json",
    completenessField: "BoxScoreCompleteness",
    scoreStatCheck: "footballLineScore",
    stats: [
      {
        file: "playergamelogs.json",
        directory: "playergamelogs",
        eventFile: "games.json",
        eventIdField: "GameID",
        rowEventIdField: "GameID",
        rowIdField: null,
        indexEventLabel: "games",
      },
    ],
  },
  {
    key: "boys-soccer",
    label: "Boys Soccer",
    base: "public/data/boys/soccer",
    timing: "spring",
    eventFile: "games.json",
    eventLabel: "games",
    eventIdField: "GameID",
    seasonField: "SeasonID",
    rosterFile: "seasonrosters.json",
    completenessField: "ScoringCompleteness",
    scoreStatCheck: "soccerGoals",
  },
  {
    key: "girls-soccer",
    label: "Girls Soccer",
    base: "public/data/girls/soccer",
    timing: "spring",
    eventFile: "games.json",
    eventLabel: "games",
    eventIdField: "GameID",
    seasonField: "SeasonID",
    rosterFile: "seasonrosters.json",
    completenessField: "ScoringCompleteness",
    scoreStatCheck: "soccerGoals",
  },
  {
    key: "girls-volleyball",
    label: "Girls Volleyball",
    base: "public/data/girls/volleyball",
    timing: "fall",
    eventFile: "games.json",
    eventLabel: "matches",
    eventIdField: "GameID",
    seasonField: "SeasonID",
    rosterFile: "seasonrosters.json",
    completenessField: "BoxScoreCompleteness",
    scoreStatCheck: "volleyballSets",
    stats: [
      {
        file: "playergamestats.json",
        directory: "playergamestats",
        eventFile: "games.json",
        eventIdField: "GameID",
        rowEventIdField: "GameID",
        rowIdField: null,
        rowSeasonField: "Season",
        indexEventLabel: "matches",
      },
      {
        file: "teammatchstats.json",
        directory: "teammatchstats",
        eventFile: "games.json",
        eventIdField: "GameID",
        rowEventIdField: "GameID",
        rowIdField: null,
        rowSeasonField: "Season",
        indexEventLabel: "matches",
        teamStatsOnly: true,
      },
    ],
  },
  {
    key: "girls-softball",
    label: "Girls Softball",
    base: "src/girls/softball",
    timing: "spring",
    eventFile: "softballData.js",
    eventLabel: "games",
    eventIdField: "GameID",
    seasonField: "Season",
    jsData: true,
    completenessField: "BoxScoreCompleteness",
    scoreStatCheck: "softballLineScore",
  },
  {
    key: "golf",
    label: "Golf",
    base: "public/data/golf",
    timing: "spring",
    eventFiles: [
      {
        file: "matches.json",
        eventLabel: "matches",
        eventIdField: "MatchID",
        seasonField: "Season",
        completenessField: "ResultCompleteness",
      },
      {
        file: "tournaments.json",
        eventLabel: "tournaments",
        eventIdField: "TournamentID",
        seasonField: "Season",
        completenessField: "ResultCompleteness",
      },
    ],
    rosterFile: "seasonrosters.json",
  },
  {
    key: "tennis",
    label: "Tennis",
    base: "public/data/tennis",
    timing: "mixed",
    eventFile: "matches.json",
    eventLabel: "matches",
    eventIdField: "MatchID",
    seasonField: "Season",
    completenessField: "ResultCompleteness",
    scoreStatCheck: "tennisTeamScore",
  },
  {
    key: "cross-country",
    label: "Cross Country",
    base: "public/data/cross-country",
    timing: "endYear",
    eventFile: "meets.json",
    eventLabel: "meets",
    eventIdField: "MeetID",
    seasonField: "Season",
    completenessField: "ResultCompleteness",
    stats: [
      {
        file: "playermeetstats.json",
        directory: "playermeetstats",
        eventFile: "meets.json",
        eventIdField: "MeetID",
        rowEventIdField: "MeetID",
        rowIdField: "StatID",
        indexEventLabel: "meets",
      },
    ],
  },
  {
    key: "swimming",
    label: "Swimming",
    base: "public/data/swimming",
    timing: "endYear",
    eventFile: "meets.json",
    eventLabel: "meets",
    eventIdField: "MeetID",
    seasonField: "Season",
    completenessField: "ResultCompleteness",
    stats: [
      {
        file: "playermeetstats.json",
        directory: "playermeetstats",
        eventFile: "meets.json",
        eventIdField: "MeetID",
        rowEventIdField: "MeetID",
        rowIdField: "StatID",
        indexEventLabel: "meets",
      },
    ],
  },
  {
    key: "track",
    label: "Track",
    base: "public/data/track",
    timing: "spring",
    eventFile: "meets.json",
    eventLabel: "meets",
    eventIdField: "MeetID",
    seasonField: "Season",
    completenessField: "ResultCompleteness",
    stats: [
      {
        file: "playermeetstats.json",
        directory: "playermeetstats",
        eventFile: "meets.json",
        eventIdField: "MeetID",
        rowEventIdField: "MeetID",
        rowIdField: "StatID",
        rowSeasonField: null,
        indexEventLabel: "meets",
      },
    ],
  },
];

function schoolYearLabel(startYear) {
  const start = Number(startYear);
  return `${start}-${String(start + 1).slice(-2)}`;
}

function schoolYearStartFromLabel(value) {
  const text = String(value || "");
  const match = text.match(/\b((?:19|20)\d{2})\s*[-–]\s*(\d{2}|\d{4})\b/);
  return match ? Number(match[1]) : null;
}

function schoolYearStartFromSeasonValue(value, timing = "fall") {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  if (timing === "spring" || timing === "endYear") return numeric - 1;
  return numeric;
}

function schoolYearStartForRow(row, config = {}) {
  const labelStart =
    schoolYearStartFromLabel(row?.SourceSeasonLabel) ??
    schoolYearStartFromLabel(row?.SeasonLabel) ??
    schoolYearStartFromLabel(row?.DisplaySeason) ??
    schoolYearStartFromLabel(row?.SchoolYear) ??
    schoolYearStartFromLabel(row?.SeasonID) ??
    schoolYearStartFromLabel(row?.Season);

  if (labelStart !== null) return labelStart;

  const seasonValue =
    row?.SeasonID ??
    row?.Season ??
    row?.YearEnd ??
    row?.Year ??
    row?.DisplaySeason;
  return schoolYearStartFromSeasonValue(seasonValue, config.timing);
}

function isTargetSchoolYear(row, config = {}) {
  const start = schoolYearStartForRow(row, config);
  return TARGET_SCHOOL_YEARS.has(start);
}

function selectedSportConfigs(selectedKeys = []) {
  const keys = selectedKeys.filter(Boolean);
  if (!keys.length) return SPORT_CONFIGS;
  const keySet = new Set(keys);
  return SPORT_CONFIGS.filter((config) => keySet.has(config.key));
}

module.exports = {
  SPORT_CONFIGS,
  TARGET_SCHOOL_YEAR_STARTS,
  TARGET_SCHOOL_YEARS,
  isTargetSchoolYear,
  schoolYearLabel,
  schoolYearStartForRow,
  selectedSportConfigs,
};
