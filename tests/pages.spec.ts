import { expect, test, type Page } from "@playwright/test";

const corePages = [
  { path: "/", heading: "Latest" },
  { path: "/projects", heading: "Projects" },
  { path: "/posts", heading: "Posts" },
  { path: "/about", heading: "About me" },
  { path: "/colophon" },
];

function collectPageErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

for (const { path, heading } of corePages) {
  test(`${path} renders without errors`, async ({ page }) => {
    const errors = collectPageErrors(page);
    const response = await page.goto(path);

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/Mark Miro/);
    await expect(page.getByRole("navigation")).toBeVisible();
    if (heading) {
      await expect(
        page.getByRole("heading", { name: heading }).first(),
      ).toBeVisible();
    }
    expect(errors).toEqual([]);
  });
}

test("nav links navigate and highlight the active page", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation");

  for (const name of ["Projects", "Posts", "About"]) {
    await nav.getByRole("link", { name }).click();
    await expect(page).toHaveURL(`/${name.toLowerCase()}`);
    await expect(nav.getByRole("link", { name })).toHaveClass(/cursor-default/);
  }

  await nav.getByRole("link", { name: "Mark Miro" }).click();
  await expect(page).toHaveURL("/");
});

test("unknown routes return 404", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(page.getByText("Page not found")).toBeVisible();
});
