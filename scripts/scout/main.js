const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { JSDOM, VirtualConsole } = require("jsdom");

// -------- CONFIG --------
const OUTPUT_DIR = path.resolve("imports/scout");
const SEARCH_TERMS = [
  "St. Andrew's baseball",
  "St. Andrew's Lions baseball",
  "St. Andrew's Savannah baseball",
  "St. Andrew's baseball 2018",
  "St. Andrew's baseball 2017"
];

// Make sure output folder exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// -------- FETCH --------
async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
      }
    });
    const html = await res.text();
    return html;
  } catch (err) {
    console.error("Fetch failed:", url);
    return null;
  }
}

// -------- EXTRACT --------
function extractText(html) {
  const cleanedHtml = html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ");

  const virtualConsole = new VirtualConsole();
  virtualConsole.on("error", () => {});
  virtualConsole.on("warn", () => {});

  const dom = new JSDOM(cleanedHtml, {
    virtualConsole
  });
  const document = dom.window.document;

  const title = document.querySelector("title")?.textContent || "";
  const bodyText = document.body?.textContent || "";

  const cleanText = bodyText.replace(/\s+/g, " ").trim();

  return {
    title,
    text: cleanText
  };
}

// -------- SIMPLE DETECTION --------
function analyze(text) {
  const lower = text.toLowerCase();

  const hasStAndrews =
    lower.includes("st. andrew") || lower.includes("st andrews");

  const hasBaseball = lower.includes("baseball");

  const scoreMatch = text.match(/\b\d{1,2}\s*[-–]\s*\d{1,2}\b/);

  const yearMatch = text.match(/\b(20\d{2})\b/);

  return {
    sport: hasBaseball ? "baseball" : null,
    score: scoreMatch ? scoreMatch[0] : null,
    year: yearMatch ? yearMatch[0] : null,
    isRelevant: hasStAndrews && hasBaseball
  };
}

// -------- SAVE --------
function saveResult(url, data) {
  const hash = crypto.createHash("sha256").update(url).digest("hex");

  const filePath = path.join(OUTPUT_DIR, `${hash}.json`);

  fs.writeFileSync(
    filePath,
    JSON.stringify(
      {
        url,
        ...data,
        savedAt: new Date().toISOString()
      },
      null,
      2
    )
  );

  console.log("Saved:", url);
}

// -------- MAIN --------
async function run() {
  console.log("Starting scout...");

  // TEMP: Hardcoded test URLs (we'll replace this with search later)
  const testUrls = [
    "https://www.wtoc.com/2026/02/20/st-andrews-baseball-opens-new-season-with-no-hitter-new-field/",
    "https://prepsportsreport.com/p/savannah-area-baseball-preview-part-2-which-teams-are-ready-to-break-through",
    "https://www.msn.com/en-us/sports/mlb/st-andrews-baseball-team-improves-to-9-2-after-winning-only-three-game-last-year/ar-AA1YWXEt",
    "https://www.savannahnow.com/"
  ];

  for (const url of testUrls) {
    const html = await fetchPage(url);
    if (!html) continue;

    const extracted = extractText(html);
    const analysis = analyze(extracted.text);

    if (analysis.isRelevant) {
      saveResult(url, {
        title: extracted.title,
        ...analysis
      });
    } else {
      console.log("Skipped (not relevant):", url);
    }
  }

  console.log("Done.");
}

run();