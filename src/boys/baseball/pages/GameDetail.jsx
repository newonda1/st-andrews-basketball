import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

function baseballInningsToOuts(value) {
  if (value == null || value === "") return 0;
  const str = String(value);
  if (!str.includes(".")) return (Number(str) || 0) * 3;

  const [whole, fraction] = str.split(".");
  return (Number(whole || 0) || 0) * 3 + (Number((fraction || "0").charAt(0)) || 0);
}

function outsToBaseballInnings(outs) {
  const whole = Math.floor((outs || 0) / 3);
  const remainder = (outs || 0) % 3;
  return `${whole}.${remainder}`;
}

function formatDateFromGameID(gameId) {
  if (!gameId) return "";

  const digits = String(gameId).slice(0, 8);
  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6));
  const day = Number(digits.slice(6, 8));

  if (!year || !month || !day) return "";

  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatPct(num, den, digits = 3) {
  if (!den) return "-";
  return (num / den).toFixed(digits).replace(/^0(?=\.)/, "");
}

function formatDecimal(value, digits = 2) {
  if (!Number.isFinite(value)) return "-";
  return value.toFixed(digits);
}

function safeNumber(value) {
  return Number(value || 0);
}

function getPlayerName(playersMap, playerId) {
  const player = playersMap.get(Number(playerId));
  return player ? `${player.FirstName} ${player.LastName}` : "Unknown Player";
}

function getJerseyNumber(jerseyMap, playerId) {
  const jersey = jerseyMap.get(Number(playerId));
  return Number.isFinite(jersey) ? jersey : "";
}

function buildPhotoUrl(playerId) {
  return `/images/boys/baseball/players/${playerId}.jpg`;
}

function formatOpponentAbbr(game) {
  if (game?.OpponentAbbr) return game.OpponentAbbr;
  const opponent = String(game?.Opponent || "").trim();
  if (!opponent) return "OPP";
  const words = opponent
    .replace(/[^A-Za-z0-9\s&'-]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return "OPP";
  return words
    .slice(0, 4)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function getDecisionPitcher(rows, key) {
  return rows.find((row) => Number(row[key] || 0) > 0) || null;
}

function formatPitcherDecisionSuffix(decisionTotals, key) {
  if (!decisionTotals) return "";
  if (key === "SV") {
    return decisionTotals.SV > 0 ? ` (${decisionTotals.SV})` : "";
  }
  return ` (${decisionTotals.W}-${decisionTotals.L})`;
}

const sectionTitleClass = "text-2xl font-semibold mt-8 mb-4";
const cardClass = "overflow-x-auto rounded-lg shadow border border-gray-200 bg-white";
const thClass = "px-3 py-2 text-center bg-gray-100 text-gray-700 font-semibold";
const tdClass = "px-3 py-2 text-center border-t border-gray-200";

export default function GameDetail() {
  const { gameId } = useParams();
  const numericGameId = Number(gameId);

  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [seasonRosters, setSeasonRosters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [gamesRes, statsRes, playersRes, rostersRes] = await Promise.all([
          fetch("/data/boys/baseball/games.json"),
          fetch("/data/boys/baseball/playergamestats.json"),
          fetch("/data/boys/players.json"),
          fetch("/data/boys/baseball/seasonrosters.json"),
        ]);

        const [gamesData, statsData, playersData, rostersData] = await Promise.all([
          gamesRes.json(),
          statsRes.json(),
          playersRes.json(),
          rostersRes.json(),
        ]);

        setGames(Array.isArray(gamesData) ? gamesData : []);
        setPlayerStats(Array.isArray(statsData) ? statsData : []);
        setPlayers(Array.isArray(playersData) ? playersData : []);
        setSeasonRosters(Array.isArray(rostersData) ? rostersData : []);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const game = useMemo(
    () => games.find((g) => Number(g.GameID) === numericGameId) || null,
    [games, numericGameId]
  );

  const playersMap = useMemo(() => {
    const map = new Map();
    players.forEach((player) => map.set(Number(player.PlayerID), player));
    return map;
  }, [players]);

  const jerseyMap = useMemo(() => {
    const seasonId = game?.Season;
    const roster = seasonRosters.find(
      (record) => Number(record.SeasonID) === Number(seasonId) || String(record.SeasonID) === String(seasonId)
    );

    const map = new Map();
    (roster?.Players || []).forEach((entry) => {
      map.set(Number(entry.PlayerID), Number(entry.JerseyNumber));
    });
    return map;
  }, [seasonRosters, game]);

  const gameStats = useMemo(
    () => playerStats.filter((stat) => Number(stat.GameID) === numericGameId),
    [playerStats, numericGameId]
  );

  const seasonPitcherDecisionMap = useMemo(() => {
    if (!game) return new Map();

    const seasonGames = games
      .filter((g) => Number(g.Season) === Number(game.Season))
      .filter((g) => Number(g.GameID) <= Number(game.GameID))
      .map((g) => Number(g.GameID));

    const seasonGameIdSet = new Set(seasonGames);
    const map = new Map();

    playerStats
      .filter((stat) => seasonGameIdSet.has(Number(stat.GameID)))
      .forEach((stat) => {
        const playerId = Number(stat.PlayerID);
        if (!map.has(playerId)) {
          map.set(playerId, { W: 0, L: 0, SV: 0 });
        }
        const totals = map.get(playerId);
        totals.W += safeNumber(stat.W);
        totals.L += safeNumber(stat.L);
        totals.SV += safeNumber(stat.SV);
      });

    return map;
  }, [games, playerStats, game]);

  const seasonCumulativeMap = useMemo(() => {
    if (!game) return new Map();

    const seasonGames = games
      .filter((g) => Number(g.Season) === Number(game.Season))
      .filter((g) => Number(g.GameID) <= Number(game.GameID))
      .map((g) => Number(g.GameID));

    const seasonGameIdSet = new Set(seasonGames);
    const map = new Map();

    playerStats
      .filter((stat) => seasonGameIdSet.has(Number(stat.GameID)))
      .forEach((stat) => {
        const playerId = Number(stat.PlayerID);
        if (!map.has(playerId)) {
          map.set(playerId, {
            H: 0,
            AB: 0,
            ipOuts: 0,
            HAllowed: 0,
            ER: 0,
            BBAllowed: 0,
            PO: 0,
            A: 0,
            E: 0,
          });
        }

        const totals = map.get(playerId);
        totals.H += safeNumber(stat.H);
        totals.AB += safeNumber(stat.AB);
        totals.ipOuts += baseballInningsToOuts(stat.IP);
        totals.HAllowed += safeNumber(stat.H_Allowed);
        totals.ER += safeNumber(stat.ER);
        totals.BBAllowed += safeNumber(stat.BB_Allowed);
        totals.PO += safeNumber(stat.PO);
        totals.A += safeNumber(stat.A);
        totals.E += safeNumber(stat.E);
      });

    return map;
  }, [games, playerStats, game]);

  const hittingRows = useMemo(() => {
    return gameStats
      .map((stat) => {
        const cumulative = seasonCumulativeMap.get(Number(stat.PlayerID)) || { H: 0, AB: 0 };
        return {
          PlayerID: Number(stat.PlayerID),
          jersey: getJerseyNumber(jerseyMap, stat.PlayerID),
          name: getPlayerName(playersMap, stat.PlayerID),
          PA: safeNumber(stat.PA),
          AB: safeNumber(stat.AB),
          R: safeNumber(stat.R),
          H: safeNumber(stat.H),
          Single: safeNumber(stat["1B"]),
          Double: safeNumber(stat["2B"]),
          Triple: safeNumber(stat["3B"]),
          HR: safeNumber(stat.HR),
          RBI: safeNumber(stat.RBI),
          BB: safeNumber(stat.BB),
          SO: safeNumber(stat.SO),
          HBP: safeNumber(stat.HBP),
          SF: safeNumber(stat.SF),
          SB: safeNumber(stat.SB),
          TB: safeNumber(stat.TB),
          seasonAVG: cumulative.AB ? cumulative.H / cumulative.AB : NaN,
        };
      })
      .filter((row) => row.PA || row.AB || row.BB || row.HBP)
      .sort((a, b) => {
        if (a.jersey !== b.jersey) return a.jersey - b.jersey;
        return a.name.localeCompare(b.name);
      });
  }, [gameStats, jerseyMap, playersMap, seasonCumulativeMap]);

  const pitchingRows = useMemo(() => {
    return gameStats
      .map((stat) => {
        const ipOuts = baseballInningsToOuts(stat.IP);
        const cumulative = seasonCumulativeMap.get(Number(stat.PlayerID)) || {
          ipOuts: 0,
          HAllowed: 0,
          ER: 0,
          BBAllowed: 0,
        };
        return {
          PlayerID: Number(stat.PlayerID),
          jersey: getJerseyNumber(jerseyMap, stat.PlayerID),
          name: getPlayerName(playersMap, stat.PlayerID),
          IP: ipOuts,
          W: safeNumber(stat.W),
          L: safeNumber(stat.L),
          SV: safeNumber(stat.SV),
          H: safeNumber(stat.H_Allowed),
          R: safeNumber(stat.R_Allowed),
          ER: safeNumber(stat.ER),
          BB: safeNumber(stat.BB_Allowed),
          SO: safeNumber(stat.SO_Pitching),
          BF: safeNumber(stat.BF),
          Pitches: safeNumber(stat.Pitches),
          seasonERA: cumulative.ipOuts ? (cumulative.ER * 21) / cumulative.ipOuts : NaN,
          seasonWHIP: cumulative.ipOuts ? ((cumulative.HAllowed + cumulative.BBAllowed) * 3) / cumulative.ipOuts : NaN,
        };
      })
      .filter((row) => row.IP > 0 || row.BF > 0)
      .sort((a, b) => {
        if (b.IP !== a.IP) return b.IP - a.IP;
        if (a.jersey !== b.jersey) return a.jersey - b.jersey;
        return a.name.localeCompare(b.name);
      });
  }, [gameStats, jerseyMap, playersMap, seasonCumulativeMap]);

  const fieldingRows = useMemo(() => {
    return gameStats
      .map((stat) => {
        const inningsOuts = [
          "C_Innings",
          "1B_Innings",
          "2B_Innings",
          "3B_Innings",
          "SS_Innings",
          "LF_Innings",
          "CF_Innings",
          "RF_Innings",
          "SF_Innings",
        ].reduce((sum, key) => sum + baseballInningsToOuts(stat[key]), 0);

        const po = safeNumber(stat.PO);
        const a = safeNumber(stat.A);
        const e = safeNumber(stat.E);
        const tc = po + a + e;

        const cumulative = seasonCumulativeMap.get(Number(stat.PlayerID)) || { PO: 0, A: 0, E: 0 };
        const cumulativeTC = cumulative.PO + cumulative.A + cumulative.E;
        return {
          PlayerID: Number(stat.PlayerID),
          jersey: getJerseyNumber(jerseyMap, stat.PlayerID),
          name: getPlayerName(playersMap, stat.PlayerID),
          INN: inningsOuts,
          PO: po,
          A: a,
          E: e,
          TC: tc,
          DP: safeNumber(stat.DP),
          PB: safeNumber(stat.PB),
          FPCT: tc ? (po + a) / tc : NaN,
          seasonFPCT: cumulativeTC ? (cumulative.PO + cumulative.A) / cumulativeTC : NaN,
        };
      })
      .filter((row) => row.INN > 0 || row.PO || row.A || row.E || row.PB)
      .sort((a, b) => {
        if (a.jersey !== b.jersey) return a.jersey - b.jersey;
        return a.name.localeCompare(b.name);
      });
  }, [gameStats, jerseyMap, playersMap, seasonCumulativeMap]);

  const hittingTotals = useMemo(() => {
    return hittingRows.reduce(
      (totals, row) => ({
        PA: totals.PA + row.PA,
        AB: totals.AB + row.AB,
        R: totals.R + row.R,
        H: totals.H + row.H,
        Double: totals.Double + row.Double,
        Triple: totals.Triple + row.Triple,
        HR: totals.HR + row.HR,
        RBI: totals.RBI + row.RBI,
        BB: totals.BB + row.BB,
        SO: totals.SO + row.SO,
        SB: totals.SB + row.SB,
        TB: totals.TB + row.TB,
      }),
      { PA: 0, AB: 0, R: 0, H: 0, Double: 0, Triple: 0, HR: 0, RBI: 0, BB: 0, SO: 0, SB: 0, TB: 0 }
    );
  }, [hittingRows]);

  const pitchingTotals = useMemo(() => {
    const totalOuts = pitchingRows.reduce((sum, row) => sum + row.IP, 0);
    const totalH = pitchingRows.reduce((sum, row) => sum + row.H, 0);
    const totalR = pitchingRows.reduce((sum, row) => sum + row.R, 0);
    const totalER = pitchingRows.reduce((sum, row) => sum + row.ER, 0);
    const totalBB = pitchingRows.reduce((sum, row) => sum + row.BB, 0);
    const totalSO = pitchingRows.reduce((sum, row) => sum + row.SO, 0);
    const totalPitches = pitchingRows.reduce((sum, row) => sum + row.Pitches, 0);

    return {
      IP: totalOuts,
      H: totalH,
      R: totalR,
      ER: totalER,
      BB: totalBB,
      SO: totalSO,
      Pitches: totalPitches,
      ERA: totalOuts ? (totalER * 21) / totalOuts : NaN,
      WHIP: totalOuts ? ((totalH + totalBB) * 3) / totalOuts : NaN,
    };
  }, [pitchingRows]);

  const fieldingTotals = useMemo(() => {
    const po = fieldingRows.reduce((sum, row) => sum + row.PO, 0);
    const a = fieldingRows.reduce((sum, row) => sum + row.A, 0);
    const e = fieldingRows.reduce((sum, row) => sum + row.E, 0);
    const tc = fieldingRows.reduce((sum, row) => sum + row.TC, 0);
    const dp = fieldingRows.reduce((sum, row) => sum + row.DP, 0);
    const pb = fieldingRows.reduce((sum, row) => sum + row.PB, 0);

    return {
      INN: fieldingRows.reduce((sum, row) => sum + row.INN, 0),
      PO: po,
      A: a,
      E: e,
      TC: tc,
      DP: dp,
      PB: pb,
      FPCT: tc ? (po + a) / tc : NaN,
    };
  }, [fieldingRows]);

  if (loading) {
    return <div className="max-w-6xl mx-auto py-6 text-center text-gray-600">Loading game details...</div>;
  }

  if (!game) {
    return (
      <div className="max-w-6xl mx-auto py-6 text-center">
        <h1 className="text-3xl font-bold mb-3">Game Not Found</h1>
        <p className="text-gray-600 mb-4">We could not find a baseball game with that ID.</p>
        <Link to="/athletics/boys/baseball" className="text-blue-700 hover:underline">
          Back to Boys' Baseball
        </Link>
      </div>
    );
  }

  const complete = game.Result === "W" || game.Result === "L";

  const lineScore = game.LineScore || null;
  const innings = Array.isArray(lineScore?.Innings) ? lineScore.Innings : [];
  const stAndrewsLine = Array.isArray(lineScore?.StAndrews) ? lineScore.StAndrews : [];
  const opponentLine = Array.isArray(lineScore?.Opponent) ? lineScore.Opponent : [];
  const opponentAbbr = formatOpponentAbbr(game);

  const winningPitcher = getDecisionPitcher(pitchingRows, "W");
  const losingPitcher = getDecisionPitcher(pitchingRows, "L");
  const savePitcher = getDecisionPitcher(pitchingRows, "SV");

  return (
    <div className="max-w-6xl mx-auto py-4 space-y-8">
      <div className="space-y-2">
        <div className="text-sm text-gray-600">
          <Link to="/athletics/boys/baseball" className="text-blue-700 hover:underline">
            Boys' Baseball
          </Link>
          <span> / </span>
          <Link to={`/athletics/boys/baseball/seasons/${game.Season}`} className="text-blue-700 hover:underline">
            {game.Season} Season
          </Link>
        </div>

        <h1 className="text-3xl font-bold">
          St. Andrew&apos;s vs. {game.Opponent}
        </h1>

        <div className="text-gray-700 flex flex-wrap gap-x-4 gap-y-1">
          <span>{formatDateFromGameID(game.GameID)}</span>
          <span>•</span>
          <span>{game.LocationType}</span>
          <span>•</span>
          <span>{game.GameType}</span>
        </div>
      </div>

      <section className="rounded-2xl shadow border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-gray-200">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-gray-500 font-semibold mb-2">Final Score</p>
              <div className="flex items-end gap-5 flex-wrap">
                <div>
                  <div className="text-sm font-semibold tracking-wide text-gray-500 uppercase mb-1">SAS</div>
                  <div className="text-5xl md:text-6xl font-black text-gray-900 leading-none">{game.TeamScore ?? "-"}</div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-300 leading-none">-</div>
                <div>
                  <div className="text-sm font-semibold tracking-wide text-gray-500 uppercase mb-1">{opponentAbbr}</div>
                  <div className="text-5xl md:text-6xl font-black text-gray-900 leading-none">{game.OpponentScore ?? "-"}</div>
                </div>
              </div>
            </div>

            <div className="text-left md:text-right">
              <div className="text-sm uppercase tracking-wide text-gray-500 font-semibold">Result</div>
              <div className={`text-3xl font-black ${game.Result === "W" ? "text-green-700" : game.Result === "L" ? "text-red-700" : "text-gray-500"}`}>
                {game.Result || "Upcoming"}
              </div>
            </div>
          </div>
        </div>

        {game.Recap ? (
          <div className="px-5 py-5 border-b border-gray-200">
            <div className="mb-3">
              <p className="text-sm uppercase tracking-[0.18em] text-gray-500 font-semibold mb-2">Game Recap</p>
              {game.RecapTitle ? <h2 className="text-2xl font-semibold text-gray-900">{game.RecapTitle}</h2> : null}
            </div>
            <div className="text-gray-800 leading-7 whitespace-pre-line">{game.Recap}</div>
          </div>
        ) : null}

        {lineScore ? (
          <div className="px-3 md:px-5 py-4 border-b border-gray-200 overflow-x-auto">
            <table className="min-w-full text-sm md:text-base border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left bg-gray-50 text-gray-500 font-semibold border border-gray-200"> </th>
                  {innings.map((inning, idx) => (
                    <th key={`inning-${idx}`} className="px-4 py-3 text-center bg-gray-50 text-gray-600 font-semibold border border-gray-200 min-w-[52px]">
                      {inning}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center bg-gray-100 text-gray-800 font-bold border border-gray-200 min-w-[52px]">R</th>
                  <th className="px-4 py-3 text-center bg-gray-100 text-gray-800 font-bold border border-gray-200 min-w-[52px]">H</th>
                  <th className="px-4 py-3 text-center bg-gray-100 text-gray-800 font-bold border border-gray-200 min-w-[52px]">E</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-4 font-bold text-left border border-gray-200 whitespace-nowrap">{opponentAbbr}</td>
                  {innings.map((_, idx) => (
                    <td key={`opp-${idx}`} className="px-4 py-4 text-center text-xl md:text-2xl font-medium border border-gray-200">
                      {opponentLine[idx] ?? ""}
                    </td>
                  ))}
                  <td className="px-4 py-4 text-center text-xl md:text-2xl font-extrabold border border-gray-200 bg-gray-50">{lineScore?.OpponentTotals?.R ?? game.OpponentScore ?? "-"}</td>
                  <td className="px-4 py-4 text-center text-xl md:text-2xl font-extrabold border border-gray-200 bg-gray-50">{lineScore?.OpponentTotals?.H ?? "-"}</td>
                  <td className="px-4 py-4 text-center text-xl md:text-2xl font-extrabold border border-gray-200 bg-gray-50">{lineScore?.OpponentTotals?.E ?? "-"}</td>
                </tr>
                <tr>
                  <td className="px-4 py-4 font-black text-left border border-gray-200 whitespace-nowrap">SAS</td>
                  {innings.map((_, idx) => (
                    <td key={`st-${idx}`} className="px-4 py-4 text-center text-xl md:text-2xl font-semibold border border-gray-200">
                      {stAndrewsLine[idx] ?? ""}
                    </td>
                  ))}
                  <td className="px-4 py-4 text-center text-xl md:text-2xl font-black border border-gray-200 bg-blue-50 text-blue-900">{lineScore?.StAndrewsTotals?.R ?? game.TeamScore ?? "-"}</td>
                  <td className="px-4 py-4 text-center text-xl md:text-2xl font-black border border-gray-200 bg-blue-50 text-blue-900">{lineScore?.StAndrewsTotals?.H ?? "-"}</td>
                  <td className="px-4 py-4 text-center text-xl md:text-2xl font-black border border-gray-200 bg-blue-50 text-blue-900">{lineScore?.StAndrewsTotals?.E ?? "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}

        {(winningPitcher || losingPitcher || savePitcher) ? (
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {winningPitcher ? (
              <div className="p-4 flex items-center gap-4">
                <img
                  src={buildPhotoUrl(winningPitcher.PlayerID)}
                  alt={winningPitcher.name}
                  className="w-16 h-16 rounded-full object-cover border border-gray-300 bg-gray-50"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div>
                  <div className="text-sm font-black tracking-wide text-gray-500 uppercase">Win</div>
                  <div className="text-xl font-bold text-gray-900">
                    {winningPitcher.name}
                    {formatPitcherDecisionSuffix(seasonPitcherDecisionMap.get(winningPitcher.PlayerID), "W")}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {outsToBaseballInnings(winningPitcher.IP)} IP, {winningPitcher.H} H, {winningPitcher.ER} ER, {winningPitcher.SO} K, {winningPitcher.BB} BB
                  </div>
                </div>
              </div>
            ) : <div className="hidden md:block" />}

            {losingPitcher ? (
              <div className="p-4 flex items-center gap-4">
                <img
                  src={buildPhotoUrl(losingPitcher.PlayerID)}
                  alt={losingPitcher.name}
                  className="w-16 h-16 rounded-full object-cover border border-gray-300 bg-gray-50"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div>
                  <div className="text-sm font-black tracking-wide text-gray-500 uppercase">Loss</div>
                  <div className="text-xl font-bold text-gray-900">
                    {losingPitcher.name}
                    {formatPitcherDecisionSuffix(seasonPitcherDecisionMap.get(losingPitcher.PlayerID), "L")}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {outsToBaseballInnings(losingPitcher.IP)} IP, {losingPitcher.H} H, {losingPitcher.ER} ER, {losingPitcher.SO} K, {losingPitcher.BB} BB
                  </div>
                </div>
              </div>
            ) : <div className="hidden md:block" />}

            {savePitcher ? (
              <div className="p-4 flex items-center gap-4">
                <img
                  src={buildPhotoUrl(savePitcher.PlayerID)}
                  alt={savePitcher.name}
                  className="w-16 h-16 rounded-full object-cover border border-gray-300 bg-gray-50"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div>
                  <div className="text-sm font-black tracking-wide text-gray-500 uppercase">Save</div>
                  <div className="text-xl font-bold text-gray-900">
                    {savePitcher.name}
                    {formatPitcherDecisionSuffix(seasonPitcherDecisionMap.get(savePitcher.PlayerID), "SV")}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {outsToBaseballInnings(savePitcher.IP)} IP, {savePitcher.H} H, {savePitcher.ER} ER, {savePitcher.SO} K, {savePitcher.BB} BB
                  </div>
                </div>
              </div>
            ) : <div className="hidden md:block" />}
          </div>
        ) : null}
      </section>


      <section>
        <h2 className={sectionTitleClass}>St. Andrew&apos;s Hitting</h2>
        <div className={cardClass}>
          <table className="min-w-full bg-white text-sm">
            <thead>
              <tr>
                <th className={thClass}>#</th>
                <th className={`${thClass} text-left`}>HITTERS</th>
                <th className={thClass}>PA</th>
                <th className={thClass}>AB</th>
                <th className={thClass}>R</th>
                <th className={thClass}>H</th>
                <th className={thClass}>2B</th>
                <th className={thClass}>3B</th>
                <th className={thClass}>HR</th>
                <th className={thClass}>RBI</th>
                <th className={thClass}>BB</th>
                <th className={thClass}>SO</th>
                <th className={thClass}>SB</th>
                <th className={thClass}>AVG</th>
              </tr>
            </thead>
            <tbody>
              {hittingRows.map((row) => (
                <tr key={row.PlayerID} className="hover:bg-gray-50">
                  <td className={tdClass}>{row.jersey}</td>
                  <td className={`${tdClass} text-left whitespace-nowrap`}>
                    <div className="flex items-center gap-3">
                      <img
                        src={buildPhotoUrl(row.PlayerID)}
                        alt={row.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-300"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <span>{row.name}</span>
                    </div>
                  </td>
                  <td className={tdClass}>{row.PA}</td>
                  <td className={tdClass}>{row.AB}</td>
                  <td className={tdClass}>{row.R}</td>
                  <td className={tdClass}>{row.H}</td>
                  <td className={tdClass}>{row.Double}</td>
                  <td className={tdClass}>{row.Triple}</td>
                  <td className={tdClass}>{row.HR}</td>
                  <td className={tdClass}>{row.RBI}</td>
                  <td className={tdClass}>{row.BB}</td>
                  <td className={tdClass}>{row.SO}</td>
                  <td className={tdClass}>{row.SB}</td>
                  <td className={tdClass}>{Number.isFinite(row.seasonAVG) ? row.seasonAVG.toFixed(3).replace(/^0(?=\.)/, "") : "-"}</td>
                </tr>
              ))}
              <tr className="font-semibold bg-gray-50">
                <td className={tdClass}></td>
                <td className={`${tdClass} text-left`}>TEAM</td>
                <td className={tdClass}>{hittingTotals.PA}</td>
                <td className={tdClass}>{hittingTotals.AB}</td>
                <td className={tdClass}>{hittingTotals.R}</td>
                <td className={tdClass}>{hittingTotals.H}</td>
                <td className={tdClass}>{hittingTotals.Double}</td>
                <td className={tdClass}>{hittingTotals.Triple}</td>
                <td className={tdClass}>{hittingTotals.HR}</td>
                <td className={tdClass}>{hittingTotals.RBI}</td>
                <td className={tdClass}>{hittingTotals.BB}</td>
                <td className={tdClass}>{hittingTotals.SO}</td>
                <td className={tdClass}>{hittingTotals.SB}</td>
                <td className={tdClass}>{formatPct(hittingTotals.H, hittingTotals.AB)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className={sectionTitleClass}>St. Andrew&apos;s Pitching</h2>
        <div className={cardClass}>
          <table className="min-w-full bg-white text-sm">
            <thead>
              <tr>
                <th className={thClass}>#</th>
                <th className={`${thClass} text-left`}>PITCHERS</th>
                <th className={thClass}>IP</th>
                <th className={thClass}>H</th>
                <th className={thClass}>R</th>
                <th className={thClass}>ER</th>
                <th className={thClass}>BB</th>
                <th className={thClass}>SO</th>
                <th className={thClass}>P</th>
                <th className={thClass}>W</th>
                <th className={thClass}>L</th>
                <th className={thClass}>SV</th>
                <th className={thClass}>ERA</th>
                <th className={thClass}>WHIP</th>
              </tr>
            </thead>
            <tbody>
              {pitchingRows.map((row) => (
                <tr key={row.PlayerID} className="hover:bg-gray-50">
                  <td className={tdClass}>{row.jersey}</td>
                  <td className={`${tdClass} text-left whitespace-nowrap`}>{row.name}</td>
                  <td className={tdClass}>{outsToBaseballInnings(row.IP)}</td>
                  <td className={tdClass}>{row.H}</td>
                  <td className={tdClass}>{row.R}</td>
                  <td className={tdClass}>{row.ER}</td>
                  <td className={tdClass}>{row.BB}</td>
                  <td className={tdClass}>{row.SO}</td>
                  <td className={tdClass}>{row.Pitches}</td>
                  <td className={tdClass}>{row.W}</td>
                  <td className={tdClass}>{row.L}</td>
                  <td className={tdClass}>{row.SV}</td>
                  <td className={tdClass}>{formatDecimal(row.seasonERA)}</td>
                  <td className={tdClass}>{formatDecimal(row.seasonWHIP)}</td>
                </tr>
              ))}
              <tr className="font-semibold bg-gray-50">
                <td className={tdClass}></td>
                <td className={`${tdClass} text-left`}>TEAM</td>
                <td className={tdClass}>{outsToBaseballInnings(pitchingTotals.IP)}</td>
                <td className={tdClass}>{pitchingTotals.H}</td>
                <td className={tdClass}>{pitchingTotals.R}</td>
                <td className={tdClass}>{pitchingTotals.ER}</td>
                <td className={tdClass}>{pitchingTotals.BB}</td>
                <td className={tdClass}>{pitchingTotals.SO}</td>
                <td className={tdClass}>{pitchingTotals.Pitches}</td>
                <td className={tdClass}></td>
                <td className={tdClass}></td>
                <td className={tdClass}></td>
                <td className={tdClass}>{formatDecimal(pitchingTotals.ERA)}</td>
                <td className={tdClass}>{formatDecimal(pitchingTotals.WHIP)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className={sectionTitleClass}>St. Andrew&apos;s Fielding</h2>
        <div className={cardClass}>
          <table className="min-w-full bg-white text-sm">
            <thead>
              <tr>
                <th className={thClass}>#</th>
                <th className={`${thClass} text-left`}>FIELDERS</th>
                <th className={thClass}>INN</th>
                <th className={thClass}>PO</th>
                <th className={thClass}>A</th>
                <th className={thClass}>E</th>
                <th className={thClass}>TC</th>
                <th className={thClass}>DP</th>
                <th className={thClass}>PB</th>
                <th className={thClass}>FLD%</th>
              </tr>
            </thead>
            <tbody>
              {fieldingRows.map((row) => (
                <tr key={row.PlayerID} className="hover:bg-gray-50">
                  <td className={tdClass}>{row.jersey}</td>
                  <td className={`${tdClass} text-left whitespace-nowrap`}>{row.name}</td>
                  <td className={tdClass}>{outsToBaseballInnings(row.INN)}</td>
                  <td className={tdClass}>{row.PO}</td>
                  <td className={tdClass}>{row.A}</td>
                  <td className={tdClass}>{row.E}</td>
                  <td className={tdClass}>{row.TC}</td>
                  <td className={tdClass}>{row.DP}</td>
                  <td className={tdClass}>{row.PB}</td>
                  <td className={tdClass}>{Number.isFinite(row.seasonFPCT) ? row.seasonFPCT.toFixed(3).replace(/^0(?=\.)/, "") : "-"}</td>
                </tr>
              ))}
              <tr className="font-semibold bg-gray-50">
                <td className={tdClass}></td>
                <td className={`${tdClass} text-left`}>TEAM</td>
                <td className={tdClass}>{outsToBaseballInnings(fieldingTotals.INN)}</td>
                <td className={tdClass}>{fieldingTotals.PO}</td>
                <td className={tdClass}>{fieldingTotals.A}</td>
                <td className={tdClass}>{fieldingTotals.E}</td>
                <td className={tdClass}>{fieldingTotals.TC}</td>
                <td className={tdClass}>{fieldingTotals.DP}</td>
                <td className={tdClass}>{fieldingTotals.PB}</td>
                <td className={tdClass}>{Number.isFinite(fieldingTotals.FPCT) ? fieldingTotals.FPCT.toFixed(3).replace(/^0(?=\.)/, "") : "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {!complete ? (
        <div className="text-center text-gray-600 text-sm">
          This game is currently listed as upcoming, so the box score may be incomplete.
        </div>
      ) : null}
    </div>
  );
}
