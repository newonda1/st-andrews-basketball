import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const seasonRecap = `The fall 2001 NewsBank window did not include any St. Andrew's girls basketball game results, but it did add the Savannah Morning News private-school preview for Deborah Morell's fourth season. The preview placed the Saints one year before the six-player state championship run and described a program coming off a 15-6 season with its core largely intact.

St. Andrew's key returnees were senior forward Kim Cooper, senior guard Sarah Roddenberry, and sophomore forward Becca Cooper. The preview also identified Meghan Lowe as the catalyst for the Saints' balanced scoring attack and framed the team's identity around pressure defense, transition scoring, and a controlled half-court offense.

No winter box scores from the 2001-02 season have been recovered yet in this fall sweep, so the roster and season page are intentionally conservative. The page preserves the confirmed preseason names, coach, and style notes now, leaving room for the full schedule and statistics to be filled when the December-through-March archive window is searched.`;

export default function Season2001_02() {
  return (
    <MaxPrepsSeasonPage
      seasonId={2001}
      seasonLabel="2001-02"
      trimShootingColumns
      hideScheduleToggle
      hidePlayerStatsToggle
      seasonRecap={seasonRecap}
      seasonRecapLinks={[
        {
          Text: "private-school preview",
          ArticleID: "20011116-private-schools-basketball-preview",
        },
      ]}
      seasonBriefs={[
        { label: "Coach", value: "Deborah Morell" },
        { label: "Archive", value: "Preseason preview" },
        { label: "Returning Core", value: "Kim, Sarah, Becca" },
      ]}
      hideSeasonArticles
      showSeasonImagesPlaceholder
      showSeasonRoster
      headCoach="Deborah Morell"
    />
  );
}
