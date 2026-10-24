import { expect, test } from "@playwright/test";

const post = "/posts/too-much-tailwind";

test("/me marks the browser as Mark's and can undo it", async ({ page }) => {
  await page.goto("/me");
  await expect(page.getByText("This browser is marked as yours")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("mm:me"))).toBe("1");

  await page.getByRole("button", { name: "Count my visits again" }).click();
  await expect(page.getByText("counts as a regular visitor")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("mm:me"))).toBeNull();
});

test("headless browsers don't count as views", async ({ page }) => {
  await page.goto(post);
  const viewed = await page.evaluate(() =>
    Object.keys(localStorage).filter((key) => key.startsWith("mm:viewed:")),
  );
  expect(viewed).toEqual([]);
});

test("posts have a subscribe form that posts to Convex", async ({ page }) => {
  await page.goto(post);
  const form = page.locator("form", {
    has: page.getByRole("button", { name: "Subscribe" }),
  });
  await expect(form).toHaveAttribute("method", "post");
  await expect(form).toHaveAttribute("action", /\.convex\.site\/subscribe$/);
});

test("/subscribe shows the status Convex redirects with", async ({ page }) => {
  await page.goto("/subscribe?status=check-email");
  await expect(page.getByText("Check your inbox")).toBeVisible();
  await expect(page.getByText("You're subscribed")).toBeHidden();
});

test("comments load when scrolled into view", async ({ page }) => {
  await page.goto(post);
  await page.getByRole("heading", { name: "Comments" }).scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("button", { name: "Sign in to comment" }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("button", { name: /this post/ })).toBeVisible();
});
