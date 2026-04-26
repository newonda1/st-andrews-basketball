from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterable

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = Path("/tmp/golf-archive-pdfs")
SEASONS_PATH = ROOT / "public" / "data" / "golf" / "seasons.json"
TOURNAMENTS_PATH = ROOT / "public" / "data" / "golf" / "tournaments.json"
FIRST_ST_ANDREWS_GOLF_SEASON = 2019


PDF_URLS = {
    2024: "https://giaasports.org/wp-content/uploads/2024/08/2024-Golf-Results-Archive.pdf",
    2023: "https://giaasports.org/wp-content/uploads/2023/06/2023-GIAA-Golf.pdf",
    2022: "https://giaasports.org/wp-content/uploads/2022/05/2022-GISA-State-Golf-RESULTS.pdf",
    2021: "https://giaasports.org/wp-content/uploads/2022/05/2021-GISA-State-Golf-RESULTS.pdf",
    2019: "https://giaasports.org/wp-content/uploads/2022/05/2019-Golf-Results.pdf",
    2018: "https://giaasports.org/wp-content/uploads/2022/05/2018-GISA-Golf.pdf",
    2017: "https://giaasports.org/wp-content/uploads/2022/05/2017-State-Golf-Results-ALL.pdf",
    2016: "https://giaasports.org/wp-content/uploads/2022/05/2016-State-Golf-Results-ALL.pdf",
    2015: "https://giaasports.org/wp-content/uploads/2022/05/2015-GISA-Golf.pdf",
    2014: "https://giaasports.org/wp-content/uploads/2022/05/2014-GISA-Golf.pdf",
    2013: "https://giaasports.org/wp-content/uploads/2022/05/2013-GISA-Golf.pdf",
    2012: "https://giaasports.org/wp-content/uploads/2022/05/2012-GISA-Golf.pdf",
    2011: "https://giaasports.org/wp-content/uploads/2022/05/2011_State_Golf_Results_ALL.pdf",
    2010: "https://giaasports.org/wp-content/uploads/2022/05/2010_State_Golf_Results_ALL.pdf",
    2009: "https://giaasports.org/wp-content/uploads/2022/05/2009_StateGolf_Results_ALL.pdf",
    2008: "https://giaasports.org/wp-content/uploads/2022/05/2008_Golf_Results_All.pdf",
    2007: "https://giaasports.org/wp-content/uploads/2022/05/2007_State_Results.pdf",
    2006: "https://giaasports.org/wp-content/uploads/2022/05/2006-State-Golf-Results.pdf",
    2005: "https://giaasports.org/wp-content/uploads/2022/05/2005_State_Results.pdf",
    2004: "https://giaasports.org/wp-content/uploads/2022/05/2004_State_Results.pdf",
}


EARLY_SUMMARY_SEASONS = [
    {
        "SeasonID": 2004,
        "SeasonLabel": "Spring 2004",
        "Classification": "GISA",
        "StatusBadge": "partial",
        "StatusNote": "The 2004 archive preserves class-by-class state PDFs, but the earliest AA pages mostly list team scores and all-state golfers rather than a full player-by-player field.",
        "ArchivePdfUrl": PDF_URLS[2004],
        "ArchiveScope": "summary",
        "HistoricalSummary": [
            "The April 26, 2004 AA file lists Clydesdale Meadows Golf Club in Colquitt, along with team scores and an all-state list led by Daniel Mobley (Edmund Burke) at 72.",
            "The AAA pages move to Stonebridge Country Club in Albany and preserve a much fuller scoreboard headlined by Russell Henley's 67 for Stratford Academy.",
            "Because the published AA pages do not expose a full top-ten individual field, the site keeps 2004 as an archive summary for now rather than a full standings page.",
        ],
    },
    {
        "SeasonID": 2005,
        "SeasonLabel": "Spring 2005",
        "Classification": "GISA",
        "StatusBadge": "partial",
        "StatusNote": "The 2005 archive still reads like a historical program sheet: team standings and all-state golfers are visible, but the full individual scoring field is only partially published.",
        "ArchivePdfUrl": PDF_URLS[2005],
        "ArchiveScope": "summary",
        "HistoricalSummary": [
            "Class A was played May 9, 2005 at Ironwood Country Club in Cordele, where David Emanuel Academy won the team title and Sam Bhimani (Robert Toombs) led the all-state list with a 70.",
            "Class AA was played the same day at Dublin Country Club, where Trinity Christian School won the team title and John Mekeska (Gatewood) shot 72 to headline the all-state list.",
            "The PDF does not publish a complete top-ten individual leaderboard for every class, so 2005 remains a summary season while the older archive is cleaned up.",
        ],
    },
    {
        "SeasonID": 2006,
        "SeasonLabel": "Spring 2006",
        "Classification": "GISA",
        "StatusBadge": "partial",
        "StatusNote": "The 2006 PDF is the thinnest file in the archive: it lists only the published team champions and runner-ups by class, without full individual score tables.",
        "ArchivePdfUrl": PDF_URLS[2006],
        "ArchiveScope": "summary",
        "HistoricalSummary": [
            "Class A champion: David Emanuel Academy (303), runner-up Robert Toombs Christian Academy (341).",
            "Class AA champion: Trinity Christian (313), runner-up Frederica Academy (323).",
            "Class AAA champion: Augusta Prep. The published file does not preserve the full runner-up line or player-by-player results.",
        ],
    },
    {
        "SeasonID": 2007,
        "SeasonLabel": "Spring 2007",
        "Classification": "GISA",
        "StatusBadge": "partial",
        "StatusNote": "The 2007 archive pages survive, but the OCR is rough enough that the class scoreboards still need manual cleanup before they can be trusted as full standings tables.",
        "ArchivePdfUrl": PDF_URLS[2007],
        "ArchiveScope": "summary",
        "HistoricalSummary": [
            "The visible Class A header points to Rocky Creek Golf Club in Vidalia.",
            "The file also includes an AA coaches score sheet and an AAA results page, but the raw OCR text still duplicates letters and breaks names apart.",
            "Those pages are preserved as source material in the site, but the older 2007 standings are not yet rendered as a clean top-ten leaderboard.",
        ],
    },
    {
        "SeasonID": 2008,
        "SeasonLabel": "Spring 2008",
        "Classification": "GISA",
        "StatusBadge": "partial",
        "StatusNote": "The 2008 archive includes class results, but the PDF OCR is still too noisy to publish complete player-by-player leaderboards with confidence.",
        "ArchivePdfUrl": PDF_URLS[2008],
        "ArchiveScope": "summary",
        "HistoricalSummary": [
            "The Class A header points to Rocky Creek Golf Club in Vidalia, while the Class AA header points to Dublin Country Club in Dublin.",
            "The preserved text still shows enough to identify team champions and several medalists, but it breaks too many player names to trust a full leaderboard yet.",
            "Those older pages remain linked so the source archive is still visible while cleanup continues.",
        ],
    },
    {
        "SeasonID": 2009,
        "SeasonLabel": "Spring 2009",
        "Classification": "GISA",
        "StatusBadge": "partial",
        "StatusNote": "The 2009 PDF keeps the state golf archive alive across multiple classes, but the OCR-heavy format still needs manual cleanup before full leaderboards can be shown on the site.",
        "ArchivePdfUrl": PDF_URLS[2009],
        "ArchiveScope": "summary",
        "HistoricalSummary": [
            "The Class A header points to Ironwood Country Club in Cordele.",
            "The Class AA header points to Rocky Creek Country Club in Vidalia.",
            "The site keeps 2009 in summary mode for now because the preserved player lines are still too noisy for a reliable top-ten table.",
        ],
    },
    {
        "SeasonID": 2010,
        "SeasonLabel": "Spring 2010",
        "Classification": "GISA",
        "StatusBadge": "partial",
        "StatusNote": "The 2010 multi-page PDF survives with division tables, but the older formatted export still needs cleanup before a trustworthy player-by-player leaderboard can be published.",
        "ArchivePdfUrl": PDF_URLS[2010],
        "ArchiveScope": "summary",
        "HistoricalSummary": [
            "The header points to the 2010 GISA A/AA State Golf Championship at Pine Lakes on Jekyll Island.",
            "Individual score tables are visible in the source file, but the extracted text still distorts several names and columns across the older divisions.",
            "The season is included on the site with the archive link and a summary note while the 2010 player table is cleaned up.",
        ],
    },
    {
        "SeasonID": 2011,
        "SeasonLabel": "Spring 2011",
        "Classification": "GISA",
        "StatusBadge": "partial",
        "StatusNote": "The 2011 state PDF is readable enough to confirm the classes and venue, but it still needs one more cleanup pass before the older division tables can be published alongside the later seasons.",
        "ArchivePdfUrl": PDF_URLS[2011],
        "ArchiveScope": "summary",
        "HistoricalSummary": [
            "The 2011 file preserves Class A, AA, and AAA state pages at Pine Lakes on Jekyll Island.",
            "The results tables are much closer to usable than the 2007-2010 PDFs, but several older lines still need manual normalization before they can be shown as polished standings.",
            "For now, 2011 appears as a summary season with the official archive link intact.",
        ],
    },
]


DETAILED_MANIFEST = [
    {
        "season": 2012,
        "pdf_name": "2012-GISA-Golf.pdf",
        "groups": [
            {
                "id": "2012-aa-state",
                "name": "2012 GISA Class AA State Golf Championship",
                "governing_body": "GISA",
                "division": "Class AA",
                "pages": [1, 2],
            },
            {
                "id": "2012-aaa-state",
                "name": "2012 GISA Class AAA State Golf Championship",
                "governing_body": "GISA",
                "division": "Class AAA",
                "pages": [3, 4],
            },
        ],
    },
    {
        "season": 2013,
        "pdf_name": "2013-GISA-Golf.pdf",
        "groups": [
            {
                "id": "2013-aa-state",
                "name": "2013 GISA Class AA State Golf Championship",
                "governing_body": "GISA",
                "division": "Class AA",
                "pages": [1, 2],
            },
            {
                "id": "2013-aaa-state",
                "name": "2013 GISA Class AAA State Golf Championship",
                "governing_body": "GISA",
                "division": "Class AAA",
                "pages": [3, 4],
            },
        ],
    },
    {
        "season": 2014,
        "pdf_name": "2014-GISA-Golf.pdf",
        "groups": [
            {
                "id": "2014-aa-state",
                "name": "2014 GISA AA State Golf Tournament",
                "governing_body": "GISA",
                "division": "Class AA",
                "pages": [1, 2],
            },
            {
                "id": "2014-aaa-state",
                "name": "2014 GISA AAA State Golf Tournament",
                "governing_body": "GISA",
                "division": "Class AAA",
                "pages": [3, 4],
            },
        ],
    },
    {
        "season": 2015,
        "pdf_name": "2015-GISA-Golf.pdf",
        "groups": [
            {
                "id": "2015-aa-state",
                "name": "2015 GISA AA State Golf Tournament",
                "governing_body": "GISA",
                "division": "Class AA",
                "pages": [1],
            },
            {
                "id": "2015-aaa-state",
                "name": "2015 GISA AAA State Golf Tournament",
                "governing_body": "GISA",
                "division": "Class AAA",
                "pages": [2, 3],
            },
        ],
    },
    {
        "season": 2016,
        "pdf_name": "2016-State-Golf-Results-ALL.pdf",
        "groups": [
            {
                "id": "2016-aa-state",
                "name": "2016 GISA AA State Golf Tournament",
                "governing_body": "GISA",
                "division": "Class AA",
                "pages": [1],
            },
            {
                "id": "2016-aaa-state",
                "name": "2016 GISA AAA State Golf Tournament",
                "governing_body": "GISA",
                "division": "Class AAA",
                "pages": [2, 3],
            },
        ],
    },
    {
        "season": 2017,
        "pdf_name": "2017-State-Golf-Results-ALL.pdf",
        "groups": [
            {
                "id": "2017-aa-state",
                "name": "2017 GISA AA State Golf Tournament",
                "governing_body": "GISA",
                "division": "Class AA",
                "pages": [1],
            },
            {
                "id": "2017-aaa-state",
                "name": "2017 GISA AAA State Golf Tournament",
                "governing_body": "GISA",
                "division": "Class AAA",
                "pages": [2, 3],
            },
        ],
    },
    {
        "season": 2018,
        "pdf_name": "2018-GISA-Golf.pdf",
        "groups": [
            {
                "id": "2018-aa-state",
                "name": "2018 GISA AA State Golf Tournament",
                "governing_body": "GISA",
                "division": "Class AA",
                "pages": [1],
            },
            {
                "id": "2018-aaa-state",
                "name": "2018 GISA AAA State Golf Tournament",
                "governing_body": "GISA",
                "division": "Class AAA",
                "pages": [2],
            },
        ],
    },
    {
        "season": 2019,
        "pdf_name": "2019-Golf-Results.pdf",
        "groups": [
            {
                "id": "2019-aa-state",
                "name": "2019 GISA AA State Golf Tournament",
                "governing_body": "GISA",
                "division": "Class AA",
                "pages": [1, 2],
            },
            {
                "id": "2019-aaa-state",
                "name": "2019 GISA AAA State Golf Tournament",
                "governing_body": "GISA",
                "division": "Class AAA",
                "pages": [3, 4, 5],
            },
        ],
    },
    {
        "season": 2021,
        "pdf_name": "2021-GISA-State-Golf-RESULTS.pdf",
        "groups": [
            {
                "id": "2021-aa-state",
                "name": "2021 GISA State Golf Tournament - Class AA",
                "governing_body": "GISA",
                "division": "Class AA",
                "pages": [1],
            },
            {
                "id": "2021-aaa-state",
                "name": "2021 GISA State Golf Tournament - Class AAA",
                "governing_body": "GISA",
                "division": "Class AAA",
                "pages": [2],
            },
        ],
    },
    {
        "season": 2022,
        "pdf_name": "2022-GISA-State-Golf-RESULTS.pdf",
        "groups": [
            {
                "id": "2022-aa-state",
                "name": "2022 GISA State Golf Tournament - Class AA",
                "governing_body": "GISA",
                "division": "Class AA",
                "pages": [1],
            },
            {
                "id": "2022-aaa-state",
                "name": "2022 GISA State Golf Tournament - Class AAA",
                "governing_body": "GISA",
                "division": "Class AAA",
                "pages": [2],
            },
        ],
    },
    {
        "season": 2023,
        "pdf_name": "2023-GIAA-Golf.pdf",
        "groups": [
            {
                "id": "2023-girls-state",
                "name": "2023 GIAA Girls State Golf Tournament",
                "governing_body": "GIAA",
                "division": "Girls",
                "pages": [1, 2],
            },
            {
                "id": "2023-aa-boys-state",
                "name": "2023 GIAA AA Boys State Golf Tournament",
                "governing_body": "GIAA",
                "division": "Class AA Boys",
                "pages": [3],
            },
            {
                "id": "2023-aaa-boys-state",
                "name": "2023 GIAA AAA Boys State Golf Tournament",
                "governing_body": "GIAA",
                "division": "Class AAA Boys",
                "pages": [4],
            },
        ],
    },
    {
        "season": 2024,
        "pdf_name": "2024-Golf-Results-Archive.pdf",
        "groups": [
            {
                "id": "2024-girls-state",
                "name": "2024 GIAA Girls State Golf Tournament",
                "governing_body": "GIAA",
                "division": "Girls",
                "pages": [1, 2],
            },
            {
                "id": "2024-aa-boys-state",
                "name": "2024 GISA State Golf Tournament - Class AA",
                "governing_body": "GISA",
                "division": "Class AA Boys",
                "pages": [3, 4],
            },
            {
                "id": "2024-aaa-boys-state",
                "name": "2024 GISA State Golf Tournament - Class AAA",
                "governing_body": "GISA",
                "division": "Class AAA Boys",
                "pages": [5, 6],
                "archive_note": "The published archive appears to splice the AAA pages differently than the later PDFs, so the event title is normalized from the season file while the player scores are taken directly from the source pages.",
            },
        ],
    },
]


SCHOOL_ALIASES = {
    "St.  Andrews School": "St. Andrew's School",
    "St. Andrews School": "St. Andrew's School",
    "ST. ANDREWS SCHOOL": "St. Andrew's School",
    "RIVERS ACADEMY": "Rivers Academy",
    "GATEWOOD SCHOOL": "Gatewood School",
    "CRISP ACADEMY": "Crisp Academy",
    "BRIARWOOD ACADEMY": "Briarwood Academy",
    "THOMAS JEFFERSON ACADEMY": "Thomas Jefferson Academy",
    "FREDERICA ACADEMY": "Frederica Academy",
    "PINEWOOD CHRISTIAN ACADEMY": "Pinewood Christian Academy",
    "BROOKWOOD SCHOOL": "Brookwood School",
    "DEERFIELD-WINDSOR SCHOOL": "Deerfield-Windsor School",
    "WESTFIELD SCHOOL": "Westfield School",
    "Windsor Academy": "Windsor Academy",
    "William and Reed": "William & Reed Academy",
    "William & Reed": "William & Reed Academy",
    "Frederica": "Frederica Academy",
    "Brookwood": "Brookwood School",
    "Bulloch": "Bulloch Academy",
    "Valwood": "Valwood School",
    "Pinewood": "Pinewood Christian Academy",
    "Rivers": "Rivers Academy",
    "Gatewood": "Gatewood School",
    "Southland": "Southland Academy",
    "Westfield": "Westfield School",
    "Westminster": "Westminster Schools, Augusta",
    "Peidmont": "Piedmont Academy",
    "Frederica Academy ": "Frederica Academy",
    "Strong Rock Christian School": "Strong Rock Christian",
    "St. Anne Pacelli": "St. Anne Pacelli",
    "St. Anne-Pacelli": "St. Anne-Pacelli Catholic School",
    "Mt. De Sales": "Mount de Sales Academy",
    "First Presbyterian Day School": "First Presbyterian Day School",
    "First Presbyterian Day": "First Presbyterian Day School",
}


PLAYER_ALIASES = {
    "EllaMcWhorter": "Ella McWhorter",
    "Mckenzie King": "McKenzie King",
    "Grey Johnson": "Gray Johnston",
    "Joe Levitan": "Joe Levitan",
    "Connor Corbit": "Connor Corbitt",
    "Conner Corbitt": "Connor Corbitt",
    "Dylan Mullins": "Dylan Mulling",
    "Parker  Highsmith": "Parker Highsmith",
    "Will Reaves": "William Reaves",
    "McCullough Pickens": "McCullough Pickens",
    "McCollugh Pickens": "McCullough Pickens",
    "Katerine Ananthasane": "Katherine Amanthasane",
    "Katherine Amanthasane": "Katherine Amanthasane",
    "Mitch Archer": "Mitch Archer",
    "JP Spivey": "J.P. Spivey",
    "JR Weber": "J.R. Weber",
    "Aarnav Nath": "Aarnav Nath",
    "Byrd": "Jackson Byrd",
    "Shingler": "Ramie Shingler",
    "Claxton": "Parker Claxton",
    "Swindell": "Ben Swindell",
    "Durrence": "Blaine Durrence",
    "Reed": "Cooper Reed",
    "Easterlin": "William Easterlin",
    "Payne": "John Roberts Payne",
    "Garvin": "Griffin Garvin",
    "Jackson": "Emory Jackson",
    "Murphy": "Case Murphy",
    "Fisher": "Ryan Fisher",
    "Hardy": "Hayden Hardy",
    "Avarado": "Bennett Alvarado",
    "Mortiz": "Kolby Moritz",
}


COURSE_LOCATION_OVERRIDES = {
    "Pine Lakes Course": "Jekyll Island, GA",
    "Pine Lakes": "Jekyll Island, GA",
    "Pine Lakes Jekyll Island": "Jekyll Island, GA",
    "Callaway Gardens": "Pine Mountain, GA",
    "Lake Blackshear Resort & Golf Club": "Cordele, GA",
    "Sapelo Hammock Golf Course": "Shellman Bluff, GA",
    "Jekyll Island Golf Club": "Jekyll Island, GA",
    "Brunswick Country Club": "Brunswick, GA",
    "Doublegate Country Club": "Albany, GA",
    "Hawks Point Golf Course": "Vidalia, GA",
}


MONTH_PATTERN = re.compile(
    r"(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?(?:,\s*\d{4})?",
    re.IGNORECASE,
)


@dataclass
class Entry:
    school: str | None
    player: str
    score: int | None
    award: str | None
    section: str


def normalize_whitespace(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def normalize_school(value: str | None) -> str | None:
    if value is None:
        return None
    value = normalize_whitespace(value)
    return SCHOOL_ALIASES.get(value, value)


def normalize_player(value: str | None) -> str | None:
    if value is None:
        return None
    value = normalize_whitespace(value)
    return PLAYER_ALIASES.get(value, value)


def tokenize(line: str) -> list[str]:
    cleaned = line.replace("St.  Andrews School", "St. Andrew's School")
    return [
        normalize_whitespace(part)
        for part in re.split(r"\s{2,}", cleaned.strip())
        if normalize_whitespace(part)
    ]


def is_score_token(value: str | None) -> bool:
    if not value:
        return False
    return bool(re.fullmatch(r"(?:\d+|WD|DNS|NC|DQ|\d+\*)", value))


def normalize_score(value: str | None) -> int | None:
    if not value:
        return None
    cleaned = value.replace("*", "").strip()
    if cleaned.isdigit():
        return int(cleaned)
    return None


def parse_date(value: str | None, season: int) -> str | None:
    if not value:
        return None
    cleaned = normalize_whitespace(value)
    cleaned = cleaned.replace("@", "")
    cleaned = re.sub(r"(\d)(st|nd|rd|th)", r"\1", cleaned)
    cleaned = cleaned.replace(" ,", ",")
    match = MONTH_PATTERN.search(cleaned)
    if not match:
        return None
    date_text = match.group(0)
    if "," not in date_text:
        date_text = f"{date_text}, {season}"
    for fmt in ("%B %d, %Y", "%b %d, %Y"):
        try:
            return datetime.strptime(date_text, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None


def split_course_and_location(line: str | None) -> tuple[str | None, str | None]:
    if not line:
        return None, None

    cleaned = normalize_whitespace(line.replace("@", ""))
    date_match = MONTH_PATTERN.search(cleaned)
    if date_match:
        cleaned = normalize_whitespace(cleaned.replace(date_match.group(0), ""))
        cleaned = cleaned.lstrip(", ")

    if "," in cleaned:
        course, location = [part.strip() for part in cleaned.split(",", 1)]
        if re.search(r"[A-Za-z]", course) and re.search(r"[A-Za-z]", location):
            if len(location.split()) == 1:
                return course, f"{location}, GA"
            return course, location

    if " on " in cleaned:
        course, location = [part.strip() for part in cleaned.split(" on ", 1)]
        if location:
            if location.endswith("Island"):
                return course, f"{location}, GA"
            return course, location

    if " Jekyll Island" in cleaned:
        course = cleaned.replace(" Jekyll Island", "").strip()
        return course, "Jekyll Island, GA"

    if " Albany" in cleaned:
        course = cleaned.replace(" Albany", "").strip()
        return course, "Albany, GA"

    if " Vidalia" in cleaned:
        course = cleaned.replace(" Vidalia", "").strip()
        return course, "Vidalia, GA"

    if cleaned in COURSE_LOCATION_OVERRIDES:
        return cleaned, COURSE_LOCATION_OVERRIDES[cleaned]

    return cleaned, COURSE_LOCATION_OVERRIDES.get(cleaned)


def extract_metadata(lines: Iterable[str], season: int) -> dict[str, str | None]:
    trimmed = [normalize_whitespace(line) for line in lines if normalize_whitespace(line)]
    title = None
    date = None
    course = None
    location = None

    for line in trimmed[:8]:
        if "Golf" in line or "GOLF" in line:
            if "Fan Guide" in line:
                continue
            if title is None and (
                "Tournament" in line
                or "TOURNAMENT" in line
                or "Championship" in line
                or "RESULTS" in line
            ):
                title = line

        if date is None:
            date = parse_date(line, season)

        if course is None and any(
            keyword in line
            for keyword in (
                "Golf Club",
                "Country Club",
                "Course",
                "Gardens",
                "Jekyll Island",
                "Callaway",
                "Hammock",
            )
        ):
            course, location = split_course_and_location(line)

    return {
        "title": title,
        "date": date,
        "course": course,
        "location": location,
    }


def should_merge_with_current_team(tokens: list[str], current_team: str | None) -> bool:
    if current_team is None or len(tokens) < 3:
        return False
    if not is_score_token(tokens[2]):
        return False
    return all(re.fullmatch(r"[A-Za-z.'\-&]+", value) for value in tokens[:2])


def parse_group(pdf_path: Path, pages: list[int]) -> list[Entry]:
    reader = PdfReader(str(pdf_path))
    entries: list[Entry] = []
    current_team: str | None = None
    pending_special: dict[str, str | int | None] | None = None
    in_individuals = False

    for page_no in pages:
        text = reader.pages[page_no - 1].extract_text(extraction_mode="layout") or ""
        lines = text.splitlines()

        for raw_line in lines:
            stripped = raw_line.strip()
            if not stripped:
                continue

            if "PAIRINGS" in stripped or "Fan Guide" in stripped or "TEE TIMES" in stripped:
                break

            if stripped in {"INDIVIDUALS", "ALL-STATE"}:
                current_team = None
                in_individuals = True
                continue

            if stripped.startswith("Team") or stripped.startswith("School"):
                continue

            if stripped.startswith("20") and "Golf" in stripped:
                continue

            if stripped.startswith("GISA State Tournament"):
                continue

            tokens = tokenize(raw_line)
            if not tokens:
                continue

            if should_merge_with_current_team(tokens, current_team):
                player = normalize_player(f"{tokens[0]} {tokens[1]}")
                score = normalize_score(tokens[2])
                award = " | ".join(tokens[3:]) if len(tokens) > 3 else None
                entries.append(
                    Entry(
                        school=current_team,
                        player=player or "Unknown Golfer",
                        score=score,
                        award=award,
                        section="individual" if in_individuals else "team",
                    )
                )
                continue

            if (
                "STATE CHAMPIONS" in tokens[0]
                or "STATE RUNNER-UP" in tokens[0]
                or "1st Place Team" in tokens[0]
                or "2nd Place Team" in tokens[0]
            ):
                if len(tokens) >= 3:
                    idx = 2
                    if idx < len(tokens) and tokens[idx] in {"A", "AA", "AAA"}:
                        idx += 1
                    pending_special = {
                        "player": normalize_player(tokens[1]),
                        "score": normalize_score(tokens[idx]) if idx < len(tokens) else None,
                        "award": " | ".join(tokens[idx + 1 :]) if idx + 1 < len(tokens) else None,
                    }
                continue

            if len(tokens) >= 2 and not is_score_token(tokens[1]):
                team = normalize_school(tokens[0])
                player = normalize_player(tokens[1])
                idx = 2
            else:
                team = current_team
                player = normalize_player(tokens[0])
                idx = 1

            if idx < len(tokens) and tokens[idx] in {"A", "AA", "AAA"}:
                idx += 1

            if idx >= len(tokens) or not is_score_token(tokens[idx]):
                continue

            score = normalize_score(tokens[idx])
            award = " | ".join(tokens[idx + 1 :]) if idx + 1 < len(tokens) else None

            if team:
                current_team = team

            if pending_special and team:
                entries.append(
                    Entry(
                        school=team,
                        player=(pending_special.get("player") or "Unknown Golfer"),
                        score=pending_special.get("score"),
                        award=pending_special.get("award"),
                        section="team",
                    )
                )
                pending_special = None

            entries.append(
                Entry(
                    school=team,
                    player=player or "Unknown Golfer",
                    score=score,
                    award=award,
                    section="individual" if in_individuals else "team",
                )
            )

    return entries


def build_ranked_finishers(entries: list[Entry]) -> list[dict[str, object]]:
    scored = [
        entry
        for entry in entries
        if entry.score is not None and entry.player and entry.school
    ]
    scored.sort(
        key=lambda entry: (
            entry.score or 999,
            normalize_player(entry.player) or "",
            normalize_school(entry.school) or "",
        )
    )

    ranked: list[dict[str, object]] = []
    previous_score: int | None = None
    previous_place = 0

    for index, entry in enumerate(scored, start=1):
        if entry.score == previous_score:
            place = previous_place
        else:
            place = index
            previous_score = entry.score
            previous_place = place

        ranked.append(
            {
                "place": place,
                "player": entry.player,
                "school": entry.school,
                "score": entry.score,
                "award": entry.award,
                "section": entry.section,
                "isStAndrews": entry.school == "St. Andrew's School",
            }
        )

    return ranked


def summarize_tournament(tournament: dict[str, object]) -> str:
    top_finishers = tournament["TopFinishers"]
    st_andrews = tournament["StAndrewsFinishers"]
    if top_finishers:
        medalist = top_finishers[0]
        opening = (
            f"Medalist: {medalist['player']} ({medalist['school']}) shot {medalist['score']}."
        )
    else:
        opening = "The source PDF does not preserve a full player-by-player leaderboard."

    if st_andrews:
        names = ", ".join(
            f"{entry['player']} ({entry['score']})" for entry in st_andrews[:3]
        )
        return f"{opening} St. Andrew's entries: {names}."

    return f"{opening} No published St. Andrew's golfers appear in this event."


def build_detailed_tournaments() -> list[dict[str, object]]:
    tournaments: list[dict[str, object]] = []

    for season_manifest in DETAILED_MANIFEST:
        season = season_manifest["season"]
        if season < FIRST_ST_ANDREWS_GOLF_SEASON:
            continue
        pdf_name = season_manifest["pdf_name"]
        pdf_path = PDF_DIR / pdf_name
        source_url = PDF_URLS[season]

        for group in season_manifest["groups"]:
            reader = PdfReader(str(pdf_path))
            metadata_page_text = (
                reader.pages[group["pages"][0] - 1].extract_text(extraction_mode="layout")
                or ""
            )
            metadata = extract_metadata(metadata_page_text.splitlines(), season)
            entries = parse_group(pdf_path, group["pages"])
            ranked_finishers = build_ranked_finishers(entries)
            top_finishers = [
                finisher for finisher in ranked_finishers if finisher["place"] <= 10
            ]
            st_andrews = [
                finisher
                for finisher in ranked_finishers
                if finisher["isStAndrews"] and finisher["place"] > 10
            ]

            tournaments.append(
                {
                    "TournamentID": group["id"],
                    "Season": season,
                    "Name": group["name"],
                    "GoverningBody": group["governing_body"],
                    "Division": group["division"],
                    "Date": metadata["date"],
                    "Course": metadata["course"],
                    "Location": metadata["location"],
                    "SourcePdfUrl": source_url,
                    "SourcePdfPages": group["pages"],
                    "ArchiveNote": group.get("archive_note"),
                    "ArchiveDetailLevel": "full",
                    "EntryCount": len(ranked_finishers),
                    "TopFinishers": top_finishers,
                    "StAndrewsFinishers": st_andrews,
                }
            )

    tournaments.sort(key=lambda item: (item["Season"], item["TournamentID"]))
    for tournament in tournaments:
        tournament["Summary"] = summarize_tournament(tournament)
    return tournaments


def build_seasons(tournaments: list[dict[str, object]]) -> list[dict[str, object]]:
    seasons: list[dict[str, object]] = []
    season_map: dict[int, list[dict[str, object]]] = {}

    for tournament in tournaments:
        season_map.setdefault(int(tournament["Season"]), []).append(tournament)

    for summary in EARLY_SUMMARY_SEASONS:
        if int(summary["SeasonID"]) >= FIRST_ST_ANDREWS_GOLF_SEASON:
            seasons.append(summary)

    for season_year, season_tournaments in sorted(season_map.items()):
        season_tournaments.sort(key=lambda tournament: tournament["Name"])
        divisions = [tournament["Division"] for tournament in season_tournaments]
        st_andrews_tournaments = [
            tournament for tournament in season_tournaments if tournament["StAndrewsFinishers"]
        ]
        top_st_andrews = [
            finisher
            for tournament in season_tournaments
            for finisher in tournament["TopFinishers"]
            if finisher["isStAndrews"]
        ]

        if top_st_andrews or st_andrews_tournaments:
            status_note = (
                f"The {season_year} archive includes {len(season_tournaments)} published state tournament"
                f"{'' if len(season_tournaments) == 1 else 's'}. St. Andrew's golfers appear in the published standings."
            )
        else:
            status_note = (
                f"The {season_year} archive includes {len(season_tournaments)} published state tournament"
                f"{'' if len(season_tournaments) == 1 else 's'}, but no St. Andrew's golfers appear in the posted results."
            )

        highlight_notes: list[str] = []
        if top_st_andrews:
            first = top_st_andrews[0]
            highlight_notes.append(
                f"{first['player']} placed {first['place']} with a {first['score']} in the {next(t['Name'] for t in season_tournaments if first in t['TopFinishers'])}."
            )
        elif st_andrews_tournaments:
            sample = st_andrews_tournaments[0]["StAndrewsFinishers"][0]
            highlight_notes.append(
                f"{sample['player']} represented St. Andrew's in the {st_andrews_tournaments[0]['Name']} and shot {sample['score']}."
            )

        if not highlight_notes:
            highlight_notes.append(
                "No St. Andrew's golfers are visible in the published archive standings for this season."
            )

        seasons.append(
            {
                "SeasonID": season_year,
                "SeasonLabel": f"Spring {season_year}",
                "Classification": " / ".join(divisions),
                "StatusBadge": "verified",
                "StatusNote": status_note,
                "ArchivePdfUrl": PDF_URLS[season_year],
                "ArchiveScope": "full",
                "HighlightNotes": highlight_notes,
            }
        )

    seasons.sort(key=lambda season: int(season["SeasonID"]))
    return seasons


def main() -> None:
    tournaments = build_detailed_tournaments()
    seasons = build_seasons(tournaments)

    SEASONS_PATH.parent.mkdir(parents=True, exist_ok=True)
    TOURNAMENTS_PATH.parent.mkdir(parents=True, exist_ok=True)

    SEASONS_PATH.write_text(json.dumps(seasons, indent=2) + "\n")
    TOURNAMENTS_PATH.write_text(json.dumps(tournaments, indent=2) + "\n")

    print(f"Wrote {SEASONS_PATH}")
    print(f"Wrote {TOURNAMENTS_PATH}")
    print(f"Seasons: {len(seasons)}")
    print(f"Tournaments: {len(tournaments)}")


if __name__ == "__main__":
    main()
