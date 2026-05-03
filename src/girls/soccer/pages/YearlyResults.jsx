import React, { useMemo } from "react";
import { Link } from "react-router-dom";

import { recordTableStyles } from "../../basketball/pages/recordTableStyles";
import {
  getSoccerSeasonLabel,
  soccerSeasonPath,
  sortSoccerGames,
} from "../soccerData";

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatRecord(wins, losses, ties = 0) {
  if (wins === null || losses === null) return "–";
  if (wins === undefined || losses === undefined) return "–";

  const winValue = safeNumber(wins);
  const lossValue = safeNumber(losses);
  const tieValue = safeNumber(ties);

  return tieValue > 0
    ? `${winValue}–${lossValue}–${tieValue}`
    : `${winValue}–${lossValue}`;
}

function formatWinPct(wins, losses, ties = 0) {
  if (wins === null || losses === null) return "–";
  if (wins === undefined || losses === undefined) return "–";

  const winValue = safeNumber(wins);
  const lossValue = safeNumber(losses);
  const tieValue = safeNumber(ties);
  const total = winValue + lossValue + tieValue;

  if (!total) return "–";
  return `${((winValue / total) * 100).toFixed(1)}%`;
}

function buildRecord(games, filterFn = () => true) {
  return (games || []).filter(filterFn).reduce(
    (record, game) => {
      const result = String(game?.Result || "").toUpperCase();
      if (result === "W") record.wins += 1;
      else if (result === "L") record.losses += 1;
      else if (result === "T") record.ties += 1;
      return record;
    },
    { wins: 0, losses: 0, ties: 0 }
  );
}

function recordFromSeasonFields(season, prefix) {
  const wins = season?.[`${prefix}Wins`];
  const losses = season?.[`${prefix}Losses`];
  const ties = season?.[`${prefix}Ties`] ?? 0;

  if (wins === null || losses === null) return null;
  if (wins === undefined || losses === undefined) return null;

  return {
    wins: safeNumber(wins),
    losses: safeNumber(losses),
    ties: safeNumber(ties),
  };
}

function isCompletedGame(game) {
  const result = String(game?.Result || "").toUpperCase();
  return result === "W" || result === "L" || result === "T";
}

function isRegionGame(game) {
  return String(game?.GameType || "").trim().toLowerCase() === "region";
}

function isPlayoffGame(game) {
  const gameType = String(game?.GameType || "").trim().toLowerCase();
  return (
    gameType === "region tournament" ||
    gameType === "state tournament" ||
    gameType.includes("playoff")
  );
}

function isHomeGame(game) {
  return String(game?.LocationType || "").trim().toLowerCase() === "home";
}

function isAwayGame(game) {
  return String(game?.LocationType || "").trim().toLowerCase() === "away";
}

function formatNotes(season) {
  return [season?.RegionFinish, season?.StateFinish]
    .map((value) => String(value ?? "").trim())
    .filter((value) =>
      /champion|runner[- ]?up|final\s*four/i.test(value)
    )
    .join(" & ");
}

export default function YearlyResults({ data, status = "" }) {
  const seasonRows = useMemo(() => {
    return (data?.seasons || [])
      .slice()
      .sort((a, b) => Number(a.SeasonID) - Number(b.SeasonID))
      .map((season) => {
        const seasonGames = sortSoccerGames(
          (data?.games || []).filter(
            (game) => Number(game?.SeasonID ?? game?.Season) === Number(season.SeasonID)
          )
        );
        const completedGames = seasonGames.filter(isCompletedGame);

        const overall =
          recordFromSeasonFields(season, "Overall") || buildRecord(completedGames);
        const region =
          recordFromSeasonFields(season, "Region") ||
          buildRecord(completedGames, isRegionGame);
        const nonRegion = buildRecord(
          completedGames,
          (game) => !isRegionGame(game) && !isPlayoffGame(game)
        );
        const home =
          recordFromSeasonFields(season, "Home") || buildRecord(completedGames, isHomeGame);
        const away =
          recordFromSeasonFields(season, "Away") || buildRecord(completedGames, isAwayGame);
        const playoffs = buildRecord(completedGames, isPlayoffGame);

        const gameGoalsFor = completedGames.reduce(
          (sum, game) => sum + Number(game.TeamScore || 0),
          0
        );
        const gameGoalsAgainst = completedGames.reduce(
          (sum, game) => sum + Number(game.OpponentScore || 0),
          0
        );

        return {
          season,
          seasonId: season.SeasonID,
          label: getSoccerSeasonLabel(season),
          coach: season.HeadCoach || season.Coach || "Unknown",
          overall,
          region,
          nonRegion,
          home,
          away,
          playoffs,
          goalsFor: season.PointsFor ?? gameGoalsFor,
          goalsAgainst: season.PointsAgainst ?? gameGoalsAgainst,
          notes: formatNotes(season),
        };
      });
  }, [data]);

  const coachTotals = useMemo(() => {
    const coachMap = new Map();

    seasonRows.forEach((season) => {
      const coachName = season.coach || "Unknown";

      if (!coachMap.has(coachName)) {
        coachMap.set(coachName, {
          coach: coachName,
          years: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          notes: [],
        });
      }

      const coach = coachMap.get(coachName);
      coach.years += 1;
      coach.wins += season.overall.wins;
      coach.losses += season.overall.losses;
      coach.ties += season.overall.ties;

      if (season.notes && season.notes.trim() !== "") {
        coach.notes.push(`${season.label}: ${season.notes}`);
      }
    });

    return [...coachMap.values()].sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      const aTotal = a.wins + a.losses + a.ties;
      const bTotal = b.wins + b.losses + b.ties;
      const aPct = aTotal ? a.wins / aTotal : 0;
      const bPct = bTotal ? b.wins / bTotal : 0;
      if (bPct !== aPct) return bPct - aPct;
      return a.coach.localeCompare(b.coach);
    });
  }, [seasonRows]);

  const totals = useMemo(
    () =>
      seasonRows.reduce(
        (accumulator, row) => {
          accumulator.overall.wins += row.overall.wins;
          accumulator.overall.losses += row.overall.losses;
          accumulator.overall.ties += row.overall.ties;
          accumulator.region.wins += row.region.wins;
          accumulator.region.losses += row.region.losses;
          accumulator.region.ties += row.region.ties;
          accumulator.nonRegion.wins += row.nonRegion.wins;
          accumulator.nonRegion.losses += row.nonRegion.losses;
          accumulator.nonRegion.ties += row.nonRegion.ties;
          accumulator.home.wins += row.home.wins;
          accumulator.home.losses += row.home.losses;
          accumulator.home.ties += row.home.ties;
          accumulator.away.wins += row.away.wins;
          accumulator.away.losses += row.away.losses;
          accumulator.away.ties += row.away.ties;
          accumulator.playoffs.wins += row.playoffs.wins;
          accumulator.playoffs.losses += row.playoffs.losses;
          accumulator.playoffs.ties += row.playoffs.ties;
          accumulator.goalsFor += Number(row.goalsFor || 0);
          accumulator.goalsAgainst += Number(row.goalsAgainst || 0);
          return accumulator;
        },
        {
          overall: { wins: 0, losses: 0, ties: 0 },
          region: { wins: 0, losses: 0, ties: 0 },
          nonRegion: { wins: 0, losses: 0, ties: 0 },
          home: { wins: 0, losses: 0, ties: 0 },
          away: { wins: 0, losses: 0, ties: 0 },
          playoffs: { wins: 0, losses: 0, ties: 0 },
          goalsFor: 0,
          goalsAgainst: 0,
        }
      ),
    [seasonRows]
  );

  const pageClassName =
    "mx-auto max-w-6xl space-y-[clamp(1.75rem,4vw,2.5rem)] px-4 pb-10 pt-2 lg:pb-40";
  const sectionClassName = "space-y-[clamp(0.5rem,1.3vw,0.875rem)]";
  const sectionTitleClassName =
    "text-center font-bold text-[clamp(1.25rem,5vw,1.5rem)]";
  const tableClassName =
    "w-full table-auto border text-center text-[clamp(0.64rem,0.95vw,1rem)] md:mx-auto md:w-max";
  const headerCellClassName = `${recordTableStyles.headerCell} whitespace-nowrap`;
  const numericCellClassName = `${recordTableStyles.bodyCell} whitespace-nowrap`;
  const textCellClassName = `${recordTableStyles.bodyCell} md:text-left`;
  const compactTextCellClassName =
    `${recordTableStyles.bodyCell} whitespace-nowrap md:text-left`;
  const notesCellClassName =
    `${recordTableStyles.bodyCell} md:min-w-[30rem] md:text-left`;
  const notesWrapClassName =
    "grid gap-x-[clamp(1rem,2vw,1.75rem)] gap-y-[clamp(0.15rem,0.5vw,0.35rem)] md:text-left lg:grid-cols-2";
  const resultCellClassName =
    `${recordTableStyles.bodyCell} md:min-w-[22rem] md:text-left`;
  const totalRowClassName = "bg-gray-100 font-bold";

  const recordText = (record) => formatRecord(record.wins, record.losses, record.ties);

  return (
    <div className={pageClassName}>
      {status ? <div className="text-center text-slate-600">{status}</div> : null}

      <div className={sectionClassName}>
        <h1 className={sectionTitleClassName}>Coaching Records</h1>

        <div className="overflow-x-auto">
          <table className={tableClassName}>
            <thead className="bg-gray-200 font-bold">
              <tr>
                <th className={`${headerCellClassName} md:text-left`}>Coach</th>
                <th className={headerCellClassName}>Years</th>
                <th className={headerCellClassName}>Overall Record</th>
                <th className={headerCellClassName}>Win %</th>
                <th className={`${headerCellClassName} md:text-left`}>
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {coachTotals.length ? (
                coachTotals.map((coach) => (
                  <tr key={coach.coach}>
                    <td className={compactTextCellClassName}>{coach.coach}</td>
                    <td className={numericCellClassName}>{coach.years}</td>
                    <td className={numericCellClassName}>
                      {formatRecord(coach.wins, coach.losses, coach.ties)}
                    </td>
                    <td className={numericCellClassName}>
                      {formatWinPct(coach.wins, coach.losses, coach.ties)}
                    </td>
                    <td className={notesCellClassName}>
                      <div className={notesWrapClassName}>
                        {coach.notes.map((note, index) => (
                          <div key={`${coach.coach}-${index}`}>{note}</div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className={numericCellClassName} colSpan={5}>
                    No girls soccer coaching data is available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={sectionClassName}>
        <h1 className={sectionTitleClassName}>Full Year-by-Year Results</h1>

        <div className="overflow-x-auto">
          <table className={tableClassName}>
            <thead className="bg-gray-200 font-bold">
              <tr>
                <th className={headerCellClassName}>Season</th>
                <th className={`${headerCellClassName} md:text-left`}>Coach</th>
                <th className={headerCellClassName}>Overall</th>
                <th className={headerCellClassName}>Region</th>
                <th className={headerCellClassName}>Non-Region</th>
                <th className={headerCellClassName}>Home</th>
                <th className={headerCellClassName}>Away</th>
                <th className={headerCellClassName}>Playoffs</th>
                <th className={headerCellClassName}>GF</th>
                <th className={headerCellClassName}>GA</th>
                <th className={`${headerCellClassName} md:text-left`}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {seasonRows.length ? (
                seasonRows.map((row) => (
                  <tr key={row.seasonId}>
                    <td className={numericCellClassName}>
                      <Link
                        to={soccerSeasonPath(row.seasonId)}
                        className="whitespace-nowrap text-blue-600 hover:underline"
                      >
                        {row.label}
                      </Link>
                    </td>
                    <td className={compactTextCellClassName}>{row.coach}</td>
                    <td className={numericCellClassName}>{recordText(row.overall)}</td>
                    <td className={numericCellClassName}>{recordText(row.region)}</td>
                    <td className={numericCellClassName}>{recordText(row.nonRegion)}</td>
                    <td className={numericCellClassName}>{recordText(row.home)}</td>
                    <td className={numericCellClassName}>{recordText(row.away)}</td>
                    <td className={numericCellClassName}>{recordText(row.playoffs)}</td>
                    <td className={numericCellClassName}>{row.goalsFor}</td>
                    <td className={numericCellClassName}>{row.goalsAgainst}</td>
                    <td className={resultCellClassName}>{row.notes}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className={numericCellClassName} colSpan={11}>
                    Girls soccer seasons will appear here when data is added.
                  </td>
                </tr>
              )}

              {seasonRows.length ? (
                <tr className={totalRowClassName}>
                  <td className={textCellClassName}>Totals</td>
                  <td className={textCellClassName}></td>
                  <td className={numericCellClassName}>{recordText(totals.overall)}</td>
                  <td className={numericCellClassName}>{recordText(totals.region)}</td>
                  <td className={numericCellClassName}>{recordText(totals.nonRegion)}</td>
                  <td className={numericCellClassName}>{recordText(totals.home)}</td>
                  <td className={numericCellClassName}>{recordText(totals.away)}</td>
                  <td className={numericCellClassName}>{recordText(totals.playoffs)}</td>
                  <td className={numericCellClassName}>{totals.goalsFor}</td>
                  <td className={numericCellClassName}>{totals.goalsAgainst}</td>
                  <td className={textCellClassName}></td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
