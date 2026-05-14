export const SOFTBALL_BASE_PATH = "/athletics/softball";

const SOFTBALL_PLAYER_IDS_BY_NAME = new Map([
  ["emily aimone", "200409"],
  ["rose wilkowski", "200422"],
  ["stephanie vine", "200429"],
  ["alix erola-rebellato", "200698"],
  ["jordan bazemore", "200699"],
]);

export function getSoftballPlayerIdForName(name) {
  return SOFTBALL_PLAYER_IDS_BY_NAME.get(String(name || "").toLowerCase()) || "";
}

export const softballGames = [
  {
    id: "20050406-1",
    GameID: "20050406-1",
    season: 2005,
    Season: 2005,
    date: "2005-04-06",
    displayDate: "April 6, 2005",
    opponent: "Thomas Heyward",
    Opponent: "Thomas Heyward",
    OpponentID: "sc-thomas-heyward-academy-ridgeland",
    opponentFullName: "Thomas Heyward Academy",
    opponentAbbr: "TH",
    stAndrewsRecord: "0-1",
    result: "L",
    Result: "L",
    score: "Thomas Heyward 13, St. Andrew's 1",
    teamScore: 1,
    TeamScore: 1,
    opponentScore: 13,
    OpponentScore: 13,
    locationType: "Away",
    LocationType: "Away",
    gameType: "Region",
    GameType: "Region",
    lineScore: {
      innings: ["1", "2", "3", "4"],
      opponent: ["7", "0", "6", "X"],
      stAndrews: ["0", "0", "1", "0"],
      opponentTotals: { runs: 13, hits: 9, errors: null },
      stAndrewsTotals: { runs: 1, hits: 1, errors: 7 },
      raw: {
        opponent: "TH 706 x - 13 9 NA",
        stAndrews: "SA 001 0 - 1 1 7",
      },
    },
    pitchingDecisions: {
      win: {
        player: "Jordan Christensen",
      },
      loss: {
        player: "Rose Wilkowski",
        playerId: "200422",
        record: "0-1",
      },
    },
    hittingLeaders: [
      {
        player: "Rose Wilkowski",
        playerId: "200422",
        atBats: 2,
        hits: 1,
        doubles: 0,
        triples: 0,
        homeRuns: 0,
        rbi: 1,
      },
    ],
    notes: [
      "Thomas Heyward defeated St. Andrew's 13-1 in the first game of a region doubleheader reported April 7, 2005.",
      "Rose Wilkowski drove in St. Andrew's run. The published pitching record line appears inconsistent with the team record after the doubleheader, so the archive normalizes this as Rose's first recovered loss.",
    ],
  },
  {
    id: "20050406-2",
    GameID: "20050406-2",
    season: 2005,
    Season: 2005,
    date: "2005-04-06",
    displayDate: "April 6, 2005",
    opponent: "Thomas Heyward",
    Opponent: "Thomas Heyward",
    OpponentID: "sc-thomas-heyward-academy-ridgeland",
    opponentFullName: "Thomas Heyward Academy",
    opponentAbbr: "TH",
    stAndrewsRecord: "0-2",
    result: "L",
    Result: "L",
    score: "Thomas Heyward 10, St. Andrew's 0",
    teamScore: 0,
    TeamScore: 0,
    opponentScore: 10,
    OpponentScore: 10,
    locationType: "Away",
    LocationType: "Away",
    gameType: "Region",
    GameType: "Region",
    lineScore: {
      innings: ["1", "2", "3", "4"],
      opponent: ["1", "1", "8", "X"],
      stAndrews: ["0", "0", "0", "0"],
      opponentTotals: { runs: 10, hits: 5, errors: null },
      stAndrewsTotals: { runs: 0, hits: 0, errors: 4 },
      raw: {
        opponent: "TH 118 x - 10 5 NA",
        stAndrews: "SA 000 0 - 0 0 4",
      },
    },
    pitchingDecisions: {
      win: {
        player: "Jordan Christensen",
      },
      loss: {
        player: "Rose Wilkowski",
        playerId: "200422",
        record: "0-2",
      },
    },
    hittingLeaders: [],
    notes: [
      "Thomas Heyward completed the region doubleheader sweep with a 10-0 win in Game 2.",
      "The Savannah Morning News listed St. Andrew's at 0-2 overall and 0-2 in SCISA 2-AA after the second game.",
    ],
  },
  {
    id: "20050410",
    GameID: "20050410",
    season: 2005,
    Season: 2005,
    date: "2005-04-10",
    displayDate: "Between April 6 and April 18",
    opponent: "Unknown",
    Opponent: "Unknown",
    OpponentID: "",
    opponentFullName: "Unknown",
    opponentAbbr: "TBD",
    stAndrewsRecord: "1-2",
    result: "W",
    Result: "W",
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
      win: {
        player: "Rose Wilkowski",
        playerId: "200422",
        record: "1-2",
      },
      loss: null,
    },
    hittingLeaders: [],
    notes: [
      "This is a placeholder for an unidentified St. Andrew's win between the Thomas Heyward doubleheader and the April 18 Agape Christian result.",
      "The April 18 box score listed St. Andrew's at 3-2 after that win, requiring two missing wins after the 0-2 Thomas Heyward start.",
    ],
  },
  {
    id: "20050414",
    GameID: "20050414",
    season: 2005,
    Season: 2005,
    date: "2005-04-14",
    displayDate: "Between April 6 and April 18",
    opponent: "Unknown",
    Opponent: "Unknown",
    OpponentID: "",
    opponentFullName: "Unknown",
    opponentAbbr: "TBD",
    stAndrewsRecord: "2-2",
    result: "W",
    Result: "W",
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
      win: {
        player: "Rose Wilkowski",
        playerId: "200422",
        record: "2-2",
      },
      loss: null,
    },
    hittingLeaders: [],
    notes: [
      "This is a placeholder for the second unidentified St. Andrew's win needed to reconcile the April 18 record line.",
      "The opponent, score, and site have not been recovered yet.",
    ],
  },
  {
    id: "20050418",
    GameID: "20050418",
    season: 2005,
    Season: 2005,
    date: "2005-04-18",
    displayDate: "April 18, 2005",
    opponent: "Agape Christian",
    Opponent: "Agape Christian",
    OpponentID: "",
    opponentFullName: "Agape Christian",
    opponentAbbr: "AC",
    stAndrewsRecord: "3-2",
    result: "W",
    Result: "W",
    score: "St. Andrew's 12, Agape Christian 2",
    teamScore: 12,
    TeamScore: 12,
    opponentScore: 2,
    OpponentScore: 2,
    locationType: "Home",
    LocationType: "Home",
    gameType: "",
    GameType: "",
    lineScore: {
      innings: ["1", "2", "3", "4", "5"],
      opponent: ["1", "0", "0", "0", "1"],
      stAndrews: ["1", "1", "1", "8", "1"],
      opponentTotals: { runs: 2, hits: 2, errors: 3 },
      stAndrewsTotals: { runs: 12, hits: 13, errors: 1 },
      raw: {
        opponent: "AC 100 01 - 2 2 3",
        stAndrews: "SA 111 81 - 12 13 1",
      },
    },
    pitchingDecisions: {
      win: {
        player: "Rose Wilkowski",
        playerId: "200422",
        record: "3-2",
      },
      loss: null,
    },
    hittingLeaders: [
      {
        player: "Rose Wilkowski",
        playerId: "200422",
        atBats: 4,
        hits: 3,
        doubles: 0,
        triples: 0,
        homeRuns: 0,
        rbi: null,
      },
      {
        player: "Emily Aimone",
        playerId: "200409",
        atBats: 4,
        hits: 2,
        doubles: 0,
        triples: 0,
        homeRuns: 0,
        rbi: null,
      },
      {
        player: "Stephanie Vine",
        playerId: "200429",
        atBats: 4,
        hits: 4,
        doubles: 0,
        triples: 0,
        homeRuns: 0,
        rbi: null,
      },
    ],
    notes: [
      "St. Andrew's defeated Agape Christian 12-2 in five innings in the April 18 result reported by the Savannah Morning News.",
      "Rose Wilkowski earned the win, and the Saints' leading hitters were Rose Wilkowski at 3-for-4, Emily Aimone at 2-for-4, and Stephanie Vine at 4-for-4.",
    ],
  },
  {
    id: "20050420",
    GameID: "20050420",
    season: 2005,
    Season: 2005,
    date: "2005-04-20",
    displayDate: "April 20, 2005",
    opponent: "St. Paul's",
    Opponent: "St. Paul's",
    OpponentID: "sc-st-pauls-country-day-school-hollywood",
    opponentFullName: "St. Paul's Country Day School",
    opponentAbbr: "SP",
    opponentRecord: "0-6",
    stAndrewsRecord: "4-2",
    result: "W",
    Result: "W",
    score: "St. Andrew's 13, St. Paul's 3",
    teamScore: 13,
    TeamScore: 13,
    opponentScore: 3,
    OpponentScore: 3,
    locationType: "Away",
    LocationType: "Away",
    gameType: "",
    GameType: "",
    lineScore: {
      innings: ["1", "2", "3", "4", "5"],
      opponent: ["0", "1", "0", "0", "2"],
      stAndrews: ["7", "0", "0", "0", "6"],
      opponentTotals: { runs: 3, hits: 2, errors: 2 },
      stAndrewsTotals: { runs: 13, hits: 9, errors: 1 },
      raw: {
        opponent: "SP 010 02 - 3 2 2",
        stAndrews: "SA 700 06 - 13 9 1",
      },
    },
    pitchingDecisions: {
      win: {
        player: "Rose Wilkowski",
        playerId: "200422",
        record: "4-2",
      },
      loss: null,
    },
    hittingLeaders: [
      {
        player: "Emily Aimone",
        playerId: "200409",
        atBats: 4,
        hits: 2,
        doubles: 2,
        triples: 0,
        homeRuns: 0,
        rbi: 1,
      },
      {
        player: "Rose Wilkowski",
        playerId: "200422",
        atBats: 4,
        hits: 2,
        doubles: 1,
        triples: 0,
        homeRuns: 0,
        rbi: 3,
      },
    ],
    notes: [
      "St. Andrew's defeated St. Paul's Country Day 13-3 in five innings.",
      "Emily Aimone went 2-for-4 with two doubles and an RBI. Rose Wilkowski went 2-for-4 with a double and three RBIs, and earned the win to move to 4-2.",
    ],
  },
  {
    id: "20050427",
    GameID: "20050427",
    season: 2005,
    Season: 2005,
    date: "2005-04-27",
    displayDate: "April 27, 2005",
    opponent: "St. Paul's",
    Opponent: "St. Paul's",
    OpponentID: "sc-st-pauls-country-day-school-hollywood",
    opponentFullName: "St. Paul's Country Day School",
    opponentAbbr: "SP",
    stAndrewsRecord: "5-2",
    result: "W",
    Result: "W",
    score: "St. Andrew's 12, St. Paul's 2",
    teamScore: 12,
    TeamScore: 12,
    opponentScore: 2,
    OpponentScore: 2,
    locationType: "Home",
    LocationType: "Home",
    gameType: "",
    GameType: "",
    lineScore: {
      innings: ["1", "2", "3", "4", "5"],
      opponent: ["1", "0", "0", "0", "1"],
      stAndrews: ["4", "8", "0", "0", "X"],
      opponentTotals: { runs: 2, hits: 4, errors: 1 },
      stAndrewsTotals: { runs: 12, hits: 10, errors: 0 },
      raw: {
        opponent: "SP 100 01 - 2 4 1",
        stAndrews: "SA 480 0x - 12 10 0",
      },
    },
    pitchingDecisions: {
      win: {
        player: "Rose Wilkowski",
        playerId: "200422",
        record: "5-2",
      },
      loss: null,
    },
    hittingLeaders: [
      {
        player: "Rose Wilkowski",
        playerId: "200422",
        atBats: 3,
        hits: 2,
        doubles: 0,
        triples: 0,
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
        rbi: 2,
      },
    ],
    notes: [
      "St. Andrew's defeated St. Paul's 12-2 in the April 27 result reported by the Savannah Morning News.",
      "Rose Wilkowski earned the win to move to 5-2, went 2-for-3, and drove in three runs. Stephanie Vine went 3-for-3 with two RBIs.",
    ],
  },
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
  {
    id: "20060405",
    GameID: "20060405",
    season: 2006,
    Season: 2006,
    date: "2006-04-05",
    displayDate: "April 5, 2006",
    opponent: "Bible Baptist",
    Opponent: "Bible Baptist",
    OpponentID: "ga-bible-baptist-school-savannah",
    opponentFullName: "Bible Baptist School",
    opponentAbbr: "BB",
    opponentRecord: "8-7",
    stAndrewsRecord: "3-1",
    result: "W",
    Result: "W",
    score: "St. Andrew's 14, Bible Baptist 12",
    teamScore: 14,
    TeamScore: 14,
    opponentScore: 12,
    OpponentScore: 12,
    locationType: "Home",
    LocationType: "Home",
    gameType: "",
    GameType: "",
    lineScore: {
      innings: ["1", "2", "3", "4", "5", "6"],
      opponent: ["3", "0", "3", "3", "1", "2"],
      stAndrews: ["0", "11", "0", "2", "1", "X"],
      opponentTotals: { runs: 12, hits: 12, errors: 2 },
      stAndrewsTotals: { runs: 14, hits: 13, errors: 4 },
      raw: {
        opponent: "BB 303 312 - 12 12 2",
        stAndrews: "SA 0(11)0 21x - 14 13 4",
      },
    },
    pitchingDecisions: {
      win: {
        player: "Rose Wilkowski",
        playerId: "200422",
        record: "3-1",
      },
      loss: null,
    },
    hittingLeaders: [
      {
        player: "Stephanie Vine",
        playerId: "200429",
        atBats: 4,
        hits: 4,
        doubles: 0,
        triples: 0,
        homeRuns: 0,
        rbi: 2,
      },
      {
        player: "Rose Wilkowski",
        playerId: "200422",
        atBats: 4,
        hits: 4,
        doubles: 0,
        triples: 1,
        homeRuns: 1,
        rbi: 3,
      },
      {
        player: "Alix Erola-Rebellato",
        playerId: "200698",
        atBats: 4,
        hits: 4,
        doubles: 0,
        triples: 0,
        homeRuns: 0,
        rbi: 3,
      },
    ],
    notes: [
      "St. Andrew's outlasted Bible Baptist 14-12 at home in the fourth game of the Spring 2006 season.",
      "Rose Wilkowski earned the win to move to 3-1, while Stephanie Vine, Rose Wilkowski, and Alix Erola-Rebellato each went 4-for-4.",
    ],
  },
  {
    id: "20060407",
    GameID: "20060407",
    season: 2006,
    Season: 2006,
    date: "2006-04-07",
    displayDate: "April 7, 2006",
    opponent: "Faith Christian",
    Opponent: "Faith Christian",
    OpponentID: "sc-faith-christian-summerville",
    opponentFullName: "Faith Christian",
    opponentAbbr: "FC",
    opponentRecord: "2-3",
    stAndrewsRecord: "4-1",
    result: "W",
    Result: "W",
    score: "St. Andrew's 6, Faith Christian 4",
    teamScore: 6,
    TeamScore: 6,
    opponentScore: 4,
    OpponentScore: 4,
    locationType: "Home",
    LocationType: "Home",
    gameType: "",
    GameType: "",
    lineScore: {
      innings: ["1", "2", "3", "4", "5", "6", "7"],
      opponent: ["0", "0", "3", "1", "0", "0", "0"],
      stAndrews: ["0", "1", "1", "0", "0", "1", "3"],
      opponentTotals: { runs: 4, hits: 5, errors: 1 },
      stAndrewsTotals: { runs: 6, hits: 11, errors: 4 },
      raw: {
        opponent: "FC 003 100 0 - 4 5 1",
        stAndrews: "SA 011 001 3 - 6 11 4",
      },
    },
    pitchingDecisions: {
      win: {
        player: "Rose Wilkowski",
        playerId: "200422",
        record: "4-1",
      },
      loss: {
        player: "Meghan",
      },
    },
    hittingLeaders: [
      {
        player: "Stephanie Vine",
        playerId: "200429",
        atBats: 4,
        hits: 3,
        doubles: 0,
        triples: 0,
        homeRuns: 0,
        rbi: 4,
      },
    ],
    notes: [
      "St. Andrew's defeated Faith Christian 6-4 at home in the fifth game of the Spring 2006 season.",
      "Rose Wilkowski earned the win to move to 4-1, and Stephanie Vine drove in four runs on a 3-for-4 day.",
    ],
  },
  {
    id: "20060417",
    GameID: "20060417",
    season: 2006,
    Season: 2006,
    date: "2006-04-17",
    displayDate: "Between April 7 and April 27",
    opponent: "Unknown",
    Opponent: "Unknown",
    OpponentID: "",
    opponentFullName: "Unknown",
    opponentAbbr: "TBD",
    stAndrewsRecord: "4-2",
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
        record: "4-2",
      },
    },
    hittingLeaders: [],
    notes: [
      "This is a placeholder for the missing sixth game of the Spring 2006 softball season.",
      "The known April 27 box score lists St. Andrew's at 5-2 and Rose Wilkowski at 5-2 after that win, so the missing game has been recorded as a loss until the opponent and box score are recovered.",
    ],
  },
  {
    id: "20060427",
    GameID: "20060427",
    season: 2006,
    Season: 2006,
    date: "2006-04-27",
    displayDate: "April 27, 2006",
    opponent: "Cathedral Academy",
    Opponent: "Cathedral Academy",
    OpponentID: "sc-cathedral-academy-north-charleston",
    opponentFullName: "Cathedral Academy",
    opponentAbbr: "CA",
    opponentRecord: "3-5",
    stAndrewsRecord: "5-2",
    result: "W",
    Result: "W",
    score: "St. Andrew's 10, Cathedral Academy 4",
    teamScore: 10,
    TeamScore: 10,
    opponentScore: 4,
    OpponentScore: 4,
    locationType: "Away",
    LocationType: "Away",
    gameType: "Non-Region",
    GameType: "Non-Region",
    lineScore: {
      innings: ["1", "2", "3", "4", "5", "6", "7"],
      opponent: ["1", "0", "0", "0", "0", "2", "1"],
      stAndrews: ["3", "4", "0", "1", "2", "0", "0"],
      opponentTotals: { runs: 4, hits: 4, errors: 0 },
      stAndrewsTotals: { runs: 10, hits: 12, errors: 2 },
      raw: {
        opponent: "CA 100 002 1 - 4 4 0",
        stAndrews: "SAS 340 120 0 - 10 12 2",
      },
    },
    pitchingDecisions: {
      win: {
        player: "Rose Wilkowski",
        playerId: "200422",
        record: "5-2",
      },
      loss: {
        player: "Lauren Rickus",
        record: "3-5",
      },
    },
    hittingLeaders: [
      {
        player: "Rose Wilkowski",
        playerId: "200422",
        atBats: 5,
        hits: 3,
        doubles: 0,
        triples: 0,
        homeRuns: 0,
        rbi: 1,
      },
      {
        player: "Stephanie Vine",
        playerId: "200429",
        atBats: 5,
        hits: 3,
        doubles: 0,
        triples: 0,
        homeRuns: 0,
        rbi: 2,
      },
    ],
    notes: [
      "St. Andrew's defeated Cathedral Academy 10-4 on April 27, 2006.",
      "Rose Wilkowski earned the win to move to 5-2, while Rose and Stephanie Vine each collected three hits.",
    ],
  },
];

export function getSoftballGameById(gameId) {
  return softballGames.find((game) => game.id === String(gameId));
}

export function getSoftballSeasonGames(season = 2006) {
  return softballGames
    .filter((game) => Number(game.season) === Number(season))
    .sort(
      (a, b) =>
        String(a.date || "").localeCompare(String(b.date || "")) ||
        String(a.id).localeCompare(String(b.id), undefined, { numeric: true })
    );
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
    .sort(
      (a, b) =>
        String(b.date || "").localeCompare(String(a.date || "")) ||
        String(b.id).localeCompare(String(a.id), undefined, { numeric: true })
    );
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
