import React from "react";

import SportHomePage from "../../../components/SportHomePage";

const girlsBasketballArchiveImages = [
  {
    src: "/images/girls/basketball/girls_basketball_home.jpg",
    alt: "St. Andrew's girls basketball players gathered at center court",
    caption: "Girls basketball",
  },
  {
    src: "/images/girls/basketball/seasons/2025-26/Season2025_26_1.png",
    alt: "St. Andrew's girls basketball players during the 2025-26 season",
    caption: "2025-26 season",
  },
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-team.png",
    alt: "2003-04 St. Andrew's girls basketball team photo",
    caption: "2003-04 team",
  },
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-01-leighanne-evans-smile.png",
    alt: "LeighAnne Evans smiling before a 2003-04 girls basketball game",
    caption: "2003-04 introductions",
  },
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-02-becca-cooper-shot.png",
    alt: "Becca Cooper shooting during the 2003-04 girls basketball season",
    caption: "2003-04 shot",
  },
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-03-mary-wilkowski-intro.png",
    alt: "Mary Wilkowski running onto the court during the 2003-04 season",
    caption: "2003-04 intro",
  },
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-04-kunst-timeout.png",
    alt: "Coach Kevin Kunst talking to the 2003-04 girls basketball team during a timeout",
    caption: "2003-04 timeout",
  },
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-05-grace-wilkowski-free-throw.png",
    alt: "Grace Wilkowski shooting a free throw during the 2003-04 girls basketball season",
    caption: "2003-04 free throw",
  },
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-06-michelle-griffin-defense.png",
    alt: "Michelle Griffin defending during the 2003-04 girls basketball season",
    caption: "2003-04 defense",
  },
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-07-jennifer-moesch-free-throw.png",
    alt: "Jennifer Moesch preparing for a free throw during the 2003-04 season",
    caption: "2003-04 routine",
  },
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-08-offensive-rebound.png",
    alt: "St. Andrew's girls basketball players going for an offensive rebound in 2003-04",
    caption: "2003-04 rebound",
  },
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-09-gym-camera.png",
    alt: "St. Andrew's girls basketball players posing in the gym during the 2003-04 season",
    caption: "2003-04 gym",
  },
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-10-defense-memorial.png",
    alt: "St. Andrew's girls basketball defense against Memorial Day during the 2003-04 season",
    caption: "2003-04 pressure",
  },
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-11-mary-rebound-outlet.png",
    alt: "Mary Wilkowski grabbing a rebound during the 2003-04 girls basketball season",
    caption: "2003-04 outlet",
  },
  {
    src: "/images/girls/basketball/seasons/2003-04/gallery/2003-04-girls-basketball-12-carie-bugos-ball-fake.png",
    alt: "Carie Bugos ball faking during the 2003-04 girls basketball season",
    caption: "2003-04 ball fake",
  },
];

export default function Home() {
  return (
    <SportHomePage
      sportName="Girls' Basketball"
      archiveImageKey="girlsBasketball"
      headline="A growing home for St. Andrew's girls basketball history."
      intro="The girls basketball archive now connects 22 season records, 432 games, 119 player records, opponent history, team records, individual leaderboards, roster files, and player pages across the site."
      secondaryIntro="The recovered 2003-04 season adds a 21-5 State Final Four run, full roster details, newspaper recaps, game-by-game scoring, and a newly organized photo gallery to the modern season pages already live from 2020-21 through 2025-26."
      heroImage="/images/girls/basketball/girls_basketball_home.jpg"
      heroImageAlt="St. Andrew's girls basketball players gathered at center court"
      heroImageCaption="Girls Basketball Archive"
      storyTitle="Program Archive"
      storyParagraphs={[
        "The archive now reaches from the 2002-03 state championship marker and the recovered 2003-04 postseason run through the current 2025-26 season. Season pages, game detail pages, record tables, and player profiles share one data structure so new finds can flow into the same historical record.",
        "The current files include 19 roster seasons, 2,541 player stat rows, 71 recorded opponents, and a 2003-04 archive package with team photos, game clippings, and a feature on Grace and Mary Wilkowski anchoring a faster Saints team under Kevin Kunst.",
      ]}
      highlights={[
        "22 season records",
        "432 games in the database",
        "119 player records",
        "2,541 player stat rows",
        "71 recorded opponents",
        "19 roster seasons",
        "2002-03 state championship",
        "2003-04 State Final Four",
        "2020-21 through 2025-26 season pages",
        "Game recaps, records, and player profiles",
      ]}
      archiveImages={girlsBasketballArchiveImages}
    />
  );
}
