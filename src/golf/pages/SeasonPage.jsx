import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  buildGolfPdfPagesLabel,
  formatGolfDate,
  formatGolfPlace,
  getGolfSeasonLabel,
  sortGolfTournaments,
} from "../golfPageUtils";

function SummaryCard({ season }) {
  return (
    <section className="rounded-[1.4rem] border border-slate-200 bg-white px-5 py-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Archive Status
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            {season.StatusNote || "State archive summary."}
          </p>
        </div>
        {season.ArchivePdfUrl ? (
          <a
            href={season.ArchivePdfUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-full bg-[#012169] px-4 py-2 text-sm font-semibold text-white no-underline"
          >
            Open Official PDF
          </a>
        ) : null}
      </div>

      {Array.isArray(season.HighlightNotes) && season.HighlightNotes.length ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Season Highlight
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            {season.HighlightNotes[0]}
          </p>
        </div>
      ) : null}

      {Array.isArray(season.HistoricalSummary) && season.HistoricalSummary.length ? (
        <div className="mt-4 space-y-3">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Archive Summary
          </p>
          {season.HistoricalSummary.map((paragraph, index) => (
            <p
              key={`${season.SeasonID}-summary-${index}`}
              className="text-sm leading-7 text-slate-700"
            >
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function FinishersTable({ title, finishers = [], compact = false }) {
  if (!finishers.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border-b border-slate-300 px-3 py-2 text-center font-bold">
                Place
              </th>
              <th className="border-b border-slate-300 px-3 py-2 text-left font-bold">
                Golfer
              </th>
              <th className="border-b border-slate-300 px-3 py-2 text-left font-bold">
                School
              </th>
              <th className="border-b border-slate-300 px-3 py-2 text-center font-bold">
                Score
              </th>
            </tr>
          </thead>
          <tbody>
            {finishers.map((finisher) => (
              <tr
                key={`${title}-${finisher.place}-${finisher.player}-${finisher.score}`}
                className={finisher.isStAndrews ? "bg-blue-50" : "bg-white"}
              >
                <td className="border-b border-slate-200 px-3 py-2 text-center font-semibold text-slate-900">
                  {formatGolfPlace(finisher.place)}
                </td>
                <td className="border-b border-slate-200 px-3 py-2 text-slate-900">
                  <div className="font-semibold">{finisher.player}</div>
                  {!compact && finisher.award ? (
                    <div className="mt-1 text-xs text-slate-500">{finisher.award}</div>
                  ) : null}
                </td>
                <td className="border-b border-slate-200 px-3 py-2 text-slate-700">
                  {finisher.school}
                </td>
                <td className="border-b border-slate-200 px-3 py-2 text-center font-semibold text-slate-900">
                  {finisher.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TournamentCard({ tournament }) {
  const metaItems = [
    { label: "Date", value: tournament.Date ? formatGolfDate(tournament.Date) : null },
    { label: "Division", value: tournament.Division || "State Tournament" },
    { label: "Course", value: tournament.Course || null },
    { label: "Location", value: tournament.Location || null },
    {
      label: "Field",
      value: tournament.EntryCount
        ? `${tournament.EntryCount} published scores`
        : null,
    },
  ].filter((item) => item.value);

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{tournament.Name}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {metaItems.map((item) => (
              <span
                key={`${tournament.TournamentID}-${item.label}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600"
              >
                {item.label}: {item.value}
              </span>
            ))}
          </div>
        </div>
        <a
          href={tournament.SourcePdfUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 no-underline"
        >
          {buildGolfPdfPagesLabel(tournament.SourcePdfPages)}
        </a>
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-700">{tournament.Summary}</p>

      {tournament.ArchiveNote ? (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900">
          {tournament.ArchiveNote}
        </p>
      ) : null}

      <div className="mt-5 space-y-4">
        <FinishersTable title="Top Finishers" finishers={tournament.TopFinishers} />
        <FinishersTable
          title="Additional St. Andrew's Finishers"
          finishers={tournament.StAndrewsFinishers}
          compact
        />
      </div>
    </section>
  );
}

export default function SeasonPage({
  seasons = [],
  tournaments = [],
  status = "",
}) {
  const { seasonId } = useParams();

  const season = useMemo(() => {
    return (
      seasons.find((entry) => Number(entry.SeasonID) === Number(seasonId)) || null
    );
  }, [seasonId, seasons]);

  const seasonTournaments = useMemo(() => {
    return sortGolfTournaments(
      tournaments.filter((entry) => Number(entry.Season) === Number(seasonId))
    );
  }, [seasonId, tournaments]);

  if (!season) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center sm:px-6">
        <section className="rounded-[1.4rem] border border-slate-200 bg-white px-6 py-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Season Not Found</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            That golf season is not available yet.
          </p>
          <Link
            to="/athletics/golf/yearly-results"
            className="mt-5 inline-flex rounded-full bg-[#012169] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Golf Seasons
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-24 pt-2 sm:px-6">
      {status ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm text-slate-600 shadow-sm">
          {status}
        </div>
      ) : null}

      <header className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          {getGolfSeasonLabel(season)} Golf
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          {season.Classification || "State archive"}
        </p>
      </header>

      <SummaryCard season={season} />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">State Tournaments</h2>

        {seasonTournaments.length ? (
          seasonTournaments.map((tournament) => (
            <TournamentCard
              key={tournament.TournamentID}
              tournament={tournament}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center text-sm text-slate-600">
            This season currently has an archive summary but no cleaned tournament table
            loaded yet.
          </div>
        )}
      </section>
    </div>
  );
}
