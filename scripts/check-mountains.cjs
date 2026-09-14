const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    for (const reducedMotion of ["no-preference", "reduce"]) {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 1000 },
        reducedMotion,
      });
      await page.goto("http://localhost:3002");
      await page
        .getByRole("button", { name: "Decline optional", exact: true })
        .click();
      await page.waitForTimeout(3500);
      const layer = page.locator(
        ".editorial-home > .mountain-backdrop .mountain-backdrop-image",
      );
      const transform = () =>
        layer.evaluate((el) => getComputedStyle(el).transform);
      const before = await transform();
      await page.evaluate(() => window.scrollTo(0, 300));
      await page.waitForTimeout(300);
      assert.equal(
        (await transform()) !== before,
        reducedMotion === "no-preference",
      );
      if (reducedMotion === "no-preference") {
        await page
          .getByRole("button", { name: "Pause animations", exact: true })
          .first()
          .click();
        const paused = await transform();
        await page.evaluate(() => window.scrollTo(0, 200));
        await page.waitForTimeout(300);
        assert.equal(await transform(), paused);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      await page.screenshot({
        path: ".impeccable/review/mountains-desktop-" + reducedMotion + ".png",
      });
      assert(
        await page
          .locator(".editorial-home > .mountain-backdrop img")
          .evaluate((i) => i.complete && i.naturalWidth > 0),
      );
      await page.locator("#models").scrollIntoViewIfNeeded();
      await page.locator("#models canvas").waitFor({ timeout: 60000 });
      await page.waitForFunction(
        () =>
          !document.querySelector("#models").textContent.includes("Loading "),
        {},
        { timeout: 45000 },
      );
      await page.screenshot({
        path: ".impeccable/review/mountains-models-" + reducedMotion + ".png",
      });
      await page.locator("#services").scrollIntoViewIfNeeded();
      await page.screenshot({
        path:
          ".impeccable/review/translucent-services-" + reducedMotion + ".png",
      });
      for (const [width, expected] of [
        [1440, 128],
        [768, 112],
        [390, 96],
      ]) {
        await page.setViewportSize({ width, height: 844 });
        assert.equal(
          await page
            .locator("header img")
            .evaluate((i) => i.getBoundingClientRect().height),
          expected,
        );
      }
      await page.setViewportSize({ width: 390, height: 844 });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await page.screenshot({
        path: ".impeccable/review/mountains-mobile-" + reducedMotion + ".png",
      });
      await page.close();
      console.log(
        reducedMotion +
          ": image loading, scroll movement, pause, model loading and mobile width passed",
      );
    }
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
