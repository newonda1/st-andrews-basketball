import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function randomIndexes(length, count, previousIndexes = []) {
  if (length <= 0) return [];

  const previousSet = new Set(previousIndexes);
  const availableIndexes = Array.from({ length }, (_, index) => index);
  const primaryPool = availableIndexes.filter((index) => !previousSet.has(index));
  const pool = primaryPool.length >= count ? primaryPool : availableIndexes;

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return pool.slice(0, Math.min(count, length));
}

function SportHeroVisual({
  sportName,
  icon,
  iconClassName = "",
  alt,
  image,
  imageAlt,
  imageCaption,
}) {
  if (image) {
    return (
      <figure className="m-0 overflow-hidden border border-[var(--stats-line)] bg-[var(--stats-panel-muted)]">
        <div className="aspect-[1.15/1] w-full bg-[#eef3fb]">
          <img
            src={image}
            alt={imageAlt || `${sportName} archive image`}
            className="h-full w-full object-cover"
          />
        </div>
        {imageCaption ? (
          <figcaption className="border-t border-[var(--stats-line)] bg-white px-4 py-3 text-[0.8rem] font-bold uppercase tracking-[0.14em] text-[var(--stats-gray)]">
            {imageCaption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

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

function ArchiveImage({ image, featured = false }) {
  return (
    <figure className={`m-0 ${featured ? "sm:col-span-2 lg:col-span-1" : ""}`}>
      <div className="aspect-[4/3] overflow-hidden border border-[var(--stats-line)] bg-[var(--stats-panel-muted)]">
        <img
          src={image.src}
          alt={image.alt}
          className="h-full w-full object-cover transition-opacity duration-500"
        />
      </div>
      {image.caption ? (
        <figcaption className="mt-3 text-[0.82rem] font-bold uppercase tracking-[0.14em] text-[var(--stats-gray)]">
          {image.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function ArchiveImageRotator({
  title = "Images from the Archive",
  images = [],
  visibleCount = 3,
  intervalMs = 4200,
}) {
  const imageCount = images.length;
  const [activeIndexes, setActiveIndexes] = useState(() => randomIndexes(imageCount, visibleCount));

  useEffect(() => {
    setActiveIndexes(randomIndexes(imageCount, visibleCount));
  }, [imageCount, visibleCount]);

  useEffect(() => {
    if (imageCount <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndexes((currentIndexes) => randomIndexes(imageCount, visibleCount, currentIndexes));
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [imageCount, intervalMs, visibleCount]);

  const activeImages = useMemo(
    () => activeIndexes.map((index) => images[index]).filter(Boolean),
    [activeIndexes, images],
  );

  if (activeImages.length === 0) return null;

  return (
    <section className="stats-module">
      <h2 className="stats-module-title">{title}</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {activeImages.map((image, index) => (
          <ArchiveImage key={`${image.src}-${index}`} image={image} featured={index === 0} />
        ))}
      </div>
    </section>
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
  heroImage,
  heroImageAlt,
  heroImageCaption,
  storyTitle = "Program Archive",
  storyParagraphs = [],
  highlightsTitle = "Archive Highlights",
  highlights = [],
  archiveImagesTitle = "Images from the Archive",
  archiveImages = [],
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
            image={heroImage}
            imageAlt={heroImageAlt}
            imageCaption={heroImageCaption}
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

      {archiveImages.length > 0 ? (
        <ArchiveImageRotator title={archiveImagesTitle} images={archiveImages} />
      ) : null}
    </div>
  );
}
