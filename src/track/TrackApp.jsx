import React from "react";
import AthleticsProgramShell from "../components/AthleticsProgramShell";

const menuSections = [
  {
    title: "Sports",
    links: [
      { to: "/athletics/boys/basketball", label: "Boys Basketball" },
      { to: "/athletics/girls/basketball", label: "Girls Basketball" },
      { to: "/athletics/boys/baseball", label: "Boys Baseball" },
      { to: "/athletics/track", label: "Track & Field", end: true },
    ],
  },
];

export default function TrackApp() {
  return (
    <AthleticsProgramShell
      title="Track & Field Statistics"
      menuTitle="Track & Field"
      menuSections={menuSections}
      athleticsHomePath="/athletics"
    >
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <div className="bg-[#012169] px-6 py-8 text-white sm:px-8 sm:py-10">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-100">
              Boys and Girls
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Track &amp; Field
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-50 sm:text-base">
              This section is now live and ready for meet results, season leaders,
              state qualifiers, and championship history.
            </p>
          </div>

          <div className="grid gap-5 px-6 py-6 sm:grid-cols-2 sm:px-8 sm:py-8">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
              <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                Region Championships
              </h3>
              <div className="mt-4 min-h-[3rem] rounded-xl border border-dashed border-slate-300 bg-white/70" />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
              <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                State Championships
              </h3>
              <div className="mt-4 min-h-[3rem] rounded-xl border border-dashed border-slate-300 bg-white/70" />
            </div>
          </div>
        </section>
      </div>
    </AthleticsProgramShell>
  );
}
