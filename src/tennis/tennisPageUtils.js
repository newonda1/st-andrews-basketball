export function formatTennisDate(dateValue) {
  if (!dateValue) return "—";

  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return String(dateValue);

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getTennisDateLabel(matchOrDate) {
  if (matchOrDate && typeof matchOrDate === "object") {
    return matchOrDate.DateLabel || formatTennisDate(matchOrDate.Date);
  }

  return formatTennisDate(matchOrDate);
}

export function getTennisSeasonLabel(season) {
  if (!season) return "—";
  if (typeof season === "object") {
    return season.SeasonLabel || String(season.SeasonID || "—");
  }
  return String(season);
}

const REGION_OPPONENT_IDS_BY_SEASON = {
  2026: new Set([
    "ga-bulloch-academy-statesboro",
    "ga-frederica-academy-st-simons-island",
    "ga-pinewood-christian-academy-bellville",
    "ga-westminster-schools-of-augusta-augusta",
  ]),
};

export function getTennisMatchCategory(match) {
  if (match?.MatchCategory) return match.MatchCategory;
  if (match?.GameType) return match.GameType;
  if (match?.MatchType === "Tournament") return "Tournament";

  if (match?.MatchType === "Dual Match") {
    const regionOpponentIds = REGION_OPPONENT_IDS_BY_SEASON[Number(match?.Season)];
    if (regionOpponentIds) {
      return regionOpponentIds.has(String(match.OpponentSchoolID))
        ? "Region"
        : "Non-Region";
    }
  }

  return match?.Classification || match?.MatchType || "Regular Season";
}

export function sortTennisMatches(matches = []) {
  return matches.slice().sort((a, b) => {
    const dateDiff = String(a.SortDate || a.Date || "").localeCompare(
      String(b.SortDate || b.Date || "")
    );
    if (dateDiff !== 0) return dateDiff;

    return String(a.Name || "").localeCompare(String(b.Name || ""));
  });
}
