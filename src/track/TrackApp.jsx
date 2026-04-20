import React, { useEffect, useMemo, useState } from "react";
import AthleticsProgramShell from "../components/AthleticsProgramShell";

const menuSections = [
  {
    title: "Track & Field",
    links: [{ to: "/athletics/track", label: "Overview", end: true }],
  },
  {
    title: "Sports",
    links: [
      { to: "/athletics/boys/basketball", label: "Boys Basketball" },
      { to: "/athletics/girls/basketball", label: "Girls Basketball" },
      { to: "/athletics/boys/baseball", label: "Boys Baseball" },
    ],
  },
];

function SummaryCard({ label, value, tone = "slate" }) {
  const toneClasses = {
    slate: "border-slate-200 bg-slate-50 text-slate-900",
    navy: "border-blue-950/20 bg-[#012169] text-white",
    gold: "border-amber-200 bg-amber-50 text-slate-900",
  };

  return (
    <article
      className={`rounded-2xl border px-5 py-5 shadow-sm ${toneClasses[tone]}`}
    >
      <p
        className={`text-[0.7rem] font-bold uppercase tracking-[0.22em] ${
          tone === "navy" ? "text-blue-100" : "text-slate-500"
        }`}
      >
        {label}
      </p>
      <p className="mt-3 text-2xl font-bold leading-tight sm:text-[1.75rem]">
        {value}
      </p>
    </article>
  );
}

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow ? (
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.24em] text-slate-500">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "TBD";

  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) return "TBD";
  if (startDate && endDate) {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }
  return formatDate(startDate || endDate);
}

function MeetStatusBadge({ status }) {
  const classes = {
    verified: "bg-emerald-100 text-emerald-800",
    scheduled: "bg-blue-100 text-blue-800",
    compiling: "bg-amber-100 text-amber-800",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[0.72rem] font-bold uppercase tracking-[0.16em] ${
        classes[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

export default function TrackApp() {
  const [overview, setOverview] = useState(null);
  const [currentSeason, setCurrentSeason] = useState(null);
  const [status, setStatus] = useState("Loading track & field data...");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [overviewRes, currentSeasonRes] = await Promise.all([
          fetch("/data/track/overview.json"),
          fetch("/data/track/currentSeason.json"),
        ]);

        if (!overviewRes.ok) {
          throw new Error(`Could not load track overview (${overviewRes.status}).`);
        }

        if (!currentSeasonRes.ok) {
          throw new Error(
            `Could not load current track season data (${currentSeasonRes.status}).`
          );
        }

        const [overviewData, currentSeasonData] = await Promise.all([
          overviewRes.json(),
          currentSeasonRes.json(),
        ]);

        if (!cancelled) {
          setOverview(overviewData);
          setCurrentSeason(currentSeasonData);
          setStatus("");
        }
      } catch (error) {
        if (!cancelled) {
          setStatus(error?.message || "Failed to load track data.");
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const seasonMilestones = currentSeason?.seasonMilestones || [];
  const verifiedMeets = currentSeason?.verifiedMeets || [];
  const cards = useMemo(() => {
    if (!overview || !currentSeason) return [];

    return [
      {
        label: "Tracked Era",
        value: overview.trackedSince,
        tone: "navy",
      },
      {
        label: "Classification",
        value: `${overview.classification} ${overview.region}`,
      },
      {
        label: "Current Season",
        value: currentSeason.seasonLabel,
        tone: "gold",
      },
      {
        label: "Verified Meets",
        value: String(verifiedMeets.length),
      },
    ];
  }, [overview, currentSeason, verifiedMeets.length]);

  return (
    <AthleticsProgramShell
      title="Track & Field Statistics"
      menuTitle="Track & Field"
      menuSections={menuSections}
      athleticsHomePath="/athletics"
      headerHomePath="/athletics/track"
    >
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {status ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center text-sm text-slate-600 shadow-sm">
            {status}
          </div>
        ) : null}

        {overview ? (
          <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <div className="relative overflow-hidden bg-[#012169] px-6 py-8 text-white sm:px-8 sm:py-10">
              <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_62%)] md:block" />

              <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                <div className="max-w-3xl">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-100">
                    Boys and Girls
                  </p>
                  <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                    {overview.pageTitle}
                  </h1>
                  <p className="mt-4 text-sm leading-7 text-blue-50 sm:text-base">
                    {overview.pageIntro}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
                    <span>{overview.classification}</span>
                    <span>{overview.region}</span>
                    <span>{overview.location}</span>
                  </div>
                </div>

                <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full border border-white/18 bg-white/10 p-5 shadow-[0_20px_40px_rgba(0,0,0,0.18)] md:mx-0">
                  <img
                    src="/images/track/track_icon.png"
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-contain drop-shadow-[0_14px_20px_rgba(15,23,42,0.3)]"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 px-6 py-6 sm:grid-cols-2 xl:grid-cols-4 sm:px-8 sm:py-8">
              {cards.map((card) => (
                <SummaryCard
                  key={card.label}
                  label={card.label}
                  value={card.value}
                  tone={card.tone}
                />
              ))}
            </div>
          </section>
        ) : null}

        {overview ? (
          <section className="mt-10">
            <SectionTitle
              eyebrow="Program Identity"
              title="What Belongs on a Track Page"
              description="Track success is measured by marks, placements, qualifiers, and championship finishes rather than wins and losses. This section is built to highlight individual progress, relay depth, and postseason advancement."
            />

            <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
              <article className="rounded-[1.8rem] border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8">
                <h3 className="text-lg font-bold text-slate-900">
                  Program Snapshot
                </h3>
                <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600 sm:text-[0.98rem]">
                  {overview.programSnapshot.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>

              <div className="grid gap-5">
                <article className="rounded-[1.8rem] border border-slate-200 bg-white px-6 py-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900">
                    Coaching Staff
                  </h3>
                  <dl className="mt-4 space-y-3 text-sm text-slate-600">
                    <div>
                      <dt className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Head Coach
                      </dt>
                      <dd className="mt-1 text-base font-semibold text-slate-900">
                        {overview.coaches.headCoach}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Assistant Coach
                      </dt>
                      <dd className="mt-1 text-base font-semibold text-slate-900">
                        {overview.coaches.assistantCoach}
                      </dd>
                    </div>
                  </dl>
                </article>

                <article className="rounded-[1.8rem] border border-slate-200 bg-white px-6 py-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900">
                    Championship Space
                  </h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Region Championships
                      </p>
                      <div className="mt-4 min-h-[3rem] rounded-xl border border-dashed border-slate-300 bg-white/80" />
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-slate-500">
                        State Championships
                      </p>
                      <div className="mt-4 min-h-[3rem] rounded-xl border border-dashed border-slate-300 bg-white/80" />
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </section>
        ) : null}

        {currentSeason ? (
          <section className="mt-10">
            <SectionTitle
              eyebrow="2025-26 Season"
              title="Current Season Hub"
              description="This section is ready for this season’s meet results, qualifiers, and season-best marks. The milestone dates below are verified, and the meet log will fill in as results are confirmed."
            />

            <div className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <article className="rounded-[1.8rem] border border-slate-200 bg-white px-6 py-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    This Season&apos;s Meets
                  </h3>
                  <MeetStatusBadge status={currentSeason.status} />
                </div>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {currentSeason.statusNote}
                </p>

                {verifiedMeets.length > 0 ? (
                  <div className="mt-5 overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="border border-slate-200 bg-slate-100 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
                            Date
                          </th>
                          <th className="border border-slate-200 bg-slate-100 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
                            Meet
                          </th>
                          <th className="border border-slate-200 bg-slate-100 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
                            Location
                          </th>
                          <th className="border border-slate-200 bg-slate-100 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
                            Notes
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {verifiedMeets.map((meet) => (
                          <tr key={meet.id}>
                            <td className="border border-slate-200 px-4 py-3 text-sm text-slate-700">
                              {formatDate(meet.date)}
                            </td>
                            <td className="border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
                              {meet.name}
                            </td>
                            <td className="border border-slate-200 px-4 py-3 text-sm text-slate-700">
                              {meet.location || "TBD"}
                            </td>
                            <td className="border border-slate-200 px-4 py-3 text-sm text-slate-600">
                              {meet.notes || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-5 text-sm leading-7 text-slate-600">
                    No 2026 St. Andrew&apos;s meet-by-meet results have been loaded yet.
                    We&apos;ve started the season data structure and verified the major
                    postseason dates so new meets can be added cleanly as we confirm
                    them.
                  </div>
                )}
              </article>

              <article className="rounded-[1.8rem] border border-slate-200 bg-white px-6 py-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">
                  Verified Milestones
                </h3>
                <div className="mt-5 space-y-4">
                  {seasonMilestones.map((milestone) => (
                    <div
                      key={milestone.label}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                    >
                      <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-slate-500">
                        {milestone.label}
                      </p>
                      <p className="mt-2 text-base font-semibold text-slate-900">
                        {formatDateRange(milestone.startDate || milestone.date, milestone.endDate)}
                      </p>
                      {milestone.location ? (
                        <p className="mt-1 text-sm text-slate-600">
                          {milestone.location}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>
        ) : null}

        {overview ? (
          <section className="mt-10">
            <SectionTitle
              eyebrow="Next Buildouts"
              title="The Data We Can Layer In Next"
              description="The first version of the page is designed so we can add deeper track pages without changing the overall feel of the section."
            />

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {overview.nextSections.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[1.8rem] border border-slate-200 bg-white px-5 py-5 shadow-sm"
                >
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Planned Section
                  </p>
                  <h3 className="mt-3 text-lg font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </AthleticsProgramShell>
  );
}
