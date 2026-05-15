import React from "react";

import SportHomePage from "../../../components/SportHomePage";

const links = [
  { label: "Spring 2003 Season", to: "/athletics/boys/soccer/seasons/2003" },
  { label: "2003 State Championship Game", to: "/athletics/boys/soccer/games/20030517" },
  { label: "Spring 2006 Season", to: "/athletics/boys/soccer/seasons/2006" },
  { label: "Charleston Collegiate 2006 Game", to: "/athletics/boys/soccer/games/20060323" },
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
      archiveImageKey="boysSoccer"
      headline="Building the St. Andrew's boys soccer archive."
      intro="The boys soccer section is ready for recovered schedules, rosters, game briefs, and season records."
      secondaryIntro="This section now has the same archive structure as girls soccer: a landing page, year-by-year results, season pages, game detail pages, player pages, and opponent history."
      icon="/images/common/soccer_icon.png"
      iconAlt="St. Andrew's soccer icon"
      iconClassName="scale-[0.8]"
      storyTitle="Program Archive"
      storyParagraphs={[
        "Boys soccer preserves scores, goal scorers, assists, goalkeeper saves, tournament context, region context, roster entries, and record notes as source material is added.",
        "The 2003 championship season is now represented alongside the 2004 title run, giving the archive a clearer bridge between the program's late-1990s titles and the mid-2000s state championship teams.",
      ]}
      highlights={[
        "2003 state champions",
        "15-1 final record",
        "84-9 scoring margin",
        "Jacob Rauers title hat trick",
        "13-1-1 final record",
        "2004 region champions",
        "2004 state champions",
        "Hamish Huntley 23 goals",
      ]}
      links={links}
    />
  );
}
