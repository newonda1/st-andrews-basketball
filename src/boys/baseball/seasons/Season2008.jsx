import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PlayerHeadshot from "../../../components/PlayerHeadshot";
import {
  buildSchoolLookup,
  getSchoolDisplayName,
  getSchoolLogoPath,
  loadBaseballPlayerGameStatsForSeason,
  loadBaseballPlayerSeasonAdjustmentsForSeason,
  loadSchools,
  resolveSchoolForGame,
} from "../dataLoaders";
import { athleteProfilePath, isPre2015Season } from "../../../athletes/archiveEra";

const DEFAULT_SEASON_ID = 2008;

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

function formatBaseballScore(game) {
  if (game.TeamScore == null || game.OpponentScore == null) return "-";
  return `${game.TeamScore}-${game.OpponentScore}`;
}

function resultClassName(result) {
  if (result === "W") return "text-green-700";
  if (result === "L") return "text-red-700";
  return "text-gray-500";
}

function getPlayerName(playersMap, playerId) {
  const p = playersMap.get(playerId);
  return p ? `${p.FirstName} ${p.LastName}` : "Unknown Player";
}

function baseballPlayerPath(playerId, seasonId) {
  if (isPre2015Season(seasonId)) return athleteProfilePath(playerId, "baseball");
  return `/athletics/boys/baseball/players/${playerId}`;
}

function sortableString(value) {
  return String(value ?? "").toLowerCase();
}

function hasNonZeroStat(stat, keys) {
  return keys.some((key) => Number(stat[key] || 0) !== 0);
}

function formatGrade(grade) {
  if (grade === null || grade === undefined || grade === "") return "-";
  const value = Number(grade);
  if (!Number.isFinite(value)) return String(grade);
  if (value === 8) return "8th";
  if (value === 9) return "Fr.";
  if (value === 10) return "So.";
  if (value === 11) return "Jr.";
  if (value === 12) return "Sr.";
  return String(grade);
}

function SeasonRecapSection({ seasonLabel, paragraphs = [] }) {
  if (paragraphs.length) {
    return (
      <section id="season-recap" className="mx-auto max-w-4xl space-y-3">
        <h2 className="text-2xl font-semibold">Season Recap</h2>
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white px-6 py-5 text-base leading-7 text-gray-800 shadow-sm">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="season-recap" className="mx-auto max-w-4xl space-y-3">
      <h2 className="text-2xl font-semibold">Season Recap</h2>
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center shadow-sm">
        <p className="text-base font-semibold text-gray-800">Season recap not ready yet</p>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          A written recap for the {seasonLabel} baseball season will be added here.
        </p>
      </div>
    </section>
  );
}

function SeasonImagesSection({ images = [], seasonLabel }) {
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    setImageIndex(0);
  }, [images]);

  if (!images.length) {
    return (
      <section id="season-images" className="space-y-3">
        <h2 className="text-2xl font-semibold">Season Images</h2>
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
          <p className="text-base font-semibold text-gray-800">Season photo gallery coming soon</p>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Photos from the {seasonLabel} baseball season will be added here.
          </p>
        </div>
      </section>
    );
  }

  const selectedImage = images[imageIndex] || images[0];
  const selectedCaption = String(selectedImage?.caption || "").trim();
  const currentImageNumber = Math.min(imageIndex + 1, images.length);
  const goPrev = () => setImageIndex((index) => (index - 1 + images.length) % images.length);
  const goNext = () => setImageIndex((index) => (index + 1) % images.length);

  return (
    <section id="season-images" className="space-y-3">
      <h2 className="text-2xl font-semibold">Season Images</h2>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="relative bg-gray-50">
          <img
            src={selectedImage.src}
            alt={selectedImage.alt || ""}
            className="w-full max-h-[620px] object-contain"
            loading="lazy"
          />

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 shadow hover:bg-white"
                aria-label="Previous image"
                title="Previous"
              >
                {"<"}
              </button>

              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 shadow hover:bg-white"
                aria-label="Next image"
                title="Next"
              >
                {">"}
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-3 py-1 text-xs text-white">
                {currentImageNumber} / {images.length}
              </div>
            </>
          ) : null}
        </div>

        <div className="border-t border-gray-200 bg-white px-4 py-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-gray-900">{selectedCaption}</p>
            <p className="text-xs text-gray-500">
              Image {currentImageNumber} of {images.length}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-7">
            {images.map((image, index) => (
              <button
                key={image.src}
                type="button"
                onClick={() => setImageIndex(index)}
                className={`aspect-square overflow-hidden rounded-md border bg-gray-50 ${
                  index === imageIndex
                    ? "border-gray-900 ring-2 ring-gray-900"
                    : "border-gray-200 hover:border-gray-500"
                }`}
                aria-label={`Go to image ${index + 1}`}
                title={image.caption || image.alt || `Image ${index + 1}`}
              >
                <img src={image.src} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RosterTableBlock({ rows }) {
  const rosterHeaderCellClassName =
    "border px-2 py-2 font-normal leading-tight whitespace-nowrap md:px-3";
  const rosterBodyCellClassName =
    "border px-2 py-1.5 align-middle whitespace-nowrap leading-tight md:px-3";
  const rosterPlayerCellClassName =
    "border px-2 py-1.5 align-middle leading-tight md:px-3 text-left";

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
      <table className="min-w-full bg-white text-sm text-center">
        <thead className="bg-gray-100 text-xs font-normal uppercase tracking-wide text-gray-700">
          <tr>
            <th className={rosterHeaderCellClassName}>No.</th>
            <th className={`${rosterHeaderCellClassName} text-left`}>Player</th>
            <th className={rosterHeaderCellClassName}>Grade</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr
                key={row.key}
                className={`border-t border-gray-200 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/70"
                } hover:bg-gray-100`}
              >
                <td className={rosterBodyCellClassName}>{row.jersey || "-"}</td>
                <td className={rosterPlayerCellClassName}>
                  {row.path ? (
                    <Link to={row.path} className="text-blue-600 hover:underline">
                      {row.name}
                    </Link>
                  ) : (
                    <span>{row.name}</span>
                  )}
                </td>
                <td className={rosterBodyCellClassName}>{formatGrade(row.grade)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className={`${rosterBodyCellClassName} text-center text-slate-600`} colSpan={3}>
                No roster data is available for this season yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function RosterTable({ rows }) {
  const splitIndex = Math.ceil(rows.length / 2);
  const firstColumnRows = rows.slice(0, splitIndex);
  const secondColumnRows = rows.slice(splitIndex);

  if (rows.length <= 1) {
    return <RosterTableBlock rows={rows} />;
  }

  return (
    <>
      <div className="lg:hidden">
        <RosterTableBlock rows={rows} />
      </div>
      <div className="hidden gap-4 lg:grid lg:grid-cols-2">
        <RosterTableBlock rows={firstColumnRows} />
        <RosterTableBlock rows={secondColumnRows} />
      </div>
    </>
  );
}

function SortableHeader({ label, sortKey, sortConfig, onSort, className = "" }) {
  const arrow =
    sortConfig.key !== sortKey ? "" : sortConfig.direction === "asc" ? " ↑" : " ↓";

  return (
    <th
      className={`px-2 py-2 text-center text-xs font-normal cursor-pointer select-none whitespace-nowrap ${className}`}
      onClick={() => onSort(sortKey)}
    >
      {label}
      {arrow}
    </th>
  );
}

export function BaseballSeasonPage({
  seasonId = DEFAULT_SEASON_ID,
  title = `${DEFAULT_SEASON_ID} Season`,
  showSeasonImagesPlaceholder = false,
  seasonImages = [],
  showSeasonRoster = false,
  rosterStaff = [],
  seasonRecapParagraphs = [],
}) {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [seasonAdjustments, setSeasonAdjustments] = useState([]);
  const [players, setPlayers] = useState([]);
  const [rosterEntries, setRosterEntries] = useState([]);
  const [schools, setSchools] = useState([]);

  const [hittingSort, setHittingSort] = useState({ key: "jersey", direction: "asc" });
  const [pitchingSort, setPitchingSort] = useState({ key: "ipOuts", direction: "desc" });
  const [fieldingSort, setFieldingSort] = useState({ key: "jersey", direction: "asc" });

  useEffect(() => {
    async function fetchData() {
      const [gamesRes, statsData, adjustmentsData, playersRes, rostersRes, schoolsData] = await Promise.all([
        fetch("/data/boys/baseball/games.json"),
        loadBaseballPlayerGameStatsForSeason(seasonId),
        loadBaseballPlayerSeasonAdjustmentsForSeason(seasonId),
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
        .filter((g) => Number(g.Season) === Number(seasonId))
        .sort((a, b) => Number(a.GameID) - Number(b.GameID));

      const seasonGameIds = new Set(seasonGames.map((g) => Number(g.GameID)));
      const seasonPlayerStats = (Array.isArray(statsData) ? statsData : []).filter((s) =>
        seasonGameIds.has(Number(s.GameID))
      );

      const rosterRecord = (Array.isArray(rostersData) ? rostersData : []).find(
        (r) => Number(r.SeasonID) === Number(seasonId) || String(r.SeasonID) === String(seasonId)
      );

      setGames(seasonGames);
      setPlayerStats(seasonPlayerStats);
      setSeasonAdjustments(Array.isArray(adjustmentsData) ? adjustmentsData : []);
      setPlayers(Array.isArray(playersData) ? playersData : []);
      setRosterEntries(Array.isArray(rosterRecord?.Players) ? rosterRecord.Players : []);
      setSchools(Array.isArray(schoolsData) ? schoolsData : []);
    }

    fetchData();
  }, [seasonId]);

  const playersMap = useMemo(() => {
    const map = new Map();
    players.forEach((p) => map.set(Number(p.PlayerID), p));
    return map;
  }, [players]);

  const jerseyMap = useMemo(() => {
    const map = new Map();
    rosterEntries.forEach((entry) => {
      if (entry.JerseyNumber == null || entry.JerseyNumber === "") return;
      const jerseyNumber = Number(entry.JerseyNumber);
      if (Number.isFinite(jerseyNumber)) {
        map.set(Number(entry.PlayerID), jerseyNumber);
      }
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

  const rosterTableRows = useMemo(() => {
    const playerRows = rosterEntries.map((entry, index) => ({
      key: `player-${entry.PlayerID}-${index}`,
      jersey: entry.JerseyNumber,
      name: entry.PlayerName || getPlayerName(playersMap, Number(entry.PlayerID)),
      grade: entry.Grade,
      path: baseballPlayerPath(entry.PlayerID, seasonId),
    }));

    const staffRows = rosterStaff.map((staff) => ({
      key: `staff-${staff.name}-${staff.role}`,
      jersey: "",
      name: staff.name,
      grade: staff.role,
      path: "",
    }));

    return [...playerRows, ...staffRows];
  }, [playersMap, rosterEntries, rosterStaff, seasonId]);

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

    seasonAdjustments.forEach((adjustment) => {
      const id = Number(adjustment.PlayerID);
      if (!Number.isFinite(id)) return;
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
          HasAdjustment: false,
        });
      }

      const t = map.get(id);
      t.PA += Number(adjustment.PA || 0);
      t.AB += Number(adjustment.AB || 0);
      t.R += Number(adjustment.R || 0);
      t.H += Number(adjustment.H || 0);
      t.Single += Number(adjustment["1B"] || 0);
      t.Double += Number(adjustment["2B"] || 0);
      t.Triple += Number(adjustment["3B"] || 0);
      t.HR += Number(adjustment.HR || 0);
      t.RBI += Number(adjustment.RBI || 0);
      t.BB += Number(adjustment.BB || 0);
      t.SO += Number(adjustment.SO || 0);
      t.HBP += Number(adjustment.HBP || 0);
      t.SAC += Number(adjustment.SAC || 0);
      t.SF += Number(adjustment.SF || 0);
      t.SB += Number(adjustment.SB || 0);
      t.CS += Number(adjustment.CS || 0);
      t.TB += Number(adjustment.TB || 0);
      t.HasAdjustment = true;
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
  }, [playerIdsForSeason, playerStats, seasonAdjustments, jerseyMap, playersMap]);

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

  const scheduleHeaderCellClassName = "px-2 py-2 text-center text-xs font-normal whitespace-nowrap";
  const scheduleOpponentHeaderCellClassName =
    "px-2 py-2 pl-10 text-left text-xs font-normal whitespace-nowrap";
  const scheduleBodyCellClassName = "px-2 py-1.5 text-center align-middle whitespace-nowrap";
  const scheduleOpponentCellClassName = "px-2 py-1.5 align-middle";
  const statsBodyCellClassName = "px-2 py-1.5 text-center whitespace-nowrap";
  const renderPlayerLink = (player) => (
    <div className="flex items-center gap-2 text-left">
      <PlayerHeadshot
        playerId={player.PlayerID}
        sportKey="boys-baseball"
        gender="Boys"
        name={player.name}
        className="h-8 w-8 shrink-0 rounded-full object-cover"
      />
      <Link
        to={baseballPlayerPath(player.PlayerID, seasonId)}
        className="text-blue-600 hover:underline"
      >
        {player.name}
      </Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pb-10 pt-2 lg:pb-40">
      <h1 className="text-3xl font-bold text-center mb-2">{title}</h1>

      <SeasonRecapSection
        seasonLabel={title.replace(/\s+Season$/, "")}
        paragraphs={seasonRecapParagraphs}
      />

      {showSeasonImagesPlaceholder || seasonImages.length ? (
        <SeasonImagesSection images={seasonImages} seasonLabel={String(seasonId)} />
      ) : null}

      {showSeasonRoster ? (
        <section id="roster" className="space-y-4">
          <h2 className="text-2xl font-semibold">Roster</h2>
          <RosterTable rows={rosterTableRows} />
        </section>
      ) : null}

      <section>
        <div className="mt-8 mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Schedule &amp; Results</h2>
        </div>

        <div className="grid gap-3 sm:hidden">
          {games.map((game) => {
            const school = resolveSchoolForGame(game, schoolLookup);
            const opponentName = getSchoolDisplayName(school, game.Opponent);
            const logoPath = getSchoolLogoPath(school);

            return (
              <Link
                key={game.GameID}
                to={`/athletics/boys/baseball/games/${game.GameID}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 text-gray-900 no-underline shadow-sm transition hover:border-blue-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="mb-2 text-sm text-gray-600">
                      {game.DisplayDate || formatDateFromGameID(game.GameID) || "-"}
                    </p>
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden">
                        {logoPath ? (
                          <img
                            src={logoPath}
                            alt=""
                            className="h-full w-full object-contain"
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold leading-snug">{opponentName}</h3>
                        <p className="mt-2 text-sm text-gray-600">
                          {[game.LocationType || "-", game.GameType || "-"].join(" • ")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-lg font-bold ${resultClassName(game.Result)}`}>
                      {game.Result || "-"}
                    </p>
                    <p className="text-sm">{formatBaseballScore(game)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white shadow sm:block">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-100 text-xs font-normal text-gray-700 uppercase tracking-wide">
              <tr>
                <th className={`${scheduleHeaderCellClassName} text-left`}>Date</th>
                <th className={scheduleOpponentHeaderCellClassName}>Opponent</th>
                <th className={scheduleHeaderCellClassName}>Location</th>
                <th className={scheduleHeaderCellClassName}>Result</th>
                <th className={scheduleHeaderCellClassName}>Score</th>
                <th className={scheduleHeaderCellClassName}>Type</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game, index) => {
                const school = resolveSchoolForGame(game, schoolLookup);
                const opponentName = getSchoolDisplayName(school, game.Opponent);
                const logoPath = getSchoolLogoPath(school);
                return (
                  <tr
                    key={game.GameID}
                    className={`border-t border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/70"} hover:bg-gray-100`}
                  >
                    <td className={`${scheduleBodyCellClassName} text-left`}>
                      {game.DisplayDate || formatDateFromGameID(game.GameID) || "-"}
                    </td>
                    <td className={scheduleOpponentCellClassName}>
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden">
                          {logoPath ? (
                            <img
                              src={logoPath}
                              alt=""
                              className="h-full w-full object-contain"
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : null}
                        </div>
                        <Link
                          to={`/athletics/boys/baseball/games/${game.GameID}`}
                          className="text-blue-700 underline hover:text-blue-900"
                        >
                          {opponentName}
                        </Link>
                      </div>
                    </td>
                    <td className={scheduleBodyCellClassName}>{game.LocationType || "-"}</td>
                    <td className={`${scheduleBodyCellClassName} font-bold ${resultClassName(game.Result)}`}>
                      {game.Result || "-"}
                    </td>
                    <td className={scheduleBodyCellClassName}>{formatBaseballScore(game)}</td>
                    <td className={scheduleBodyCellClassName}>{game.GameType || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mt-8 mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Hitting Statistics</h2>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-100 font-normal text-gray-700">
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
                  <td className={statsBodyCellClassName}>{player.jersey === 999 ? "-" : player.jersey}</td>
                  <td className={statsBodyCellClassName}>{renderPlayerLink(player)}</td>
                  <td className={statsBodyCellClassName}>{player.GP}</td>
                  <td className={statsBodyCellClassName}>{player.PA}</td>
                  <td className={statsBodyCellClassName}>{player.AB}</td>
                  <td className={statsBodyCellClassName}>{player.R}</td>
                  <td className={statsBodyCellClassName}>{player.H}</td>
                  <td className={statsBodyCellClassName}>{player.Double}</td>
                  <td className={statsBodyCellClassName}>{player.Triple}</td>
                  <td className={statsBodyCellClassName}>{player.HR}</td>
                  <td className={statsBodyCellClassName}>{player.RBI}</td>
                  <td className={statsBodyCellClassName}>{player.BB}</td>
                  <td className={statsBodyCellClassName}>{player.SO}</td>
                  <td className={statsBodyCellClassName}>{player.SB}</td>
                  <td className={statsBodyCellClassName}>{formatPct(player.H, player.AB)}</td>
                  <td className={statsBodyCellClassName}>{formatPct(player.H + player.BB + player.HBP, player.AB + player.BB + player.HBP + player.SF)}</td>
                  <td className={statsBodyCellClassName}>{formatPct(player.TB, player.AB)}</td>
                  <td className={statsBodyCellClassName}>{Number.isFinite(player.OPS) ? player.OPS.toFixed(3).replace(/^0(?=\.)/, "") : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mt-8 mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Pitching Statistics</h2>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-100 font-normal text-gray-700">
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
                  <td className={statsBodyCellClassName}>{player.jersey === 999 ? "-" : player.jersey}</td>
                  <td className={statsBodyCellClassName}>{renderPlayerLink(player)}</td>
                  <td className={statsBodyCellClassName}>{player.appearances}</td>
                  <td className={statsBodyCellClassName}>{formatBaseballInningsFromOuts(player.ipOuts)}</td>
                  <td className={statsBodyCellClassName}>{player.W}</td>
                  <td className={statsBodyCellClassName}>{player.L}</td>
                  <td className={statsBodyCellClassName}>{player.SV}</td>
                  <td className={statsBodyCellClassName}>{player.HAllowed}</td>
                  <td className={statsBodyCellClassName}>{player.RAllowed}</td>
                  <td className={statsBodyCellClassName}>{player.ER}</td>
                  <td className={statsBodyCellClassName}>{player.BBAllowed}</td>
                  <td className={statsBodyCellClassName}>{player.SOPitching}</td>
                  <td className={statsBodyCellClassName}>{formatDecimal(player.ERA)}</td>
                  <td className={statsBodyCellClassName}>{formatDecimal(player.WHIP)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mt-8 mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Fielding Statistics</h2>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-100 font-normal text-gray-700">
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
                  <td className={statsBodyCellClassName}>{player.jersey === 999 ? "-" : player.jersey}</td>
                  <td className={statsBodyCellClassName}>{renderPlayerLink(player)}</td>
                  <td className={statsBodyCellClassName}>{player.GP}</td>
                  <td className={statsBodyCellClassName}>{formatBaseballInningsFromOuts(player.defensiveOuts)}</td>
                  <td className={statsBodyCellClassName}>{player.PO}</td>
                  <td className={statsBodyCellClassName}>{player.A}</td>
                  <td className={statsBodyCellClassName}>{player.E}</td>
                  <td className={statsBodyCellClassName}>{player.TC}</td>
                  <td className={statsBodyCellClassName}>{player.DP}</td>
                  <td className={statsBodyCellClassName}>{player.PB}</td>
                  <td className={statsBodyCellClassName}>{player.TC ? formatPct(player.PO + player.A, player.TC) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function Season2008() {
  return <BaseballSeasonPage seasonId={DEFAULT_SEASON_ID} title="2008 Season" />;
}
