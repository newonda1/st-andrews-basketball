import React from "react";
import MaxPrepsSeasonPage from "./MaxPrepsSeasonPage";

const seasonRecap = `The 2005-06 St. Andrew's girls basketball team entered the winter as the defending SCISA Class AA champion and built the season around a deep senior group, point guard Meghan Miller, and the frontcourt scoring of Grace, Mary, and Rose Wilkowski. A Savannah Morning News preseason feature framed the year around the three sisters, who gave Michael Bennet's team the scoring balance and championship expectations that followed a state title and a second straight volleyball championship. Read the 2005 Savannah Morning News girls basketball preview.

The Saints opened 5-0, split their two recovered College Prep Holiday Tournament games, and bounced back from the Ashley Hall loss with an away win at Beaufort Academy. They then moved through January with wins over Trinity Collegiate, Hilton Head Christian, Thomas Heyward, Beaufort Academy, Memorial Day, Pinewood Christian, and Ashley Hall. Grace Wilkowski set the school's career scoring record against Trinity Collegiate, Mary Wilkowski continued to anchor the glass, and Rose Wilkowski gave the Saints a third double-figure scoring option.

By early February, St. Andrew's had secured a state tournament place and reached the SCISA Region 4-AAA tournament final at Hilton Head Christian before falling to Hilton Head Prep. A March 1 Savannah Morning News state tournament preview captured the team's mindset entering the SCISA Class AA quarterfinals, highlighting Miller's MVP season, Bennet's nine-player confidence, and the Saints' goal of cutting down the nets again. Read Noell Barnidge's state tournament preview.

At the Sumter County Exhibition Center, the Saints beat Williamsburg Academy in the quarterfinals, routed Greenwood Christian in the semifinals as Grace Wilkowski reached 2,000 career points, and defeated Trinity Collegiate 54-40 for a second straight SCISA Class AA championship. Mary Wilkowski led the title game with 23 points, Grace Wilkowski, Mary Wilkowski, and Megan Hall earned all-tournament honors, and the six seniors finished with the championship legacy the Savannah Morning News later praised in its opinion pages. Read the post-championship Savannah Morning News opinion piece.

Chris Lancia's post-title feature traced the group back to a sixth-grade SPAL championship team and framed the roster as a true family, with the Wilkowski sisters and Griffin twins surrounded by a senior class that had grown up together. The Senior Speak section gave that bond a chorus of voices, from Kristen Albritton calling the title a fairy tale to Grace Wilkowski saying there was nothing better than winning her last game. Grace finished with a school-record 2,017 points and more than 1,000 rebounds, while Bennet described a program standard built around expecting to play on the last Saturday of the season. Read Chris Lancia's feature on the Saints' championship family.`;

const seasonImages = [
  {
    src: "/images/girls/basketball/seasons/2005-06/gallery/2005-06-girls-basketball-team.png",
    alt: "2005-06 St. Andrew's girls basketball team photo",
    caption: "2005-06 Lady Saints team photo",
  },
  {
    src: "/images/girls/basketball/seasons/2005-06/gallery/2005-06-girls-basketball-01-grace-wilkowski.png",
    alt: "Senior Grace Wilkowski portrait",
    caption: "Senior Grace Wilkowski",
  },
  {
    src: "/images/girls/basketball/seasons/2005-06/gallery/2005-06-girls-basketball-02-stephanie-griffin.png",
    alt: "Senior Stephanie Griffin portrait",
    caption: "Senior Stephanie Griffin",
  },
  {
    src: "/images/girls/basketball/seasons/2005-06/gallery/2005-06-girls-basketball-03-michelle-griffin.png",
    alt: "Senior Michelle Griffin portrait",
    caption: "Senior Michelle Griffin",
  },
  {
    src: "/images/girls/basketball/seasons/2005-06/gallery/2005-06-girls-basketball-04-emily-aimone.png",
    alt: "Senior Emily Aimone portrait",
    caption: "Senior Emily Aimone",
  },
  {
    src: "/images/girls/basketball/seasons/2005-06/gallery/2005-06-girls-basketball-05-kristen-albritton.png",
    alt: "Senior Kristen Albritton portrait",
    caption: "Senior Kristen Albritton",
  },
  {
    src: "/images/girls/basketball/seasons/2005-06/gallery/2005-06-girls-basketball-06-meghan-miller.png",
    alt: "Senior Meghan Miller portrait",
    caption: "Senior Meghan Miller",
  },
  {
    src: "/images/girls/basketball/seasons/2005-06/gallery/2005-06-girls-basketball-07-post-defense.png",
    alt: "St. Andrew's girls basketball players contesting a shot near the basket",
    caption: "The Lady Saints battle inside near the rim",
  },
  {
    src: "/images/girls/basketball/seasons/2005-06/gallery/2005-06-girls-basketball-08-rose-wilkowski-layup.png",
    alt: "Rose Wilkowski going up for a shot near the basket",
    caption: "Rose Wilkowski goes up at the basket",
  },
  {
    src: "/images/girls/basketball/seasons/2005-06/gallery/2005-06-girls-basketball-09-emily-aimone-shot.png",
    alt: "Emily Aimone shooting in traffic",
    caption: "Emily Aimone attacks the basket",
  },
  {
    src: "/images/girls/basketball/seasons/2005-06/gallery/2005-06-girls-basketball-10-meghan-miller-dribble.png",
    alt: "Meghan Miller handling the ball",
    caption: "Meghan Miller handles the ball on the wing",
  },
  {
    src: "/images/girls/basketball/seasons/2005-06/gallery/2005-06-girls-basketball-11-grace-wilkowski-drive.png",
    alt: "Grace Wilkowski driving against a defender",
    caption: "Grace Wilkowski drives through traffic",
  },
];

export default function Season2005_06() {
  return (
    <MaxPrepsSeasonPage
      seasonId={2005}
      seasonLabel="2005-06"
      trimShootingColumns
      hideScheduleToggle
      hidePlayerStatsToggle
      seasonRecap={seasonRecap}
      seasonRecapLinks={[
        {
          Text: "Read the 2005 Savannah Morning News girls basketball preview.",
          ArticleID: "20051119-hardwood-heroines",
        },
        {
          Text: "Read Noell Barnidge's state tournament preview.",
          ArticleID: "20060301-looking-to-climb-ladder-again",
        },
        {
          Text: "Read the post-championship Savannah Morning News opinion piece.",
          ArticleID: "20060307-champs-on-campus",
        },
        {
          Text: "Read Chris Lancia's feature on the Saints' championship family.",
          ArticleID: "20060308-family-on-and-off-court",
        },
      ]}
      seasonBriefs={[
        { label: "Record", value: "24-4" },
        { label: "Coach", value: "Michael Bennet" },
        { label: "Finish", value: "SCISA Class AA Champions" },
      ]}
      hideSeasonArticles
      seasonImages={seasonImages}
      showSeasonRoster
      headCoach="Michael Bennet"
    />
  );
}
