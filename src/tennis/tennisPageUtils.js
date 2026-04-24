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

export function getTennisSeasonLabel(season) {
  if (!season) return "—";
  if (typeof season === "object") {
    return season.SeasonLabel || String(season.SeasonID || "—");
  }
  return String(season);
}

export function sortTennisMatches(matches = []) {
  return matches.slice().sort((a, b) => {
    const dateDiff = String(a.Date || "").localeCompare(String(b.Date || ""));
    if (dateDiff !== 0) return dateDiff;

    return String(a.Name || "").localeCompare(String(b.Name || ""));
  });
}
