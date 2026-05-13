import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const seasonRecap = `The 2004-05 St. Andrew's girls basketball season opened with another coaching transition but with a proven core still in place. A newspaper season preview listed Michael Bennet as the Saints' first-year head coach after St. Andrew's finished 21-5 overall and 10-0 in SCISA Region 2-AA in 2003-04. Bennet, a former St. Andrew's boys' basketball coach, inherited a team built around Grace Wilkowski, a 5-foot-10 junior guard/forward; Mary Wilkowski, a 5-foot-11 sophomore center; and Meghan Miller, a 5-foot-3 junior point guard.

The preview also noted the losses of Carie Bugos, center Becca Cooper, and point guard Jennifer Moesch, while expecting Miller and the Wilkowski sisters to keep helping the Saints bridge coaching changes with wins.

The first recovered result matched that preview. St. Andrew's opened at home on November 22, 2004, with a 57-27 win over Bible Baptist as all three Wilkowski sisters posted double-doubles. Grace Wilkowski led the Saints with 22 points and 10 rebounds, Rose Wilkowski added 12 points and 13 rebounds, and Mary Wilkowski finished with 10 points and 13 rebounds. Pinewood Christian handed St. Andrew's its first loss eight days later, winning 68-30 at St. Andrew's as Rose Wilkowski led the Saints with 12 points. The Saints answered on December 2 in Walterboro, where Grace Wilkowski had 13 points and 15 rebounds in a 42-37 win at Colleton Prep. One night later, the Wilkowski sisters powered a 52-26 win at Memorial Day as Grace scored 18, Rose scored 16, and Mary added 6 points with 15 rebounds to move St. Andrew's to 3-1. On December 4, Grace and Mary both recorded double-doubles in a 51-31 home win over Frederica Academy, with Grace posting 19 points and 14 rebounds and Mary adding 19 points and 12 rebounds. Grace carried St. Andrew's again on December 7 at Frederica, scoring four of her game-high 26 points in overtime and adding 9 rebounds in a 46-42 non-region win. Three days later at Hilton Head Prep, Mary recorded a 10-point, 15-rebound double-double in a 68-42 loss as the Saints moved to 5-2. The next day, Mary scored a game-high 20 and Grace added 18 in a 47-46 loss at Hilton Head Christian decided by a free throw with two seconds left. St. Andrew's then opened the Bulloch Academy-Pinewood Christian Classic on December 16, falling 63-37 at unbeaten Pinewood Christian despite 15 points from Rose and 10 from Grace. Two days later in the same tournament, Mary and Grace combined for 43 points in a 54-36 neutral-site win over David Emanuel Academy. After the holiday break, Rose posted 16 points and 10 rebounds in a 44-28 home win over Colleton Prep on January 5. St. Andrew's opened SCISA Region 4 play on January 11 with a 50-33 home win over Hilton Head Christian, pulling away after a 22-17 halftime lead as Grace scored 21 points and Mary added 13. Three nights later, all three Wilkowski sisters recorded double-doubles again in a 60-34 non-region home win over Providence Christian, with Grace scoring 19, Rose 16, and Mary 14 while Emily Aimone added 11. The Saints then won 54-43 at Bible Baptist on January 15, jumping out to a 36-15 halftime lead behind 17 points from Grace, 15 from Mary, and 13 from Rose. On January 18 in Ridgeland, Mary added 14 points and 13 rebounds and Grace scored 19 as the Saints beat Thomas Heyward 49-29 in region play. Three days later in Beaufort, Grace scored 16 points, Mary added 12 points and 10 rebounds, and Rose posted 12 points and 17 rebounds as St. Andrew's defeated Beaufort Academy 63-7 to move to 12-4 overall and 3-0 in region play. The next day, Mary scored 20 points as the Saints won 64-38 at Memorial Day, with Grace adding 15 and Rose scoring 13 as St. Andrew's improved to 13-4. On January 25, Hilton Head Prep placed four players in double figures in a 71-48 SCISA win over St. Andrew's despite 16 points from Grace and 11 from Katie Hall. Game-by-game results, final record, and postseason details will continue to be added here as source material is recovered.`;

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
        { label: "Coach", value: "Michael Bennet" },
        { label: "Finish", value: "To be added" },
      ]}
      hideSeasonArticles
      seasonImages={seasonImages}
      showSeasonRoster
    />
  );
}
