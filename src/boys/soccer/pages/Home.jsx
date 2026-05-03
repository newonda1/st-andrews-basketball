import React from "react";

import SportHomePage from "../../../components/SportHomePage";

const links = [
  { label: "Spring 2004 Season", to: "/athletics/boys/soccer/seasons/2004" },
  { label: "Cathedral Academy Game", to: "/athletics/boys/soccer/games/20040322" },
  { label: "Charleston Collegiate Game", to: "/athletics/boys/soccer/games/20040323" },
  { label: "Beaufort Academy Game", to: "/athletics/boys/soccer/games/20040329" },
  { label: "James Island Christian Game", to: "/athletics/boys/soccer/games/20040402" },
  { label: "Hilton Head Christian Game", to: "/athletics/boys/soccer/games/20040406" },
  { label: "Patrick Henry Game", to: "/athletics/boys/soccer/games/20040429" },
  { label: "Cathedral Academy Region Tournament Game", to: "/athletics/boys/soccer/games/20040504" },
  { label: "Patrick Henry Region Tournament Game", to: "/athletics/boys/soccer/games/20040506" },
  { label: "Beaufort Academy Region Championship Game", to: "/athletics/boys/soccer/games/20040508" },
  { label: "St. Francis Xavier State Tournament Game", to: "/athletics/boys/soccer/games/20040510" },
  { label: "Cathedral Academy State Semifinal Game", to: "/athletics/boys/soccer/games/20040512" },
  { label: "James Island Christian State Championship Game", to: "/athletics/boys/soccer/games/20040515" },
  { label: "Year-by-Year Results", to: "/athletics/boys/soccer/yearly-results" },
  { label: "Opponent Game History", to: "/athletics/boys/soccer/records/opponents" },
];

export default function Home() {
  return (
    <SportHomePage
      sportName="Boys Soccer"
      headline="Building the St. Andrew's boys soccer archive."
      intro="The boys soccer section is ready for recovered schedules, rosters, game briefs, and season records."
      secondaryIntro="This section now has the same archive structure as girls soccer: a landing page, year-by-year results, season pages, game detail pages, player pages, and opponent history."
      icon="/images/common/soccer_icon.png"
      iconAlt="St. Andrew's soccer icon"
      iconClassName="scale-[0.8]"
      storyTitle="Program Archive"
      storyParagraphs={[
        "Boys soccer is set up to preserve scores, goal scorers, assists, goalkeeper saves, tournament context, region context, roster entries, and record notes as source material is added.",
        "The pages are intentionally data-ready: once games and seasons are entered, the results tables, detail pages, player pages, and opponent records will fill in automatically.",
      ]}
      highlights={[
        "13-1-1 final record",
        "2004 region champions",
        "2004 state champions",
        "Hamish Huntley 19 goals",
        "Daniel Eichholz final brace",
        "Second straight state title",
      ]}
      links={links}
    />
  );
}
