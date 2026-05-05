const RUNS_PER_WIN = 10;
const REPLACEMENT_RUNS_ALLOWED_PER_7 = 7;

const battingWeights = {
  single: 0.47,
  double: 0.78,
  triple: 1.09,
  homeRun: 1.4,
  walk: 0.33,
  hitByPitch: 0.33,
  battingOut: -0.25,
  stolenBase: 0.2,
  caughtStealing: -0.4,
  replacementPerPlateAppearance: 0.02,
};

const fieldingWeights = {
  assist: 0.05,
  putout: 0.02,
  error: -0.75,
  doublePlay: 0.15,
  triplePlay: 0.3,
  passedBall: -0.35,
  pickoff: 0.5,
  catcherInterference: -0.5,
};

function safeNum(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function baseballInningsToOuts(value) {
  const innings = safeNum(value);
  const whole = Math.trunc(innings);
  const decimal = Math.round((innings - whole) * 10);
  return whole * 3 + decimal;
}

function battingRuns(stats) {
  const singles =
    stats?.["1B"] != null
      ? safeNum(stats["1B"])
      : Math.max(
          safeNum(stats?.H) -
            safeNum(stats?.["2B"]) -
            safeNum(stats?.["3B"]) -
            safeNum(stats?.HR),
          0
        );
  const battingOuts =
    Math.max(safeNum(stats?.AB) - safeNum(stats?.H), 0) +
    safeNum(stats?.SAC) +
    safeNum(stats?.SF);

  return (
    singles * battingWeights.single +
    safeNum(stats?.["2B"]) * battingWeights.double +
    safeNum(stats?.["3B"]) * battingWeights.triple +
    safeNum(stats?.HR) * battingWeights.homeRun +
    safeNum(stats?.BB) * battingWeights.walk +
    safeNum(stats?.HBP) * battingWeights.hitByPitch +
    battingOuts * battingWeights.battingOut +
    safeNum(stats?.SB) * battingWeights.stolenBase +
    safeNum(stats?.CS) * battingWeights.caughtStealing +
    safeNum(stats?.PA) * battingWeights.replacementPerPlateAppearance
  );
}

function pitchingRuns(stats) {
  const outs =
    stats?.IPOuts != null ? safeNum(stats.IPOuts) : baseballInningsToOuts(stats?.IP);
  if (!outs) return 0;

  const replacementRunsAllowed =
    REPLACEMENT_RUNS_ALLOWED_PER_7 * (outs / 21);
  return replacementRunsAllowed - safeNum(stats?.R_Allowed);
}

function fieldingRuns(stats) {
  return (
    safeNum(stats?.A) * fieldingWeights.assist +
    safeNum(stats?.PO) * fieldingWeights.putout +
    safeNum(stats?.E) * fieldingWeights.error +
    safeNum(stats?.DP) * fieldingWeights.doublePlay +
    safeNum(stats?.TP) * fieldingWeights.triplePlay +
    safeNum(stats?.PB) * fieldingWeights.passedBall +
    safeNum(stats?.PIK_Fielding) * fieldingWeights.pickoff +
    safeNum(stats?.CI) * fieldingWeights.catcherInterference
  );
}

export function calculateSasWar(stats) {
  const runs = battingRuns(stats) + pitchingRuns(stats) + fieldingRuns(stats);
  return runs / RUNS_PER_WIN;
}

export const SAS_WAR_NOTE =
  "SAS WAR is a St. Andrew's-specific estimate using offensive linear weights, SB/CS, PA replacement credit, pitching runs prevented versus a replacement-level seven-inning baseline, and a conservative fielding component for PO/A/DP/TP/PIK with penalties for E/PB/CI. It is not MLB bWAR/fWAR.";
