export function absUrl(path) {
  return new URL(path, window.location.origin).toString();
}

export async function fetchJson(label, path) {
  const url = absUrl(path);
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();

  if (!res.ok) throw new Error(`${label} failed (HTTP ${res.status}) at ${path}`);

  const trimmed = text.trim();
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
    throw new Error(`${label} did not return JSON at ${path} (returned HTML).`);
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`${label} returned invalid JSON at ${path}: ${String(e?.message || e)}`);
  }
}

export function safeNum(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatRecordValue(value) {
  if (!Number.isFinite(value)) return value;

  const roundedToTenth = Math.round(value * 10) / 10;
  if (Math.abs(roundedToTenth - Math.round(roundedToTenth)) < 1e-9) {
    return String(Math.round(roundedToTenth));
  }

  return roundedToTenth.toFixed(1);
}

export function baseballInningsToOuts(value) {
  const innings = safeNum(value);
  const whole = Math.trunc(innings);
  const decimal = Math.round((innings - whole) * 10);
  return whole * 3 + decimal;
}

export function outsToBaseballInnings(outs) {
  const safeOuts = safeNum(outs);
  const whole = Math.floor(safeOuts / 3);
  const remainder = safeOuts % 3;
  return Number(`${whole}.${remainder}`);
}

export const FIELDING_INNING_KEYS = [
  "P_Innings",
  "C_Innings",
  "1B_Innings",
  "2B_Innings",
  "3B_Innings",
  "SS_Innings",
  "LF_Innings",
  "CF_Innings",
  "RF_Innings",
];

export function baseballInningOuts(stats, key) {
  const outsKey = `${key}Outs`;
  return stats?.[outsKey] != null ? safeNum(stats[outsKey]) : baseballInningsToOuts(stats?.[key]);
}

export function baseballInningValue(stats, key) {
  return outsToBaseballInnings(baseballInningOuts(stats, key));
}

export function addBaseballInnings(total, row, key) {
  const outsKey = `${key}Outs`;
  total[outsKey] = safeNum(total[outsKey]) + baseballInningsToOuts(row?.[key]);
  total[key] = outsToBaseballInnings(total[outsKey]);
}

export function getSeasonKey(game) {
  if (!game) return "Unknown Season";

  if (game.SeasonID != null && String(game.SeasonID).trim() !== "") {
    return String(game.SeasonID).trim();
  }

  if (game.Season != null && String(game.Season).trim() !== "") {
    return String(game.Season).trim();
  }

  return "Unknown Season";
}

export function formatSeasonLabel(seasonKey) {
  const text = String(seasonKey ?? "").trim();
  if (!text) return "Unknown Season";
  return text;
}

export function tryParseGameDate(game) {
  const gid = String(game?.GameID ?? "");

  if (/^\d{8,}$/.test(gid)) {
    const y = Number(gid.slice(0, 4));
    const m = Number(gid.slice(4, 6));
    const d = Number(gid.slice(6, 8));
    const dt = new Date(Date.UTC(y, m - 1, d));
    if (!Number.isNaN(dt.getTime())) return dt;
  }

  return null;
}

export function formatDateFromGame(game) {
  const dt = tryParseGameDate(game);
  if (!dt) return "Unknown Date";

  return dt.toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getGameResult(game) {
  if (!game) return "—";

  const team = Number(game.TeamScore);
  const opp = Number(game.OpponentScore);
  if (!Number.isFinite(team) || !Number.isFinite(opp)) return "—";

  let outcome = "Tie";
  if (team > opp) outcome = "Win";
  else if (team < opp) outcome = "Loss";

  return `${team}-${opp} ${outcome}`;
}

export function extractGameDateKey(gameId) {
  const text = String(gameId ?? "");
  const match = text.match(/^(\d{8})/);
  return match ? Number(match[1]) : NaN;
}

export function todayDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return Number(`${year}${month}${day}`);
}

export function isFutureGame(game, currentDateKey = todayDateKey()) {
  const gameDateKey = extractGameDateKey(game?.GameID);
  return Number.isFinite(gameDateKey) && gameDateKey > currentDateKey;
}

export function createEmptyTeamGameTotals() {
  return {
    GamesPlayed: 1,
    NoHitters: 0,
    PerfectGames: 0,
    PA: 0,
    AB: 0,
    R: 0,
    H: 0,
    "1B": 0,
    "2B": 0,
    "3B": 0,
    HR: 0,
    RBI: 0,
    BB: 0,
    SO: 0,
    HBP: 0,
    SAC: 0,
    SF: 0,
    ROE: 0,
    FC: 0,
    SB: 0,
    CS: 0,
    TB: 0,
    IP: 0,
    IPOuts: 0,
    BF: 0,
    Pitches: 0,
    W: 0,
    L: 0,
    SV: 0,
    SVO: 0,
    BS: 0,
    H_Allowed: 0,
    R_Allowed: 0,
    ER: 0,
    BB_Allowed: 0,
    SO_Pitching: 0,
    HBP_Pitching: 0,
    BK: 0,
    PIK_Allowed: 0,
    CS_Pitching: 0,
    SB_Allowed: 0,
    WP: 0,
    A: 0,
    PO: 0,
    E: 0,
    DP: 0,
    TP: 0,
    PB: 0,
    PIK_Fielding: 0,
    CI: 0,
    P_Innings: 0,
    C_Innings: 0,
    "1B_Innings": 0,
    "2B_Innings": 0,
    "3B_Innings": 0,
    SS_Innings: 0,
    LF_Innings: 0,
    CF_Innings: 0,
    RF_Innings: 0,
  };
}

export function accumulateTeamGameStats(total, row) {
  total.PA += safeNum(row.PA);
  total.AB += safeNum(row.AB);
  total.R += safeNum(row.R);
  total.H += safeNum(row.H);
  total["1B"] += safeNum(row["1B"]);
  total["2B"] += safeNum(row["2B"]);
  total["3B"] += safeNum(row["3B"]);
  total.HR += safeNum(row.HR);
  total.RBI += safeNum(row.RBI);
  total.BB += safeNum(row.BB);
  total.SO += safeNum(row.SO);
  total.HBP += safeNum(row.HBP);
  total.SAC += safeNum(row.SAC);
  total.SF += safeNum(row.SF);
  total.ROE += safeNum(row.ROE);
  total.FC += safeNum(row.FC);
  total.SB += safeNum(row.SB);
  total.CS += safeNum(row.CS);
  total.TB += safeNum(row.TB);
  total.IPOuts += baseballInningsToOuts(row.IP);
  total.IP = outsToBaseballInnings(total.IPOuts);
  total.BF += safeNum(row.BF);
  total.Pitches += safeNum(row.Pitches);
  total.SV += safeNum(row.SV);
  total.SVO += safeNum(row.SVO);
  total.BS += safeNum(row.BS);
  total.H_Allowed += safeNum(row.H_Allowed);
  total.R_Allowed += safeNum(row.R_Allowed);
  total.ER += safeNum(row.ER);
  total.BB_Allowed += safeNum(row.BB_Allowed);
  total.SO_Pitching += safeNum(row.SO_Pitching);
  total.HBP_Pitching += safeNum(row.HBP_Pitching);
  total.BK += safeNum(row.BK);
  total.PIK_Allowed += safeNum(row.PIK_Allowed);
  total.CS_Pitching += safeNum(row.CS_Pitching);
  total.SB_Allowed += safeNum(row.SB_Allowed);
  total.WP += safeNum(row.WP);
  total.A += safeNum(row.A);
  total.PO += safeNum(row.PO);
  total.E += safeNum(row.E);
  total.DP += safeNum(row.DP);
  total.TP += safeNum(row.TP);
  total.PB += safeNum(row.PB);
  total.PIK_Fielding += safeNum(row.PIK_Fielding);
  total.CI += safeNum(row.CI);
  FIELDING_INNING_KEYS.forEach((key) => addBaseballInnings(total, row, key));
}

function applyOfficialGameFallbacks(total, game, hadDetailedRows) {
  const teamScore = Number(game?.TeamScore);
  const oppScore = Number(game?.OpponentScore);
  const lineScore = game?.LineScore;

  if (Number.isFinite(teamScore)) total.R = teamScore;
  else if (Number.isFinite(Number(lineScore?.StAndrewsTotals?.R))) total.R = Number(lineScore.StAndrewsTotals.R);

  if (Number.isFinite(oppScore)) total.R_Allowed = oppScore;
  else if (Number.isFinite(Number(lineScore?.OpponentTotals?.R))) total.R_Allowed = Number(lineScore.OpponentTotals.R);

  if (Number.isFinite(Number(lineScore?.StAndrewsTotals?.H))) {
    total.H = Number(lineScore.StAndrewsTotals.H);
  }

  if (Number.isFinite(Number(lineScore?.StAndrewsTotals?.E))) {
    total.E = Number(lineScore.StAndrewsTotals.E);
  }

  if (Number.isFinite(Number(lineScore?.OpponentTotals?.H))) {
    total.H_Allowed = Number(lineScore.OpponentTotals.H);
  }

  if (Number.isFinite(teamScore) && Number.isFinite(oppScore)) {
    if (teamScore > oppScore) total.W = 1;
    else if (teamScore < oppScore) total.L = 1;
  } else {
    const result = String(game?.Result ?? "").trim().toUpperCase();
    if (result === "W") total.W = 1;
    if (result === "L") total.L = 1;
  }

  const inningsCount = Array.isArray(lineScore?.Innings) ? lineScore.Innings.length : 0;
  const hasMinimumLength = total.IPOuts >= 15 || inningsCount >= 5;

  if (hasMinimumLength && safeNum(total.H_Allowed) === 0) {
    total.NoHitters = 1;
  }

  if (
    hadDetailedRows &&
    hasMinimumLength &&
    safeNum(total.H_Allowed) === 0 &&
    safeNum(total.BB_Allowed) === 0 &&
    safeNum(total.HBP_Pitching) === 0 &&
    safeNum(total.E) === 0
  ) {
    total.PerfectGames = 1;
  }
}

export function buildTeamGameTotals(gamesDataRaw, playerStatsDataRaw) {
  const gamesData = Array.isArray(gamesDataRaw) ? gamesDataRaw : [];
  const playerStatsData = Array.isArray(playerStatsDataRaw) ? playerStatsDataRaw : [];
  const currentDateKey = todayDateKey();

  const statsByGame = new Map();
  for (const row of playerStatsData) {
    if (!row || row.GameID == null) continue;
    const key = String(row.GameID);
    if (!statsByGame.has(key)) statsByGame.set(key, []);
    statsByGame.get(key).push(row);
  }

  return gamesData
    .filter((game) => game?.GameID != null && !isFutureGame(game, currentDateKey))
    .map((game) => {
      const totals = createEmptyTeamGameTotals();
      const gameRows = statsByGame.get(String(game.GameID)) || [];

      for (const row of gameRows) {
        accumulateTeamGameStats(totals, row);
      }

      applyOfficialGameFallbacks(totals, game, gameRows.length > 0);

      return {
        ...totals,
        GameID: String(game.GameID),
        SeasonKey: getSeasonKey(game),
        date: formatDateFromGame(game),
        opponent: game?.Opponent ?? "Unknown Opponent",
        gameResult: getGameResult(game),
      };
    });
}
