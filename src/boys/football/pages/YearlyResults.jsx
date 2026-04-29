import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { recordTableStyles } from "../../basketball/pages/recordTableStyles";
import {
  buildRecord,
  formatRecord,
  formatSeasonLabel,
  formatWinningPct,
  loadFootballResultsData,
  sortGamesChronologically,
} from "../footballData";

function isCompletedGame(game) {
  return game?.Result === "W" || game?.Result === "L" || game?.Result === "T";
}

export default function YearlyResults() {
  const [games, setGames] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [status, setStatus] = useState("Loading football results...");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const data = await loadFootballResultsData();
        if (cancelled) return;
        setGames(data.games);
        setSeasons(data.seasons);
        setStatus("");
      } catch (error) {
        if (cancelled) return;
        setStatus(error?.message || "Failed to load football data.");
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const seasonsWithGames = useMemo(() => {
    const map = new Map();

    seasons.forEach((season) => {
      map.set(String(season.SeasonID), {
        season,
        games: [],
      });
    });

    games.forEach((game) => {
      const seasonKey = String(game.SeasonID ?? game.Season ?? "");
      if (!map.has(seasonKey)) {
        map.set(seasonKey, {
          season: {
            SeasonID: seasonKey,
            DisplaySeason: seasonKey,
            HeadCoach: "",
            SeasonResult: "",
          },
          games: [],
        });
      }
      map.get(seasonKey).games.push(game);
    });

    return Array.from(map.values())
      .map(({ season, games: seasonGames }) => ({
        season,
        games: sortGamesChronologically(seasonGames),
      }))
      .sort((a, b) => Number(a.season.SeasonID) - Number(b.season.SeasonID));
  }, [games, seasons]);

  const coachTotals = useMemo(() => {
    const coachMap = new Map();

    seasonsWithGames.forEach(({ season, games: seasonGames }) => {
      const completedGames = seasonGames.filter(isCompletedGame);
      const overall = buildRecord(completedGames);
      const coach = season.HeadCoach || "Unknown";

      if (!coachMap.has(coach)) {
        coachMap.set(coach, {
          coach,
          years: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          notes: [],
        });
      }

      const entry = coachMap.get(coach);
      entry.years += 1;
      entry.wins += overall.wins;
      entry.losses += overall.losses;
      entry.ties += overall.ties;

      const note = season.SeasonResult || season.League || "";
      if (note) {
        entry.notes.push(`${formatSeasonLabel(season)}: ${note}`);
      }
    });

    return Array.from(coachMap.values()).sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.coach.localeCompare(b.coach);
    });
  }, [seasonsWithGames]);

  const yearlyRows = useMemo(
    () =>
      seasonsWithGames.map(({ season, games: seasonGames }) => {
        const completedGames = seasonGames.filter(isCompletedGame);
        const overall = buildRecord(completedGames);
        const region = buildRecord(
          completedGames,
          (game) => String(game.GameType ?? "").toLowerCase() === "region"
        );
        const home = buildRecord(
          completedGames,
          (game) => String(game.LocationType ?? "") === "Home"
        );
        const away = buildRecord(
          completedGames,
          (game) => String(game.LocationType ?? "") === "Away"
        );

        const pointsFor =
          season.PointsFor ??
          completedGames.reduce((sum, game) => sum + Number(game.TeamScore || 0), 0);
        const pointsAgainst =
          season.PointsAgainst ??
          completedGames.reduce((sum, game) => sum + Number(game.OpponentScore || 0), 0);

        return {
          seasonId: season.SeasonID,
          seasonLabel: formatSeasonLabel(season),
          coach: season.HeadCoach || "—",
          overall: overall.text,
          region: region.text,
          home: home.text,
          away: away.text,
          pointsFor,
          pointsAgainst,
          seasonResult: season.SeasonResult || season.League || "",
        };
      }),
    [seasonsWithGames]
  );

  const totals = useMemo(
    () =>
      yearlyRows.reduce(
        (accumulator, row) => {
          const [overallWins = 0, overallLosses = 0, overallTies = 0] = row.overall
            .split("–")
            .map((value) => Number(value) || 0);
          const [regionWins = 0, regionLosses = 0, regionTies = 0] = row.region
            .split("–")
            .map((value) => Number(value) || 0);
          const [homeWins = 0, homeLosses = 0, homeTies = 0] = row.home
            .split("–")
            .map((value) => Number(value) || 0);
          const [awayWins = 0, awayLosses = 0, awayTies = 0] = row.away
            .split("–")
            .map((value) => Number(value) || 0);

          accumulator.overallW += overallWins;
          accumulator.overallL += overallLosses;
          accumulator.overallT += overallTies;
          accumulator.regionW += regionWins;
          accumulator.regionL += regionLosses;
          accumulator.regionT += regionTies;
          accumulator.homeW += homeWins;
          accumulator.homeL += homeLosses;
          accumulator.homeT += homeTies;
          accumulator.awayW += awayWins;
          accumulator.awayL += awayLosses;
          accumulator.awayT += awayTies;
          accumulator.pointsFor += Number(row.pointsFor || 0);
          accumulator.pointsAgainst += Number(row.pointsAgainst || 0);
          return accumulator;
        },
        {
          overallW: 0,
          overallL: 0,
          overallT: 0,
          regionW: 0,
          regionL: 0,
          regionT: 0,
          homeW: 0,
          homeL: 0,
          homeT: 0,
          awayW: 0,
          awayL: 0,
          awayT: 0,
          pointsFor: 0,
          pointsAgainst: 0,
        }
      ),
    [yearlyRows]
  );

  const pageClassName =
    "mx-auto max-w-6xl space-y-[clamp(1.75rem,4vw,2.5rem)] px-4 pb-10 pt-2 lg:pb-40";
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
    `${recordTableStyles.bodyCell} md:min-w-[24rem] md:text-left`;
  const totalRowClassName = "bg-gray-100 font-bold";

  return (
    <div className={pageClassName}>
      {status ? <div className="text-center text-slate-600">{status}</div> : null}

      <div className="space-y-[clamp(0.5rem,1.3vw,0.875rem)]">
        <h1 className={sectionTitleClassName}>Coaching Records</h1>

        <div className="overflow-x-auto">
          <table className={tableClassName}>
            <thead className="bg-gray-200 font-bold">
              <tr>
                <th className={`${headerCellClassName} md:text-left`}>Coach</th>
                <th className={headerCellClassName}>Years</th>
                <th className={headerCellClassName}>Overall Record</th>
                <th className={headerCellClassName}>Win %</th>
                <th className={`${headerCellClassName} md:text-left`}>Notes (Season Results)</th>
              </tr>
            </thead>
            <tbody>
              {coachTotals.length === 0 ? (
                <tr>
                  <td className={numericCellClassName} colSpan={5}>
                    No football coaching data is available yet.
                  </td>
                </tr>
              ) : (
                coachTotals.map((coach) => (
                  <tr key={coach.coach}>
                    <td className={compactTextCellClassName}>{coach.coach}</td>
                    <td className={numericCellClassName}>{coach.years}</td>
                    <td className={numericCellClassName}>
                      {formatRecord(coach.wins, coach.losses, coach.ties)}
                    </td>
                    <td className={numericCellClassName}>
                      {formatWinningPct(coach.wins, coach.losses, coach.ties)}
                    </td>
                    <td className={notesCellClassName}>
                      <div className="grid gap-y-1 md:text-left">
                        {coach.notes.map((note) => (
                          <div key={note}>{note}</div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-[clamp(0.5rem,1.3vw,0.875rem)]">
        <h1 className={sectionTitleClassName}>Full Year-by-Year Results</h1>

        <div className="overflow-x-auto">
          <table className={tableClassName}>
            <thead className="bg-gray-200 font-bold">
              <tr>
                <th className={headerCellClassName}>Season</th>
                <th className={`${headerCellClassName} md:text-left`}>Coach</th>
                <th className={headerCellClassName}>Overall</th>
                <th className={headerCellClassName}>Region</th>
                <th className={headerCellClassName}>Home</th>
                <th className={headerCellClassName}>Away</th>
                <th className={headerCellClassName}>PF</th>
                <th className={headerCellClassName}>PA</th>
                <th className={`${headerCellClassName} md:text-left`}>Season Result</th>
              </tr>
            </thead>
            <tbody>
              {yearlyRows.length === 0 ? (
                <tr>
                  <td className={numericCellClassName} colSpan={9}>
                    No yearly football results are available yet.
                  </td>
                </tr>
              ) : (
                yearlyRows.map((row) => (
                  <tr key={row.seasonId}>
                    <td className={numericCellClassName}>
                      <Link
                        to={`/athletics/football/seasons/${row.seasonId}`}
                        className="whitespace-nowrap text-blue-600 hover:underline"
                      >
                        {row.seasonLabel}
                      </Link>
                    </td>
                    <td className={compactTextCellClassName}>{row.coach}</td>
                    <td className={numericCellClassName}>{row.overall}</td>
                    <td className={numericCellClassName}>{row.region}</td>
                    <td className={numericCellClassName}>{row.home}</td>
                    <td className={numericCellClassName}>{row.away}</td>
                    <td className={numericCellClassName}>{row.pointsFor}</td>
                    <td className={numericCellClassName}>{row.pointsAgainst}</td>
                    <td className={textCellClassName}>{row.seasonResult}</td>
                  </tr>
                ))
              )}

              {yearlyRows.length > 0 ? (
                <tr className={totalRowClassName}>
                  <td className={textCellClassName}>Totals</td>
                  <td className={textCellClassName}></td>
                  <td className={numericCellClassName}>
                    {formatRecord(totals.overallW, totals.overallL, totals.overallT)}
                  </td>
                  <td className={numericCellClassName}>
                    {formatRecord(totals.regionW, totals.regionL, totals.regionT)}
                  </td>
                  <td className={numericCellClassName}>
                    {formatRecord(totals.homeW, totals.homeL, totals.homeT)}
                  </td>
                  <td className={numericCellClassName}>
                    {formatRecord(totals.awayW, totals.awayL, totals.awayT)}
                  </td>
                  <td className={numericCellClassName}>{totals.pointsFor}</td>
                  <td className={numericCellClassName}>{totals.pointsAgainst}</td>
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
