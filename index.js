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
    animations: "allow",
  });

  await browser.close();

  // Send the screenshot as a base64-encoded string
  res.setHeader("Content-Type", "image/png");
  res.send(screenshot);
});

app.get("/api/video", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send("Bad Request: Please provide a URL.");
  }

  const browser = await playwright.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(url);

  // Start video recording
  await page.video().start({ width: 1280, height: 720 });

  // Simulate scrolling
  await page.evaluate(() => {
    const totalHeight = document.body.scrollHeight;
    let scrolled = 0;
    const scrollStep = 100;
    const scrollInterval = setInterval(() => {
      window.scrollBy(0, scrollStep);
      scrolled += scrollStep;
      if (scrolled >= totalHeight) {
        clearInterval(scrollInterval);
      }
    }, 100);
  });

  // Wait for scrolling to complete
  await page.waitForTimeout(5000);

  // Stop recording and get video
  const video = await page.video().stop();

  await browser.close();

  // Send the video file
  res.setHeader("Content-Type", "video/webm");
  res.send(video);
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started http://localhost:${process.env.PORT || 3000}`);
});

module.exports = app;
