const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const SEARCH_INDEX_OUTPUT_PATH = path.join(
  ROOT,
  "public",
  "data",
  "search",
  "index.json"
);

const PAGE_ENTRIES = [
  {
    id: "athletics-home",
    type: "page",
    title: "Athletics Home",
    subtitle: "St. Andrew's athletics stats home",
    to: "/athletics",
    featured: true,
    keywords: ["athletics", "stats", "sports", "home"],
  },
  {
    id: "boys-basketball-home",
    type: "team",
    title: "Boys Basketball",
    subtitle: "St. Andrew's team home",
    to: "/athletics/boys/basketball",
    featured: true,
    keywords: ["boys", "basketball", "program", "team", "home", "lions"],
  },
  {
    id: "boys-basketball-yearly-results",
    type: "page",
    title: "Full Year-by-Year Results",
    subtitle: "Boys Basketball",
    to: "/athletics/boys/basketball/yearly-results",
    keywords: ["boys", "basketball", "results", "yearly", "history"],
  },
  {
    id: "boys-basketball-opponent-history",
    type: "page",
    title: "Opponent Game History",
    subtitle: "Boys Basketball",
    to: "/athletics/boys/basketball/records/opponents",
    keywords: ["boys", "basketball", "opponents", "team", "games", "history"],
  },
  {
    id: "boys-basketball-full-team-stats",
    type: "page",
    title: "Full Team Stats",
    subtitle: "Boys Basketball",
    to: "/athletics/boys/basketball/team/full",
    keywords: ["boys", "basketball", "team", "stats"],
  },
  {
    id: "boys-basketball-team-single-game-records",
    type: "page",
    title: "Team Single Game Records",
    subtitle: "Boys Basketball",
    to: "/athletics/boys/basketball/records/team",
    keywords: ["boys", "basketball", "team", "single game", "records"],
  },
  {
    id: "boys-basketball-team-season-records",
    type: "page",
    title: "Team Season Records",
    subtitle: "Boys Basketball",
    to: "/athletics/boys/basketball/team/season-records",
    keywords: ["boys", "basketball", "team", "season", "records"],
  },
  {
    id: "boys-basketball-full-career-stats",
    type: "page",
    title: "Full Career Stats",
    subtitle: "Boys Basketball",
    to: "/athletics/boys/basketball/records/career",
    keywords: ["boys", "basketball", "career", "stats"],
  },
  {
    id: "boys-basketball-single-game-records",
    type: "page",
    title: "Single Game Records",
    subtitle: "Boys Basketball",
    to: "/athletics/boys/basketball/records/single-game",
    keywords: ["boys", "basketball", "single game", "records"],
  },
  {
    id: "boys-basketball-season-records",
    type: "page",
    title: "Season Records",
    subtitle: "Boys Basketball",
    to: "/athletics/boys/basketball/records/season",
    keywords: ["boys", "basketball", "season", "records"],
  },
  {
    id: "boys-basketball-career-records",
    type: "page",
    title: "Career Records",
    subtitle: "Boys Basketball",
    to: "/athletics/boys/basketball/records/career-records",
    keywords: ["boys", "basketball", "career", "records"],
  },
  {
    id: "baseball-home",
    type: "team",
    title: "Baseball",
    subtitle: "St. Andrew's team home",
    to: "/athletics/boys/baseball",
    featured: true,
    keywords: ["boys", "baseball", "program", "team", "home", "lions"],
  },
  {
    id: "baseball-yearly-results",
    type: "page",
    title: "Full Year-by-Year Results",
    subtitle: "Baseball",
    to: "/athletics/boys/baseball/yearly-results",
    keywords: ["boys", "baseball", "results", "yearly", "history"],
  },
  {
    id: "baseball-opponent-history",
    type: "page",
    title: "Opponent Game History",
    subtitle: "Baseball",
    to: "/athletics/boys/baseball/records/opponents",
    keywords: ["boys", "baseball", "opponents", "team", "games", "history"],
  },
  {
    id: "baseball-full-team-stats",
    type: "page",
    title: "Full Team Stats",
    subtitle: "Baseball",
    to: "/athletics/boys/baseball/team/full",
    keywords: ["boys", "baseball", "team", "stats"],
  },
  {
    id: "baseball-team-single-game-records",
    type: "page",
    title: "Team Single Game Records",
    subtitle: "Baseball",
    to: "/athletics/boys/baseball/records/team",
    keywords: ["boys", "baseball", "team", "single game", "records"],
  },
  {
    id: "baseball-team-season-records",
    type: "page",
    title: "Team Season Records",
    subtitle: "Baseball",
    to: "/athletics/boys/baseball/team/season-records",
    keywords: ["boys", "baseball", "team", "season", "records"],
  },
  {
    id: "baseball-full-career-stats",
    type: "page",
    title: "Full Career Stats",
    subtitle: "Baseball",
    to: "/athletics/boys/baseball/records/career",
    keywords: ["boys", "baseball", "career", "stats"],
  },
  {
    id: "baseball-single-game-records",
    type: "page",
    title: "Single Game Records",
    subtitle: "Baseball",
    to: "/athletics/boys/baseball/records/single-game",
    keywords: ["boys", "baseball", "single game", "records"],
  },
  {
    id: "baseball-season-records",
    type: "page",
    title: "Season Records",
    subtitle: "Baseball",
    to: "/athletics/boys/baseball/records/season",
    keywords: ["boys", "baseball", "season", "records"],
  },
  {
    id: "baseball-career-records",
    type: "page",
    title: "Career Records",
    subtitle: "Baseball",
    to: "/athletics/boys/baseball/records/career-records",
    keywords: ["boys", "baseball", "career", "records"],
  },
  {
    id: "girls-basketball-home",
    type: "team",
    title: "Girls Basketball",
    subtitle: "St. Andrew's team home",
    to: "/athletics/girls/basketball",
    featured: true,
    keywords: ["girls", "basketball", "program", "team", "home", "lions"],
  },
  {
    id: "girls-basketball-yearly-results",
    type: "page",
    title: "Full Year-by-Year Results",
    subtitle: "Girls Basketball",
    to: "/athletics/girls/basketball/yearly-results",
    keywords: ["girls", "basketball", "results", "yearly", "history"],
  },
  {
    id: "girls-basketball-opponent-history",
    type: "page",
    title: "Opponent Game History",
    subtitle: "Girls Basketball",
    to: "/athletics/girls/basketball/records/opponents",
    keywords: ["girls", "basketball", "opponents", "team", "games", "history"],
  },
  {
    id: "girls-basketball-full-team-stats",
    type: "page",
    title: "Full Team Stats",
    subtitle: "Girls Basketball",
    to: "/athletics/girls/basketball/team/full",
    keywords: ["girls", "basketball", "team", "stats"],
  },
  {
    id: "girls-basketball-team-single-game-records",
    type: "page",
    title: "Team Single Game Records",
    subtitle: "Girls Basketball",
    to: "/athletics/girls/basketball/records/team",
    keywords: ["girls", "basketball", "team", "single game", "records"],
  },
  {
    id: "girls-basketball-team-season-records",
    type: "page",
    title: "Team Season Records",
    subtitle: "Girls Basketball",
    to: "/athletics/girls/basketball/team/season-records",
    keywords: ["girls", "basketball", "team", "season", "records"],
  },
  {
    id: "girls-basketball-full-career-stats",
    type: "page",
    title: "Full Career Stats",
    subtitle: "Girls Basketball",
    to: "/athletics/girls/basketball/records/career",
    keywords: ["girls", "basketball", "career", "stats"],
  },
  {
    id: "girls-basketball-single-game-records",
    type: "page",
    title: "Single Game Records",
    subtitle: "Girls Basketball",
    to: "/athletics/girls/basketball/records/single-game",
    keywords: ["girls", "basketball", "single game", "records"],
  },
  {
    id: "girls-basketball-season-records",
    type: "page",
    title: "Season Records",
    subtitle: "Girls Basketball",
    to: "/athletics/girls/basketball/records/season",
    keywords: ["girls", "basketball", "season", "records"],
  },
  {
    id: "girls-basketball-career-records",
    type: "page",
    title: "Career Records",
    subtitle: "Girls Basketball",
    to: "/athletics/girls/basketball/records/career-records",
    keywords: ["girls", "basketball", "career", "records"],
  },
  {
    id: "football-home",
    type: "team",
    title: "Football",
    subtitle: "St. Andrew's team home",
    to: "/athletics/football",
    featured: true,
    keywords: [
      "football",
      "team",
      "program",
      "home",
      "results",
      "schedule",
      "roster",
      "stats",
      "lions",
    ],
  },
  {
    id: "football-yearly-results",
    type: "page",
    title: "Full Year-by-Year Results",
    subtitle: "Football",
    to: "/athletics/football/yearly-results",
    keywords: ["football", "results", "yearly", "history", "records"],
  },
  {
    id: "football-opponent-history",
    type: "page",
    title: "Opponent Game History",
    subtitle: "Football",
    to: "/athletics/football/records/opponents",
    keywords: ["football", "opponents", "team", "games", "history"],
  },
  {
    id: "football-2025-season",
    type: "page",
    title: "2025 Season",
    subtitle: "Football",
    to: "/athletics/football/seasons/2025",
    keywords: ["football", "2025", "season", "schedule", "roster", "results", "stats"],
  },
  {
    id: "football-1998-season",
    type: "page",
    title: "1998-99 Championship Season",
    subtitle: "Football",
    to: "/athletics/football/seasons/1998",
    keywords: [
      "football",
      "1998",
      "season",
      "championship",
      "state champion",
      "SCISA",
      "saints",
      "schedule",
      "results",
    ],
  },
  {
    id: "football-1997-season",
    type: "page",
    title: "1997-98 Season",
    subtitle: "Football",
    to: "/athletics/football/seasons/1997",
    keywords: [
      "football",
      "1997",
      "season",
      "state runner-up",
      "SCISA",
      "saints",
      "schedule",
      "results",
    ],
  },
  {
    id: "football-1996-season",
    type: "page",
    title: "1996-97 Season",
    subtitle: "Football",
    to: "/athletics/football/seasons/1996",
    keywords: [
      "football",
      "1996",
      "season",
      "state runner-up",
      "SCISA",
      "saints",
      "schedule",
      "results",
    ],
  },
  {
    id: "football-1999-season",
    type: "page",
    title: "1999-00 Season",
    subtitle: "Football",
    to: "/athletics/football/seasons/1999",
    keywords: ["football", "1999", "season", "SCISA", "saints", "schedule", "results"],
  },
  {
    id: "football-2000-season",
    type: "page",
    title: "2000-01 Season",
    subtitle: "Football",
    to: "/athletics/football/seasons/2000",
    keywords: ["football", "2000", "season", "SCISA", "saints", "results"],
  },
  {
    id: "football-2001-season",
    type: "page",
    title: "2001-02 Season",
    subtitle: "Football",
    to: "/athletics/football/seasons/2001",
    keywords: ["football", "2001", "season", "SCISA", "saints", "results"],
  },
  {
    id: "football-2002-season",
    type: "page",
    title: "2002-03 State Runner-up Season",
    subtitle: "Football",
    to: "/athletics/football/seasons/2002",
    keywords: [
      "football",
      "2002",
      "season",
      "region champion",
      "state runner-up",
      "SCISA",
      "saints",
      "results",
    ],
  },
  {
    id: "football-2003-season",
    type: "page",
    title: "2003-04 Season",
    subtitle: "Football",
    to: "/athletics/football/seasons/2003",
    keywords: ["football", "2003", "season", "SCISA", "saints", "results"],
  },
  {
    id: "football-team-single-game-records",
    type: "page",
    title: "Team Single Game Records",
    subtitle: "Football",
    to: "/athletics/football/records/team",
    keywords: ["football", "team", "single game", "records"],
  },
  {
    id: "football-team-season-records",
    type: "page",
    title: "Team Season Records",
    subtitle: "Football",
    to: "/athletics/football/team/season-records",
    keywords: ["football", "team", "season", "records"],
  },
  {
    id: "football-full-career-stats",
    type: "page",
    title: "Full Career Stats",
    subtitle: "Football",
    to: "/athletics/football/records/career",
    keywords: ["football", "career", "stats"],
  },
  {
    id: "football-single-game-records",
    type: "page",
    title: "Single Game Records",
    subtitle: "Football",
    to: "/athletics/football/records/single-game",
    keywords: ["football", "single game", "records"],
  },
  {
    id: "football-season-records",
    type: "page",
    title: "Season Records",
    subtitle: "Football",
    to: "/athletics/football/records/season",
    keywords: ["football", "season", "records"],
  },
  {
    id: "football-career-records",
    type: "page",
    title: "Career Records",
    subtitle: "Football",
    to: "/athletics/football/records/career-records",
    keywords: ["football", "career", "records"],
  },
  {
    id: "volleyball-home",
    type: "team",
    title: "Volleyball",
    subtitle: "St. Andrew's team home",
    to: "/athletics/volleyball",
    featured: true,
    keywords: ["volleyball", "team", "program", "home", "schedule", "roster", "stats"],
  },
  {
    id: "volleyball-yearly-results",
    type: "page",
    title: "Season Results",
    subtitle: "Volleyball",
    to: "/athletics/volleyball/yearly-results",
    keywords: ["volleyball", "season", "results", "schedule", "archive"],
  },
  {
    id: "volleyball-2025-season",
    type: "page",
    title: "2025 Season",
    subtitle: "Volleyball",
    to: "/athletics/volleyball/seasons/2025",
    keywords: ["volleyball", "2025", "season", "schedule", "roster", "results", "stats"],
  },
  {
    id: "girls-soccer-home",
    type: "team",
    title: "Girls Soccer",
    subtitle: "St. Andrew's team home",
    to: "/athletics/girls/soccer",
    featured: true,
    keywords: ["girls", "soccer", "team", "program", "home", "archive", "results"],
  },
  {
    id: "girls-soccer-yearly-results",
    type: "page",
    title: "Full Year-by-Year Results",
    subtitle: "Girls Soccer",
    to: "/athletics/girls/soccer/yearly-results",
    keywords: ["girls", "soccer", "season", "results", "yearly", "history"],
  },
  {
    id: "girls-soccer-2004-season",
    type: "page",
    title: "Spring 2004 Season",
    subtitle: "Girls Soccer",
    to: "/athletics/girls/soccer/seasons/2004",
    keywords: ["girls", "soccer", "2004", "spring", "season", "schedule", "roster"],
  },
  {
    id: "girls-soccer-20040309-game",
    type: "page",
    title: "Frederica Academy 4, St. Andrew's 0",
    subtitle: "Girls Soccer",
    to: "/athletics/girls/soccer/games/20040309",
    keywords: [
      "girls",
      "soccer",
      "2004",
      "frederica",
      "frederica academy",
      "mary wilkowski",
      "saves",
      "game",
      "result",
    ],
  },
  {
    id: "girls-soccer-20040311-game",
    type: "page",
    title: "St. Andrew's 9, Colleton Prep 0",
    subtitle: "Girls Soccer",
    to: "/athletics/girls/soccer/games/20040311",
    keywords: [
      "girls",
      "soccer",
      "2004",
      "colleton",
      "colleton prep",
      "region",
      "scisa 2-aa",
      "jennifer moesch",
      "mary wilkowski",
      "game",
      "result",
    ],
  },
  {
    id: "girls-soccer-2004031901-game",
    type: "page",
    title: "St. Andrew's 2, Dominion Christian 0",
    subtitle: "Girls Soccer",
    to: "/athletics/girls/soccer/games/2004031901",
    keywords: [
      "girls",
      "soccer",
      "2004",
      "dominion christian",
      "cavalier classic",
      "mount de sales",
      "jennifer moesch",
      "mary wilkowski",
      "game",
      "result",
    ],
  },
  {
    id: "girls-soccer-20040319-game",
    type: "page",
    title: "St. Andrew's 1, First Presbyterian Day 0",
    subtitle: "Girls Soccer",
    to: "/athletics/girls/soccer/games/20040319",
    keywords: [
      "girls",
      "soccer",
      "2004",
      "first presbyterian day",
      "fpd",
      "cavalier classic",
      "mount de sales",
      "jennifer moesch",
      "mary wilkowski",
      "game",
      "result",
    ],
  },
  {
    id: "girls-soccer-20040320-game",
    type: "page",
    title: "Frederica Academy 5, St. Andrew's 0",
    subtitle: "Girls Soccer",
    to: "/athletics/girls/soccer/games/20040320",
    keywords: [
      "girls",
      "soccer",
      "2004",
      "frederica academy",
      "cavalier classic",
      "mount de sales",
      "semifinal",
      "game",
      "result",
    ],
  },
  {
    id: "girls-soccer-2004032001-game",
    type: "page",
    title: "St. Andrew's 3, Fellowship Christian 2",
    subtitle: "Girls Soccer",
    to: "/athletics/girls/soccer/games/2004032001",
    keywords: [
      "girls",
      "soccer",
      "2004",
      "fellowship christian",
      "central fellowship christian",
      "cavalier classic",
      "mount de sales",
      "third place",
      "jennifer moesch",
      "leighanne evans",
      "mary wilkowski",
      "all-tournament",
      "game",
      "result",
    ],
  },
  {
    id: "girls-soccer-20040327-game",
    type: "page",
    title: "St. Andrew's 6, Kings Academy 0",
    subtitle: "Girls Soccer",
    to: "/athletics/girls/soccer/games/20040327",
    keywords: [
      "girls",
      "soccer",
      "2004",
      "kings academy",
      "king's academy",
      "kelme tournament of champions",
      "jennifer moesch",
      "becca timms",
      "maggie hinchey",
      "leighanne evans",
      "mary wilkowski",
      "game",
      "result",
    ],
  },
  {
    id: "girls-soccer-2004032701-game",
    type: "page",
    title: "St. Andrew's 4, Trinity Collegiate 1",
    subtitle: "Girls Soccer",
    to: "/athletics/girls/soccer/games/2004032701",
    keywords: [
      "girls",
      "soccer",
      "2004",
      "trinity collegiate",
      "kelme tournament of champions",
      "jennifer moesch",
      "maggie hinchey",
      "grace wilkowski",
      "mary wilkowski",
      "alyssa pignone",
      "game",
      "result",
    ],
  },
  {
    id: "boys-soccer-home",
    type: "team",
    title: "Boys Soccer",
    subtitle: "St. Andrew's team home",
    to: "/athletics/boys/soccer",
    featured: true,
    keywords: ["boys", "soccer", "team", "program", "home", "archive", "results"],
  },
  {
    id: "boys-soccer-yearly-results",
    type: "page",
    title: "Full Year-by-Year Results",
    subtitle: "Boys Soccer",
    to: "/athletics/boys/soccer/yearly-results",
    keywords: ["boys", "soccer", "season", "results", "yearly", "history"],
  },
  {
    id: "boys-soccer-2004-season",
    type: "page",
    title: "Spring 2004 Season",
    subtitle: "Boys Soccer",
    to: "/athletics/boys/soccer/seasons/2004",
    keywords: ["boys", "soccer", "2004", "spring", "season", "schedule", "roster"],
  },
  {
    id: "boys-soccer-20040322-game",
    type: "page",
    title: "St. Andrew's 4, Cathedral Academy 1",
    subtitle: "Boys Soccer",
    to: "/athletics/boys/soccer/games/20040322",
    keywords: [
      "boys",
      "soccer",
      "2004",
      "cathedral",
      "cathedral academy",
      "region",
      "scisa 2-aa",
      "will massey",
      "hamish huntley",
      "beau hinton",
      "emett eason",
      "game",
      "result",
    ],
  },
  {
    id: "boys-soccer-20040323-game",
    type: "page",
    title: "St. Andrew's 13, Charleston Collegiate 0",
    subtitle: "Boys Soccer",
    to: "/athletics/boys/soccer/games/20040323",
    keywords: [
      "boys",
      "soccer",
      "2004",
      "charleston collegiate",
      "region",
      "scisa 2-aa",
      "beau hinton",
      "omar glenn",
      "hamish huntley",
      "danny eichholz",
      "will massey",
      "jacob rauers",
      "freddy presutto",
      "graham rossell",
      "martin sullivan",
      "game",
      "result",
    ],
  },
  {
    id: "boys-soccer-opponent-history",
    type: "page",
    title: "Opponent Game History",
    subtitle: "Boys Soccer",
    to: "/athletics/boys/soccer/records/opponents",
    keywords: ["boys", "soccer", "opponents", "records", "history", "game"],
  },
  {
    id: "cross-country-home",
    type: "team",
    title: "Cross Country",
    subtitle: "St. Andrew's team home",
    to: "/athletics/cross-country",
    featured: true,
    keywords: [
      "cross country",
      "xc",
      "team",
      "program",
      "home",
      "menu",
      "archive",
      "running",
    ],
  },
  {
    id: "cross-country-champions",
    type: "page",
    title: "List of Champions",
    subtitle: "Cross Country",
    to: "/athletics/cross-country/champions",
    keywords: ["cross country", "xc", "champions", "championships", "running"],
  },
  {
    id: "cross-country-school-records",
    type: "page",
    title: "School Records",
    subtitle: "Cross Country",
    to: "/athletics/cross-country/records/school",
    keywords: ["cross country", "xc", "school", "records", "top times"],
  },
  {
    id: "cross-country-season-results",
    type: "page",
    title: "Season Results",
    subtitle: "Cross Country",
    to: "/athletics/cross-country/yearly-results",
    keywords: ["cross country", "xc", "season", "results", "schedule", "meets"],
  },
  {
    id: "track-home",
    type: "team",
    title: "Track & Field",
    subtitle: "St. Andrew's team home",
    to: "/athletics/track",
    featured: true,
    keywords: ["track", "field", "team", "program", "home", "menu", "archive"],
  },
  {
    id: "track-champions",
    type: "page",
    title: "List of Champions",
    subtitle: "Track & Field",
    to: "/athletics/track/champions",
    keywords: ["track", "field", "champions", "championships"],
  },
  {
    id: "track-school-records",
    type: "page",
    title: "School Records",
    subtitle: "Track & Field",
    to: "/athletics/track/records/school",
    keywords: ["track", "field", "school", "records"],
  },
  {
    id: "track-season-results",
    type: "page",
    title: "Season Results",
    subtitle: "Track & Field",
    to: "/athletics/track/yearly-results",
    keywords: ["track", "field", "season", "results"],
  },
  {
    id: "swimming-home",
    type: "team",
    title: "Swimming",
    subtitle: "St. Andrew's team home",
    to: "/athletics/swimming",
    featured: true,
    keywords: ["swimming", "swim", "team", "program", "home", "archive"],
  },
  {
    id: "swimming-champions",
    type: "page",
    title: "State Champions",
    subtitle: "Swimming",
    to: "/athletics/swimming/champions",
    keywords: ["swimming", "swim", "champions", "championships"],
  },
  {
    id: "swimming-school-records",
    type: "page",
    title: "School Records",
    subtitle: "Swimming",
    to: "/athletics/swimming/records/school",
    keywords: ["swimming", "swim", "school", "records"],
  },
  {
    id: "swimming-season-results",
    type: "page",
    title: "Season Results",
    subtitle: "Swimming",
    to: "/athletics/swimming/yearly-results",
    keywords: ["swimming", "swim", "season", "results"],
  },
  {
    id: "tennis-home",
    type: "team",
    title: "Tennis",
    subtitle: "St. Andrew's team home",
    to: "/athletics/tennis",
    featured: true,
    keywords: ["tennis", "team", "program", "home", "overview"],
  },
  {
    id: "golf-home",
    type: "team",
    title: "Golf",
    subtitle: "St. Andrew's team home",
    to: "/athletics/golf",
    featured: true,
    keywords: ["golf", "team", "program", "home", "archive"],
  },
  {
    id: "golf-season-results",
    type: "page",
    title: "Season Results",
    subtitle: "Golf",
    to: "/athletics/golf/yearly-results",
    keywords: ["golf", "season", "results", "state", "archive"],
  },
];

const SPORT_PLAYER_CONFIGS = [
  {
    key: "boys-basketball",
    sportLabel: "Boys Basketball",
    playerRouteBase: "/athletics/boys/basketball/players",
    playersPath: "public/data/players.json",
    rostersPath: "public/data/boys/basketball/seasonrosters.json",
  },
  {
    key: "baseball",
    sportLabel: "Baseball",
    playerRouteBase: "/athletics/boys/baseball/players",
    playersPath: "public/data/players.json",
    rostersPath: "public/data/boys/baseball/seasonrosters.json",
  },
  {
    key: "girls-basketball",
    sportLabel: "Girls Basketball",
    playerRouteBase: "/athletics/girls/basketball/players",
    playersPath: "public/data/girls/basketball/players.json",
    rostersPath: "public/data/girls/basketball/seasonrosters.json",
  },
  {
    key: "football",
    sportLabel: "Football",
    playerRouteBase: "/athletics/football/players",
    playersPath: "public/data/boys/football/players.json",
    rostersPath: "public/data/boys/football/seasonrosters.json",
  },
  {
    key: "girls-soccer",
    sportLabel: "Girls Soccer",
    playerRouteBase: "/athletics/girls/soccer/players",
    playersPath: "public/data/players.json",
    rostersPath: "public/data/girls/soccer/seasonrosters.json",
  },
  {
    key: "boys-soccer",
    sportLabel: "Boys Soccer",
    playerRouteBase: "/athletics/boys/soccer/players",
    playersPath: "public/data/players.json",
    rostersPath: "public/data/boys/soccer/seasonrosters.json",
  },
  {
    key: "volleyball",
    sportLabel: "Volleyball",
    playerRouteBase: "/athletics/volleyball/players",
    playersPath: "public/data/players.json",
    rostersPath: "public/data/girls/volleyball/seasonrosters.json",
  },
];

const SPORT_TEAM_CONFIGS = [
  {
    key: "boys-basketball",
    sportLabel: "Boys Basketball",
    teamRouteBase: "/athletics/boys/basketball/records/opponents",
    gamesPath: "public/data/boys/basketball/games.json",
  },
  {
    key: "baseball",
    sportLabel: "Baseball",
    teamRouteBase: "/athletics/boys/baseball/records/opponents",
    gamesPath: "public/data/boys/baseball/games.json",
  },
  {
    key: "girls-basketball",
    sportLabel: "Girls Basketball",
    teamRouteBase: "/athletics/girls/basketball/records/opponents",
    gamesPath: "public/data/girls/basketball/games.json",
  },
  {
    key: "football",
    sportLabel: "Football",
    teamRouteBase: "/athletics/football/records/opponents",
    gamesPath: "public/data/boys/football/games.json",
  },
  {
    key: "girls-soccer",
    sportLabel: "Girls Soccer",
    teamRouteBase: "/athletics/girls/soccer/records/opponents",
    gamesPath: "public/data/girls/soccer/games.json",
  },
  {
    key: "boys-soccer",
    sportLabel: "Boys Soccer",
    teamRouteBase: "/athletics/boys/soccer/records/opponents",
    gamesPath: "public/data/boys/soccer/games.json",
  },
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function ensureText(value) {
  return String(value ?? "").trim();
}

function buildSchoolMap() {
  const schools = readJson("public/data/schools.json");
  return new Map(
    schools
      .filter((school) => school?.SchoolID)
      .map((school) => [String(school.SchoolID), school])
  );
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function getPlayerDisplayName(player) {
  return [ensureText(player?.FirstName), ensureText(player?.LastName)]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function buildAthleteEntries() {
  return SPORT_PLAYER_CONFIGS.flatMap((config) => {
    const players = readJson(config.playersPath);
    const rosters = readJson(config.rostersPath);
    const playersById = new Map(
      players
        .filter((player) => player?.PlayerID != null)
        .map((player) => [String(player.PlayerID), player])
    );

    const playerIds = unique(
      rosters.flatMap((roster) =>
        Array.isArray(roster?.Players)
          ? roster.Players.map((player) => String(player.PlayerID))
          : []
      )
    );

    return playerIds
      .map((playerId) => {
        const player = playersById.get(String(playerId));
        if (!player) {
          return null;
        }

        const title = getPlayerDisplayName(player);
        if (!title) {
          return null;
        }

        const gradYear = ensureText(player?.GradYear);
        const gradLabel = gradYear ? `Class of ${gradYear}` : null;

        return {
          id: `${config.key}-athlete-${playerId}`,
          type: "athlete",
          title,
          subtitle: gradLabel
            ? `${config.sportLabel} athlete - ${gradLabel}`
            : `${config.sportLabel} athlete`,
          to: `${config.playerRouteBase}/${playerId}`,
          keywords: unique([
            config.sportLabel,
            "athlete",
            "player",
            "stats",
            "records",
            ensureText(player?.FirstName),
            ensureText(player?.LastName),
            `${ensureText(player?.LastName)} ${ensureText(player?.FirstName)}`.trim(),
            gradYear ? `class of ${gradYear}` : "",
            gradYear ? `grad ${gradYear}` : "",
          ]),
        };
      })
      .filter(Boolean);
  });
}

function buildTeamEntries() {
  const schoolMap = buildSchoolMap();

  return SPORT_TEAM_CONFIGS.flatMap((config) => {
    const games = readJson(config.gamesPath);
    const teamsByName = new Map();

    for (const game of Array.isArray(games) ? games : []) {
      const school = schoolMap.get(String(game?.OpponentID));
      const schoolName = ensureText(school?.Name);
      const opponentName = ensureText(game?.Opponent);
      const title = schoolName || opponentName;

      if (!title || title.toLowerCase() === "unknown") {
        continue;
      }

      if (!teamsByName.has(title)) {
        teamsByName.set(title, {
          aliases: new Set(),
          school,
        });
      }

      const teamEntry = teamsByName.get(title);
      teamEntry.aliases.add(title);

      if (opponentName) {
        teamEntry.aliases.add(opponentName);
      }

      if (school?.ShortName) {
        teamEntry.aliases.add(ensureText(school.ShortName));
      }

      if (school?.Mascot) {
        teamEntry.aliases.add(ensureText(school.Mascot));
      }

      if (school?.City) {
        teamEntry.aliases.add(ensureText(school.City));
      }

      if (school?.State) {
        teamEntry.aliases.add(ensureText(school.State));
      }
    }

    return [...teamsByName.entries()].map(([title, teamData]) => {
      const school = teamData.school;
      const locationBits = [ensureText(school?.City), ensureText(school?.State)].filter(Boolean);
      const subtitle = locationBits.length
        ? `${config.sportLabel} opponent history - ${locationBits.join(", ")}`
        : `${config.sportLabel} opponent history`;

      return {
        id: `${config.key}-team-${title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")}`,
        type: "team",
        title,
        subtitle,
        to: `${config.teamRouteBase}?${new URLSearchParams({ team: title }).toString()}`,
        keywords: unique([
          config.sportLabel,
          "team",
          "opponent",
          "history",
          "records",
          ...teamData.aliases,
        ]),
      };
    });
  });
}

function main() {
  const items = [...PAGE_ENTRIES, ...buildAthleteEntries(), ...buildTeamEntries()];

  fs.mkdirSync(path.dirname(SEARCH_INDEX_OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(
    SEARCH_INDEX_OUTPUT_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        itemCount: items.length,
        items,
      },
      null,
      2
    ) + "\n"
  );

  process.stdout.write(
    `Wrote ${items.length} search entries to ${path.relative(ROOT, SEARCH_INDEX_OUTPUT_PATH)}\n`
  );
}

main();
