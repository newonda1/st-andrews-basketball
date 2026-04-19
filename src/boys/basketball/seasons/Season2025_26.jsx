import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import RegionBracket5SVG from "../components/RegionBracket5SVG";
import StateBracket12SVG from "../components/StateBracket12SVG";
import {
  BOYS_BASKETBALL_ROSTERS_PATH,
  SCHOOLS_PATH,
  getRosterEntriesForSeason,
  getRosterJerseyNumber,
  hydrateGamesWithSchools,
} from "../dataUtils";

function Season2025_26() {
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [rosterEntries, setRosterEntries] = useState([]);
  const [seasonTotals, setSeasonTotals] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "jersey",
    direction: "asc",
  });
  const [showPerGame, setShowPerGame] = useState(false);
  const [showTeamTotals, setShowTeamTotals] = useState(false);
  const [bracketsData, setBracketsData] = useState(null);

  const SEASON_ID = 2025; // 2025–26 season

  // 1. Fetch data
  useEffect(() => {
    async function fetchData() {
      const [gamesRes, statsRes, playersRes, bracketsRes, rostersRes, schoolsRes] = await Promise.all([
        fetch("/data/boys/basketball/games.json"),
        fetch("/data/boys/basketball/playergamestats.json"),
        fetch("/data/boys/players.json"),
        fetch("/data/boys/basketball/brackets.json"),
        fetch(BOYS_BASKETBALL_ROSTERS_PATH),
        fetch(SCHOOLS_PATH),
      ]);

      const [gamesDataRaw, statsData, playersData, bracketsJson, rostersData, schoolsData] = await Promise.all([
        gamesRes.json(),
        statsRes.json(),
        playersRes.json(),
        bracketsRes.json(),
        rostersRes.json(),
        schoolsRes.json(),
      ]);

      const seasonGames = hydrateGamesWithSchools(gamesDataRaw, schoolsData)
        .filter((g) => g.Season === SEASON_ID)
        .sort((a, b) => (Number(a.GameID) || 0) - (Number(b.GameID) || 0));

      const seasonGameIds = new Set(seasonGames.map((g) => g.GameID));
      const seasonStats = statsData.filter((s) => seasonGameIds.has(s.GameID));

      setGames(seasonGames);
      setPlayerStats(seasonStats);
      setPlayers(playersData);
      setRosterEntries(getRosterEntriesForSeason(rostersData, SEASON_ID));
      setBracketsData(bracketsJson);
    }

    fetchData();
  }, []);

  // 2. Build season totals + games played
  useEffect(() => {
    if (playerStats.length === 0) {
      setSeasonTotals([]);
      return;
    }

    const totalsMap = {};

    playerStats.forEach((stat) => {
      const id = stat.PlayerID;

      if (!totalsMap[id]) {
        totalsMap[id] = {
          PlayerID: id,
          Points: 0,
          Rebounds: 0,
          Assists: 0,
          Turnovers: 0,
          Steals: 0,
          Blocks: 0,
          ThreePM: 0,
          ThreePA: 0,
          TwoPM: 0,
          TwoPA: 0,
          FTM: 0,
          FTA: 0,
          GamesPlayedSet: new Set(),
        };
      }

      const t = totalsMap[id];

      t.Points += stat.Points || 0;
      t.Rebounds += stat.Rebounds || 0;
      t.Assists += stat.Assists || 0;
      t.Turnovers += stat.Turnovers || 0;
      t.Steals += stat.Steals || 0;
      t.Blocks += stat.Blocks || 0;

      t.ThreePM += stat.ThreePM || 0;
      t.ThreePA += stat.ThreePA || 0;
      t.TwoPM += stat.TwoPM || 0;
      t.TwoPA += stat.TwoPA || 0;
      t.FTM += stat.FTM || 0;
      t.FTA += stat.FTA || 0;

      if (stat.GameID != null) {
        t.GamesPlayedSet.add(stat.GameID);
      }
    });

    const totalsArray = Object.values(totalsMap).map((p) => ({
      PlayerID: p.PlayerID,
      Points: p.Points,
      Rebounds: p.Rebounds,
      Assists: p.Assists,
      Turnovers: p.Turnovers,
      Steals: p.Steals,
      Blocks: p.Blocks,
      ThreePM: p.ThreePM,
      ThreePA: p.ThreePA,
      TwoPM: p.TwoPM,
      TwoPA: p.TwoPA,
      FTM: p.FTM,
      FTA: p.FTA,
      GamesPlayed: p.GamesPlayedSet.size,
    }));

    setSeasonTotals(totalsArray);
  }, [playerStats]);

  // -------- Helpers --------
  const getPlayerName = (id) => {
    const player = players.find((p) => p.PlayerID === id);
    return player ? `${player.FirstName} ${player.LastName}` : "Unknown Player";
  };

  const getJerseyNumber = (id) => getRosterJerseyNumber(rosterEntries, id);

  const getPlayerPhotoUrl = (playerId) => {
    return `/images/boys/basketball/players/${playerId}.jpg`;
  };

  const rawPct = (made, att) => {
    if (!att || att === 0) return 0;
    return (made / att) * 100;
  };

  const formatPct = (made, att) => {
    if (!att || att === 0) return "-";
    return rawPct(made, att).toFixed(1);
  };

  const rawEFG = (player) => {
    const made = (player.TwoPM || 0) + (player.ThreePM || 0);
    const att = (player.TwoPA || 0) + (player.ThreePA || 0);
    if (!att || att === 0) return 0;
    return ((made + 0.5 * (player.ThreePM || 0)) / att) * 100;
  };

  const formatEFG = (player) => {
    const att = (player.TwoPA || 0) + (player.ThreePA || 0);
    if (!att || att === 0) return "-";
    return rawEFG(player).toFixed(1);
  };

  const formatDateFromGameID = (gameId) => {
    if (!gameId) return "";

    const n = Number(gameId);
    if (!Number.isFinite(n)) return "";

    const year = Math.floor(n / 10000);
    const month = Math.floor(n / 100) % 100;
    const day = n % 100;

    if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) {
      return "";
    }

    const d = new Date(Date.UTC(year, month - 1, day));

    return d.toLocaleDateString("en-US", {
      timeZone: "UTC",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatResult = (game) => {
    if (game.IsComplete !== "Yes" || !game.Result) return "";
    return game.Result;
  };

  const formatScore = (game) => {
    if (
      game.IsComplete !== "Yes" ||
      game.TeamScore == null ||
      game.OpponentScore == null
    ) {
      return "";
    }
    return `${game.TeamScore} - ${game.OpponentScore}`;
  };

  const formatPerGame = (player, key) => {
    const gp = player.GamesPlayed || 0;
    if (!gp) return 0;
    const total = player[key] || 0;
    return (total / gp).toFixed(1);
  };

  const formatAssistToTurnover = (player) => {
    const ast = player.Assists || 0;
    const tov = player.Turnovers || 0;
    if (!tov) return "-";
    return (ast / tov).toFixed(2);
  };

  // ---------- TEAM TOTALS ----------
  const teamGamesPlayed = useMemo(() => {
    const set = new Set();
    for (const s of playerStats) {
      if (s?.GameID != null) set.add(Number(s.GameID));
    }
    return set.size;
  }, [playerStats]);

  const teamTotalsRow = useMemo(() => {
    const t = {
      PlayerID: "TEAM_TOTALS",
      GamesPlayed: teamGamesPlayed,

      Points: 0,
      Rebounds: 0,
      Assists: 0,
      Turnovers: 0,
      Steals: 0,
      Blocks: 0,

      ThreePM: 0,
      ThreePA: 0,
      TwoPM: 0,
      TwoPA: 0,
      FTM: 0,
      FTA: 0,
    };

    for (const p of seasonTotals) {
      t.Points += Number(p.Points || 0);
      t.Rebounds += Number(p.Rebounds || 0);
      t.Assists += Number(p.Assists || 0);
      t.Turnovers += Number(p.Turnovers || 0);
      t.Steals += Number(p.Steals || 0);
      t.Blocks += Number(p.Blocks || 0);

      t.ThreePM += Number(p.ThreePM || 0);
      t.ThreePA += Number(p.ThreePA || 0);

      t.TwoPM += Number(p.TwoPM || 0);
      t.TwoPA += Number(p.TwoPA || 0);

      t.FTM += Number(p.FTM || 0);
      t.FTA += Number(p.FTA || 0);
    }

    return t;
  }, [seasonTotals, teamGamesPlayed]);

  const formatTeamPerGame = (value) => {
    if (!teamGamesPlayed) return "—";
    return (Number(value || 0) / teamGamesPlayed).toFixed(1);
  };

  const formatTeamAssistToTurnover = (t) => {
    const ast = Number(t.Assists || 0);
    const tov = Number(t.Turnovers || 0);
    if (!tov) return "-";
    return (ast / tov).toFixed(2);
  };

  // -------- Sorting --------
  const countingStatKeys = new Set([
    "Points",
    "Rebounds",
    "Assists",
    "Turnovers",
    "Steals",
    "Blocks",
    "ThreePM",
    "ThreePA",
    "TwoPM",
    "TwoPA",
    "FTM",
    "FTA",
  ]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "desc" ? "asc" : "desc" };
      }
      return { key, direction: "desc" };
    });
  };

  const getSortValue = (player, key) => {
    if (countingStatKeys.has(key) && showPerGame) {
      const gp = player.GamesPlayed || 0;
      if (!gp) return 0;
      return (player[key] || 0) / gp;
    }

    switch (key) {
      case "name":
        return getPlayerName(player.PlayerID).toLowerCase();
      case "jersey":
        return Number(getJerseyNumber(player.PlayerID)) || 0;
      case "GamesPlayed":
        return player.GamesPlayed || 0;
      case "ThreePct":
        return rawPct(player.ThreePM, player.ThreePA);
      case "TwoPct":
        return rawPct(player.TwoPM, player.TwoPA);
      case "FTPct":
        return rawPct(player.FTM, player.FTA);
      case "eFG":
        return rawEFG(player);
      case "AST_TO": {
        const ast = player.Assists || 0;
        const tov = player.Turnovers || 0;
        if (!tov) return 0;
        return ast / tov;
      }
      default:
        return player[key] || 0;
    }
  };

  const sortedSeasonTotals = seasonTotals.slice().sort((a, b) => {
    const aVal = getSortValue(a, sortConfig.key);
    const bVal = getSortValue(b, sortConfig.key);

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const sortArrow = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "desc" ? " ↓" : " ↑";
  };

  return (
    <div className="pt-2 pb-4 space-y-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2">2025–26 Season</h1>

      {/* 1. SEASON RECAP */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold mt-4 mb-3">Season Recap</h2>

        <div className="text-gray-800 leading-relaxed">
          <a
            href="https://www.flipsnack.com/6D6FD76F8D6/boys-basketball-media-guide-2025-2026.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/boys/basketball/seasons/2025-26/Season2025_26_1.PNG"
              alt="2025–26 St. Andrew's boys' basketball roster"
              className="float-left mr-4 mb-3 w-full max-w-xs rounded-lg shadow cursor-pointer"
            />
          </a>

          <p className="mb-3 leading-relaxed">
            The 2025–26 season has been a long, winding run that began with early questions and grew
            into another deep postseason push. From the first weekend in November through the final
            weekend in Columbus, St. Andrew’s had to find answers in tight finishes, respond to
            midseason setbacks, and carry the weight of high expectations that come with the
            program’s recent history.
          </p>

          <p className="mb-3 leading-relaxed">
            In head coach Mel Abrams’ view, the defining trait of this team has been its evolution.
            “Growth and maturity,” Abrams said. “A new group of leaders with a fairly large group of
            young players who have each grown individually.”
          </p>

          <p className="mb-3 leading-relaxed">
            The opening stretch set the tone. The Lions began the year with a 50–40 win over Morgan
            County at the Pro Movement Showcase, jumping out to an early lead, giving it up late, and
            then closing the game on an 11–0 run when the outcome was in doubt. A few nights later
            they raced past South Effingham at home, building a 51–18 halftime margin behind a fast
            start on both ends. Even in the first week, Ja’Cari Glover established himself as a
            constant inside presence, stacking double-doubles while the group around him settled into
            new roles.
          </p>

          <p className="mb-3 leading-relaxed">
            The schedule tightened quickly after that first burst of momentum. A loss to Bradwell
            forced the Lions to regroup, and a trip to Hilton Head Island became an early gut check.
            December brought bumps, including close losses that could easily have knocked the season
            off track. Instead, the Lions stayed committed to their daily habits and used those
            non-region games as opportunities to learn from their mistakes. As Abrams notes, “The
            confidence we have on the court comes from our daily habits and the experience and
            feedback we gathered from our non-region schedule.”
          </p>

          <p className="mb-3 leading-relaxed">
            That steady foundation began to show in the Gray Solana Memorial Game, when St. Andrew’s
            returned home and earned a 66–42 win over Hilton Head Prep. Glover was nearly unstoppable
            inside in that game and has remained a matchup problem for opponents all season long.
            “It’s his physicality and athleticism,” Abrams said. “He plays with a high motor and plays
            much bigger than his actual height.”
          </p>

          <p className="mb-3 leading-relaxed">
            At the Savannah Christian Christmas Classic, the Lions put together wins over Mount Paran
            and Effingham County and began to settle into a clearer identity — defending with purpose
            and playing with better spacing and patience offensively.
          </p>

          <img
            src="/images/boys/basketball/seasons/2025-26/Season2025_26_2.PNG"
            alt="St. Andrew's boys' basketball action collage"
            className="float-right ml-4 mt-4 mb-3 w-full max-w-sm rounded-lg shadow"
          />

          <p className="mb-3 leading-relaxed">
            Region play turned that identity into a statement. The Lions opened conference action
            with a 68–21 win at Pinewood Christian and never really slowed down. They strung together
            convincing region victories, including a dominant performance at Westminster and a
            90-point outburst on Senior Night against Pinewood. Even on nights when shots were
            inconsistent though, the defensive standard of the team held firm.
          </p>

          <p className="mb-3 leading-relaxed">
            The regular season ended with the Lions holding a 16–6 overall record. St. Andrew’s once
            again finished 8–0 in region play, completing a sixth consecutive undefeated run through
            the region schedule — a level of sustained success Abrams attributes to the broader
            foundation around the program. “To me it speaks to the support of our administration, the
            trust from our parents and the buy in from our players,” he said.
          </p>

          <p className="mb-3 leading-relaxed">
            Individual performances reinforced that success. Glover controlled the paint in big
            moments throughout the year. Chase Brown and Page Getter each had stretches where they
            took over games, the product of an offseason commitment that Abrams believes is now paying
            dividends. “They both made an off-season commitment to get better,” Abrams said. “What
            you’re seeing now is the fruit of that work. They’re playing with confidence, and that
            confidence is a result of the work.”
          </p>

          <p className="mb-3 leading-relaxed">
            Amari Cook and Milos Copic often impacted games in ways that went beyond the stat sheet.
            “They are the connectors,” Abrams said. “Amari’s ability to generate offense with his
            defense is so valuable. Milos’ ability to facilitate and make plays at his size has been a
            huge benefit.”
          </p>

          <p className="mb-3 leading-relaxed">
            The postseason has reinforced how far the group has come. St. Andrew’s rolled into the
            region tournament as the top seed, extended its dominance over Pinewood in the semifinals,
            and handled Frederica in the championship to claim a fifth straight region title. The
            victory also delivered Abrams’ 200th career win and marked the program’s 50th consecutive
            victory over region opponents.
          </p>

          <p className="mb-3 leading-relaxed">
            In the state quarterfinal, the Lions once again faced Frederica and found themselves
            trailing at halftime. What followed was one of the defining stretches of the season — a
            30–4 run that flipped the game and secured a 72–55 win, sending St. Andrew’s to its fifth
            consecutive State Final Four.
          </p>

          <p className="mb-3 leading-relaxed">
            The semifinal brought another familiar challenge. It marked the fourth straight year
            that St. Andrew’s and Lakeview Academy had met in the playoffs, and the third straight
            time the two programs had squared off in the state semifinals. After falling behind by
            13 at halftime, the Lions delivered one of their best second-half responses of the year,
            rallying for a 58–50 win to reach the state championship game. Glover was perfect from
            the field and scored 18 points, Getter added 17, and the defensive intensity that has
            defined the program over the last several seasons once again changed the course of the
            game.
          </p>

          <p className="mb-3 leading-relaxed">
            That comeback sent St. Andrew’s into a championship matchup with Brookwood Academy and
            brought another strong start. The Lions raced ahead 11–2 in the opening minutes and led
            27–22 at halftime, looking every bit ready to defend their crown. But the game turned in
            the third quarter, when Brookwood found driving lanes, tightened its coverage around
            Glover, and flipped a five-point deficit into an eight-point lead. St. Andrew’s never
            found the same offensive rhythm after the break and ultimately fell 61–46 in the title
            game, with Cook scoring 14 points and Brown and Getter adding 12 apiece.
          </p>

          <p className="mb-3 leading-relaxed">
            Even in defeat, the season reinforced what this era of St. Andrew’s basketball has come
            to represent. Over the past five years, the Lions have won three state championships,
            reached five straight Final Fours, and in the two seasons they did not finish on top,
            their postseason runs ended against the eventual champion. That consistency is a product
            of talent, but also of identity.
          </p>

          <p className="mb-3 leading-relaxed">
            Abrams still hopes this group will be remembered for more than banners. “That we played
            defense at an elite level and that we played unselfishly on offense,” he said. “But more
            importantly, that as coaches we used the game to impact lives and develop high-character,
            hard-working young men.” With a strong core returning, this season now reads not just as
            the end of another deep run, but as the latest chapter in a program that expects to be
            back.
          </p>

          <div className="clear-both" />
        </div>
      </section>

      {/* 2. SCHEDULE */}
      <section>
        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-2xl font-semibold">Schedule &amp; Results</h2>

          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span
              className={`${
                showTeamTotals ? "text-gray-400" : "text-gray-900 font-semibold"
              }`}
            >
              Game Result
            </span>

            <button
              type="button"
              onClick={() => setShowTeamTotals((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                showTeamTotals ? "bg-green-500" : "bg-gray-300"
              }`}
              aria-label="Toggle Game Result / Team Totals"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  showTeamTotals ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>

            <span
              className={`${
                showTeamTotals ? "text-gray-900 font-semibold" : "text-gray-400"
              }`}
            >
              Team Totals
            </span>
          </div>
        </div>

        {(() => {
          const safeNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

          const pct = (made, att) => {
            const m = safeNum(made);
            const a = safeNum(att);
            if (a <= 0) return "—";
            return `${((m / a) * 100).toFixed(1)}%`;
          };

          const assistTo = (ast, to) => {
            const a = safeNum(ast);
            const t = safeNum(to);
            if (t <= 0) return "—";
            return (a / t).toFixed(2);
          };

          const teamTotalsByGameId = new Map();

          for (const g of games) {
            const gid = g.GameID;
            const rows = playerStats.filter(
              (s) => Number(s.GameID) === Number(gid)
            );

            const totals = {
              REB: 0,
              AST: 0,
              TO: 0,
              STL: 0,
              BLK: 0,
              ThreePM: 0,
              ThreePA: 0,
              TwoPM: 0,
              TwoPA: 0,
              FTM: 0,
              FTA: 0,
            };

            for (const r of rows) {
              totals.REB += safeNum(r.Rebounds);
              totals.AST += safeNum(r.Assists);
              totals.TO += safeNum(r.Turnovers);
              totals.STL += safeNum(r.Steals);
              totals.BLK += safeNum(r.Blocks);

              totals.ThreePM += safeNum(r.ThreePM);
              totals.ThreePA += safeNum(r.ThreePA);

              totals.TwoPM += safeNum(r.TwoPM);
              totals.TwoPA += safeNum(r.TwoPA);

              totals.FTM += safeNum(r.FTM);
              totals.FTA += safeNum(r.FTA);
            }

            teamTotalsByGameId.set(Number(gid), totals);
          }

          return (
            <div className="overflow-x-auto">
              {!showTeamTotals ? (
                <table className="min-w-full border text-xs sm:text-sm text-center">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-2 py-1">Date</th>
                      <th className="border px-2 py-1">Opponent</th>
                      <th className="border px-2 py-1">Result</th>
                      <th className="border px-2 py-1">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {games.map((game, idx) => {
                      const hasResult =
                        game.Result === "W" || game.Result === "L";

                      const opponentCell = hasResult ? (
                        <Link
                          to={`/athletics/boys/basketball/games/${game.GameID}`}
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          {game.Opponent}
                        </Link>
                      ) : (
                        game.Opponent
                      );

                      return (
                        <tr
                          key={game.GameID || idx}
                          className={idx % 2 ? "bg-gray-50" : "bg-white"}
                        >
                          <td className="border px-2 py-1">
                            {formatDateFromGameID(game.GameID)}
                          </td>
                          <td className="border px-2 py-1">{opponentCell}</td>
                          <td className="border px-2 py-1">
                            {formatResult(game)}
                          </td>
                          <td className="border px-2 py-1 whitespace-nowrap">
                            {formatScore(game)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <table className="min-w-full border text-xs sm:text-sm text-center whitespace-nowrap">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-2 py-1">Date</th>
                      <th className="border px-2 py-1">Opponent</th>

                      <th className="border px-2 py-1">REB</th>
                      <th className="border px-2 py-1">AST</th>
                      <th className="border px-2 py-1">TO</th>
                      <th className="border px-2 py-1">A/T</th>
                      <th className="border px-2 py-1">STL</th>
                      <th className="border px-2 py-1">BLK</th>

                      <th className="border px-2 py-1">3PM</th>
                      <th className="border px-2 py-1">3PA</th>
                      <th className="border px-2 py-1">3P%</th>

                      <th className="border px-2 py-1">2PM</th>
                      <th className="border px-2 py-1">2PA</th>
                      <th className="border px-2 py-1">2P%</th>

                      <th className="border px-2 py-1">FTM</th>
                      <th className="border px-2 py-1">FTA</th>
                      <th className="border px-2 py-1">FT%</th>
                    </tr>
                  </thead>

                  <tbody>
                    {games.map((game, idx) => {
                      const totals =
                        teamTotalsByGameId.get(Number(game.GameID)) || null;
                      const hasResult =
                        game.Result === "W" || game.Result === "L";

                      const opponentCell = hasResult ? (
                        <Link
                          to={`/athletics/boys/basketball/games/${game.GameID}`}
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          {game.Opponent}
                        </Link>
                      ) : (
                        game.Opponent
                      );

                      return (
                        <tr
                          key={game.GameID || idx}
                          className={idx % 2 ? "bg-gray-50" : "bg-white"}
                        >
                          <td className="border px-2 py-1">
                            {formatDateFromGameID(game.GameID)}
                          </td>
                          <td className="border px-2 py-1">{opponentCell}</td>

                          <td className="border px-2 py-1">
                            {totals ? totals.REB : "—"}
                          </td>
                          <td className="border px-2 py-1">
                            {totals ? totals.AST : "—"}
                          </td>
                          <td className="border px-2 py-1">
                            {totals ? totals.TO : "—"}
                          </td>
                          <td className="border px-2 py-1">
                            {totals ? assistTo(totals.AST, totals.TO) : "—"}
                          </td>
                          <td className="border px-2 py-1">
                            {totals ? totals.STL : "—"}
                          </td>
                          <td className="border px-2 py-1">
                            {totals ? totals.BLK : "—"}
                          </td>

                          <td className="border px-2 py-1">
                            {totals ? totals.ThreePM : "—"}
                          </td>
                          <td className="border px-2 py-1">
                            {totals ? totals.ThreePA : "—"}
                          </td>
                          <td className="border px-2 py-1">
                            {totals ? pct(totals.ThreePM, totals.ThreePA) : "—"}
                          </td>

                          <td className="border px-2 py-1">
                            {totals ? totals.TwoPM : "—"}
                          </td>
                          <td className="border px-2 py-1">
                            {totals ? totals.TwoPA : "—"}
                          </td>
                          <td className="border px-2 py-1">
                            {totals ? pct(totals.TwoPM, totals.TwoPA) : "—"}
                          </td>

                          <td className="border px-2 py-1">
                            {totals ? totals.FTM : "—"}
                          </td>
                          <td className="border px-2 py-1">
                            {totals ? totals.FTA : "—"}
                          </td>
                          <td className="border px-2 py-1">
                            {totals ? pct(totals.FTM, totals.FTA) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          );
        })()}
      </section>

      {/* 2.5 REGION TOURNAMENT BRACKET */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Region Tournament Bracket</h2>

        {bracketsData === null ? (
          <p className="text-gray-600">Loading region bracket…</p>
        ) : bracketsData?.[String(SEASON_ID)]?.region ? (
          <RegionBracket5SVG bracket={bracketsData[String(SEASON_ID)].region} />
        ) : (
          <p className="text-gray-600">
            Region bracket data is not available for this season (missing key "
            {String(SEASON_ID)}" in brackets.json).
          </p>
        )}
      </section>

      {/* 2.6 STATE TOURNAMENT BRACKET */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">State Tournament Bracket</h2>

        {bracketsData === null ? (
          <p className="text-gray-600">Loading state bracket…</p>
        ) : bracketsData?.[String(SEASON_ID)]?.state ? (
          <StateBracket12SVG bracket={bracketsData[String(SEASON_ID)].state} />
        ) : (
          <p className="text-gray-600">
            State bracket data is not available for this season (missing key "
            {String(SEASON_ID)}" in brackets.json).
          </p>
        )}
      </section>

      {/* 3. PLAYER STATS TABLE */}
      <section>
        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-2xl font-semibold">
            Player Statistics for the Season
          </h2>

          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <span
              className={`${
                showPerGame ? "text-gray-400" : "text-gray-900 font-semibold"
              }`}
            >
              Season totals
            </span>
            <button
              type="button"
              onClick={() => setShowPerGame((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                showPerGame ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  showPerGame ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`${
                showPerGame ? "text-gray-900 font-semibold" : "text-gray-400"
              }`}
            >
              Per game averages
            </span>
          </div>
        </div>

        {seasonTotals.length === 0 ? (
          <p className="text-gray-600">
            No player statistics are available yet for this season.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-xs sm:text-sm text-center whitespace-nowrap">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    className="border px-2 py-1 cursor-pointer sticky left-0 z-40 bg-gray-100 border-r text-center min-w-[200px]"
                    onClick={() => handleSort("name")}
                  >
                    Player{sortArrow("name")}
                  </th>

                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("jersey")}
                  >
                    #{sortArrow("jersey")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("GamesPlayed")}
                  >
                    GP{sortArrow("GamesPlayed")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("Points")}
                  >
                    PTS{sortArrow("Points")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("Rebounds")}
                  >
                    REB{sortArrow("Rebounds")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("Assists")}
                  >
                    AST{sortArrow("Assists")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("Turnovers")}
                  >
                    TO{sortArrow("Turnovers")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("AST_TO")}
                  >
                    A/T{sortArrow("AST_TO")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("Steals")}
                  >
                    STL{sortArrow("Steals")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("Blocks")}
                  >
                    BLK{sortArrow("Blocks")}
                  </th>

                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("ThreePM")}
                  >
                    3PM{sortArrow("ThreePM")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("ThreePA")}
                  >
                    3PA{sortArrow("ThreePA")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("ThreePct")}
                  >
                    3P%{sortArrow("ThreePct")}
                  </th>

                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("TwoPM")}
                  >
                    2PM{sortArrow("TwoPM")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("TwoPA")}
                  >
                    2PA{sortArrow("TwoPA")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("TwoPct")}
                  >
                    2P%{sortArrow("TwoPct")}
                  </th>

                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("eFG")}
                  >
                    eFG%{sortArrow("eFG")}
                  </th>

                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("FTM")}
                  >
                    FTM{sortArrow("FTM")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("FTA")}
                  >
                    FTA{sortArrow("FTA")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("FTPct")}
                  >
                    FT%{sortArrow("FTPct")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedSeasonTotals.map((player, idx) => {
                  const name = getPlayerName(player.PlayerID);
                  const jersey = getJerseyNumber(player.PlayerID);
                  const photoUrl = getPlayerPhotoUrl(player.PlayerID);
                  const rowBg = idx % 2 === 0 ? "bg-white" : "bg-gray-50";

                  return (
                    <tr key={player.PlayerID} className={rowBg}>
                      <td
                        className={`border px-2 py-1 text-left align-middle sticky left-0 z-20 ${rowBg} border-r min-w-[200px]`}
                      >
                        <div className="flex items-center justify-start gap-2">
                          <img
                            src={photoUrl}
                            alt={name}
                            onError={(e) => {
                              e.currentTarget.src = "/images/common/logo.png";
                            }}
                            className="w-8 h-8 rounded-full object-cover border"
                          />
                          <Link
                            to={`/athletics/boys/basketball/players/${player.PlayerID}`}
                            className="text-blue-600 underline hover:text-blue-800"
                          >
                            {name}
                          </Link>
                        </div>
                      </td>

                      <td className="border px-2 py-1 align-middle">{jersey}</td>
                      <td className="border px-2 py-1 align-middle">
                        {player.GamesPlayed}
                      </td>

                      <td className="border px-2 py-1 align-middle">
                        {showPerGame
                          ? formatPerGame(player, "Points")
                          : player.Points}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {showPerGame
                          ? formatPerGame(player, "Rebounds")
                          : player.Rebounds}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {showPerGame
                          ? formatPerGame(player, "Assists")
                          : player.Assists}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {showPerGame
                          ? formatPerGame(player, "Turnovers")
                          : player.Turnovers}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {formatAssistToTurnover(player)}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {showPerGame
                          ? formatPerGame(player, "Steals")
                          : player.Steals}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {showPerGame
                          ? formatPerGame(player, "Blocks")
                          : player.Blocks}
                      </td>

                      <td className="border px-2 py-1 align-middle">
                        {showPerGame
                          ? formatPerGame(player, "ThreePM")
                          : player.ThreePM}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {showPerGame
                          ? formatPerGame(player, "ThreePA")
                          : player.ThreePA}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {formatPct(player.ThreePM, player.ThreePA)}
                      </td>

                      <td className="border px-2 py-1 align-middle">
                        {showPerGame
                          ? formatPerGame(player, "TwoPM")
                          : player.TwoPM}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {showPerGame
                          ? formatPerGame(player, "TwoPA")
                          : player.TwoPA}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {formatPct(player.TwoPM, player.TwoPA)}
                      </td>

                      <td className="border px-2 py-1 align-middle">
                        {formatEFG(player)}
                      </td>

                      <td className="border px-2 py-1 align-middle">
                        {showPerGame
                          ? formatPerGame(player, "FTM")
                          : player.FTM}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {showPerGame
                          ? formatPerGame(player, "FTA")
                          : player.FTA}
                      </td>
                      <td className="border px-2 py-1 align-middle">
                        {formatPct(player.FTM, player.FTA)}
                      </td>
                    </tr>
                  );
                })}

                {/* TEAM TOTALS ROW */}
                <tr className="bg-gray-100 font-semibold">
                  <td className="border px-2 py-1 sticky left-0 z-30 bg-gray-100 border-r text-center min-w-[200px]">
                    Team Totals
                  </td>

                  <td className="border px-2 py-1">{""}</td>
                  <td className="border px-2 py-1">
                    {teamTotalsRow.GamesPlayed || 0}
                  </td>

                  <td className="border px-2 py-1">
                    {showPerGame
                      ? formatTeamPerGame(teamTotalsRow.Points)
                      : teamTotalsRow.Points}
                  </td>
                  <td className="border px-2 py-1">
                    {showPerGame
                      ? formatTeamPerGame(teamTotalsRow.Rebounds)
                      : teamTotalsRow.Rebounds}
                  </td>
                  <td className="border px-2 py-1">
                    {showPerGame
                      ? formatTeamPerGame(teamTotalsRow.Assists)
                      : teamTotalsRow.Assists}
                  </td>
                  <td className="border px-2 py-1">
                    {showPerGame
                      ? formatTeamPerGame(teamTotalsRow.Turnovers)
                      : teamTotalsRow.Turnovers}
                  </td>
                  <td className="border px-2 py-1">
                    {formatTeamAssistToTurnover(teamTotalsRow)}
                  </td>
                  <td className="border px-2 py-1">
                    {showPerGame
                      ? formatTeamPerGame(teamTotalsRow.Steals)
                      : teamTotalsRow.Steals}
                  </td>
                  <td className="border px-2 py-1">
                    {showPerGame
                      ? formatTeamPerGame(teamTotalsRow.Blocks)
                      : teamTotalsRow.Blocks}
                  </td>

                  <td className="border px-2 py-1">
                    {showPerGame
                      ? formatTeamPerGame(teamTotalsRow.ThreePM)
                      : teamTotalsRow.ThreePM}
                  </td>
                  <td className="border px-2 py-1">
                    {showPerGame
                      ? formatTeamPerGame(teamTotalsRow.ThreePA)
                      : teamTotalsRow.ThreePA}
                  </td>
                  <td className="border px-2 py-1">
                    {formatPct(teamTotalsRow.ThreePM, teamTotalsRow.ThreePA)}
                  </td>

                  <td className="border px-2 py-1">
                    {showPerGame
                      ? formatTeamPerGame(teamTotalsRow.TwoPM)
                      : teamTotalsRow.TwoPM}
                  </td>
                  <td className="border px-2 py-1">
                    {showPerGame
                      ? formatTeamPerGame(teamTotalsRow.TwoPA)
                      : teamTotalsRow.TwoPA}
                  </td>
                  <td className="border px-2 py-1">
                    {formatPct(teamTotalsRow.TwoPM, teamTotalsRow.TwoPA)}
                  </td>

                  <td className="border px-2 py-1">
                    {formatEFG(teamTotalsRow)}
                  </td>

                  <td className="border px-2 py-1">
                    {showPerGame
                      ? formatTeamPerGame(teamTotalsRow.FTM)
                      : teamTotalsRow.FTM}
                  </td>
                  <td className="border px-2 py-1">
                    {showPerGame
                      ? formatTeamPerGame(teamTotalsRow.FTA)
                      : teamTotalsRow.FTA}
                  </td>
                  <td className="border px-2 py-1">
                    {formatPct(teamTotalsRow.FTM, teamTotalsRow.FTA)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Season2025_26;
