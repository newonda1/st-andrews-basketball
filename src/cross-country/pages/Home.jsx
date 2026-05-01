import React from "react";

import SportHomePage from "../../components/SportHomePage";

const links = [
  { label: "School Records", to: "/athletics/cross-country/records/school" },
  { label: "List of Champions", to: "/athletics/cross-country/champions" },
  { label: "Season Results", to: "/athletics/cross-country/yearly-results" },
  { label: "2025-26 Season", to: "/athletics/cross-country/seasons/2026" },
  { label: "2024-25 Season", to: "/athletics/cross-country/seasons/2025" },
];

export default function Home() {
  return (
    <SportHomePage
      sportName="Cross Country"
      eyebrow="Cross Country"
      headline="Mapping races, runners, and season history."
      intro="The cross country section is built around race results: season schedules, team-filtered MileSplit performances, postseason finishes, top times, and runners who appear across the program archive."
      secondaryIntro="The live archive keeps high-school and middle-school results distinct while preserving boys and girls results from MileSplit Georgia season by season."
      icon="/images/cross-country/cross_country_icon.png"
      iconAlt="St. Andrew's cross country icon"
      iconClassName="scale-[1.35]"
      storyTitle="Program Snapshot"
      storyParagraphs={[
        "Cross country turns the archive into a map of repeated effort: race dates, courses, distances, placements, and runners moving from early-season miles into region and state meets.",
        "The current section covers the 1996-97 through 2025-26 school years, combining MileSplit Georgia team pages with South Carolina SCISA result files for the earlier St. Andrew's seasons.",
      ]}
      highlights={[
        "30 archived seasons",
        "106 schedule entries",
        "549 high-school result rows",
        "551 middle-school result rows",
        "81 meets with public performances",
        "Row-level division split",
        "SCISA, region, and state meet snapshots",
      ]}
      links={links}
    />
  );
}
