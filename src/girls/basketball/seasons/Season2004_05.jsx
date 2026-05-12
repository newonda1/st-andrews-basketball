import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const seasonRecap = `Season recap will be added here as game information, source material, and season notes are recovered.`;

const seasonImages = [
  {
    src: "/images/girls/basketball/seasons/2004-05/gallery/2004-05-girls-basketball-team.png",
    alt: "2004-05 St. Andrew's girls basketball team photo",
    caption: "2004-05 Lady Saints team photo",
  },
  {
    src: "/images/girls/basketball/seasons/2004-05/gallery/2004-05-girls-basketball-01-inbound-play.png",
    alt: "The Lady Saints setting up for an inbound pass play",
    caption: "The Lady Saints set up for an inbound pass play",
  },
  {
    src: "/images/girls/basketball/seasons/2004-05/gallery/2004-05-girls-basketball-02-katie-hall-fast-break.png",
    alt: "Katie Hall bringing the ball down the court",
    caption: "Katie Hall bringing the ball down the court, watch out defense!",
  },
  {
    src: "/images/girls/basketball/seasons/2004-05/gallery/2004-05-girls-basketball-03-kristen-albritton-block.png",
    alt: "Kristen Albritton blocking a shot",
    caption: "",
  },
  {
    src: "/images/girls/basketball/seasons/2004-05/gallery/2004-05-girls-basketball-04-katie-hall-dribble.png",
    alt: "Katie Hall dribbling near midcourt",
    caption: "",
  },
  {
    src: "/images/girls/basketball/seasons/2004-05/gallery/2004-05-girls-basketball-05-rose-wilkowski-free-throw.png",
    alt: "Rose Wilkowski shooting a free throw",
    caption: "",
  },
  {
    src: "/images/girls/basketball/seasons/2004-05/gallery/2004-05-girls-basketball-06-mary-wilkowski-inside.png",
    alt: "Mary Wilkowski working the ball inside",
    caption: "",
  },
];

export default function Season2004_05() {
  return (
    <MaxPrepsSeasonPage
      seasonId={2004}
      seasonLabel="2004-05"
      trimShootingColumns
      hideScheduleToggle
      hidePlayerStatsToggle
      seasonRecap={seasonRecap}
      seasonBriefs={[
        { label: "Record", value: "To be added" },
        { label: "Coach", value: "To be added" },
        { label: "Finish", value: "To be added" },
      ]}
      hideSeasonArticles
      seasonImages={seasonImages}
      showSeasonRoster
    />
  );
}
