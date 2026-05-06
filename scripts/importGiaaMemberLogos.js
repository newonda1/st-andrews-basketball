const fs = require("fs");
const https = require("https");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SCHOOLS_PATH = path.join(ROOT, "public", "data", "schools.json");
const LOGO_DIR = "/images/schools/logos";

const GIAA_LOGOS = [
  {
    schoolId: "ga-augusta-preparatory-day-school-augusta",
    sourceName: "Augusta Preparatory Day School",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_AugustaPrep_Logo.png",
  },
  {
    schoolId: "ga-bethlehem-christian-academy-bethlehem",
    sourceName: "Bethlehem Christian Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2024/08/GIAA_BethlehemChristian_Logo.png",
  },
  {
    schoolId: "ga-brentwood-school-sandersville",
    sourceName: "Brentwood School",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_Brentwood_Logo.png",
  },
  {
    schoolId: "ga-briarwood-academy-warrenton",
    sourceName: "Briarwood Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2024/08/GIAA_Briarwood_Logo.png",
  },
  {
    schoolId: "ga-brookwood-academy-thomasville",
    sourceName: "Brookwood School",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_BrookwoodSchool_Logo.png",
    bracketLogoPath: `${LOGO_DIR}/ga-brookwood-academy-thomasville-bracket.png`,
  },
  {
    schoolId: "ga-bulloch-academy-statesboro",
    sourceName: "Bulloch Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_BullochAcademy_Logo.png",
  },
  {
    schoolId: "ga-central-fellowship-christian-academy-macon",
    sourceName: "Central Fellowship Christian Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_CentralFellowshipChristian_Logo.png",
  },
  {
    schoolId: "ga-citizens-christian-academy-douglas",
    sourceName: "Citizens Christian Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_CitizensChristian_Logo.png",
  },
  {
    schoolId: "ga-crisp-academy-cordele",
    sourceName: "Crisp Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_CrispAcademy_Logo.png",
  },
  {
    schoolId: "ga-cristo-rey-atlanta-jesuit-high-school-atlanta",
    sourceName: "Cristo Rey Atlanta Jesuit High School",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_CristoReyATL_Logo.png",
  },
  {
    schoolId: "ga-david-emanuel-academy-stillmore",
    sourceName: "David Emanuel Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_DavidEmanuel_Logo.png",
  },
  {
    schoolId: "ga-deerfield-windsor-school-albany",
    sourceName: "Deerfield-Windsor School",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_DeerfieldWindsor_Logo.png",
    bracketLogoPath: `${LOGO_DIR}/ga-deerfield-windsor-school-albany-bracket.png`,
  },
  {
    schoolId: "ga-dominion-christian-academy-marietta",
    sourceName: "Dominion Christian School",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_DominionChristian_Logo.png",
    bracketLogoPath: `${LOGO_DIR}/ga-dominion-christian-academy-marietta-bracket.png`,
  },
  {
    schoolId: "ga-dominion-christian-marietta",
    sourceName: "Dominion Christian School",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_DominionChristian_Logo.png",
    logoPath: `${LOGO_DIR}/ga-dominion-christian-academy-marietta.png`,
  },
  {
    schoolId: "ga-edmund-burke-academy-waynesboro",
    sourceName: "Edmund Burke Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_EdmundBurke_Logo.png",
  },
  {
    schoolId: "ga-first-preparatory-christian-academy-hinesville",
    sourceName: "First Preparatory Christian Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_FirstPrepatoryChristian_Logo.png",
  },
  {
    schoolId: "ga-first-presbyterian-day-school-macon",
    sourceName: "First Presbyterian Day School",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_FirstPresbyterianDay_Logo.png",
  },
  {
    schoolId: "ga-frederica-academy-st-simons-island",
    sourceName: "Frederica Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_FredericaAcademy_Logo.png",
  },
  {
    schoolId: "ga-fullington-academy-pinehurst",
    sourceName: "Fullington Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_FullingtonAcademy_Logo.png",
  },
  {
    schoolId: "ga-gatewood-schools-eatonton",
    sourceName: "Gatewood Schools",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_Gatewood_Logo.png",
  },
  {
    schoolId: "ga-george-walton-academy-monroe",
    sourceName: "George Walton Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_GeorgeWalton_Logo.png",
  },
  {
    schoolId: "ga-georgia-christian-school-valdosta",
    sourceName: "Georgia Christian School",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_GeorgiaChristian_Logo.png",
  },
  {
    schoolId: "ga-the-heritage-school-newnan",
    sourceName: "The Heritage School",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_HeritageNewnan_Logo.png",
  },
  {
    schoolId: "ga-holy-spirit-preparatory-school-atlanta",
    sourceName: "Holy Spirit Preparatory School",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_HolySpiritPrep_Logo.png",
  },
  {
    schoolId: "ga-john-milledge-academy-milledgeville",
    sourceName: "John Milledge Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_JohnMilledge_Logo.png",
    bracketLogoPath: `${LOGO_DIR}/ga-john-milledge-academy-milledgeville-bracket.png`,
  },
  {
    schoolId: "ga-lagrange-academy-lagrange",
    sourceName: "Lagrange Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_LaGrangeAcademy_Logo.png",
  },
  {
    schoolId: "ga-lakeview-academy-gainesville",
    sourceName: "Lakeview Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_LakeviewAcademy_Logo.png",
    bracketLogoPath: `${LOGO_DIR}/ga-lakeview-academy-gainesville-bracket.png`,
  },
  {
    schoolId: "ga-loganville-christian-academy-loganville",
    sourceName: "Loganville Christian Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2024/08/GIAA_LoganvilleChristian_Logo.png",
  },
  {
    schoolId: "ga-memorial-day-school-savannah",
    sourceName: "Memorial Day School",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_MemorialDay_Logo.png",
  },
  {
    schoolId: "ga-monsignor-donovan-catholic-high-school-athens",
    sourceName: "Monsignor Donovan Catholic HS",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_MonsignorDonovan_Logo.png",
  },
  {
    schoolId: "ga-piedmont-academy-monticello",
    sourceName: "Piedmont Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_PiedmontAcademy_Logo.png",
  },
  {
    schoolId: "ga-pinewood-christian-academy-bellville",
    sourceName: "Pinewood Christian Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_PinewoodChristian_Logo.png",
  },
  {
    schoolId: "ga-rivers-academy-alpharetta",
    sourceName: "Rivers Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_RiversAcademy_Logo.png",
  },
  {
    schoolId: "ga-riverside-military-academy-gainesville",
    sourceName: "Riverside Preparatory Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_RiversidePrep-Military_Logo.png",
  },
  {
    schoolId: "ga-robert-toombs-christian-academy-lyons",
    sourceName: "Robert Toombs Christian Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_RobertToombs_Logo.png",
  },
  {
    schoolId: "ga-screven-academy-sylvania",
    sourceName: "Screven Christian Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_ScrevenChristian_Logo.png",
  },
  {
    schoolId: "ga-southland-academy-americus",
    sourceName: "Southland Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_SouthlandAcademy_Logo.png",
  },
  {
    schoolId: "ga-southwest-georgia-academy-damascus",
    sourceName: "Southwest Georgia Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_SouthwestGeorgiaAcademy_Logo.png",
  },
  {
    schoolId: "ga-st-andrews-school-savannah",
    sourceName: "St. Andrew's School",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_StAndrewsSchool_Logo.png",
  },
  {
    schoolId: "ga-st-anne-pacelli-columbus",
    sourceName: "St. Anne-Pacelli Catholic School",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_StAnnePacelli_Logo.png",
  },
  {
    schoolId: "ga-stratford-academy-macon",
    sourceName: "Stratford Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_StratfordAcademy_Logo.png",
  },
  {
    schoolId: "ga-terrell-academy-dawson",
    sourceName: "Terrell Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_TerrellAcademy_Logo.png",
  },
  {
    schoolId: "ga-the-king-s-academy-woodstock",
    sourceName: "The King's Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2024/08/GIAA_KingsAcademy_Logo.png",
  },
  {
    schoolId: "ga-thomas-jefferson-academy-louisville",
    sourceName: "Thomas Jefferson Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_ThomasJefferson_Logo.png",
  },
  {
    schoolId: "ga-tiftarea-academy-chula",
    sourceName: "Tiftarea Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_TiftareaAcademy_Logo.png",
  },
  {
    schoolId: "ga-trinity-christian-academy-dublin",
    sourceName: "Trinity Christian School, Dublin",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_TrinityChristianDublin_Logo.png",
  },
  {
    schoolId: "ga-twiggs-academy-jeffersonville",
    sourceName: "Twiggs Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_TwiggsAcademy_Logo.png",
  },
  {
    schoolId: "ga-valwood-school-hahira",
    sourceName: "Valwood School",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_Valwood_Logo.png",
  },
  {
    schoolId: "ga-vidalia-heritage-academy-vidalia",
    sourceName: "Vidalia Heritage Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2024/10/VHA-Athletic-logo-1243x382-ai-brush-removebg-8583b577.png",
  },
  {
    schoolId: "ga-westfield-school-perry",
    sourceName: "The Westfield School",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_WestfieldSchool_Logo.png",
  },
  {
    schoolId: "ga-westminster-schools-of-augusta-augusta",
    sourceName: "Westminster Schools of Augusta",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_WestminsterAugusta_Logo.png",
  },
  {
    schoolId: "ga-westwood-school-camilla",
    sourceName: "Westwood School",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_Westwood_Logo.png",
  },
  {
    schoolId: "ga-william-and-reed-academy-johns-creek",
    sourceName: "William & Reed Academy",
    sourceUrl: "https://giaasports.org/wp-content/uploads/2023/08/GIAA_WilliamReed_Logo.png",
  },
];

function logoPathFor(schoolId) {
  return `${LOGO_DIR}/${schoolId}.png`;
}

function toFsPath(publicPath) {
  return path.join(ROOT, "public", publicPath.replace(/^\//, ""));
}

function download(url, destination, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          "User-Agent": "st-andrews-athletics-logo-import/1.0",
        },
      },
      (response) => {
        if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
          response.resume();
          if (!response.headers.location || redirectCount > 5) {
            reject(new Error(`Unexpected redirect from ${url}`));
            return;
          }
          const nextUrl = new URL(response.headers.location, url).toString();
          download(nextUrl, destination, redirectCount + 1).then(resolve, reject);
          return;
        }

        if (response.statusCode !== 200) {
          response.resume();
          reject(new Error(`GET ${url} returned ${response.statusCode}`));
          return;
        }

        fs.mkdirSync(path.dirname(destination), { recursive: true });
        const tempPath = `${destination}.tmp`;
        const file = fs.createWriteStream(tempPath);
        response.pipe(file);
        file.on("finish", () => {
          file.close(() => {
            fs.renameSync(tempPath, destination);
            resolve();
          });
        });
        file.on("error", (error) => {
          fs.rmSync(tempPath, { force: true });
          reject(error);
        });
      }
    );

    request.on("error", reject);
  });
}

function ensurePng(pathToFile) {
  const signature = fs.readFileSync(pathToFile).subarray(0, 8);
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!signature.equals(pngSignature)) {
    throw new Error(`${pathToFile} is not a PNG file`);
  }
}

async function main() {
  const schools = JSON.parse(fs.readFileSync(SCHOOLS_PATH, "utf8"));
  const schoolsById = new Map(schools.map((school) => [String(school.SchoolID), school]));
  const missingSchools = GIAA_LOGOS.filter((item) => !schoolsById.has(item.schoolId));

  if (missingSchools.length) {
    throw new Error(
      `Missing schools in schools.json: ${missingSchools.map((item) => item.schoolId).join(", ")}`
    );
  }

  const downloadTargets = new Map();

  for (const item of GIAA_LOGOS) {
    const school = schoolsById.get(item.schoolId);
    const nextLogoPath = item.logoPath || logoPathFor(item.schoolId);
    school.LogoPath = nextLogoPath;
    school.LogoSourceUrl = item.sourceUrl;
    downloadTargets.set(nextLogoPath, item.sourceUrl);

    if (item.bracketLogoPath || school.BracketLogoPath) {
      const nextBracketPath = item.bracketLogoPath || school.BracketLogoPath;
      school.BracketLogoPath = nextBracketPath;
      school.BracketLogoSourceUrl = item.sourceUrl;
      downloadTargets.set(nextBracketPath, item.sourceUrl);
    }
  }

  for (const [publicPath, sourceUrl] of downloadTargets) {
    const destination = toFsPath(publicPath);
    await download(sourceUrl, destination);
    ensurePng(destination);
    console.log(`updated ${publicPath}`);
  }

  fs.writeFileSync(SCHOOLS_PATH, `${JSON.stringify(schools, null, 2)}\n`);
  console.log(`Updated ${GIAA_LOGOS.length} school records and ${downloadTargets.size} logo files.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
