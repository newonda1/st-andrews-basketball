import React from "react";

import SportHomePage from "../../../components/SportHomePage";
import { athleteProfilePath } from "../../../athletes/archiveEra";

const links = [
  { label: "Spring 2006 Season", to: "/athletics/softball/seasons/2006" },
  { label: "First Archived Game", to: "/athletics/softball/games/20060324" },
  { label: "Rose Wilkowski", to: athleteProfilePath("200422", "softball") },
  { label: "Stephanie Vine", to: athleteProfilePath("200429", "softball") },
];

export default function Home() {
  return (
    <SportHomePage
      sportName="Softball"
      headline="Building the St. Andrew's softball archive."
      intro="The softball section now follows the same season and game detail structure used by the baseball archive."
      secondaryIntro="Spring 2006 is the first season in the section, with schedule, line score, published leaders, pitching decisions, and shared athlete profile links connected from the same archive paths."
      icon="/images/girls/softball/softball_icon.png"
      iconAlt="St. Andrew's softball icon"
      storyTitle="Current Archive"
      storyParagraphs={[
        "Softball now has a season-by-season structure that matches baseball's pattern, starting with the Spring 2006 opener against Abundant Life.",
        "Softball stats connect into the shared athlete profiles so multi-sport players stay together as more records are added.",
      ]}
      highlights={[
        "Spring sport archive",
        "2006 season page",
        "Game detail pages",
        "Shared athlete profiles",
        "Line score tables",
        "Published leader stats",
      ]}
      links={links}
    />
  );
}
