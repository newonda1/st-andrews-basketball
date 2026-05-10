export const softballGames = [
  {
    id: "20060324",
    date: "2006-03-24",
    displayDate: "March 24, 2006",
    opponent: "Abundant Life",
    opponentFullName: "Abundant Life Academy",
    opponentAbbr: "ALA",
    opponentRecord: "1-4",
    stAndrewsRecord: "1-0",
    result: "W",
    score: "St. Andrew's 16, Abundant Life 3",
    teamScore: 16,
    opponentScore: 3,
    lineScore: {
      innings: ["1", "2", "3", "4", "5"],
      opponent: ["1", "0", "1", "0", "1"],
      stAndrews: ["0", "14", "0", "2", "X"],
      opponentTotals: { runs: 3, hits: 3, errors: 3 },
      stAndrewsTotals: { runs: 16, hits: 7, errors: 1 },
      raw: {
        opponent: "ALA 101 01 - 3 3 3",
        stAndrews: "SAS 0(14)0 2X - 16 7 1",
      },
    },
    pitchingDecisions: {
      win: {
        player: "Rose Wilkowski",
        record: "1-0",
      },
      loss: {
        player: "Chelsea Hayes",
      },
    },
    hittingLeaders: [
      {
        player: "Rose Wilkowski",
        atBats: 3,
        hits: 2,
        doubles: 0,
        triples: 0,
        homeRuns: 1,
        rbi: 3,
      },
      {
        player: "Stephanie Vine",
        atBats: 3,
        hits: 2,
        doubles: 1,
        triples: 0,
        homeRuns: 0,
        rbi: 3,
      },
      {
        player: "Jordan Bazemore",
        atBats: 3,
        hits: 2,
        doubles: 1,
        triples: 0,
        homeRuns: 0,
        rbi: 2,
      },
    ],
    notes: [
      "St. Andrew's opened the Spring 2006 softball season with a run-rule win over Abundant Life.",
      "The published box score listed three St. Andrew's hitting leaders and full team line score totals.",
    ],
  },
];

export function getSoftballGameById(gameId) {
  return softballGames.find((game) => game.id === String(gameId));
}

export function getSoftballSeasonSummary() {
  return softballGames.reduce(
    (summary, game) => {
      summary.games += 1;
      summary.runsFor += game.teamScore;
      summary.runsAgainst += game.opponentScore;
      if (game.result === "W") summary.wins += 1;
      if (game.result === "L") summary.losses += 1;
      if (game.result === "T") summary.ties += 1;
      return summary;
    },
    { games: 0, wins: 0, losses: 0, ties: 0, runsFor: 0, runsAgainst: 0 },
  );
}
