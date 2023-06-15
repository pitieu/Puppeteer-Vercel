const app = require("express")();
const cors = require("cors");
const dotenv = require("dotenv");
const puppeteer = require("puppeteer-core");
const chrome = require("@sparticuz/chromium-min");

app.use(cors());

dotenv.config();

app.get("/", async (req, res) => {
  res.send("call /api?url=URL_HERE");
});

app.get("/api", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).send("Bad Request: Please provide a URL.");
  }

  if (process.env.SECRET !== req.query.secret)
    throw new Error("Invalid secret");

  const browser = await puppeteer.launch({
    args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
    defaultViewport: chrome.defaultViewport,
    executablePath: await chrome.executablePath(
      // "https://puppeteer-pitieu.s3.ap-southeast-1.amazonaws.com/chromium/chromium.br"
      "https://puppeteer-pitieu.s3.ap-southeast-1.amazonaws.com/chromium/chromium-v114.0.0-pack.tar"
    ),
    headless: chrome.headless,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630 });
  await page.goto(url, { waitUntil: "networkidle0" });
  const screenshot = await page.screenshot({ fullPage: true });
  await browser.close();

  const base64Image = screenshot.toString("base64");

  res.json({ image: base64Image });
});

app.listen(process.env.PORT || 3005, () => {
  console.log("Server started");
});

module.exports = app;
