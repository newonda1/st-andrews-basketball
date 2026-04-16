import React from "react";
import { Link } from "react-router-dom";
import AthleticsProgramShell from "./components/AthleticsProgramShell";

const BANNER_SHAPE = {
  clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 58px), 50% 100%, 0 calc(100% - 58px))",
};

const SCHOOL_LOGO = "/images/common/logo.png";

const sports = [
  {
    name: "Boys Basketball",
    to: "/athletics/boys/basketball",
    icon: "/images/boys/basketball/boys_basketball_icon.png",
    regionYears: [
      1993, 1996, 1997, 1998, 1999, 2000, 2001, 2002,
      2003, 2004, 2022, 2023, 2024, 2025, 2026,
    ],
    stateYears: [1993, 1998, 2004, 2022, 2023, 2025],
  },
  {
    name: "Girls Basketball",
    to: "/athletics/girls/basketball",
    icon: "/images/girls/basketball/girls_basketball_icon.png",
    regionYears: [1999, 2003, 2004],
    stateYears: [2003, 2005, 2006],
  },
  {
    name: "Boys Baseball",
    to: "/athletics/boys/baseball",
    icon: "/images/boys/baseball/boys_baseball_icon.png",
    regionYears: [2019],
    stateYears: [],
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

function ChampionshipSection({ title, years }) {
  return (
    <section className="rounded-2xl border border-white/20 bg-white/[0.08] px-3 py-3 shadow-inner shadow-black/10 backdrop-blur-[1px] sm:px-4">
      <h3 className="text-[0.6rem] font-bold uppercase tracking-[0.22em] text-blue-100 sm:text-[0.68rem]">
        {title}
      </h3>

      {years.length > 0 ? (
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 lg:grid-cols-4">
          {years.map((year) => (
            <div
              key={`${title}-${year}`}
              className="text-[0.76rem] font-black leading-tight tracking-[0.09em] text-white sm:text-[0.86rem]"
            >
              {year}
            </div>
          ))}
        </div>
      ) : null}
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
        className="relative flex h-full min-h-[31rem] flex-col overflow-hidden border-[3px] border-blue-100 bg-gradient-to-b from-sky-500 via-blue-600 to-blue-800 px-3 pb-20 pt-4 text-white shadow-xl transition duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl sm:min-h-[34rem] sm:px-4 sm:pt-5"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.3),_transparent_40%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[radial-gradient(circle_at_bottom,_rgba(255,255,255,0.18),_transparent_68%)]" />

        <header className="relative">
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/[0.08] px-3 py-3 shadow-inner shadow-black/10">
            <img
              src={sport.icon}
              alt=""
              aria-hidden="true"
              className="h-12 w-12 shrink-0 object-contain drop-shadow-[0_4px_8px_rgba(15,23,42,0.35)] sm:h-14 sm:w-14"
              loading="lazy"
            />
            <h2 className="text-left text-[0.98rem] font-black uppercase leading-tight tracking-[0.16em] text-white sm:text-[1.08rem]">
              {sport.name}
            </h2>
          </div>
        </header>

        <div className="relative mt-5 flex-1 space-y-3">
          <ChampionshipSection
            title="Region Championships"
            years={sport.regionYears}
          />
          {sport.stateYears.length > 0 ? (
            <ChampionshipSection
              title="State Championships"
              years={sport.stateYears}
            />
          ) : null}
        </div>

        <div className="relative mt-5 flex justify-center">
          <img
            src={SCHOOL_LOGO}
            alt=""
            aria-hidden="true"
            className="w-20 transition duration-300 group-hover:scale-105 sm:w-24"
            loading="lazy"
          />
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
          <div className="mx-auto max-w-6xl px-3 py-6 sm:px-5 sm:py-8 lg:px-6">
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
