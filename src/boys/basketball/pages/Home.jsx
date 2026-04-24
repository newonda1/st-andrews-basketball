import React from "react";

function Home() {
  return (
    <div className="space-y-14 pb-8">
      <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="stats-offset-media">
          <img
            src="/images/boys/basketball/seasons/2024-25/state_champions_2025.jpg"
            alt="The 2024-25 boys basketball state championship team with coaches and cheerleaders"
            className="block aspect-[1.15/1] w-full object-cover"
          />
        </div>

        <div className="stats-editorial-copy">
          <p className="mb-4 text-[0.82rem] font-bold uppercase tracking-[0.18em] text-[var(--stats-gray)]">
            Boys&apos; Basketball
          </p>
          <h1 className="mb-5 text-[2.2rem] font-bold leading-[1.16] text-[var(--stats-navy)] sm:text-[2.75rem] sm:leading-[1.18]">
            Celebrating the legacy of St. Andrew&apos;s basketball.
          </h1>
          <p className="mb-5 text-[1rem] leading-[1.65] text-[var(--stats-body-color)]">
            The story of St. Andrew&apos;s boys basketball is one of steady
            program building, breakthrough championship moments, and a modern
            era that has elevated the Lions into one of the most accomplished
            programs in Georgia independent school athletics.
          </p>
          <p className="m-0 text-[1rem] leading-[1.65] text-[var(--stats-body-color)]">
            Across decades of competition, the archive below connects season
            history with records, player pages, and game-by-game detail so the
            program can be explored as both a living team and a long-term
            historical record.
          </p>
        </div>
      </section>

      <hr className="stats-page-rule" />

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="stats-module">
          <h2 className="stats-module-title">Program Story</h2>
          <div className="space-y-5 text-[0.98rem] leading-[1.65] text-[var(--stats-body-color)]">
            <p className="m-0">
              The program began in the late 1970s and was shaped through its
              early years by coaches who established the standards of effort,
              discipline, and competitiveness that would become part of the
              school&apos;s basketball identity.
            </p>
            <p className="m-0">
              A major turning point came in 1992-93, when the Lions won their
              first state championship. That season proved St. Andrew&apos;s could
              compete for titles and helped define the expectations that
              followed.
            </p>
            <p className="m-0">
              Success continued through the late 1990s and early 2000s, then
              accelerated again in the modern era under Coach Mel Abrams Jr.,
              whose teams have added multiple state titles and sustained deep
              postseason success.
            </p>
          </div>
        </article>

        <article className="stats-module">
          <h2 className="stats-module-title">Archive Highlights</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "639 total wins",
              "16 region championships",
              "6 state championships",
              "Season-by-season archives",
              "Career and single-game records",
              "Player and game detail pages",
            ].map((item) => (
              <div
                key={item}
                className="border border-[var(--stats-line)] bg-[var(--stats-panel-muted)] px-4 py-4 text-[0.95rem] leading-[1.45] text-[#242424]"
              >
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
        <div>
          <h2 className="mb-4 text-[2rem] font-bold leading-[1.18] text-[var(--stats-navy)]">
            Images from the archive.
          </h2>
          <p className="m-0 text-[1rem] leading-[1.65] text-[var(--stats-body-color)]">
            Historic teams and title runs remain a key part of the story. The
            stats pages are meant to preserve not only the numbers, but the
            visual history that surrounds them.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <figure className="m-0 border border-[var(--stats-line)] bg-white p-3">
            <img
              src="/images/boys/basketball/seasons/1978-79/first_team_1978.png"
              alt="1978-79 St. Andrew's first boys basketball team"
              className="block aspect-[0.98/1] w-full object-cover"
            />
            <figcaption className="mt-3 text-[0.84rem] leading-[1.4] text-[var(--stats-body-color)]">
              1978-79: the first St. Andrew&apos;s boys basketball team.
            </figcaption>
          </figure>

          <figure className="m-0 border border-[var(--stats-line)] bg-white p-3">
            <img
              src="/images/boys/basketball/seasons/1992-93/chris_haslem_1993.png"
              alt="Chris Haslam during the 1992-93 championship season"
              className="block aspect-[0.98/1] w-full object-cover"
            />
            <figcaption className="mt-3 text-[0.84rem] leading-[1.4] text-[var(--stats-body-color)]">
              1992-93: a breakthrough championship season for the Lions.
            </figcaption>
          </figure>

          <figure className="m-0 border border-[var(--stats-line)] bg-white p-3">
            <img
              src="/images/boys/basketball/seasons/2024-25/state_champions_2025.jpg"
              alt="The 2024-25 state championship team"
              className="block aspect-[0.98/1] w-full object-cover"
            />
            <figcaption className="mt-3 text-[0.84rem] leading-[1.4] text-[var(--stats-body-color)]">
              2024-25: another state title in the program&apos;s modern era.
            </figcaption>
          </figure>
        </div>
      </section>
    </div>
  );
}

export default Home;
