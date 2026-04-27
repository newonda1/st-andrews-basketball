import React from "react";
import { Link } from "react-router-dom";

function Home() {
  const archiveLinks = [
    {
      label: "2025-26 Season",
      to: "/athletics/girls/basketball/seasons/2025-26",
    },
    {
      label: "2021-22 Season",
      to: "/athletics/girls/basketball/seasons/2021-22",
    },
    {
      label: "Year-by-Year Results",
      to: "/athletics/girls/basketball/yearly-results",
    },
    {
      label: "Full Team Stats",
      to: "/athletics/girls/basketball/team/full",
    },
    {
      label: "Career Stats",
      to: "/athletics/girls/basketball/records/career",
    },
  ];

  return (
    <div className="space-y-14 pb-8">
      <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="stats-offset-media">
          <img
            src="/images/girls/basketball/girls_basketball_home.jpg"
            alt="St. Andrew's girls basketball players gathered at center court"
            className="block aspect-[1.15/1] w-full object-cover"
          />
        </div>

        <div className="stats-editorial-copy">
          <p className="mb-4 text-[0.82rem] font-bold uppercase tracking-[0.18em] text-[var(--stats-gray)]">
            Girls&apos; Basketball
          </p>
          <h1 className="mb-5 text-[2.2rem] font-bold leading-[1.16] text-[var(--stats-navy)] sm:text-[2.75rem] sm:leading-[1.18]">
            Building the St. Andrew&apos;s girls basketball archive.
          </h1>
          <p className="mb-5 text-[1rem] leading-[1.65] text-[var(--stats-body-color)]">
            The girls basketball section now connects season pages from 2021-22
            through the current archive, with historical results, rosters, box
            scores, and records continuing to grow.
          </p>
          <p className="m-0 text-[1rem] leading-[1.65] text-[var(--stats-body-color)]">
            Current pages connect game recaps, team totals, player pages, and
            record tables so the program history can expand without changing the
            shape of the section.
          </p>
        </div>
      </section>

      <hr className="stats-page-rule" />

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="stats-module">
          <h2 className="stats-module-title">Current Archive</h2>
          <div className="space-y-5 text-[0.98rem] leading-[1.65] text-[var(--stats-body-color)]">
            <p className="m-0">
              Full girls basketball season pages are now live from 2021-22
              through 2025-26, with schedule results, recaps, player totals, and
              box-score links connected to the larger stats system.
            </p>
            <p className="m-0">
              As older seasons are added, they will flow into the same year-by-
              year tables, opponent records, team records, individual records,
              and player profiles that support a full program archive.
            </p>
          </div>
        </article>

        <article className="stats-module">
          <h2 className="stats-module-title">Archive Entry Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {archiveLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="border border-[var(--stats-line)] bg-[var(--stats-panel-muted)] px-4 py-4 text-[0.95rem] leading-[1.45] text-[#242424] no-underline transition hover:border-[var(--stats-blue)] hover:bg-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

export default Home;
