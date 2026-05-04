import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getTennisMatchCategory,
  getTennisSeasonLabel,
  sortTennisMatches,
} from "../tennisPageUtils";

const GENDERS = ["Boys", "Girls"];

const tableStyles = {
  page:
    "mx-auto max-w-6xl space-y-[clamp(1.75rem,4vw,2.5rem)] px-4 pb-24 pt-2 sm:px-6",
  section: "space-y-[clamp(0.5rem,1.3vw,0.875rem)]",
  pageTitle: "text-center text-3xl font-bold text-slate-900",
  sectionTitle: "text-center font-bold text-[clamp(1.25rem,5vw,1.5rem)]",
  table:
    "w-full min-w-[780px] border-collapse text-center text-sm",
  headerCell:
    "border border-slate-300 bg-slate-100 px-3 py-2 font-bold leading-tight whitespace-nowrap",
  bodyCell:
    "border border-slate-300 px-3 py-2 align-middle leading-tight",
  compactTextCell:
    "border border-slate-300 px-3 py-2 align-middle leading-tight whitespace-nowrap md:text-left",
  notesCell:
    "border border-slate-300 px-3 py-2 align-middle leading-tight md:min-w-[24rem] md:text-left",
  totalRow: "bg-slate-100 font-bold",
};

function buildMap(items, key) {
  const map = new Map();
  for (const item of Array.isArray(items) ? items : []) {
    if (item?.[key] !== undefined && item?.[key] !== null) {
      map.set(String(item[key]), item);
    }
  }
  return map;
}

function getPlayerName(playerId, playerMap) {
  const player = playerMap.get(String(playerId));
  if (!player) return "";
  return `${player.FirstName || ""} ${player.LastName || ""}`.trim();
}

function getCoachName(season, gender) {
  const genderKey = gender === "Boys" ? "Boys" : "Girls";
  const teamData =
    season?.Teams?.[gender] ||
    season?.Teams?.[gender.toLowerCase()] ||
    (Array.isArray(season?.Teams)
      ? season.Teams.find((team) => team?.Gender === gender)
      : null);

  return (
    teamData?.HeadCoach ||
    teamData?.Coach ||
    season?.[`${genderKey}HeadCoach`] ||
    season?.[`${genderKey}Coach`] ||
    season?.HeadCoach ||
    season?.Coach ||
    ""
  );
}

function emptyRecord() {
  return {
    wins: 0,
    losses: 0,
    known: false,
  };
}

function addResult(record, result) {
  if (result !== "W" && result !== "L") return;
  record.known = true;
  if (result === "W") {
    record.wins += 1;
  } else {
    record.losses += 1;
  }
}

function formatRecord(record) {
  if (!record?.known) return "—";
  return `${record.wins}–${record.losses}`;
}

function formatWinPct(record) {
  if (!record?.known) return "—";
  const total = record.wins + record.losses;
  if (!total) return "—";
  return `${((record.wins / total) * 100).toFixed(1)}%`;
}

function getBracketName(match, bracketId) {
  const bracket = (match.Brackets || []).find(
    (entry) => String(entry.BracketID) === String(bracketId)
  );
  return bracket?.Name || String(bracketId || "").replace(/-/g, " ");
}

function getTournamentChampionPrefix(match) {
  const name = String(match?.Name || "");
  if (/region tournament/i.test(name)) {
    return name.replace(/\s+Tournament\s+-\s+(Boys|Girls)$/i, "");
  }
  if (/state individual tennis/i.test(name)) {
    return name.replace(/\s+Tennis\s+-\s+(Boys|Girls)$/i, "");
  }
  return match?.Classification || "Tournament";
}

function participantIsStAndrews(participant) {
  if (!participant) return false;
  if (participant.ParticipantType === "stAndrewsPlayer") return true;
  return (participant.TeamMembers || []).some(
    (member) => member.ParticipantType === "stAndrewsPlayer"
  );
}

function formatParticipantName(participant, playerMap) {
  if (!participant) return "";
  if (participant.ParticipantType === "stAndrewsPlayer") {
    return getPlayerName(participant.PlayerID, playerMap) || participant.DisplayName || "";
  }

  const stAndrewsMembers = (participant.TeamMembers || []).filter(
    (member) => member.ParticipantType === "stAndrewsPlayer"
  );
  if (stAndrewsMembers.length) {
    const memberNames = stAndrewsMembers
      .map((member) => getPlayerName(member.PlayerID, playerMap))
      .filter(Boolean);
    return memberNames.join(" / ") || participant.DisplayName || "";
  }

  return participant.DisplayName || "";
}

function getHonorSubject(honor, playerMap) {
  if (honor?.PlayerID) {
    const playerName = getPlayerName(honor.PlayerID, playerMap);
    if (playerName) return playerName;
  }
  return honor?.Team || honor?.Subject || "";
}

function getChampionshipNotes(match, playerMap) {
  const notes = [];

  for (const honor of Array.isArray(match?.Honors) ? match.Honors : []) {
    const title = honor?.Title || "";
    const context = `${title} ${match?.Name || ""} ${match?.Classification || ""}`;
    if (!/champion/i.test(title) || !/(region|state)/i.test(context)) continue;

    const subject = getHonorSubject(honor, playerMap);
    notes.push(subject ? `${subject}: ${title}` : title);
  }

  const isRegionOrStateTournament =
    match?.MatchType === "Tournament" && /(region|state)/i.test(match?.Name || "");

  if (isRegionOrStateTournament) {
    const prefix = getTournamentChampionPrefix(match);
    for (const bracketMatch of Array.isArray(match.BracketMatches)
      ? match.BracketMatches
      : []) {
      if (bracketMatch.RoundCode !== "F") continue;

      const winner = (bracketMatch.Participants || []).find(
        (participant) => participant.Side === bracketMatch.WinnerSide
      );
      if (!participantIsStAndrews(winner)) continue;

      const subject = formatParticipantName(winner, playerMap);
      const eventName = getBracketName(match, bracketMatch.BracketID);
      const title = `${prefix} ${eventName} Champion`;
      notes.push(subject ? `${subject}: ${title}` : title);
    }
  }

  return Array.from(new Set(notes));
}

function buildTeamRows(seasons, matches, playerMap, gender) {
  const rows = [];

  for (const season of seasons.slice().sort((a, b) => Number(a.SeasonID) - Number(b.SeasonID))) {
    const seasonMatches = sortTennisMatches(
      matches.filter(
        (match) =>
          Number(match.Season) === Number(season.SeasonID) &&
          match.Gender === gender
      )
    );

    if (!seasonMatches.length) continue;

    const overall = emptyRecord();
    const region = emptyRecord();
    const dualMatches = seasonMatches.filter(
      (match) => match.MatchType === "Dual Match"
    );

    for (const match of dualMatches) {
      const result = match.TeamScore?.Result;
      addResult(overall, result);

      if (getTennisMatchCategory(match) === "Region") {
        addResult(region, result);
      }
    }

    if (overall.known && !region.known) {
      region.known = true;
    }

    const notes = seasonMatches.flatMap((match) =>
      getChampionshipNotes(match, playerMap)
    );
    const coach = getCoachName(season, gender);

    rows.push({
      key: `${season.SeasonID}-${gender}`,
      seasonId: season.SeasonID,
      label: getTennisSeasonLabel(season),
      coach,
      overall,
      region,
      notes: Array.from(new Set(notes)),
    });
  }

  return rows;
}

function addRecords(target, source) {
  if (!source?.known) return;
  target.known = true;
  target.wins += source.wins;
  target.losses += source.losses;
}

function buildCoachTotals(teamRows) {
  const coachMap = new Map();

  for (const row of teamRows) {
    if (!row.coach) continue;

    if (!coachMap.has(row.coach)) {
      coachMap.set(row.coach, {
        coach: row.coach,
        seasons: 0,
        overall: emptyRecord(),
        region: emptyRecord(),
      });
    }

    const coach = coachMap.get(row.coach);
    coach.seasons += 1;
    addRecords(coach.overall, row.overall);
    addRecords(coach.region, row.region);
  }

  return Array.from(coachMap.values()).sort((a, b) => {
    if (b.overall.wins !== a.overall.wins) return b.overall.wins - a.overall.wins;
    const aTotal = a.overall.wins + a.overall.losses;
    const bTotal = b.overall.wins + b.overall.losses;
    const aPct = aTotal ? a.overall.wins / aTotal : 0;
    const bPct = bTotal ? b.overall.wins / bTotal : 0;
    if (bPct !== aPct) return bPct - aPct;
    return a.coach.localeCompare(b.coach);
  });
}

function CoachingTotalsTable({ rows }) {
  return (
    <section className={tableStyles.section}>
      <h2 className={tableStyles.sectionTitle}>Coaching Totals</h2>
      <div className="overflow-x-auto">
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th className={`${tableStyles.headerCell} md:text-left`}>Coach</th>
              <th className={tableStyles.headerCell}>Seasons</th>
              <th className={tableStyles.headerCell}>Overall Record</th>
              <th className={tableStyles.headerCell}>Region Record</th>
              <th className={tableStyles.headerCell}>Win %</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr key={row.coach}>
                  <td className={tableStyles.compactTextCell}>{row.coach}</td>
                  <td className={tableStyles.bodyCell}>{row.seasons}</td>
                  <td className={tableStyles.bodyCell}>{formatRecord(row.overall)}</td>
                  <td className={tableStyles.bodyCell}>{formatRecord(row.region)}</td>
                  <td className={tableStyles.bodyCell}>{formatWinPct(row.overall)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className={`${tableStyles.bodyCell} text-slate-500`} colSpan={5}>
                  Coaching totals will appear when coach data is added.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TeamResultsTable({ title, rows }) {
  const totals = rows.reduce(
    (acc, row) => {
      addRecords(acc.overall, row.overall);
      addRecords(acc.region, row.region);
      return acc;
    },
    { overall: emptyRecord(), region: emptyRecord() }
  );

  return (
    <section className={tableStyles.section}>
      <h2 className={tableStyles.sectionTitle}>{title}</h2>
      <div className="overflow-x-auto">
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th className={tableStyles.headerCell}>Season</th>
              <th className={`${tableStyles.headerCell} md:text-left`}>Coach</th>
              <th className={tableStyles.headerCell}>Overall Record</th>
              <th className={tableStyles.headerCell}>Region Record</th>
              <th className={`${tableStyles.headerCell} md:text-left`}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr key={row.key}>
                  <td className={tableStyles.bodyCell}>
                    <Link
                      to={`/athletics/tennis/seasons/${row.seasonId}`}
                      className="whitespace-nowrap text-blue-600 hover:underline"
                    >
                      {row.label}
                    </Link>
                  </td>
                  <td className={tableStyles.compactTextCell}>
                    {row.coach || "—"}
                  </td>
                  <td className={tableStyles.bodyCell}>
                    {formatRecord(row.overall)}
                  </td>
                  <td className={tableStyles.bodyCell}>
                    {formatRecord(row.region)}
                  </td>
                  <td className={tableStyles.notesCell}>
                    {row.notes.join("; ")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className={`${tableStyles.bodyCell} text-slate-500`} colSpan={5}>
                  Results will appear when data is added.
                </td>
              </tr>
            )}
            {rows.length ? (
              <tr className={tableStyles.totalRow}>
                <td className={tableStyles.compactTextCell}>Totals</td>
                <td className={tableStyles.bodyCell}></td>
                <td className={tableStyles.bodyCell}>{formatRecord(totals.overall)}</td>
                <td className={tableStyles.bodyCell}>{formatRecord(totals.region)}</td>
                <td className={tableStyles.notesCell}></td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function YearlyResults({
  seasons = [],
  matches = [],
  players = [],
  status = "",
}) {
  const playerMap = useMemo(() => buildMap(players, "PlayerID"), [players]);

  const teamRowsByGender = useMemo(() => {
    return Object.fromEntries(
      GENDERS.map((gender) => [
        gender,
        buildTeamRows(seasons, matches, playerMap, gender),
      ])
    );
  }, [matches, playerMap, seasons]);

  const coachTotals = useMemo(
    () =>
      buildCoachTotals([
        ...teamRowsByGender.Boys,
        ...teamRowsByGender.Girls,
      ]),
    [teamRowsByGender]
  );

  return (
    <div className={tableStyles.page}>
      {status ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm text-slate-600 shadow-sm">
          {status}
        </div>
      ) : null}

      <h1 className={tableStyles.pageTitle}>Year-by-Year Results</h1>

      <CoachingTotalsTable rows={coachTotals} />
      <TeamResultsTable title="Boys" rows={teamRowsByGender.Boys} />
      <TeamResultsTable title="Girls" rows={teamRowsByGender.Girls} />
    </div>
  );
}
