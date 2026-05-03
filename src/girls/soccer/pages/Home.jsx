import React from "react";

import SportHomePage from "../../../components/SportHomePage";

const links = [
  { label: "Spring 2004 Season", to: "/athletics/girls/soccer/seasons/2004" },
  { label: "Frederica Academy Game", to: "/athletics/girls/soccer/games/20040309" },
  { label: "Year-by-Year Results", to: "/athletics/girls/soccer/yearly-results" },
];

export default function Home() {
  return (
    <SportHomePage
      sportName="Girls Soccer"
      headline="Building the St. Andrew's girls soccer archive."
      intro="The girls soccer section now begins with the Spring 2004 season, connecting recovered game briefs with season, roster, and game detail pages."
      secondaryIntro="The opening stretch now includes the March 9 Frederica Academy match, the March 11 SCISA 2-AA region win over Colleton Prep, and Cavalier Classic results from Mount De Sales."
      icon="/images/common/soccer_icon.png"
      iconAlt="St. Andrew's soccer icon"
      iconClassName="scale-[0.8]"
      storyTitle="Program Archive"
      storyParagraphs={[
        "Girls soccer is being built from published game briefs and season records as they are recovered. The first pages preserve scores, goal scorers, assists, goalkeeper saves, tournament context, region context, and record notes from the Spring 2004 season.",
        "The section follows the same archive-first structure as football: a landing page, season pages, game detail pages, and year-by-year results that can expand as more seasons are added.",
      ]}
      highlights={[
        "4 completed Spring 2004 games",
        "Cavalier Classic semifinal placeholder",
        "1-0 SCISA 2-AA region start",
        "3 straight recovered shutouts",
        "Mary Wilkowski roster entry",
        "Goal, assist, and save details",
      ]}
      links={links}
    />
  );
}
