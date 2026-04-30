import React from "react";
import { Link } from "react-router-dom";

function SportHeroVisual({ sportName, icon, iconClassName = "", alt }) {
  return (
    <div className="flex aspect-[1.15/1] w-full items-center justify-center border border-[var(--stats-line)] bg-[linear-gradient(135deg,#eef3fb_0%,#d6deef_100%)] p-6 sm:p-8">
      <div className="flex h-full w-full flex-col items-center justify-center border border-white/70 bg-white/80 px-6 py-8 text-center shadow-[0_18px_32px_rgba(0,33,105,0.08)]">
        {icon ? (
          <img
            src={icon}
            alt={alt || `${sportName} icon`}
            className={`h-24 w-24 object-contain sm:h-32 sm:w-32 ${iconClassName}`}
          />
        ) : (
          <img
            src="/images/common/st_andrews_athletics_logo.png"
            alt="St. Andrew's athletics logo"
            className="w-full max-w-[16rem] object-contain"
          />
        )}
        <p className="mb-0 mt-6 text-[0.82rem] font-bold uppercase tracking-[0.18em] text-[var(--stats-gray)]">
          {sportName}
        </p>
      </div>
    </div>
  );
}

function ArchiveLink({ label, to }) {
  return (
    <Link
      to={to}
      className="border border-[var(--stats-line)] bg-[var(--stats-panel-muted)] px-4 py-4 text-[0.95rem] leading-[1.45] text-[#242424] no-underline transition hover:border-[var(--stats-blue)] hover:bg-white"
    >
      {label}
    </Link>
  );
}

export default function SportHomePage({
  sportName,
  eyebrow = sportName,
  headline,
  intro,
  secondaryIntro,
  icon,
  iconClassName,
  iconAlt,
  storyTitle = "Program Archive",
  storyParagraphs = [],
  highlightsTitle = "Archive Highlights",
  highlights = [],
  linksTitle = "Archive Entry Points",
  links = [],
}) {
  const hasStory = storyParagraphs.length > 0;
  const hasHighlights = highlights.length > 0;
  const detailColumnClass =
    hasStory && hasHighlights ? "grid gap-5 lg:grid-cols-2" : "grid gap-5";

  return (
    <div className="space-y-14 pb-8">
      <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="stats-offset-media">
          <SportHeroVisual
            sportName={sportName}
            icon={icon}
            iconClassName={iconClassName}
            alt={iconAlt}
          />
        </div>

        <div className="stats-editorial-copy">
          <p className="mb-4 text-[0.82rem] font-bold uppercase tracking-[0.18em] text-[var(--stats-gray)]">
            {eyebrow}
          </p>
          <h1 className="mb-5 text-[2.2rem] font-bold leading-[1.16] text-[var(--stats-navy)] sm:text-[2.75rem] sm:leading-[1.18]">
            {headline}
          </h1>
          <p className="mb-5 text-[1rem] leading-[1.65] text-[var(--stats-body-color)]">
            {intro}
          </p>
          {secondaryIntro ? (
            <p className="m-0 text-[1rem] leading-[1.65] text-[var(--stats-body-color)]">
              {secondaryIntro}
            </p>
          ) : null}
        </div>
      </section>

      <hr className="stats-page-rule" />

      {hasStory || hasHighlights ? (
        <section className={detailColumnClass}>
          {hasStory ? (
            <article className="stats-module">
              <h2 className="stats-module-title">{storyTitle}</h2>
              <div className="space-y-5 text-[0.98rem] leading-[1.65] text-[var(--stats-body-color)]">
                {storyParagraphs.map((paragraph) => (
                  <p key={paragraph} className="m-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ) : null}

          {hasHighlights ? (
            <article className="stats-module">
              <h2 className="stats-module-title">{highlightsTitle}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="border border-[var(--stats-line)] bg-[var(--stats-panel-muted)] px-4 py-4 text-[0.95rem] leading-[1.45] text-[#242424]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </article>
          ) : null}
        </section>
      ) : null}

      {links.length > 0 ? (
        <section className="stats-module">
          <h2 className="stats-module-title">{linksTitle}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((item) => (
              <ArchiveLink key={item.to} label={item.label} to={item.to} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
