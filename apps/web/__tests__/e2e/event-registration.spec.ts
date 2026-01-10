import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Event Registration
 * Tests the complete user flow from browsing events to registration
 */

test.describe('Event Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to events page
    await page.goto('/hub/events');
  });

  test('should display events list', async ({ page }) => {
    // Wait for events to load
    await page.waitForSelector('[data-testid="event-card"]', { timeout: 5000 });

    // Verify events are displayed
    const eventCards = await page.locator('[data-testid="event-card"]').count();
    expect(eventCards).toBeGreaterThan(0);
  });

  test('should navigate to event detail page', async ({ page }) => {
    // Click on first event
    await page.click('[data-testid="event-card"]:first-child');

    // Verify navigation to detail page
    await page.waitForURL(/\/hub\/events\/\d+/);
    
    // Verify event details are displayed
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should register for an event', async ({ page }) => {
    // Navigate to event detail
    await page.click('[data-testid="event-card"]:first-child');
    await page.waitForURL(/\/hub\/events\/\d+/);

    // Click register button
    await page.click('button:has-text("Register")');

    // Select "Going" option
    await page.click('text="Going"');

    // Verify success toast
    await expect(page.locator('text=/Registration.*success/i')).toBeVisible();
    
    // Verify button updated
    await expect(page.locator('button:has-text("Going")')).toBeVisible();
  });

  test('should update registration status', async ({ page }) => {
    // Navigate to event with existing registration
    await page.goto('/hub/events/1'); // Assuming event 1 exists

    // Click current status button
    await page.click('button:has-text("Going")');

    // Change to "Maybe"
    await page.click('text="Maybe"');

    // Verify update
    await expect(page.locator('button:has-text("Maybe")')).toBeVisible();
  });

  test('should work in RTL mode', async ({ page }) => {
    // Set RTL direction
    await page.goto('/ar/hub/events'); // Arabic locale

    // Verify layout direction
    const direction = await page.locator('html').getAttribute('dir');
    expect(direction).toBe('rtl');

    // Verify events still load and display correctly
    await page.waitForSelector('[data-testid="event-card"]', { timeout: 5000 });
  });

  test('should work in dark theme', async ({ page }) => {
    // Toggle dark theme
    await page.emulateMedia({ colorScheme: 'dark' });

    // Navigate to events
    await page.goto('/hub/events');

    // Verify page loads correctly
    await page.waitForSelector('[data-testid="event-card"]', { timeout: 5000 });
    
    // Verify dark theme is applied
    const html = await page.locator('html').getAttribute('class');
    expect(html).toContain('dark');
  });
});
