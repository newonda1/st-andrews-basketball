export function formatGolfDate(dateValue) {
  if (!dateValue) return "Date not shown in PDF";

  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return String(dateValue);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getGolfSeasonLabel(season) {
  if (!season) return "—";
  if (typeof season === "object") {
    return season.SeasonLabel || `Spring ${season.SeasonID || "—"}`;
  }
  return `Spring ${season}`;
}

export function sortGolfTournaments(tournaments = []) {
  return tournaments.slice().sort((a, b) => {
    const dateDiff = String(a.Date || "").localeCompare(String(b.Date || ""));
    if (dateDiff !== 0) return dateDiff;

    const firstPageA = Array.isArray(a.SourcePdfPages) ? a.SourcePdfPages[0] || 0 : 0;
    const firstPageB = Array.isArray(b.SourcePdfPages) ? b.SourcePdfPages[0] || 0 : 0;
    const pageDiff = firstPageA - firstPageB;
    if (pageDiff !== 0) return pageDiff;

    return String(a.Name || "").localeCompare(String(b.Name || ""));
  });
}

export function formatGolfPlace(place) {
  const numeric = Number(place);
  if (!Number.isFinite(numeric)) return "—";

  const mod100 = numeric % 100;
  if (mod100 >= 11 && mod100 <= 13) {
    return `${numeric}th`;
  }

  const mod10 = numeric % 10;
  if (mod10 === 1) return `${numeric}st`;
  if (mod10 === 2) return `${numeric}nd`;
  if (mod10 === 3) return `${numeric}rd`;
  return `${numeric}th`;
}

export function buildGolfPdfPagesLabel(pages = []) {
  if (!Array.isArray(pages) || pages.length === 0) return "Official PDF";
  if (pages.length === 1) return `Official PDF (page ${pages[0]})`;
  return `Official PDF (pages ${pages[0]}-${pages[pages.length - 1]})`;
}
