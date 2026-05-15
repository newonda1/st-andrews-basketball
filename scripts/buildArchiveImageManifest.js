const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const OUTPUT_PATH = path.join(PUBLIC_DIR, "data", "archiveImages.json");

const IMAGE_EXTENSIONS = new Set([".gif", ".jpeg", ".jpg", ".png", ".webp"]);
const EXCLUDED_NAME_PARTS = ["athlete-spotlight", "clipping", "-page-", "page-"];

const SPORTS = [
  {
    key: "boysBaseball",
    label: "boys baseball",
    roots: ["images/boys/baseball/seasons"],
  },
  {
    key: "boysBasketball",
    label: "boys basketball",
    roots: ["images/boys/basketball/seasons"],
  },
  {
    key: "girlsBasketball",
    label: "girls basketball",
    roots: ["images/girls/basketball/seasons"],
  },
  {
    key: "football",
    label: "football",
    roots: ["images/boys/football/seasons"],
  },
  {
    key: "boysSoccer",
    label: "boys soccer",
    roots: ["images/boys/soccer/seasons"],
  },
  {
    key: "girlsSoccer",
    label: "girls soccer",
    roots: ["images/girls/soccer/seasons"],
  },
  {
    key: "golf",
    label: "golf",
    roots: ["images/golf/seasons"],
  },
  {
    key: "softball",
    label: "softball",
    roots: ["images/girls/softball/seasons"],
  },
  {
    key: "volleyball",
    label: "volleyball",
    roots: ["images/girls/volleyball/seasons"],
  },
  {
    key: "swimming",
    label: "swimming",
    roots: ["images/swimming/seasons"],
  },
  {
    key: "track",
    label: "track and field",
    roots: ["images/track/seasons"],
  },
  {
    key: "crossCountry",
    label: "cross country",
    roots: ["images/cross-country/seasons"],
  },
  {
    key: "tennis",
    label: "tennis",
    roots: ["images/tennis/seasons"],
  },
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(entryPath);
    return entry.isFile() ? [entryPath] : [];
  });
}

function isArchiveImage(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(extension)) return false;

  const name = path.basename(filePath).toLowerCase();
  return !EXCLUDED_NAME_PARTS.some((part) => name.includes(part));
}

function formatSeasonLabel(seasonFolder) {
  const seasonMatch = seasonFolder.match(/^(\d{4})-(\d{2})$/);
  if (seasonMatch) return `${seasonMatch[1]}-${seasonMatch[2]}`;

  const yearMatch = seasonFolder.match(/^(\d{4})$/);
  if (yearMatch) return yearMatch[1];

  return seasonFolder
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function imageEntry(filePath, root, sport) {
  const relativeToPublic = path.relative(PUBLIC_DIR, filePath).split(path.sep).join("/");
  const relativeToRoot = path.relative(root, filePath).split(path.sep);
  const seasonLabel = formatSeasonLabel(relativeToRoot[0] || "archive");

  return {
    src: `/${relativeToPublic}`,
    alt: `St. Andrew's ${sport.label} archive image from ${seasonLabel}`,
    caption: `${seasonLabel} ${sport.label}`,
  };
}

const manifest = SPORTS.reduce((accumulator, sport) => {
  const images = sport.roots
    .flatMap((rootPath) => {
      const root = path.join(PUBLIC_DIR, rootPath);
      return walk(root)
        .filter(isArchiveImage)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((filePath) => imageEntry(filePath, root, sport));
    })
    .sort((a, b) => a.src.localeCompare(b.src, undefined, { numeric: true }));

  accumulator[sport.key] = images;
  return accumulator;
}, {});

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

const imageTotal = Object.values(manifest).reduce((total, images) => total + images.length, 0);
console.log(`Wrote ${path.relative(ROOT, OUTPUT_PATH)} with ${imageTotal} archive images.`);
