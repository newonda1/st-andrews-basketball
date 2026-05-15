import React from "react";

import SportHomePage from "../../../components/SportHomePage";

const links = [
  { label: "Spring 2003 Season", to: "/athletics/girls/soccer/seasons/2003" },
  { label: "2003 Lowcountry Day Semifinal", to: "/athletics/girls/soccer/games/20030513" },
  { label: "Spring 2004 Season", to: "/athletics/girls/soccer/seasons/2004" },
  { label: "Frederica Academy Game", to: "/athletics/girls/soccer/games/20040309" },
  { label: "Year-by-Year Results", to: "/athletics/girls/soccer/yearly-results" },
];

export default function Home() {
  return (
    <SportHomePage
      sportName="Girls Soccer"
      archiveImageKey="girlsSoccer"
      headline="Building the St. Andrew's girls soccer archive."
      intro="The girls soccer section now begins with the Spring 2003 state semifinal season, connecting recovered game briefs with season, roster, and game detail pages."
      secondaryIntro="The archive now tracks the 2003 run through the SCISA Class AA semifinals and the 2004 state runner-up season."
      icon="/images/common/soccer_icon.png"
      iconAlt="St. Andrew's soccer icon"
      iconClassName="scale-[0.8]"
      storyTitle="Program Archive"
      storyParagraphs={[
        "Girls soccer is being built from published game briefs and season records as they are recovered. The first pages preserve scores, goal scorers, assists, goalkeeper saves, tournament context, region context, and record notes from the Spring 2003 and Spring 2004 seasons.",
        "The section follows the same archive-first structure as football: a landing page, season pages, game detail pages, and year-by-year results that can expand as more seasons are added.",
      ]}
      highlights={[
        "2003 state semifinalist",
        "5-6 final record",
        "Meghan Lowe hat trick",
        "2004 state runner-up",
        "14-3 final record",
        "Goal, assist, and save details",
      ]}
      links={links}
    />
  );
}
