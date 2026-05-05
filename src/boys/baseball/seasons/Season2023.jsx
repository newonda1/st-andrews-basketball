import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  buildSchoolLookup,
  getSchoolDisplayName,
  getSchoolLogoPath,
  loadBaseballPlayerGameStatsForSeason,
  loadSchools,
  resolveSchoolForGame,
} from "../dataLoaders";

const SEASON_ID = 2023;

function baseballInningsToOuts(value) {
  if (value == null || value === "") return 0;
  const str = String(value);
  if (!str.includes(".")) {
    return Number(str) * 3 || 0;
  }

  const [whole, fraction] = str.split(".");
  const outs = Number(whole || 0) * 3 + Number((fraction || "0").charAt(0) || 0);
  return Number.isFinite(outs) ? outs : 0;
}

function outsToBaseballInnings(outs) {
  const whole = Math.floor((outs || 0) / 3);
  const remainder = (outs || 0) % 3;
  return `${whole}.${remainder}`;
}

function formatBaseballInningsFromOuts(outs) {
  return outsToBaseballInnings(outs || 0);
}

function formatDateFromGameID(gameId) {
  if (!gameId) return "";

  const digits = String(gameId).slice(0, 8);
  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6));
  const day = Number(digits.slice(6, 8));

  if (!year || !month || !day) return "";

  const d = new Date(Date.UTC(year, month - 1, day));

  return d.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
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

function getPlayerName(playersMap, playerId) {
  const p = playersMap.get(playerId);
  return p ? `${p.FirstName} ${p.LastName}` : "Unknown Player";
}

function buildPlayerPhotoUrl(playerId) {
  return `/images/boys/baseball/players/${playerId}.jpg`;
}

function handlePlayerImageError(e) {
  e.currentTarget.onerror = null;
  e.currentTarget.src = "/images/common/logo.png";
}

function sortableString(value) {
  return String(value ?? "").toLowerCase();
}

function hasNonZeroStat(stat, keys) {
  return keys.some((key) => Number(stat[key] || 0) !== 0);
}

function SortableHeader({ label, sortKey, sortConfig, onSort, className = "" }) {
  const arrow =
    sortConfig.key !== sortKey ? "" : sortConfig.direction === "asc" ? " ↑" : " ↓";

  return (
    <th
      className={`px-2 py-2 text-xs text-center cursor-pointer select-none whitespace-nowrap ${className}`}
      onClick={() => onSort(sortKey)}
    >
      {label}
      {arrow}
    </th>
  );
}

export default function Season2023() {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [rosterEntries, setRosterEntries] = useState([]);
  const [schools, setSchools] = useState([]);

  const [hittingSort, setHittingSort] = useState({ key: "jersey", direction: "asc" });
  const [pitchingSort, setPitchingSort] = useState({ key: "ipOuts", direction: "desc" });
  const [fieldingSort, setFieldingSort] = useState({ key: "jersey", direction: "asc" });

  useEffect(() => {
    async function fetchData() {
      const [gamesRes, statsData, playersRes, rostersRes, schoolsData] = await Promise.all([
        fetch("/data/boys/baseball/games.json"),
        loadBaseballPlayerGameStatsForSeason(SEASON_ID),
        fetch("/data/players.json"),
        fetch("/data/boys/baseball/seasonrosters.json"),
        loadSchools(),
      ]);

      const [gamesData, playersData, rostersData] = await Promise.all([
        gamesRes.json(),
        playersRes.json(),
        rostersRes.json(),
      ]);

      const seasonGames = (Array.isArray(gamesData) ? gamesData : [])
        .filter((g) => Number(g.Season) === SEASON_ID)
        .sort((a, b) => Number(a.GameID) - Number(b.GameID));

      const seasonGameIds = new Set(seasonGames.map((g) => Number(g.GameID)));
      const seasonPlayerStats = (Array.isArray(statsData) ? statsData : []).filter((s) =>
        seasonGameIds.has(Number(s.GameID))
      );

      const rosterRecord = (Array.isArray(rostersData) ? rostersData : []).find(
        (r) => Number(r.SeasonID) === SEASON_ID || String(r.SeasonID) === String(SEASON_ID)
      );

      setGames(seasonGames);
      setPlayerStats(seasonPlayerStats);
      setPlayers(Array.isArray(playersData) ? playersData : []);
      setRosterEntries(Array.isArray(rosterRecord?.Players) ? rosterRecord.Players : []);
      setSchools(Array.isArray(schoolsData) ? schoolsData : []);
    }

    fetchData();
  }, []);

  const playersMap = useMemo(() => {
    const map = new Map();
    players.forEach((p) => map.set(Number(p.PlayerID), p));
    return map;
  }, [players]);

  const jerseyMap = useMemo(() => {
    const map = new Map();
    rosterEntries.forEach((entry) => {
      map.set(Number(entry.PlayerID), Number(entry.JerseyNumber));
    });
    return map;
  }, [rosterEntries]);

  const schoolLookup = useMemo(() => buildSchoolLookup(schools), [schools]);

  const playerIdsForSeason = useMemo(() => {
    const rosterIds = rosterEntries.map((entry) => Number(entry.PlayerID));
    if (rosterIds.length) return rosterIds;

    return Array.from(
      new Set(playerStats.map((stat) => Number(stat.PlayerID)).filter((id) => Number.isFinite(id)))
    );
  }, [rosterEntries, playerStats]);

  const groupedStats = useMemo(() => {
    const map = new Map();

    playerIdsForSeason.forEach((id) => {
      map.set(id, {
        PlayerID: id,
        jersey: jerseyMap.get(id) ?? 999,
        name: getPlayerName(playersMap, id),
        GamesPlayedSet: new Set(),
        HittingGamesSet: new Set(),
        PitchingGamesSet: new Set(),
        FieldingGamesSet: new Set(),

        PA: 0,
        AB: 0,
        R: 0,
        H: 0,
        Single: 0,
        Double: 0,
        Triple: 0,
        HR: 0,
        RBI: 0,
        BB: 0,
        SO: 0,
        HBP: 0,
        SAC: 0,
        SF: 0,
        SB: 0,
        CS: 0,
        TB: 0,

        appearances: 0,
        ipOuts: 0,
        BF: 0,
        Pitches: 0,
        W: 0,
        L: 0,
        SV: 0,
        HAllowed: 0,
        RAllowed: 0,
        ER: 0,
        BBAllowed: 0,
        SOPitching: 0,
        HBPPitching: 0,
        WP: 0,

        A: 0,
        PO: 0,
        E: 0,
        DP: 0,
        PB: 0,
        CI: 0,
        defensiveOuts: 0,
      });
    });

    playerStats.forEach((stat) => {
      const id = Number(stat.PlayerID);
      if (!map.has(id)) {
        map.set(id, {
          PlayerID: id,
          jersey: jerseyMap.get(id) ?? 999,
          name: getPlayerName(playersMap, id),
          GamesPlayedSet: new Set(),
          HittingGamesSet: new Set(),
          PitchingGamesSet: new Set(),
          FieldingGamesSet: new Set(),
          PA: 0,
          AB: 0,
          R: 0,
          H: 0,
          Single: 0,
          Double: 0,
          Triple: 0,
          HR: 0,
          RBI: 0,
          BB: 0,
          SO: 0,
          HBP: 0,
          SAC: 0,
          SF: 0,
          SB: 0,
          CS: 0,
          TB: 0,
          appearances: 0,
          ipOuts: 0,
          BF: 0,
          Pitches: 0,
          W: 0,
          L: 0,
          SV: 0,
          HAllowed: 0,
          RAllowed: 0,
          ER: 0,
          BBAllowed: 0,
          SOPitching: 0,
          HBPPitching: 0,
          WP: 0,
          A: 0,
          PO: 0,
          E: 0,
          DP: 0,
          PB: 0,
          CI: 0,
          defensiveOuts: 0,
        });
      }

      const t = map.get(id);
      const gameId = Number(stat.GameID);

      const hittingAppearance = hasNonZeroStat(stat, [
        "PA",
        "AB",
        "R",
        "H",
        "1B",
        "2B",
        "3B",
        "HR",
        "RBI",
        "BB",
        "SO",
        "HBP",
        "SAC",
        "SF",
        "ROE",
        "FC",
        "SB",
        "CS",
        "TB",
      ]);

      t.PA += Number(stat.PA || 0);
      t.AB += Number(stat.AB || 0);
      t.R += Number(stat.R || 0);
      t.H += Number(stat.H || 0);
      t.Single += Number(stat["1B"] || 0);
      t.Double += Number(stat["2B"] || 0);
      t.Triple += Number(stat["3B"] || 0);
      t.HR += Number(stat.HR || 0);
      t.RBI += Number(stat.RBI || 0);
      t.BB += Number(stat.BB || 0);
      t.SO += Number(stat.SO || 0);
      t.HBP += Number(stat.HBP || 0);
      t.SAC += Number(stat.SAC || 0);
      t.SF += Number(stat.SF || 0);
      t.SB += Number(stat.SB || 0);
      t.CS += Number(stat.CS || 0);
      t.TB += Number(stat.TB || 0);
      if (hittingAppearance) {
        t.HittingGamesSet.add(gameId);
      }

      const outingOuts = baseballInningsToOuts(stat.IP || 0);
      const pitchingAppearance =
        outingOuts > 0 ||
        hasNonZeroStat(stat, [
          "BF",
          "Pitches",
          "W",
          "L",
          "SV",
          "SVO",
          "BS",
          "H_Allowed",
          "R_Allowed",
          "ER",
          "BB_Allowed",
          "SO_Pitching",
          "HBP_Pitching",
          "BK",
          "PIK_Allowed",
          "CS_Pitching",
          "SB_Allowed",
          "WP",
          "IP",
          "P_Innings",
        ]);
      if (pitchingAppearance) {
        t.appearances += 1;
        t.PitchingGamesSet.add(gameId);
      }
      t.ipOuts += outingOuts;
      t.BF += Number(stat.BF || 0);
      t.Pitches += Number(stat.Pitches || 0);
      t.W += Number(stat.W || 0);
      t.L += Number(stat.L || 0);
      t.SV += Number(stat.SV || 0);
      t.HAllowed += Number(stat.H_Allowed || 0);
      t.RAllowed += Number(stat.R_Allowed || 0);
      t.ER += Number(stat.ER || 0);
      t.BBAllowed += Number(stat.BB_Allowed || 0);
      t.SOPitching += Number(stat.SO_Pitching || 0);
      t.HBPPitching += Number(stat.HBP_Pitching || 0);
      t.WP += Number(stat.WP || 0);

      t.A += Number(stat.A || 0);
      t.PO += Number(stat.PO || 0);
      t.E += Number(stat.E || 0);
      t.DP += Number(stat.DP || 0);
      t.PB += Number(stat.PB || 0);
      t.CI += Number(stat.CI || 0);

      const defensiveOuts = [
        "C_Innings",
        "1B_Innings",
        "2B_Innings",
        "3B_Innings",
        "SS_Innings",
        "LF_Innings",
        "CF_Innings",
        "RF_Innings",
      ].reduce((sum, key) => sum + baseballInningsToOuts(stat[key] || 0), 0);

      t.defensiveOuts += defensiveOuts;
      const fieldingAppearance =
        defensiveOuts > 0 ||
        hasNonZeroStat(stat, ["A", "PO", "E", "DP", "TP", "PB", "PIK_Fielding", "CI"]);
      if (fieldingAppearance) {
        t.FieldingGamesSet.add(gameId);
      }

      if (Number.isFinite(gameId) && (hittingAppearance || pitchingAppearance || fieldingAppearance)) {
        t.GamesPlayedSet.add(gameId);
      }
    });

    return Array.from(map.values()).map((player) => {
      const gp = player.GamesPlayedSet.size;
      const avg = player.H / player.AB;
      const obpDen = player.AB + player.BB + player.HBP + player.SF;
      const obp = obpDen ? (player.H + player.BB + player.HBP) / obpDen : NaN;
      const slg = player.AB ? player.TB / player.AB : NaN;
      const ops = Number.isFinite(obp) && Number.isFinite(slg) ? obp + slg : NaN;
      const era = player.ipOuts ? (player.ER * 21) / player.ipOuts : NaN;
      const whip = player.ipOuts
        ? ((player.HAllowed + player.BBAllowed) * 3) / player.ipOuts
        : NaN;
      const tc = player.PO + player.A + player.E;
      const fpct = tc ? (player.PO + player.A) / tc : NaN;

      return {
        ...player,
        GP: gp,
        AVG: avg,
        OBP: obp,
        SLG: slg,
        OPS: ops,
        ERA: era,
        WHIP: whip,
        TC: tc,
        FPCT: fpct,
      };
    });
  }, [playerIdsForSeason, playerStats, jerseyMap, playersMap]);

  const handleSortFactory = (setter) => (key) => {
    setter((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: key === "jersey" ? "asc" : "desc" };
    });
  };

  const sortRows = (rows, sortConfig, valueGetter) => {
    return rows.slice().sort((a, b) => {
      const aVal = valueGetter(a, sortConfig.key);
      const bVal = valueGetter(b, sortConfig.key);

      if (typeof aVal === "string" || typeof bVal === "string") {
        const aStr = sortableString(aVal);
        const bStr = sortableString(bVal);
        if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      }

      const aNum = Number.isFinite(aVal) ? aVal : -Infinity;
      const bNum = Number.isFinite(bVal) ? bVal : -Infinity;
      if (aNum < bNum) return sortConfig.direction === "asc" ? -1 : 1;
      if (aNum > bNum) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const hittingRows = useMemo(() => {
    const rows = groupedStats.filter((p) => p.GP > 0);
    return sortRows(rows, hittingSort, (player, key) => {
      switch (key) {
        case "jersey":
          return player.jersey;
        case "name":
          return player.name;
        default:
          return player[key];
      }
    });
  }, [groupedStats, hittingSort]);

  const pitchingRows = useMemo(() => {
    const rows = groupedStats.filter((p) => p.appearances > 0 || p.ipOuts > 0);
    return sortRows(rows, pitchingSort, (player, key) => {
      switch (key) {
        case "jersey":
          return player.jersey;
        case "name":
          return player.name;
        case "record":
          return player.W - player.L;
        default:
          return player[key];
      }
    });
  }, [groupedStats, pitchingSort]);

  const fieldingRows = useMemo(() => {
    const rows = groupedStats.filter((p) => p.GP > 0);
    return sortRows(rows, fieldingSort, (player, key) => {
      switch (key) {
        case "jersey":
          return player.jersey;
        case "name":
          return player.name;
        default:
          return player[key];
      }
    });
  }, [groupedStats, fieldingSort]);

  return (
    <div className="pt-2 pb-10 lg:pb-40 space-y-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2">2023 Season</h1>

      <section>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Schedule &amp; Results</h2>

        <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-100 text-xs text-gray-700 uppercase tracking-wide">
              <tr>
                <th className="px-3 py-1.5 text-left">Date</th>
                <th className="px-3 py-1.5 text-left">Opponent</th>
                <th className="px-3 py-1.5 text-center">Site</th>
                <th className="px-3 py-1.5 text-center">Type</th>
                <th className="px-3 py-1.5 text-center">Result</th>
                <th className="px-3 py-1.5 text-center">Score</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-800">
              {games.map((game, index) => {
                const complete = game.Result === "W" || game.Result === "L";
                const school = resolveSchoolForGame(game, schoolLookup);
                const opponentName = getSchoolDisplayName(school, game.Opponent);
                const logoPath = getSchoolLogoPath(school);
                return (
                  <tr
                    key={game.GameID}
                    className={`border-t border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/70"} hover:bg-gray-100`}
                  >
                    <td className="px-3 py-1.5 whitespace-nowrap">{formatDateFromGameID(game.GameID)}</td>
                    <td className="px-3 py-1.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-10 shrink-0 items-center justify-center">
                          {logoPath ? (
                            <img
                              src={logoPath}
                              alt=""
                              className="max-h-8 max-w-10 object-contain"
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : null}
                        </div>
                        <Link
                          to={`/athletics/boys/baseball/games/${game.GameID}`}
                          className="text-blue-700 hover:underline"
                        >
                          {opponentName}
                        </Link>
                      </div>
                    </td>
                    <td className="px-3 py-1.5 text-center whitespace-nowrap">{game.LocationType || ""}</td>
                    <td className="px-3 py-1.5 text-center whitespace-nowrap">{game.GameType || ""}</td>
                    <td className="px-3 py-1.5 text-center font-semibold whitespace-nowrap">
                      {game.Result || ""}
                    </td>
                    <td className="px-3 py-1.5 text-center whitespace-nowrap">
                      {complete && game.TeamScore != null && game.OpponentScore != null
                        ? `${game.TeamScore} - ${game.OpponentScore}`
                        : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Hitting Statistics</h2>
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <SortableHeader label="#" sortKey="jersey" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} />
                <SortableHeader label="Player" sortKey="name" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} className="text-left" />
                <SortableHeader label="GP" sortKey="GP" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} />
                <SortableHeader label="PA" sortKey="PA" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} />
                <SortableHeader label="AB" sortKey="AB" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} />
                <SortableHeader label="R" sortKey="R" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} />
                <SortableHeader label="H" sortKey="H" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} />
                <SortableHeader label="2B" sortKey="Double" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} />
                <SortableHeader label="3B" sortKey="Triple" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} />
                <SortableHeader label="HR" sortKey="HR" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} />
                <SortableHeader label="RBI" sortKey="RBI" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} />
                <SortableHeader label="BB" sortKey="BB" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} />
                <SortableHeader label="SO" sortKey="SO" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} />
                <SortableHeader label="SB" sortKey="SB" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} />
                <SortableHeader label="AVG" sortKey="AVG" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} />
                <SortableHeader label="OBP" sortKey="OBP" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} />
                <SortableHeader label="SLG" sortKey="SLG" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} />
                <SortableHeader label="OPS" sortKey="OPS" sortConfig={hittingSort} onSort={handleSortFactory(setHittingSort)} />
              </tr>
            </thead>
            <tbody>
              {hittingRows.map((player, index) => (
                <tr
                  key={player.PlayerID}
                  className={`border-t border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/70"} hover:bg-gray-100`}
                >
                  <td className="px-2 py-1.5 text-center">{player.jersey === 999 ? "" : player.jersey}</td>
                  <td className="px-2 py-1.5 text-left whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <img
                        src={buildPlayerPhotoUrl(player.PlayerID)}
                        alt={player.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-300"
                        onError={handlePlayerImageError}
                      />
                      <Link
                        to={`/athletics/boys/baseball/players/${player.PlayerID}`}
                        className="text-blue-700 hover:underline"
                      >
                        {player.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-center">{player.GP}</td>
                  <td className="px-2 py-1.5 text-center">{player.PA}</td>
                  <td className="px-2 py-1.5 text-center">{player.AB}</td>
                  <td className="px-2 py-1.5 text-center">{player.R}</td>
                  <td className="px-2 py-1.5 text-center">{player.H}</td>
                  <td className="px-2 py-1.5 text-center">{player.Double}</td>
                  <td className="px-2 py-1.5 text-center">{player.Triple}</td>
                  <td className="px-2 py-1.5 text-center">{player.HR}</td>
                  <td className="px-2 py-1.5 text-center">{player.RBI}</td>
                  <td className="px-2 py-1.5 text-center">{player.BB}</td>
                  <td className="px-2 py-1.5 text-center">{player.SO}</td>
                  <td className="px-2 py-1.5 text-center">{player.SB}</td>
                  <td className="px-2 py-1.5 text-center">{formatPct(player.H, player.AB)}</td>
                  <td className="px-2 py-1.5 text-center">{formatPct(player.H + player.BB + player.HBP, player.AB + player.BB + player.HBP + player.SF)}</td>
                  <td className="px-2 py-1.5 text-center">{formatPct(player.TB, player.AB)}</td>
                  <td className="px-2 py-1.5 text-center">{Number.isFinite(player.OPS) ? player.OPS.toFixed(3).replace(/^0(?=\.)/, "") : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Pitching Statistics</h2>
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <SortableHeader label="#" sortKey="jersey" sortConfig={pitchingSort} onSort={handleSortFactory(setPitchingSort)} />
                <SortableHeader label="Player" sortKey="name" sortConfig={pitchingSort} onSort={handleSortFactory(setPitchingSort)} className="text-left" />
                <SortableHeader label="APP" sortKey="appearances" sortConfig={pitchingSort} onSort={handleSortFactory(setPitchingSort)} />
                <SortableHeader label="IP" sortKey="ipOuts" sortConfig={pitchingSort} onSort={handleSortFactory(setPitchingSort)} />
                <SortableHeader label="W" sortKey="W" sortConfig={pitchingSort} onSort={handleSortFactory(setPitchingSort)} />
                <SortableHeader label="L" sortKey="L" sortConfig={pitchingSort} onSort={handleSortFactory(setPitchingSort)} />
                <SortableHeader label="SV" sortKey="SV" sortConfig={pitchingSort} onSort={handleSortFactory(setPitchingSort)} />
                <SortableHeader label="H" sortKey="HAllowed" sortConfig={pitchingSort} onSort={handleSortFactory(setPitchingSort)} />
                <SortableHeader label="R" sortKey="RAllowed" sortConfig={pitchingSort} onSort={handleSortFactory(setPitchingSort)} />
                <SortableHeader label="ER" sortKey="ER" sortConfig={pitchingSort} onSort={handleSortFactory(setPitchingSort)} />
                <SortableHeader label="BB" sortKey="BBAllowed" sortConfig={pitchingSort} onSort={handleSortFactory(setPitchingSort)} />
                <SortableHeader label="SO" sortKey="SOPitching" sortConfig={pitchingSort} onSort={handleSortFactory(setPitchingSort)} />
                <SortableHeader label="ERA" sortKey="ERA" sortConfig={pitchingSort} onSort={handleSortFactory(setPitchingSort)} />
                <SortableHeader label="WHIP" sortKey="WHIP" sortConfig={pitchingSort} onSort={handleSortFactory(setPitchingSort)} />
              </tr>
            </thead>
            <tbody>
              {pitchingRows.map((player, index) => (
                <tr
                  key={player.PlayerID}
                  className={`border-t border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/70"} hover:bg-gray-100`}
                >
                  <td className="px-2 py-1.5 text-center">{player.jersey === 999 ? "" : player.jersey}</td>
                  <td className="px-2 py-1.5 text-left whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <img
                        src={buildPlayerPhotoUrl(player.PlayerID)}
                        alt={player.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-300"
                        onError={handlePlayerImageError}
                      />
                      <Link
                        to={`/athletics/boys/baseball/players/${player.PlayerID}`}
                        className="text-blue-700 hover:underline"
                      >
                        {player.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-center">{player.appearances}</td>
                  <td className="px-2 py-1.5 text-center">{formatBaseballInningsFromOuts(player.ipOuts)}</td>
                  <td className="px-2 py-1.5 text-center">{player.W}</td>
                  <td className="px-2 py-1.5 text-center">{player.L}</td>
                  <td className="px-2 py-1.5 text-center">{player.SV}</td>
                  <td className="px-2 py-1.5 text-center">{player.HAllowed}</td>
                  <td className="px-2 py-1.5 text-center">{player.RAllowed}</td>
                  <td className="px-2 py-1.5 text-center">{player.ER}</td>
                  <td className="px-2 py-1.5 text-center">{player.BBAllowed}</td>
                  <td className="px-2 py-1.5 text-center">{player.SOPitching}</td>
                  <td className="px-2 py-1.5 text-center">{formatDecimal(player.ERA)}</td>
                  <td className="px-2 py-1.5 text-center">{formatDecimal(player.WHIP)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Fielding Statistics</h2>
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <SortableHeader label="#" sortKey="jersey" sortConfig={fieldingSort} onSort={handleSortFactory(setFieldingSort)} />
                <SortableHeader label="Player" sortKey="name" sortConfig={fieldingSort} onSort={handleSortFactory(setFieldingSort)} className="text-left" />
                <SortableHeader label="GP" sortKey="GP" sortConfig={fieldingSort} onSort={handleSortFactory(setFieldingSort)} />
                <SortableHeader label="INN" sortKey="defensiveOuts" sortConfig={fieldingSort} onSort={handleSortFactory(setFieldingSort)} />
                <SortableHeader label="PO" sortKey="PO" sortConfig={fieldingSort} onSort={handleSortFactory(setFieldingSort)} />
                <SortableHeader label="A" sortKey="A" sortConfig={fieldingSort} onSort={handleSortFactory(setFieldingSort)} />
                <SortableHeader label="E" sortKey="E" sortConfig={fieldingSort} onSort={handleSortFactory(setFieldingSort)} />
                <SortableHeader label="TC" sortKey="TC" sortConfig={fieldingSort} onSort={handleSortFactory(setFieldingSort)} />
                <SortableHeader label="DP" sortKey="DP" sortConfig={fieldingSort} onSort={handleSortFactory(setFieldingSort)} />
                <SortableHeader label="PB" sortKey="PB" sortConfig={fieldingSort} onSort={handleSortFactory(setFieldingSort)} />
                <SortableHeader label="FLD%" sortKey="FPCT" sortConfig={fieldingSort} onSort={handleSortFactory(setFieldingSort)} />
              </tr>
            </thead>
            <tbody>
              {fieldingRows.map((player, index) => (
                <tr
                  key={player.PlayerID}
                  className={`border-t border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/70"} hover:bg-gray-100`}
                >
                  <td className="px-2 py-1.5 text-center">{player.jersey === 999 ? "" : player.jersey}</td>
                  <td className="px-2 py-1.5 text-left whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <img
                        src={buildPlayerPhotoUrl(player.PlayerID)}
                        alt={player.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-300"
                        onError={handlePlayerImageError}
                      />
                      <Link
                        to={`/athletics/boys/baseball/players/${player.PlayerID}`}
                        className="text-blue-700 hover:underline"
                      >
                        {player.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-center">{player.GP}</td>
                  <td className="px-2 py-1.5 text-center">{formatBaseballInningsFromOuts(player.defensiveOuts)}</td>
                  <td className="px-2 py-1.5 text-center">{player.PO}</td>
                  <td className="px-2 py-1.5 text-center">{player.A}</td>
                  <td className="px-2 py-1.5 text-center">{player.E}</td>
                  <td className="px-2 py-1.5 text-center">{player.TC}</td>
                  <td className="px-2 py-1.5 text-center">{player.DP}</td>
                  <td className="px-2 py-1.5 text-center">{player.PB}</td>
                  <td className="px-2 py-1.5 text-center">{player.TC ? formatPct(player.PO + player.A, player.TC) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
