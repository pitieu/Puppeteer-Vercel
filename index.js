const app = require("express")();

let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}

app.get("/api", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).send("Bad Request: Please provide a URL.");
  }

  let options = {};

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: "new",
      ignoreHTTPSErrors: true,
    };
  }
  const browser = await puppeteer.launch(options);
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
