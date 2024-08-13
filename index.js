const app = require("express")();
const cors = require("cors");
const dotenv = require("dotenv");
const { chromium: playwright } = require("playwright-core");
const chromium = require("@sparticuz/chromium");

app.use(cors());
dotenv.config();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api", async (req, res) => {
  const url = req.query.url;
  console.log(url);
  if (!url) {
    return res.status(400).send("Bad Request: Please provide a URL.");
  }

  const browser = await playwright.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  const page = await browser.newPage();
  await page.goto(url);

  // Take a screenshot and store it as a buffer
  const screenshot = await page.screenshot({
    encoding: "base64",
    fullPage: true,
  });

  await browser.close();

  // Send the screenshot as a base64-encoded string
  res.setHeader("Content-Type", "image/png");
  res.send(screenshot);
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started http://localhost:${process.env.PORT || 3000}`);
});

module.exports = app;
