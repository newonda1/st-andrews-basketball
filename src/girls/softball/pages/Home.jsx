import React from "react";

import SportHomePage from "../../../components/SportHomePage";

const links = [
  { label: "Spring 2006 Season", to: "/athletics/softball/seasons/2006" },
];

export default function Home() {
  return (
    <SportHomePage
      sportName="Softball"
      headline="Building the St. Andrew's softball archive."
      intro="The softball section gives the program a dedicated home alongside the rest of the St. Andrew's athletics archive."
      secondaryIntro="Spring 2006 is the first season page in the section, with room for schedules, results, rosters, images, and notes as source material is added."
      icon="/images/girls/softball/softball_icon.svg"
      iconAlt="St. Andrew's softball icon"
      storyTitle="Current Archive"
      storyParagraphs={[
        "Softball now has its own section in the athletics site navigation and a season-by-season structure ready for historical records.",
        "The first published page is the Spring 2006 season page, set up as a clean landing place for the program's early archive material.",
      ]}
      highlights={[
        "Spring sport archive",
        "2006 season page",
        "Program home page",
        "Ready for roster and result data",
      ]}
      links={links}
    />
  );
}
