import React, { useMemo } from "react";
import AthleticsProgramShell from "../components/AthleticsProgramShell";

const championshipGroups = [
  {
    title: "Team Championships",
    sections: [
      { title: "Region Championships", years: [] },
      { title: "State Championships", years: [] },
    ],
  },
  {
    title: "Individual Champions",
    sections: [
      { title: "Region Championships", years: [] },
      { title: "State Championships", years: [] },
    ],
  },
];

function ChampionshipSection({ title, years }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm">
      <p className="text-center text-[0.7rem] font-black uppercase tracking-[0.22em] text-slate-500">
        {title}
      </p>
      {years.length > 0 ? (
        <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {years.map((year) => (
            <span
              key={`${title}-${year}`}
              className="text-sm font-black tracking-[0.08em] text-slate-900"
            >
              {year}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-center text-sm font-medium text-slate-400">
          Archive slot ready
        </p>
      )}
    </section>
  );
}

function ChampionshipGroup({ title, sections }) {
  return (
    <section className="rounded-[1.8rem] border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm">
      <h2 className="text-center text-sm font-black uppercase tracking-[0.22em] text-[#012169]">
        {title}
      </h2>
      <div className="mt-4 space-y-3">
        {sections.map((section) => (
          <ChampionshipSection
            key={`${title}-${section.title}`}
            title={section.title}
            years={section.years}
          />
        ))}
      </div>
    </section>
  );
}

function TennisHome() {
  return (
    <div className="mx-auto max-w-6xl px-2 py-4 sm:px-4">
      <section className="overflow-hidden rounded-[2rem] border border-[#d6e17c] bg-[linear-gradient(135deg,#eff7ba_0%,#c8de57_22%,#012169_70%,#00133f_100%)] px-6 py-8 text-white shadow-[0_22px_50px_rgba(1,33,105,0.18)]">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full border border-white/30 bg-black/20 p-2 shadow-[0_16px_28px_rgba(1,33,105,0.28)]">
            <img
              src="/images/tennis/tennis_icon.png"
              alt="Tennis"
              className="h-24 w-24 rounded-full object-contain sm:h-28 sm:w-28"
            />
          </div>
          <p className="mt-5 text-[0.72rem] font-black uppercase tracking-[0.32em] text-[#eef7bf]">
            Coed Program
          </p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-[0.08em] sm:text-4xl">
            Tennis
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/90 sm:text-base">
            The tennis section is now in place for both boys and girls athletes.
            Team and individual championship panels are ready to grow as the
            tennis archive expands.
          </p>
        </div>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {championshipGroups.map((group) => (
          <ChampionshipGroup
            key={group.title}
            title={group.title}
            sections={group.sections}
          />
        ))}
      </div>
    </div>
  );
}

export default function TennisApp() {
  const menuSections = useMemo(
    () => [
      {
        title: "Tennis",
        links: [{ to: "/athletics/tennis", label: "Overview", end: true }],
      },
    ],
    []
  );

  return (
    <AthleticsProgramShell
      title="Tennis Statistics"
      subtitle="Coed varsity program"
      menuTitle="Tennis"
      menuSections={menuSections}
      athleticsHomePath="/athletics"
      headerHomePath="/athletics/tennis"
    >
      <TennisHome />
    </AthleticsProgramShell>
  );
}
