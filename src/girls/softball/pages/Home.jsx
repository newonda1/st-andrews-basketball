import React from "react";

import SportHomePage from "../../../components/SportHomePage";

const links = [
  { label: "Spring 2006 Season", to: "/athletics/softball/seasons/2006" },
  { label: "First Archived Game", to: "/athletics/softball/games/20060324" },
  { label: "Rose Wilkowski", to: "/athletics/softball/players/200422" },
  { label: "Stephanie Vine", to: "/athletics/softball/players/200429" },
];

export default function Home() {
  return (
    <SportHomePage
      sportName="Softball"
      headline="Building the St. Andrew's softball archive."
      intro="The softball section now follows the same season, game detail, and player page structure used by the baseball archive."
      secondaryIntro="Spring 2006 is the first season in the section, with schedule, line score, published leaders, pitching decisions, and player detail pages connected from the same archive paths."
      icon="/images/girls/softball/softball_icon.svg"
      iconAlt="St. Andrew's softball icon"
      storyTitle="Current Archive"
      storyParagraphs={[
        "Softball now has a season-by-season structure that matches baseball's pattern, starting with the Spring 2006 opener against Abundant Life.",
        "Player pages are generated from the published box score leaders so the section can grow naturally as more softball records are added.",
      ]}
      highlights={[
        "Spring sport archive",
        "2006 season page",
        "Game detail pages",
        "Player detail pages",
        "Line score tables",
        "Published leader stats",
      ]}
      links={links}
    />
  );
}
