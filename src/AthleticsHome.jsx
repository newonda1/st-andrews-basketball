import React from "react";
import { Link } from "react-router-dom";
import AthleticsProgramShell from "./components/AthleticsProgramShell";

const BANNER_SHAPE = {
  clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 58px), 50% 100%, 0 calc(100% - 58px))",
};

const sports = [
  {
    name: "Boys Basketball",
    bannerNameLines: ["Boys", "Basketball"],
    to: "/athletics/boys/basketball",
    icon: "/images/boys/basketball/boys_basketball_icon.png",
    regionYears: [
      1993, 1996, 1997, 1998, 1999, 2000, 2001, 2002,
      2003, 2004, 2022, 2023, 2024, 2025, 2026,
    ],
    stateYears: [1993, 1998, 2004, 2022, 2023, 2025],
    regionYearsPerLine: 3,
    stateYearsPerLine: 3,
  },
  {
    name: "Girls Basketball",
    bannerNameLines: ["Girls", "Basketball"],
    to: "/athletics/girls/basketball",
    icon: "/images/girls/basketball/girls_basketball_icon.png",
    regionYears: [1999, 2003, 2004],
    stateYears: [2003, 2005, 2006],
    regionYearsPerLine: 3,
    stateYearsPerLine: 3,
  },
  {
    name: "Boys Baseball",
    bannerNameLines: ["Boys", "Baseball"],
    to: "/athletics/boys/baseball",
    icon: "/images/boys/baseball/boys_baseball_icon.png",
    regionYears: [2019],
    stateYears: [],
    regionYearsPerLine: 3,
    stateYearsPerLine: 3,
  },
];

const menuSections = [
  {
    title: "Sports",
    links: [
      { to: "/athletics/boys/basketball", label: "Boys Basketball" },
      { to: "/athletics/girls/basketball", label: "Girls Basketball" },
      { to: "/athletics/boys/baseball", label: "Boys Baseball" },
    ],
  },
];

function chunkYears(years, yearsPerLine) {
  if (years.length === 0) {
    return [];
  }

  const lines = [];

  for (let index = 0; index < years.length; index += yearsPerLine) {
    lines.push(years.slice(index, index + yearsPerLine).join("  "));
  }

  return lines;
}

function ChampionshipSection({ title, years, yearsPerLine }) {
  const lines = chunkYears(years, yearsPerLine);

  return (
    <section className="rounded-2xl border border-white/20 bg-white/[0.08] px-3 py-3 shadow-inner shadow-black/10 backdrop-blur-[1px] sm:px-4">
      <h3 className="text-[0.6rem] font-bold uppercase tracking-[0.22em] text-blue-100 sm:text-[0.68rem]">
        {title}
      </h3>

      {lines.length > 0 ? (
        <div className="mt-2 space-y-1.5">
          {lines.map((line) => (
            <div
              key={`${title}-${line}`}
              className="text-[0.76rem] font-black leading-tight tracking-[0.09em] text-white sm:text-[0.86rem]"
            >
              {line}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-blue-100/80 sm:text-[0.8rem]">
          None listed
        </div>
      )}
    </section>
  );
}

function SportBanner({ sport }) {
  return (
    <Link
      to={sport.to}
      className="group relative block h-full rounded-[2rem] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/60 focus-visible:ring-offset-4"
    >
      <div className="absolute inset-x-3 bottom-2 top-6 rounded-[2rem] bg-slate-900/10 blur-xl transition duration-300 group-hover:bg-slate-900/20" />

      <article
        style={BANNER_SHAPE}
        className="relative flex h-full min-h-[31rem] flex-col overflow-hidden border-[3px] border-blue-100 bg-gradient-to-b from-blue-700 via-blue-800 to-blue-950 px-3 pb-20 pt-4 text-white shadow-xl transition duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl sm:min-h-[34rem] sm:px-4 sm:pt-5"
      >
        <div className="pointer-events-none absolute inset-x-8 top-12 h-px bg-blue-200/40" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22),_transparent_42%)]" />

        <img
          src={sport.icon}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-24 right-3 w-16 opacity-[0.15] brightness-200 saturate-0 sm:right-4 sm:w-20"
          loading="lazy"
        />

        <header className="relative text-center">
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.28em] text-blue-100 sm:text-[0.62rem]">
            Lions Athletics
          </p>
          <h2 className="mt-2 text-[1.65rem] font-black uppercase leading-none tracking-[0.08em] text-white sm:text-[1.9rem]">
            Champions
          </h2>
          <div className="mt-3 text-[0.72rem] font-bold uppercase leading-tight tracking-[0.28em] text-white sm:text-[0.8rem]">
            {sport.bannerNameLines.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        </header>

        <div className="relative mt-5 flex-1 space-y-3">
          <ChampionshipSection
            title="Region Championships"
            years={sport.regionYears}
            yearsPerLine={sport.regionYearsPerLine}
          />
          <ChampionshipSection
            title="State Championships"
            years={sport.stateYears}
            yearsPerLine={sport.stateYearsPerLine}
          />
        </div>

        <div className="relative mt-5 text-center text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-blue-100 transition duration-300 group-hover:text-white sm:text-[0.76rem]">
          View Stats &rarr;
        </div>
      </article>
    </Link>
  );
}

function AthleticsHome() {
  return (
    <AthleticsProgramShell
      title="St. Andrew's Athletic Statistics"
      menuTitle="Athletics"
      menuSections={menuSections}
      athleticsHomePath="/athletics"
    >
      <div className="mx-auto max-w-7xl px-2 py-2 sm:px-4 sm:py-4">
        <section className="mt-4">
          <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-white/80 px-3 py-6 shadow-sm shadow-slate-300/40 backdrop-blur sm:px-5 sm:py-8 lg:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Championship Legacy
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                Explore each program through a banner-style view of its region
                and state championship history.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {sports.map((sport) => (
                <SportBanner key={sport.name} sport={sport} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </AthleticsProgramShell>
  );
}

export default AthleticsHome;
