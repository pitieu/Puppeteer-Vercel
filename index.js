const app = require("express")();
const cors = require("cors");
const dotenv = require("dotenv");
const chrome = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");

app.use(cors());

dotenv.config();

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
    executablePath: await chrome.executablePath,
    headless: "new",
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

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

module.exports = app;
