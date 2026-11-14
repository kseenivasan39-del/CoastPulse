import { test, expect } from "@playwright/test";

test.describe("CoastPulse Global Explorer & Geospatial Tooling", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to local frontend
    await page.goto("/");
    // Switch to Interactive Map tab
    await page.getByRole("button", { name: "Interactive Map" }).click();
  });

  test("1. Map viewport, controls, and coordinate bar load correctly", async ({ page }) => {
    // Map container exists
    const mapRegion = page.getByRole("region", { name: /Interactive Satellite Map/i });
    await expect(mapRegion).toBeVisible();

    // Scale distance indicator and coordinates exist
    await expect(page.getByText("Lon:")).toBeVisible();
    await expect(page.getByText("Lat:")).toBeVisible();
    await expect(page.getByText("Zoom:")).toBeVisible();

    // Layer controls accordion exists
    await expect(page.getByText("Layer Controls")).toBeVisible();
    await expect(page.getByText("OpenStreetMap Basemap")).toBeVisible();
    await expect(page.getByText("Authoritative Satellite Catalogue")).toBeVisible();
  });

  test("2. Search by coastal city, region, and direct coordinates", async ({ page }) => {
    const searchInput = page.getByRole("searchbox");
    await expect(searchInput).toBeVisible();

    // Search by coastal delta
    await searchInput.fill("Cauvery");
    await expect(page.getByText("Nagapattinam & Cauvery Delta")).toBeVisible();

    // Click result
    await page.getByText("Nagapattinam & Cauvery Delta").click();
    await expect(page.getByText("Cauvery Delta & Muthupet Tidal Wetland")).toBeVisible();

    // Search by direct coordinates
    await searchInput.fill("10.76, 79.84");
    await expect(page.getByText("Direct Coordinate:")).toBeVisible();
  });

  test("3. Delineate, inspect, and save an Area of Interest (AOI)", async ({ page }) => {
    // Verify pre-seeded authoritative AOI
    await expect(page.getByText("Cauvery Delta & Muthupet Tidal Wetland")).toBeVisible();

    // Start Rectangle Drawing mode
    const rectBtn = page.getByRole("button", { name: "Draw Rectangle AOI" });
    await rectBtn.click();

    // Active drawing banner appears
    await expect(page.getByText(/Click first corner of the bounding rectangle/i)).toBeVisible();

    // Click map canvas to simulate points
    const mapRegion = page.getByRole("region", { name: /Interactive Satellite Map/i });
    await mapRegion.click({ position: { x: 250, y: 250 } });
    await page.waitForTimeout(300);
    await mapRegion.click({ position: { x: 450, y: 400 } });

    // Verify a new bounded AOI was registered in the list
    await expect(page.getByText(/Bounded AOI/i).first()).toBeVisible();

    // Inspect the AOI and save to workspace
    const saveBtn = page.getByRole("button", { name: "Save to Workspace" });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Verify save feedback confirmation
    await expect(page.getByText(/stored locally|persisted to researcher workspace/i)).toBeVisible();
  });

  test("4. Delete an Area of Interest", async ({ page }) => {
    // Select the existing AOI
    const aoiItem = page.getByText("Cauvery Delta & Muthupet Tidal Wetland");
    await aoiItem.click();

    // Click Delete AOI
    const deleteBtn = page.getByTitle("Delete AOI");
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    // Verify removed from list
    await expect(page.getByText("Cauvery Delta & Muthupet Tidal Wetland")).not.toBeVisible();
  });
});
