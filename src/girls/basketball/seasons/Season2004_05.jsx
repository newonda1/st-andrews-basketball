import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const seasonRecap = `The 2004-05 St. Andrew's girls basketball season became a championship reset. A newspaper preview identified Michael Bennet as the Saints' new head coach after Kevin Kunst left the school, putting the former St. Andrew's boys coach in charge of a program that had won the 2003 SCISA Class AA title and reached the 2004 semifinals. Bennet inherited a team that had graduated major pieces from the 21-5 group, including Carie Bogus, Becca Cooper, Leigh Anne Evans, Maggie Hinchey, and point guard Jennifer Moesch, but the Saints still had a core built around Grace, Mary, and Rose Wilkowski, point guard Meghan Miller, senior transfer Katie Hall, Emily Aimone, Kristen Albritton, and the Griffin twins.

The early part of the season looked like a team learning how to absorb that change while playing an ambitious schedule. St. Andrew's opened with a 57-27 win over Bible Baptist behind double-doubles from all three Wilkowski sisters, then took a heavy loss to Pinewood Christian, the defending GISA Class AA champion. The Saints stabilized with wins over Colleton Prep, Memorial Day, Frederica Academy, Bible Baptist, Thomas Heyward, Beaufort Academy, Providence Christian, and Hilton Head Christian, while their regular-season losses came against Pinewood, Hilton Head Christian, and a powerful Hilton Head Prep team. By early February, Grace Wilkowski had crossed 1,500 career points, Mary Wilkowski had become a steady interior scorer and rebounder, Rose Wilkowski had grown into a freshman force, and Hall had given St. Andrew's another dependable senior presence.

The Saints were 17-6 after the regular-season finale at Hilton Head Prep, then split two SCISA Region 4 tournament games. Hall scored 20 points and Rose added 10 in a 50-41 win over Hilton Head Christian, but Hilton Head Prep controlled the region final 52-31 at Estill despite 10 points from Rose. The February 25 Savannah Morning News preview, St. Andrew's in Hunt for Another SCISA State Title, framed the Saints as the highest-ranked SCISA Class AA team entering Sumter and noted that the tournament run was not a title defense after the 2004 semifinal loss, but a chance to win the program's second girls basketball crown in three seasons.

Once the state tournament began, St. Andrew's looked like the team Bennet believed it could be. In the first round, Grace and Rose Wilkowski combined for 37 points and 40 rebounds in a 65-31 win over Calhoun Academy. In the quarterfinals, Rose posted her first career triple-double with 14 points, 15 rebounds, and 10 assists as the Saints beat Marlboro Academy 83-52; Grace scored 29, while Mary and Hall added 18 each. Donald Heath's March 4 feature, Saints March to Semis, captured the larger arc of the season: Bennet had moved from a boys championship into a rebuilt girls roster, and the Saints had navigated a Class AAA-heavy regular-season schedule to get back within reach of the final.

St. Andrew's finished the job with two controlled games in Sumter. The Saints jumped Colleton Prep early in the semifinal, got 11 points apiece from Mary and Rose, and held the War Hawks to 28 points in a 44-28 win. One day later, W.W. King led 29-24 at halftime of the championship game, but St. Andrew's pressed harder, controlled the boards, and outscored the Knights 36-20 after the break. Mary and Rose scored 16 points each, Grace added 12, Hall scored 10, and Miller delivered two critical fourth-quarter baskets after going scoreless through three quarters. The Highs... Saints Take Title chronicled the 60-49 win, the net-cutting celebration, and a 22-7 finish that gave St. Andrew's the 2005 SCISA Class AA state championship.`;

const seasonImages = [
  {
    src: "/images/girls/basketball/seasons/2004-05/gallery/2004-05-girls-basketball-team.png",
    alt: "2004-05 St. Andrew's girls basketball team photo",
    caption: "2004-05 Lady Saints team photo",
  },
  {
    src: "/images/girls/basketball/seasons/2004-05/gallery/2004-05-girls-basketball-01-inbound-play.png",
    alt: "The Lady Saints setting up for an inbound pass play",
    caption: "The Lady Saints set up for an inbound pass play",
  },
  {
    src: "/images/girls/basketball/seasons/2004-05/gallery/2004-05-girls-basketball-02-katie-hall-fast-break.png",
    alt: "Katie Hall bringing the ball down the court",
    caption: "Katie Hall bringing the ball down the court, watch out defense!",
  },
  {
    src: "/images/girls/basketball/seasons/2004-05/gallery/2004-05-girls-basketball-03-kristen-albritton-block.png",
    alt: "Kristen Albritton blocking a shot",
    caption: "",
  },
  {
    src: "/images/girls/basketball/seasons/2004-05/gallery/2004-05-girls-basketball-04-katie-hall-dribble.png",
    alt: "Katie Hall dribbling near midcourt",
    caption: "",
  },
  {
    src: "/images/girls/basketball/seasons/2004-05/gallery/2004-05-girls-basketball-05-rose-wilkowski-free-throw.png",
    alt: "Rose Wilkowski shooting a free throw",
    caption: "",
  },
  {
    src: "/images/girls/basketball/seasons/2004-05/gallery/2004-05-girls-basketball-06-mary-wilkowski-inside.png",
    alt: "Mary Wilkowski working the ball inside",
    caption: "",
  },
];

export default function Season2004_05() {
  return (
    <MaxPrepsSeasonPage
      seasonId={2004}
      seasonLabel="2004-05"
      trimShootingColumns
      hideScheduleToggle
      hidePlayerStatsToggle
      seasonRecap={seasonRecap}
      seasonBriefs={[
        { label: "Record", value: "22-7" },
        { label: "Coach", value: "Michael Bennet" },
        { label: "Finish", value: "SCISA Class AA State Champion" },
      ]}
      seasonRecapLinks={[
        {
          Text: "St. Andrew's in Hunt for Another SCISA State Title",
          ArticleID: "20050225-st-andrews-in-hunt-for-another-scisa-state-title",
        },
        {
          Text: "Saints March to Semis",
          ArticleID: "20050304-saints-march-to-semis",
        },
        {
          Text: "The Highs... Saints Take Title",
          ArticleID: "20050306-saints-take-title",
        },
      ]}
      hideSeasonArticles
      seasonImages={seasonImages}
      showSeasonRoster
    />
  );
}
