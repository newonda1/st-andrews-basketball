export const SOFTBALL_BASE_PATH = "/athletics/softball";

const SOFTBALL_PLAYER_IDS_BY_NAME = new Map([
  ["rose wilkowski", "200422"],
  ["stephanie vine", "200429"],
  ["jordan bazemore", "200699"],
]);

export function getSoftballPlayerIdForName(name) {
  return SOFTBALL_PLAYER_IDS_BY_NAME.get(String(name || "").toLowerCase()) || "";
}

export const softballGames = [
  {
    id: "20060324",
    GameID: "20060324",
    season: 2006,
    Season: 2006,
    date: "2006-03-24",
    displayDate: "March 24, 2006",
    opponent: "Abundant Life",
    Opponent: "Abundant Life",
    OpponentID: "sc-abundant-life-academy-hardeeville",
    opponentFullName: "Abundant Life Academy",
    opponentAbbr: "ALA",
    opponentRecord: "1-4",
    stAndrewsRecord: "1-0",
    result: "W",
    Result: "W",
    score: "St. Andrew's 16, Abundant Life 3",
    teamScore: 16,
    TeamScore: 16,
    opponentScore: 3,
    OpponentScore: 3,
    locationType: "Home",
    LocationType: "Home",
    gameType: "Non-Region",
    GameType: "Non-Region",
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
        playerId: "200422",
        record: "1-0",
      },
      loss: {
        player: "Chelsea Hayes",
      },
    },
    hittingLeaders: [
      {
        player: "Rose Wilkowski",
        playerId: "200422",
        atBats: 3,
        hits: 2,
        doubles: 0,
        triples: 0,
        homeRuns: 1,
        rbi: 3,
      },
      {
        player: "Stephanie Vine",
        playerId: "200429",
        atBats: 3,
        hits: 2,
        doubles: 1,
        triples: 0,
        homeRuns: 0,
        rbi: 3,
      },
      {
        player: "Jordan Bazemore",
        playerId: "200699",
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
  {
    id: "20060330",
    GameID: "20060330",
    season: 2006,
    Season: 2006,
    date: "2006-03-30",
    displayDate: "Between March 24 and March 31",
    opponent: "Unknown",
    Opponent: "Unknown",
    OpponentID: "",
    opponentFullName: "Unknown",
    opponentAbbr: "TBD",
    stAndrewsRecord: "1-1",
    result: "L",
    Result: "L",
    score: "Missing result",
    teamScore: null,
    TeamScore: null,
    opponentScore: null,
    OpponentScore: null,
    locationType: "",
    LocationType: "",
    gameType: "",
    GameType: "",
    isPlaceholder: true,
    lineScore: null,
    pitchingDecisions: {
      win: null,
      loss: {
        player: "Rose Wilkowski",
        playerId: "200422",
        record: "1-1",
      },
    },
    hittingLeaders: [],
    notes: [
      "This is a placeholder for the missing second game of the Spring 2006 softball season.",
      "The known March 31 box score lists Rose Wilkowski at 2-1 after that win, so the missing game has been recorded as a loss until the opponent and box score are recovered.",
    ],
  },
  {
    id: "20060331",
    GameID: "20060331",
    season: 2006,
    Season: 2006,
    date: "2006-03-31",
    displayDate: "March 31, 2006",
    opponent: "Cathedral Academy",
    Opponent: "Cathedral Academy",
    OpponentID: "sc-cathedral-academy-north-charleston",
    opponentFullName: "Cathedral Academy",
    opponentAbbr: "CAT",
    opponentRecord: "2-2",
    stAndrewsRecord: "2-1",
    result: "W",
    Result: "W",
    score: "St. Andrew's 11, Cathedral Academy 1",
    teamScore: 11,
    TeamScore: 11,
    opponentScore: 1,
    OpponentScore: 1,
    locationType: "Home",
    LocationType: "Home",
    gameType: "Non-Region",
    GameType: "Non-Region",
    lineScore: {
      innings: ["1", "2", "3", "4", "5"],
      opponent: ["0", "0", "1", "0", "0"],
      stAndrews: ["2", "0", "2", "2", "5"],
      opponentTotals: { runs: 1, hits: 2, errors: 0 },
      stAndrewsTotals: { runs: 11, hits: 7, errors: 0 },
      raw: {
        opponent: "Cathedral 001 00 - 1 2 0",
        stAndrews: "SA 202 25 - 11 7 0",
      },
    },
    pitchingDecisions: {
      win: {
        player: "Rose Wilkowski",
        playerId: "200422",
        record: "2-1",
      },
      loss: {
        player: "Rickus",
      },
    },
    hittingLeaders: [
      {
        player: "Rose Wilkowski",
        playerId: "200422",
        atBats: 4,
        hits: 3,
        doubles: 0,
        triples: 1,
        homeRuns: 0,
        rbi: 3,
      },
      {
        player: "Stephanie Vine",
        playerId: "200429",
        atBats: 3,
        hits: 3,
        doubles: 0,
        triples: 0,
        homeRuns: 0,
        rbi: 4,
      },
    ],
    notes: [
      "St. Andrew's defeated Cathedral Academy 11-1 in five innings at home on March 31, 2006.",
      "Rose Wilkowski earned the win to move to 2-1, while Rose and Stephanie Vine combined for six of the Saints' seven hits.",
    ],
  },
];

export function getSoftballGameById(gameId) {
  return softballGames.find((game) => game.id === String(gameId));
}

export function getSoftballSeasonGames(season = 2006) {
  return softballGames
    .filter((game) => Number(game.season) === Number(season))
    .sort((a, b) => Number(a.id) - Number(b.id));
}

export function getSoftballSeasonSummary(season = 2006) {
  return getSoftballSeasonGames(season).reduce(
    (summary, game) => {
      summary.games += 1;
      summary.runsFor += Number(game.teamScore || 0);
      summary.runsAgainst += Number(game.opponentScore || 0);
      if (game.result === "W") summary.wins += 1;
      if (game.result === "L") summary.losses += 1;
      if (game.result === "T") summary.ties += 1;
      return summary;
    },
    { games: 0, wins: 0, losses: 0, ties: 0, runsFor: 0, runsAgainst: 0 },
  );
}

export function getSoftballPlayerById(playerId) {
  const key = String(playerId || "");
  const name = [...SOFTBALL_PLAYER_IDS_BY_NAME.entries()].find(([, id]) => id === key)?.[0];
  if (!name) return null;
  const [firstName, ...lastNameParts] = name.split(" ");
  const displayName = [firstName, ...lastNameParts]
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  return {
    id: key,
    playerId: key,
    name: displayName,
    firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
    lastName: lastNameParts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" "),
  };
}

export function getSoftballPlayerIdsForSeason(season = 2006) {
  const ids = new Set();

  getSoftballSeasonGames(season).forEach((game) => {
    game.hittingLeaders.forEach((row) => ids.add(row.playerId || getSoftballPlayerIdForName(row.player)));
    if (game.pitchingDecisions.win?.playerId) ids.add(game.pitchingDecisions.win.playerId);
  });

  return [...ids].filter(Boolean);
}

export function getSoftballSeasonHittingRows(season = 2006) {
  const rows = new Map();

  getSoftballSeasonGames(season).forEach((game) => {
    game.hittingLeaders.forEach((leader) => {
      const playerId = leader.playerId || getSoftballPlayerIdForName(leader.player);
      if (!playerId) return;

      if (!rows.has(playerId)) {
        rows.set(playerId, {
          playerId,
          player: leader.player,
          games: new Set(),
          atBats: 0,
          hits: 0,
          doubles: 0,
          triples: 0,
          homeRuns: 0,
          rbi: 0,
        });
      }

      const row = rows.get(playerId);
      row.games.add(game.id);
      row.atBats += Number(leader.atBats || 0);
      row.hits += Number(leader.hits || 0);
      row.doubles += Number(leader.doubles || 0);
      row.triples += Number(leader.triples || 0);
      row.homeRuns += Number(leader.homeRuns || 0);
      row.rbi += Number(leader.rbi || 0);
    });
  });

  return [...rows.values()]
    .map((row) => ({
      ...row,
      gamesPlayed: row.games.size,
      average: row.atBats ? row.hits / row.atBats : 0,
    }))
    .sort((a, b) => b.hits - a.hits || a.player.localeCompare(b.player));
}

export function getSoftballSeasonPitchingRows(season = 2006) {
  const rows = new Map();

  getSoftballSeasonGames(season).forEach((game) => {
    const decisions = [
      { ...game.pitchingDecisions.win, decision: "win" },
      { ...game.pitchingDecisions.loss, decision: "loss" },
    ].filter((decision) => decision.playerId);

    decisions.forEach((decision) => {
      if (!rows.has(decision.playerId)) {
        rows.set(decision.playerId, {
          playerId: decision.playerId,
          player: decision.player,
          appearances: 0,
          wins: 0,
          losses: 0,
          saves: 0,
          record: decision.record || "",
        });
      }

      const row = rows.get(decision.playerId);
      row.appearances += 1;
      if (decision.decision === "win") row.wins += 1;
      if (decision.decision === "loss") row.losses += 1;
      row.record = decision.record || row.record;
    });
  });

  return [...rows.values()].sort((a, b) => b.wins - a.wins || a.player.localeCompare(b.player));
}

export function getSoftballPlayerGameRows(playerId) {
  const key = String(playerId || "");

  return softballGames
    .map((game) => {
      const batting = game.hittingLeaders.find((row) => String(row.playerId) === key) || null;
      const pitching =
        String(game.pitchingDecisions.win?.playerId || "") === key
          ? {
              appearances: 1,
              wins: 1,
              losses: 0,
              saves: 0,
              record: game.pitchingDecisions.win.record || "",
            }
          : String(game.pitchingDecisions.loss?.playerId || "") === key
            ? {
                appearances: 1,
                wins: 0,
                losses: 1,
                saves: 0,
                record: game.pitchingDecisions.loss.record || "",
              }
            : null;

      if (!batting && !pitching) return null;
      return { ...game, batting, pitching };
    })
    .filter(Boolean)
    .sort((a, b) => Number(b.id) - Number(a.id));
}

export function getSoftballPlayerTotals(playerId) {
  return getSoftballPlayerGameRows(playerId).reduce(
    (totals, game) => {
      if (game.batting) {
        totals.battingGames += 1;
        totals.atBats += Number(game.batting.atBats || 0);
        totals.hits += Number(game.batting.hits || 0);
        totals.doubles += Number(game.batting.doubles || 0);
        totals.triples += Number(game.batting.triples || 0);
        totals.homeRuns += Number(game.batting.homeRuns || 0);
        totals.rbi += Number(game.batting.rbi || 0);
      }

      if (game.pitching) {
        totals.pitchingAppearances += Number(game.pitching.appearances || 0);
        totals.wins += Number(game.pitching.wins || 0);
        totals.losses += Number(game.pitching.losses || 0);
        totals.saves += Number(game.pitching.saves || 0);
      }

      return totals;
    },
    {
      battingGames: 0,
      atBats: 0,
      hits: 0,
      doubles: 0,
      triples: 0,
      homeRuns: 0,
      rbi: 0,
      pitchingAppearances: 0,
      wins: 0,
      losses: 0,
      saves: 0,
    }
  );
}
