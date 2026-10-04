import { expect, test } from "@playwright/test";

// These pages list S3 objects while rendering, so they need AWS credentials.
// See docs/aws-s3-access.md.
const needsAws = ["/projects/jpeg-degrader"];
const hasAws = !!(process.env.AWS_PROFILE || process.env.AWS_ACCESS_KEY_ID);

// Every post and project linked from its index page should render.
for (const section of ["posts", "projects"]) {
  test(`all ${section} linked from /${section} render`, async ({
    page,
    request,
  }) => {
    await page.goto(`/${section}`);
    const hrefs = await page
      .locator(`a[href^="/${section}/"]`)
      .evaluateAll((links) => [
        ...new Set(links.map((link) => link.getAttribute("href")!)),
      ]);

    expect(hrefs.length).toBeGreaterThan(0);

    for (const href of hrefs) {
      if (!hasAws && needsAws.includes(href)) continue;
      const response = await request.get(href);
      expect.soft(response.status(), href).toBe(200);
      // Astro streams responses, so a render error after the first byte
      // still returns 200 but cuts the document short.
      expect.soft(await response.text(), href).toContain("</html>");
    }
  });
}

test("a post page shows its title", async ({ page }) => {
  await page.goto("/posts");
  const firstPost = page.locator('a[href^="/posts/"]').first();
  const title = (await firstPost.textContent())!.trim();

  await firstPost.click();

  await expect(page.getByRole("heading", { level: 1 })).toContainText(title);
});
