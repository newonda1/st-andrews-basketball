import React from "react";

import { BaseballSeasonPage } from "./Season2008";

const seasonImages = [
  {
    src: "/images/boys/baseball/seasons/2006/gallery/2006-baseball-team.png",
    alt: "2006 St. Andrew's baseball team photo",
    caption: "2006 St. Andrew's baseball team photo",
  },
  {
    src: "/images/boys/baseball/seasons/2006/gallery/2006-baseball-01-jim-kingston-bat.png",
    alt: "Jim Kingston gets ready to bat",
    caption: "Jim Kingston gets ready to bat",
  },
  {
    src: "/images/boys/baseball/seasons/2006/gallery/2006-baseball-02-throw.png",
    alt: "St. Andrew's baseball player making a throw",
    caption: "What a throw!",
  },
  {
    src: "/images/boys/baseball/seasons/2006/gallery/2006-baseball-03-swing.png",
    alt: "St. Andrew's baseball player swinging at the plate",
    caption: "Swing batter batter swing!",
  },
  {
    src: "/images/boys/baseball/seasons/2006/gallery/2006-baseball-04-homerun.png",
    alt: "St. Andrew's baseball player after a swing",
    caption: "Homerun!!",
  },
  {
    src: "/images/boys/baseball/seasons/2006/gallery/2006-baseball-05-team-huddle.png",
    alt: "The 2006 baseball team huddles after a win",
    caption: "The team gathers in for a huddle after a win",
  },
  {
    src: "/images/boys/baseball/seasons/2006/gallery/2006-baseball-06-alex-bubby-determined.png",
    alt: "Alex and Bubby walk out determined to win",
    caption: "Alex and Bubby walk out determined to win",
  },
  {
    src: "/images/boys/baseball/seasons/2006/gallery/2006-baseball-07.png",
    alt: "St. Andrew's baseball players between pitches",
    caption: "",
  },
  {
    src: "/images/boys/baseball/seasons/2006/gallery/2006-baseball-08.png",
    alt: "St. Andrew's baseball player following through at the plate",
    caption: "",
  },
  {
    src: "/images/boys/baseball/seasons/2006/gallery/2006-baseball-09.png",
    alt: "St. Andrew's baseball player in the field",
    caption: "",
  },
  {
    src: "/images/boys/baseball/seasons/2006/gallery/2006-baseball-10.png",
    alt: "St. Andrew's baseball catcher crouched behind the plate",
    caption: "",
  },
  {
    src: "/images/boys/baseball/seasons/2006/gallery/2006-baseball-11.png",
    alt: "St. Andrew's baseball player throwing from the field",
    caption: "",
  },
  {
    src: "/images/boys/baseball/seasons/2006/gallery/2006-baseball-12.png",
    alt: "St. Andrew's baseball player fielding a ball",
    caption: "",
  },
  {
    src: "/images/boys/baseball/seasons/2006/gallery/2006-baseball-13.png",
    alt: "St. Andrew's baseball player on the field",
    caption: "",
  },
  {
    src: "/images/boys/baseball/seasons/2006/gallery/2006-baseball-14.png",
    alt: "St. Andrew's baseball player swinging at the plate",
    caption: "",
  },
];

export default function Season2006() {
  return (
    <BaseballSeasonPage
      seasonId={2006}
      title="2006 Season"
      seasonImages={seasonImages}
      showSeasonRoster
      rosterStaff={[
        { name: "Jim Rice", role: "Head Coach" },
        { name: "Rusty Perry", role: "Assistant Coach" },
      ]}
    />
  );
}
