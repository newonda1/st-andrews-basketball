import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const seasonRecap = `The 2005-06 girls basketball season page is ready for archive work. Results, roster details, articles, photos, and season notes will be added here as they are recovered.`;

export default function Season2005_06() {
  return (
    <MaxPrepsSeasonPage
      seasonId={2005}
      seasonLabel="2005-06"
      trimShootingColumns
      hideScheduleToggle
      hidePlayerStatsToggle
      seasonRecap={seasonRecap}
      seasonBriefs={[
        { label: "Record", value: "-" },
        { label: "Coach", value: "-" },
        { label: "Finish", value: "-" },
      ]}
      showSeasonImagesPlaceholder
      showSeasonRoster
    />
  );
}
