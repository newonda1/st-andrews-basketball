import React from "react";
import { Link } from "react-router-dom";

import AthleticsProgramShell from "./AthleticsProgramShell";

export default function UnderConstructionSportPage({
  sportName,
  sportPath,
}) {
  return (
    <AthleticsProgramShell
      title={sportName}
      menuTitle={sportName}
      athleticsHomePath="/athletics"
      headerHomePath={sportPath}
    >
      <div className="space-y-14 pb-8">
        <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="stats-offset-media">
            <div className="flex aspect-[1.15/1] w-full items-center justify-center border border-[var(--stats-line)] bg-[linear-gradient(135deg,#eef3fb_0%,#d6deef_100%)] p-6 sm:p-8">
              <div className="flex h-full w-full flex-col items-center justify-center border border-white/70 bg-white/80 px-6 py-8 text-center shadow-[0_18px_32px_rgba(0,33,105,0.08)]">
                <img
                  src="/images/common/st_andrews_athletics_logo.png"
                  alt="St. Andrew's athletics logo"
                  className="w-full max-w-[16rem] object-contain"
                />
                <p className="mb-0 mt-6 text-[0.82rem] font-bold uppercase tracking-[0.18em] text-[var(--stats-gray)]">
                  {sportName}
                </p>
              </div>
            </div>
          </div>

          <div className="stats-editorial-copy">
            <p className="mb-4 text-[0.82rem] font-bold uppercase tracking-[0.18em] text-[var(--stats-gray)]">
              {sportName}
            </p>
            <h1 className="mb-5 text-[2.2rem] font-bold leading-[1.16] text-[var(--stats-navy)] sm:text-[2.75rem] sm:leading-[1.18]">
              This page is under construction.
            </h1>
            <p className="m-0 text-[1rem] leading-[1.65] text-[var(--stats-body-color)]">
              The {sportName.toLowerCase()} landing page is under construction
              and will be up soon.
            </p>
          </div>
        </section>

        <hr className="stats-page-rule" />

        <section className="max-w-3xl">
          <article className="stats-module">
            <h2 className="stats-module-title">Coming Soon</h2>
            <p className="text-[0.98rem] leading-[1.65] text-[var(--stats-body-color)]">
              We&apos;re building out the {sportName.toLowerCase()} section now.
              Please check back soon for the full landing page.
            </p>
            <Link to="/athletics" className="stats-button mt-6">
              Return to Athletics Home
            </Link>
          </article>
        </section>
      </div>
    </AthleticsProgramShell>
  );
}
