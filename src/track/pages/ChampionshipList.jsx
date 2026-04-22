import React, { useMemo } from "react";
import {
  buildTrackPlayerMap,
  formatTrackDate,
  resolveTrackAthleteName,
} from "../trackPageUtils";

const CHAMPIONSHIP_TYPE_ORDER = {
  State: 0,
  Region: 1,
};

function isWinningPlace(place) {
  const value = String(place || "").trim().toLowerCase();
  return value === "1st" || value === "1";
}

function isChampionshipFinal(entry, meet) {
  if (!meet) return false;
  if (meet.MeetType !== "State" && meet.MeetType !== "Region") return false;
  if (meet.Status !== "Complete") return false;
  if (!isWinningPlace(entry?.Place)) return false;

  const round = String(entry?.Round || "").trim().toLowerCase();
  return round === "" || round === "final" || round === "finals";
}

function buildChampionshipRows({
  playerMeetStats = [],
  meets = [],
  seasons = [],
  players = [],
}) {
  const playerMap = buildTrackPlayerMap(players);
  const meetMap = new Map((meets || []).map((meet) => [Number(meet.MeetID), meet]));
  const seasonMap = new Map(
    (seasons || []).map((season) => [Number(season.SeasonID), season])
  );

  return (playerMeetStats || [])
    .map((entry) => {
      const meet = meetMap.get(Number(entry.MeetID));
      if (!isChampionshipFinal(entry, meet)) return null;

      const season = seasonMap.get(Number(meet.Season)) || null;
      const athleteName = resolveTrackAthleteName(entry, playerMap);
      const championshipYear = String(meet.Date || "").slice(0, 4) || String(meet.Season);

      return {
        key: entry.StatID || `${entry.MeetID}-${entry.Event}-${athleteName}`,
        championshipType: meet.MeetType,
        year: championshipYear,
        athleteName,
        gender: entry.Gender || "—",
        event: entry.Event || "—",
        mark: entry.Mark || "—",
        date: meet.Date || "",
        dateLabel: formatTrackDate(meet.Date),
        championshipName: meet.Name || "Unknown Championship",
        classification: season?.Classification || "",
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const typeDiff =
        (CHAMPIONSHIP_TYPE_ORDER[a.championshipType] ?? 99) -
        (CHAMPIONSHIP_TYPE_ORDER[b.championshipType] ?? 99);
      if (typeDiff !== 0) return typeDiff;

      const dateDiff = String(b.date || "").localeCompare(String(a.date || ""));
      if (dateDiff !== 0) return dateDiff;

      const eventDiff = String(a.event || "").localeCompare(String(b.event || ""));
      if (eventDiff !== 0) return eventDiff;

      return String(a.athleteName || "").localeCompare(String(b.athleteName || ""));
    });
}

function ChampionshipTable({ rows = [] }) {
  return (
    <div className="overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[860px] border-collapse text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">
              Year
            </th>
            <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">
              Athlete
            </th>
            <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">
              Event
            </th>
            <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">
              Mark
            </th>
            <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">
              Championship Date
            </th>
            <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">
              Championship
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.key}
              className={index % 2 ? "bg-slate-50/80" : "bg-white"}
            >
              <td className="border-b border-slate-100 px-4 py-3 align-top font-semibold text-slate-900">
                {row.year || "—"}
              </td>
              <td className="border-b border-slate-100 px-4 py-3 align-top">
                <div className="font-semibold text-slate-900">{row.athleteName}</div>
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  {row.gender}
                </div>
              </td>
              <td className="border-b border-slate-100 px-4 py-3 align-top text-slate-700">
                {row.event}
              </td>
              <td className="border-b border-slate-100 px-4 py-3 align-top font-semibold text-slate-900">
                {row.mark}
              </td>
              <td className="border-b border-slate-100 px-4 py-3 align-top text-slate-700">
                {row.dateLabel}
              </td>
              <td className="border-b border-slate-100 px-4 py-3 align-top">
                <div className="font-semibold text-slate-900">{row.championshipName}</div>
                {row.classification ? (
                  <div className="text-xs text-slate-500">{row.classification}</div>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChampionshipSection({
  title,
  description,
  rows = [],
}) {
  return (
    <section className="space-y-4">
      <div className="rounded-[1.6rem] border border-slate-200 bg-white/90 px-5 py-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
          </div>
          <div className="inline-flex w-fit rounded-full bg-[#012169] px-4 py-2 text-sm font-semibold text-white">
            {rows.length} {rows.length === 1 ? "champion" : "champions"}
          </div>
        </div>
      </div>

      {rows.length ? (
        <ChampionshipTable rows={rows} />
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center text-sm text-slate-600">
          No championship winners are loaded in this section yet.
        </div>
      )}
    </section>
  );
}

export default function ChampionshipList({
  seasons = [],
  meets = [],
  playerMeetStats = [],
  players = [],
  status = "",
}) {
  const championshipRows = useMemo(
    () =>
      buildChampionshipRows({
        playerMeetStats,
        meets,
        seasons,
        players,
      }),
    [meets, playerMeetStats, players, seasons]
  );

  const stateChampions = useMemo(
    () => championshipRows.filter((row) => row.championshipType === "State"),
    [championshipRows]
  );
  const regionChampions = useMemo(
    () => championshipRows.filter((row) => row.championshipType === "Region"),
    [championshipRows]
  );

  const championCount = championshipRows.length;
  const uniqueChampionCount = new Set(
    championshipRows.map((row) => row.athleteName)
  ).size;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-10 pt-2 sm:px-6 lg:pb-40">
      {status ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center text-sm text-slate-600 shadow-sm">
          {status}
        </div>
      ) : null}

      <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#eff6ff,#ffffff_48%,#e0f2fe)] px-6 py-7 shadow-sm">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold text-slate-900">List of Champions</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            This page collects every loaded St. Andrew&apos;s region and state
            championship result in track &amp; field. State champions appear first,
            followed by region champions, with the winning mark and the meet where
            the title was earned.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <div className="rounded-2xl bg-white/85 px-4 py-3 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Loaded Titles
            </div>
            <div className="mt-1 text-2xl font-black text-[#012169]">
              {championCount}
            </div>
          </div>
          <div className="rounded-2xl bg-white/85 px-4 py-3 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Unique Champions
            </div>
            <div className="mt-1 text-2xl font-black text-[#012169]">
              {uniqueChampionCount}
            </div>
          </div>
        </div>
      </section>

      <ChampionshipSection
        title="State Champions"
        description="State-meet titles are listed first so the top championship finishes stay front and center."
        rows={stateChampions}
      />

      <ChampionshipSection
        title="Region Champions"
        description="Region winners appear below the state champions in reverse chronological order."
        rows={regionChampions}
      />
    </div>
  );
}
