import React from "react";
import { Link } from "react-router-dom";
import AthleticsProgramShell from "./components/AthleticsProgramShell";

const BANNER_SHAPE = {
  clipPath:
    "polygon(20px 0, calc(100% - 20px) 0, 100% 24px, 100% calc(100% - 58px), 50% 100%, 0 calc(100% - 58px), 0 24px)",
};

const HEADER_PLATE_SHAPE = {
  clipPath:
    "polygon(16px 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%, 0 16px)",
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
    <section className="rounded-2xl border border-white/20 bg-white/[0.08] px-3.5 py-3.5 shadow-inner shadow-black/10 backdrop-blur-[1px] sm:px-4 sm:py-4">
      <h3 className="text-[0.6rem] font-bold uppercase tracking-[0.22em] text-blue-100 sm:text-[0.68rem]">
        {title}
      </h3>

      {years.length > 0 ? (
        <div className="mt-3 flex flex-wrap justify-center gap-x-[clamp(0.75rem,1.8vw,1.5rem)] gap-y-2">
          {years.map((year) => (
            <div
              key={`${title}-${year}`}
              className="min-w-[4.1rem] text-center text-[clamp(0.8rem,0.74rem+0.2vw,0.92rem)] font-black leading-none tracking-[0.08em] text-white"
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
        className="relative flex h-full min-h-[31rem] flex-col overflow-hidden border-[3px] border-slate-200 bg-slate-500 px-3 pb-24 pt-5 text-white shadow-xl transition duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl sm:min-h-[34rem] sm:px-4 sm:pt-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22),_transparent_42%)]" />
        <div className="pointer-events-none absolute inset-x-5 top-3 h-[3px] bg-white/75" />
        <div className="pointer-events-none absolute inset-x-6 top-[1.15rem] h-px bg-slate-900/35" />
        <div className="pointer-events-none absolute left-4 top-4 h-3.5 w-3.5 rounded-full border border-white/75 bg-slate-900/35 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]" />
        <div className="pointer-events-none absolute right-4 top-4 h-3.5 w-3.5 rounded-full border border-white/75 bg-slate-900/35 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]" />

        <header className="relative pt-5 sm:pt-6">
          <div
            style={HEADER_PLATE_SHAPE}
            className="relative overflow-hidden border border-white/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.08)_42%,rgba(15,23,42,0.18))] px-[clamp(0.95rem,2.2vw,1.35rem)] py-[clamp(1rem,2vw,1.3rem)] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_24px_rgba(15,23,42,0.16)]"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.2),transparent)]" />
            <div className="pointer-events-none absolute inset-x-4 top-3 h-px bg-white/45" />
            <div className="relative mb-3 text-center text-[0.56rem] font-bold uppercase tracking-[0.34em] text-blue-100/90 sm:text-[0.62rem]">
              Championship Tradition
            </div>
            <div className="relative grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3">
              <img
                src={sport.icon}
                alt=""
                aria-hidden="true"
                className="h-[clamp(2.8rem,5vw,3.5rem)] w-[clamp(2.8rem,5vw,3.5rem)] shrink-0 object-contain drop-shadow-[0_4px_8px_rgba(15,23,42,0.35)]"
                loading="lazy"
              />
              <h2 className="min-w-0 text-left text-[clamp(0.95rem,0.82rem+0.45vw,1.16rem)] font-black uppercase leading-[1.12] tracking-[0.14em] text-white [text-wrap:balance] sm:tracking-[0.18em]">
                {sport.name}
              </h2>
            </div>
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

        <div className="relative mt-6 flex translate-y-2 justify-center pt-4">
          <img
            src={SCHOOL_LOGO}
            alt=""
            aria-hidden="true"
            className="w-[clamp(9.2rem,31.5vw,10.95rem)] object-contain drop-shadow-[0_10px_18px_rgba(15,23,42,0.38)] transition duration-300 group-hover:scale-105"
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

            <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,17rem),1fr))] gap-5">
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
