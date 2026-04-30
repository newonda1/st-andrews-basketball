import React from "react";

import SportHomePage from "../../components/SportHomePage";

const links = [
  { label: "State Champions", to: "/athletics/swimming/champions" },
  { label: "School Records", to: "/athletics/swimming/records/school" },
  { label: "Season Results", to: "/athletics/swimming/yearly-results" },
  { label: "2025-26 Season", to: "/athletics/swimming/seasons/2026" },
  { label: "2024-25 Season", to: "/athletics/swimming/seasons/2025" },
];

export default function Home() {
  return (
    <SportHomePage
      sportName="Swimming"
      headline="Preserving St. Andrew's swimming results."
      intro="The swimming section gives state champions, school records, meet results, athlete entries, and season summaries a single program home."
      secondaryIntro="The live archive currently covers verified meet data from 2014-15 through 2025-26, with room to keep folding in older championship history."
      icon="/images/swimming/swimming_icon.png"
      iconAlt="St. Andrew's swimming icon"
      storyTitle="Program Archive"
      storyParagraphs={[
        "Swimming's archive is driven by official meet files and state-meet results, making it a natural fit for champion lists, event records, and athlete-by-athlete performance detail.",
        "Recent seasons are especially rich, with repeated state-title performances and school-record marks connected to season pages and meet summaries.",
      ]}
      highlights={[
        "11 archived seasons",
        "17 meet pages",
        "288 swim entries",
        "2008 and 2009 team state titles",
        "State champion list",
        "School record tables",
      ]}
      links={links}
    />
  );
}
