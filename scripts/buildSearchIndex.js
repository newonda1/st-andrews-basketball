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
    keywords: ["girls", "soccer", "team", "program", "home", "coming soon"],
  },
  {
    id: "boys-soccer-home",
    type: "team",
    title: "Boys Soccer",
    subtitle: "St. Andrew's team home",
    to: "/athletics/boys/soccer",
    keywords: ["boys", "soccer", "team", "program", "home", "coming soon"],
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
