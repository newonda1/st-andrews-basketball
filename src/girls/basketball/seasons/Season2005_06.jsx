import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const seasonRecap = `The 2005-06 girls basketball season page is ready for archive work. Results, roster details, articles, photos, and season notes will be added here as they are recovered.

A Savannah Morning News preseason feature framed the year around Grace, Mary, and Rose Wilkowski, who entered the winter as the core of a St. Andrew's team favored to defend its SCISA Class AA title. Read the 2005 Savannah Morning News girls basketball preview.`;

const seasonImages = [
  {
    src: "/images/girls/basketball/seasons/2005-06/gallery/2005-06-girls-basketball-team.png",
    alt: "2005-06 St. Andrew's girls basketball team photo",
    caption: "2005-06 Lady Saints team photo",
  },
  {
    src: "/images/girls/basketball/seasons/2005-06/gallery/2005-06-girls-basketball-01-grace-wilkowski.png",
    alt: "Senior Grace Wilkowski portrait",
    caption: "Senior Grace Wilkowski",
  },
  {
    src: "/images/girls/basketball/seasons/2005-06/gallery/2005-06-girls-basketball-02-stephanie-griffin.png",
    alt: "Senior Stephanie Griffin portrait",
    caption: "Senior Stephanie Griffin",
  },
  {
    src: "/images/girls/basketball/seasons/2005-06/gallery/2005-06-girls-basketball-03-michelle-griffin.png",
    alt: "Senior Michelle Griffin portrait",
    caption: "Senior Michelle Griffin",
  },
  {
    src: "/images/girls/basketball/seasons/2005-06/gallery/2005-06-girls-basketball-04-emily-aimone.png",
    alt: "Senior Emily Aimone portrait",
    caption: "Senior Emily Aimone",
  },
  {
    src: "/images/girls/basketball/seasons/2005-06/gallery/2005-06-girls-basketball-05-kristen-albritton.png",
    alt: "Senior Kristen Albritton portrait",
    caption: "Senior Kristen Albritton",
  },
  {
    src: "/images/girls/basketball/seasons/2005-06/gallery/2005-06-girls-basketball-06-meghan-miller.png",
    alt: "Senior Meghan Miller portrait",
    caption: "Senior Meghan Miller",
  },
  {
    src: "/images/girls/basketball/seasons/2005-06/gallery/2005-06-girls-basketball-07-post-defense.png",
    alt: "St. Andrew's girls basketball players contesting a shot near the basket",
    caption: "The Lady Saints battle inside near the rim",
  },
  {
    src: "/images/girls/basketball/seasons/2005-06/gallery/2005-06-girls-basketball-08-rose-wilkowski-layup.png",
    alt: "Rose Wilkowski going up for a shot near the basket",
    caption: "Rose Wilkowski goes up at the basket",
  },
  {
    src: "/images/girls/basketball/seasons/2005-06/gallery/2005-06-girls-basketball-09-emily-aimone-shot.png",
    alt: "Emily Aimone shooting in traffic",
    caption: "Emily Aimone attacks the basket",
  },
  {
    src: "/images/girls/basketball/seasons/2005-06/gallery/2005-06-girls-basketball-10-meghan-miller-dribble.png",
    alt: "Meghan Miller handling the ball",
    caption: "Meghan Miller handles the ball on the wing",
  },
  {
    src: "/images/girls/basketball/seasons/2005-06/gallery/2005-06-girls-basketball-11-grace-wilkowski-drive.png",
    alt: "Grace Wilkowski driving against a defender",
    caption: "Grace Wilkowski drives through traffic",
  },
];

export default function Season2005_06() {
  return (
    <MaxPrepsSeasonPage
      seasonId={2005}
      seasonLabel="2005-06"
      trimShootingColumns
      hideScheduleToggle
      hidePlayerStatsToggle
      seasonRecap={seasonRecap}
      seasonRecapLinks={[
        {
          Text: "Read the 2005 Savannah Morning News girls basketball preview.",
          ArticleID: "20051119-hardwood-heroines",
        },
      ]}
      seasonBriefs={[
        { label: "Record", value: "-" },
        { label: "Coach", value: "Michael Bennet" },
        { label: "Finish", value: "-" },
      ]}
      hideSeasonArticles
      seasonImages={seasonImages}
      showSeasonRoster
      headCoach="Michael Bennet"
    />
  );
}
