// Optional visual-check helper (not part of the app bundle).
// Captures full-page screenshots of the landing page in light, dark and mobile.
//
// Usage:
//   npm i -D playwright-core          # drives your installed Google Chrome, no browser download
//   PORT=3210 npm run start           # serve the production build
//   node scripts/shoot.mjs            # writes PNGs into .shots/ (gitignored)
//
// Adjust CHROME below if Chrome lives elsewhere on your machine.
import { chromium } from "playwright-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const URL = "http://localhost:3210/";
const OUT = "/Users/andrinramonr/Desktop/ZodiacAI/LibraAI/.shots";

const browser = await chromium.launch({ executablePath: CHROME, headless: true });

async function shoot(name, theme, width, height) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    colorScheme: theme === "dark" ? "dark" : "light",
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.evaluate((t) => localStorage.setItem("libra-theme", t), theme);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200); // let entrance + mockup settle
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  // Also a viewport-only hero shot
  await page.screenshot({ path: `${OUT}/${name}-hero.png`, fullPage: false });
  await ctx.close();
  console.log("shot", name);
}

await shoot("light", "light", 1440, 900);
await shoot("dark", "dark", 1440, 900);
await shoot("mobile-light", "light", 390, 844);
await browser.close();
console.log("done");
