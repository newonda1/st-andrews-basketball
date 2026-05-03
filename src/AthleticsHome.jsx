import React from "react";
import { Link } from "react-router-dom";
import { athleticsMenuSections } from "./athleticsMenuSections";
import AthleticsProgramShell from "./components/AthleticsProgramShell";

const BANNER_SHAPE = {
  clipPath:
    "polygon(20px 0, calc(100% - 20px) 0, 100% 24px, 100% calc(100% - 58px), 50% 100%, 0 calc(100% - 58px), 0 24px)",
};

const CHAMPIONS_NAVY = "#012169";
const CHAMPIONS_WORDMARK = "/images/common/champions_wordmark.svg";
const BANNER_SCHOOL_LOGO = "/images/common/logo_banner_navy.png";
const SPORT_NAME_FONT_FAMILY =
  "'Rockwell Extra Bold', Rockwell, 'Arial Black', Impact, sans-serif";

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
    name: "Baseball",
    to: "/athletics/boys/baseball",
    icon: "/images/boys/baseball/boys_baseball_icon.png",
    regionYears: [2019],
    stateYears: [],
  },
  {
    name: "Football",
    to: "/athletics/football",
    icon: "/images/common/football_icon.png",
    regionYears: [1996, 1998, 2002],
    stateYears: [1998],
  },
  {
    name: "Volleyball",
    to: "/athletics/volleyball",
    icon: "/images/common/volleyball_icon.png",
    iconClassName: "scale-[0.82]",
    championshipGroups: [
      {
        title: "Program Archive",
        sections: [{ title: "Published Results", years: [2025] }],
      },
    ],
  },
  {
    name: "Girls Soccer",
    to: "/athletics/girls/soccer",
    icon: "/images/common/soccer_icon.png",
    iconClassName: "scale-[0.8]",
    bannerMessage: "This page is under construction and will be up soon.",
    regionYears: [],
    stateYears: [],
  },
  {
    name: "Boys Soccer",
    to: "/athletics/boys/soccer",
    icon: "/images/common/soccer_icon.png",
    iconClassName: "scale-[0.8]",
    bannerMessage: "This page is under construction and will be up soon.",
    regionYears: [],
    stateYears: [],
  },
  {
    name: "Cross Country",
    to: "/athletics/cross-country",
    icon: "/images/cross-country/cross_country_icon.png",
    iconClassName: "scale-[1.45]",
    bannerMessage: "This page is under construction and will be up soon.",
    regionYears: [],
    stateYears: [],
  },
  {
    name: "Track & Field",
    to: "/athletics/track",
    icon: "/images/track/track_icon.png",
    iconClassName: "scale-[1.35]",
    championshipGroups: [
      {
        title: "Individual Champions",
        sections: [
          { title: "Region Championships", years: [2021, 2022, 2024, 2026] },
          { title: "State Championships", years: [2011, 2014, 2018] },
        ],
      },
    ],
  },
  {
    name: "Swimming",
    to: "/athletics/swimming",
    icon: "/images/swimming/swimming_icon.png",
    championshipGroups: [
      {
        title: "Team Championships",
        sections: [
          { title: "State Championships", years: [2008, 2009] },
        ],
      },
      {
        title: "Individual Champions",
        sections: [
          {
            title: "State Championships",
            years: [
              2015, 2016, 2017, 2018, 2019, 2020,
              2022, 2023, 2024, 2025, 2026,
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Tennis",
    to: "/athletics/tennis",
    icon: "/images/tennis/tennis_icon.png",
    championshipGroups: [
      {
        title: "Team Championships",
        sections: [
          { title: "Region Championships", years: [1981, 2019, 2025, 2026] },
          { title: "State Championships", years: [1981] },
        ],
      },
      {
        title: "Individual Champions",
        sections: [
          { title: "Region Championships", years: [2025, 2026] },
          { title: "State Championships", years: [2019] },
        ],
      },
    ],
  },
  {
    name: "Golf",
    to: "/athletics/golf",
    icon: "/images/golf/golf_icon.png",
    championshipGroups: [
      {
        title: "Archive",
        sections: [
          {
            title: "Published Results",
            years: [2004, 2019, 2021, 2022, 2023, 2024],
          },
        ],
      },
    ],
  },
];

function ChampionshipSection({ title, years }) {
  return (
    <section className="mx-1.5 rounded-2xl border border-white/20 bg-white/[0.08] px-3.5 py-3.5 shadow-inner shadow-black/10 backdrop-blur-[1px] sm:mx-2 sm:px-4 sm:py-4">
      <h3 className="text-center text-[0.6rem] font-bold uppercase tracking-[0.22em] text-blue-100 sm:text-[0.68rem]">
        {title}
      </h3>

      {years.length > 0 ? (
        <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(3.35rem,1fr))] justify-items-center gap-x-1 gap-y-2">
          {years.map((year) => (
            <div
              key={`${title}-${year}`}
              className="text-center text-[clamp(0.8rem,0.74rem+0.2vw,0.92rem)] font-black leading-none tracking-[0.08em] text-white"
            >
              {year}
            </div>
          ))}
        </div>
      ) : (
        <div
          className="mt-3 min-h-[2.25rem] sm:min-h-[2.5rem]"
          aria-hidden="true"
        />
      )}
    </section>
  );
}

function ChampionshipGroup({ title, sections }) {
  const visibleSections = sections.filter((section) => section.years.length > 0);

  if (visibleSections.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[1.7rem] border border-white/16 bg-white/[0.06] px-2.5 py-3 shadow-inner shadow-black/10">
      <h3 className="px-2 text-center text-[0.64rem] font-black uppercase tracking-[0.24em] text-white/90 sm:text-[0.7rem]">
        {title}
      </h3>

      <div className="mt-3 space-y-3">
        {visibleSections.map((section) => (
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

function SportBannerHeader({ sport }) {
  const badgeText = sport.badgeText || sport.name;

  return (
    <div className="relative mx-1.5 overflow-hidden rounded-[1.8rem] border border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.05)_58%,rgba(15,23,42,0.14))] px-4 pb-3 pt-2.5 shadow-inner shadow-black/10 sm:mx-2">
      <div className="pointer-events-none absolute inset-x-5 top-0 h-12 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_72%)]" />

      <div className="relative mx-auto h-[9.35rem] w-full max-w-[15.75rem]">
        <img
          src={CHAMPIONS_WORDMARK}
          alt=""
          aria-hidden="true"
          className="absolute left-1/2 top-[0.6rem] w-full max-w-[15.25rem] -translate-x-1/2 object-contain drop-shadow-[0_6px_10px_rgba(15,23,42,0.16)]"
          loading="lazy"
        />

        {sport.icon ? (
          <img
            src={sport.icon}
            alt=""
            aria-hidden="true"
            className={`absolute left-1/2 top-[4.45rem] h-[4.7rem] w-[4.7rem] -translate-x-1/2 object-contain drop-shadow-[0_10px_16px_rgba(15,23,42,0.32)] ${
              sport.iconClassName || ""
            }`}
            loading="lazy"
          />
        ) : (
          <div className="absolute left-1/2 top-[4.35rem] flex h-[4.9rem] w-[4.9rem] -translate-x-1/2 items-center justify-center rounded-full border border-white/40 bg-white/[0.12] px-2 text-center text-[1.15rem] font-black uppercase tracking-[0.16em] text-white shadow-[0_10px_16px_rgba(15,23,42,0.32)] backdrop-blur-sm">
            {badgeText}
          </div>
        )}
      </div>

      <h2
        style={{ fontFamily: SPORT_NAME_FONT_FAMILY }}
        className="relative -mt-1 text-center text-[clamp(1.02rem,0.9rem+0.55vw,1.28rem)] font-black uppercase leading-[0.98] tracking-[0.08em] text-white [text-wrap:balance]"
      >
        {sport.name}
      </h2>
      {sport.bannerNote ? (
        <p className="relative mt-2 text-center text-[0.62rem] font-bold uppercase tracking-[0.24em] text-blue-100/90 sm:text-[0.66rem]">
          {sport.bannerNote}
        </p>
      ) : null}
    </div>
  );
}

function SportBanner({ sport }) {
  const championshipContent = sport.bannerMessage ? (
    <section className="rounded-[1.7rem] border border-white/16 bg-white/[0.06] px-4 py-5 shadow-inner shadow-black/10">
      <p className="m-0 text-center text-[0.9rem] leading-[1.6] text-white/92">
        {sport.bannerMessage}
      </p>
    </section>
  ) : sport.championshipGroups ? (
    sport.championshipGroups.map((group) => (
      <ChampionshipGroup
        key={`${sport.name}-${group.title}`}
        title={group.title}
        sections={group.sections}
      />
    ))
  ) : sport.regionYears.length > 0 ||
    sport.stateYears.length > 0 ||
    sport.showStateSectionWhenEmpty ? (
    <>
      {sport.regionYears.length > 0 ? (
        <ChampionshipSection
          title="Region Championships"
          years={sport.regionYears}
        />
      ) : null}
      {sport.stateYears.length > 0 || sport.showStateSectionWhenEmpty ? (
        <ChampionshipSection
          title="State Championships"
          years={sport.stateYears}
        />
      ) : null}
    </>
  ) : null;

  return (
    <Link
      to={sport.to}
      className="group relative block h-full rounded-[2rem] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/60 focus-visible:ring-offset-4"
    >
      <div className="absolute inset-x-2 bottom-1 top-5 rounded-[2rem] bg-slate-900/18 blur-2xl transition duration-300 group-hover:bg-slate-900/28" />

      <article
        style={BANNER_SHAPE}
        className="relative flex h-full min-h-[31rem] flex-col overflow-hidden px-3 pb-24 pt-5 text-white shadow-[0_18px_38px_rgba(15,23,42,0.18),0_6px_14px_rgba(15,23,42,0.1)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_24px_44px_rgba(15,23,42,0.22),0_10px_18px_rgba(15,23,42,0.14)] sm:min-h-[34rem] sm:px-4 sm:pt-6"
      >
        <div
          style={BANNER_SHAPE}
          className="pointer-events-none absolute inset-0 z-0"
          aria-hidden="true"
        >
          <div
            className="h-full w-full"
            style={{ ...BANNER_SHAPE, backgroundColor: CHAMPIONS_NAVY }}
          />
        </div>
        <div
          style={BANNER_SHAPE}
          className="pointer-events-none absolute inset-[4px] z-0 bg-white"
        />
        <div
          style={BANNER_SHAPE}
          className="pointer-events-none absolute inset-[6px] z-0"
          aria-hidden="true"
        >
          <div
            className="h-full w-full"
            style={{ ...BANNER_SHAPE, backgroundColor: CHAMPIONS_NAVY }}
          />
        </div>
        <div
          style={BANNER_SHAPE}
          className="pointer-events-none absolute inset-[10px] z-0 bg-slate-500"
        />
        <div
          style={BANNER_SHAPE}
          className="pointer-events-none absolute inset-x-[10px] bottom-28 top-[10px] z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22),_transparent_42%)] sm:bottom-32"
        />

        <header className="relative z-20 pt-2 sm:pt-3">
          <SportBannerHeader sport={sport} />
        </header>

        <div className="relative z-20 mt-5 flex-1 space-y-3">
          {championshipContent}
        </div>

        <div className="relative z-20 mt-6 flex translate-y-2 justify-center pt-4">
          <img
            src={BANNER_SCHOOL_LOGO}
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
      menuSections={athleticsMenuSections}
      athleticsHomePath="/athletics"
    >
      <div className="relative left-1/2 w-screen -translate-x-1/2 px-[clamp(1rem,4vw,5rem)] py-2 sm:py-4">
        <section className="mt-4">
          <div className="mx-auto w-full max-w-[1920px] px-0 py-6 sm:py-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Championship Legacy
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                Explore each program through a banner-style view of its region
                and state championship history.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 2xl:gap-5">
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
