import React from "react";

import SportHomePage from "../../../components/SportHomePage";

const boysBasketballArchiveImages = [
  {
    src: "/images/boys/basketball/seasons/1978-79/first_team_1978.png",
    alt: "1978-79 St. Andrew's first boys basketball team",
    caption: "1978-79 first team",
  },
  {
    src: "/images/boys/basketball/seasons/1992-93/chris_haslem_1993.png",
    alt: "Chris Haslam during the 1992-93 championship season",
    caption: "1992-93 championship season",
  },
  {
    src: "/images/boys/basketball/seasons/2024-25/state_champions_2025.jpg",
    alt: "The 2024-25 boys basketball state championship team",
    caption: "2024-25 state champions",
  },
];

function Home() {
  return (
    <SportHomePage
      sportName="Boys' Basketball"
      eyebrow="Boys' Basketball"
      archiveImageKey="boysBasketball"
      headline="Celebrating the legacy of St. Andrew's basketball."
      intro="The story of St. Andrew's boys basketball is one of steady program building, breakthrough championship moments, and a modern era that has elevated the Lions into one of the most accomplished programs in Georgia independent school athletics."
      secondaryIntro="Across decades of competition, the archive below connects season history with records, player pages, and game-by-game detail so the program can be explored as both a living team and a long-term historical record."
      heroImage="/images/boys/basketball/seasons/2024-25/state_champions_2025.jpg"
      heroImageAlt="The 2024-25 boys basketball state championship team with coaches and cheerleaders"
      heroImageCaption="2024-25 State Champions"
      storyTitle="Program Story"
      storyParagraphs={[
        "The program began in the late 1970s and was shaped through its early years by coaches who established the standards of effort, discipline, and competitiveness that would become part of the school's basketball identity.",
        "A major turning point came in 1992-93, when the Lions won their first state championship. That season proved St. Andrew's could compete for titles and helped define the expectations that followed.",
        "Success continued through the late 1990s and early 2000s, then accelerated again in the modern era under Coach Mel Abrams Jr., whose teams have added multiple state titles and sustained deep postseason success.",
      ]}
      highlights={[
        "639 total wins",
        "16 region championships",
        "6 state championships",
        "Season-by-season archives",
        "Career and single-game records",
        "Player and game detail pages",
      ]}
      archiveImages={boysBasketballArchiveImages}
    />
  );
}

export default Home;
