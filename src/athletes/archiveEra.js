// Archive standard: season/player pages before the 2015 school year should
// mirror the 2003-04 school-year format unless a later request changes this.
export const PRE_2015_ARCHIVE_CUTOFF_YEAR = 2015;

export function isPre2015Season(seasonIdOrLabel) {
  const match = String(seasonIdOrLabel || "").match(/\d{4}/);
  if (!match) return false;
  return Number(match[0]) < PRE_2015_ARCHIVE_CUTOFF_YEAR;
}

export function athleteProfilePath(playerId, sportKey = "") {
  const encodedId = encodeURIComponent(String(playerId || ""));
  const search = sportKey ? `?sport=${encodeURIComponent(sportKey)}` : "";
  return `/athletics/players/${encodedId}${search}`;
}
