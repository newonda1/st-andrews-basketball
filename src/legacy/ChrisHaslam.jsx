import React from "react";

export default function ChrisHaslam() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <h1 className="text-4xl font-bold text-center">Chris Haslam – Class of 1993</h1>

      {/* Team Photo */}
      <div className="text-center">
        <img
          src="/images/1992_1993_team.png"
          alt="1992-1993 St. Andrew's State Championship Team"
          className="mx-auto rounded-xl shadow-md mb-2"
        />
        <p className="text-sm italic">
          1992–1993 St. Andrew’s State Championship Team featuring Chris Haslam (#55)
        </p>
      </div>

      <section className="space-y-6 text-lg leading-relaxed text-justify">
        <h2 className="text-2xl font-semibold">A One-Season Legend</h2>
        <p>
          Chris Haslam’s arrival at St. Andrew’s for his senior year in 1992 marked the beginning of
          one of the most remarkable single-season performances in program history. A transfer
          student with an elite skill set, Chris led the Lions to their first-ever state championship,
          establishing himself as the anchor of the 1992–1993 team. Despite playing only one season,
          his on-court leadership and statistical dominance left an enduring mark on the program.
        </p>

        <h2 className="text-2xl font-semibold">🏆 Season Stats Snapshot</h2>
        <div className="bg-gray-100 p-4 rounded-xl shadow-md">
          <ul className="list-disc list-inside">
            <li><strong>Season Points:</strong> 654</li>
            <li><strong>Season Rebounds:</strong> 345</li>
            <li><strong>Double-Doubles:</strong> 12</li>
            <li><strong>Triple-Doubles:</strong> 3</li>
            <li><strong>Signature Game:</strong> 30 pts / 20 rebs / 14 blocks vs. Robert Toombs (Feb. 16, 1993)</li>
          </ul>
        </div>
        <p>
          His 654-point season stood as the all-time single-season scoring record at St. Andrew’s for
          nearly three decades — until it was finally surpassed in 2022 by Zyere Edwards. Chris’s consistent
          dominance included multiple triple-doubles and some of the most memorable performances in
          school history.
        </p>

        <h2 className="text-2xl font-semibold">📰 Highlight Moment</h2>
        <blockquote className="bg-white border-l-4 border-blue-500 p-4 shadow-sm italic">
          “Chris Haslam dominated both ends of the floor… He made it clear St. Andrew’s wasn’t just a
          participant in the postseason — they were there to win.”<br />
          — <span className="not-italic">Savannah Morning News, 1993</span>
        </blockquote>

        {/* Chris Action Photo */}
        <div className="text-center">
          <img
            src="/images/Chris_Haslam.png"
            alt="Chris Haslam against Memorial Day School"
            className="mx-auto rounded-xl shadow-md mb-2"
          />
          <p className="text-sm italic">Chris standing tall against a defender from Memorial Day School</p>
        </div>

        <h2 className="text-2xl font-semibold">🎓 Beyond St. Andrew’s</h2>
        <p>
          Following his breakout senior season, Chris earned a basketball scholarship to the University
          of Wyoming, where he competed at the NCAA Division I level. His deep understanding of the
          game and passion for basketball eventually led him into coaching. Today, Chris serves as an
          assistant coach for the Oregon State University men’s basketball team, helping develop
          athletes at the highest levels of collegiate competition.
        </p>

        <h2 className="text-2xl font-semibold">🏀 Haslam’s Legacy</h2>
        <p>
          Chris Haslam is more than just a one-season wonder — he’s a foundational figure in the
          history of St. Andrew’s basketball. His legacy laid the groundwork for future championship
          teams and continues to inspire players, coaches, and fans alike. Nearly 30 years later,
          his contributions remain a benchmark for excellence within the program.
        </p>
      </section>
    </div>
  );
}
