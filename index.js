const app = require("express")();
const cors = require("cors");
const dotenv = require("dotenv");
const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

app.use(cors());

dotenv.config();

chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

app.get("/api", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).send("Bad Request: Please provide a URL.");
  }

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath:
      process.env.CHROME_EXECUTABLE_PATH || (await chromium.executablePath),
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630 });
  await page.goto(url, { waitUntil: "networkidle0" });
  const screenshot = await page.screenshot({ fullPage: true });
  await browser.close();

  const base64Image = screenshot.toString("base64");

  res.json({ image: base64Image });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

module.exports = app;
