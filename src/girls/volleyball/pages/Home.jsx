import React from "react";

import SportHomePage from "../../../components/SportHomePage";

const links = [
  { label: "2025 Season", to: "/athletics/volleyball/seasons/2025" },
  { label: "2024 Season", to: "/athletics/volleyball/seasons/2024" },
  { label: "Season Results", to: "/athletics/volleyball/yearly-results" },
  { label: "Full Team Stats", to: "/athletics/volleyball/team/full" },
  { label: "Career Stats", to: "/athletics/volleyball/records/career" },
  {
    label: "Opponent History",
    to: "/athletics/volleyball/records/opponents",
  },
];

export default function Home() {
  return (
    <SportHomePage
      sportName="Volleyball"
      headline="Growing the St. Andrew's volleyball archive."
      intro="The volleyball section now has a home for season results, match detail, team totals, player pages, and record tables."
      secondaryIntro="The live archive now reaches back to the recovered 2002-03 and 2003-04 entries, then continues through the 2007-08 to 2025-26 seasons."
      icon="/images/common/volleyball_icon.png"
      iconAlt="St. Andrew's volleyball icon"
      storyTitle="Current Archive"
      storyParagraphs={[
        "Volleyball's archive is strongest in the MaxPreps-era seasons, where schedules, match scores, rosters, and player stat tables can be connected in one place.",
        "The 2003 team won the SCISA 2-AA region title and reached the state final, while the 2022 and 2024 seasons are marked as first-place region finishes in the published data.",
      ]}
      highlights={[
        "21 seasons in the archive",
        "344 matches in the database",
        "2003 region championship",
        "2022 and 2024 region first-place finishes",
        "20 wins in 2024",
        "Team and player stat pages",
        "Match detail and records",
      ]}
      links={links}
    />
  );
}
