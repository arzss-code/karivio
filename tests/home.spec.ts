import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load successfully and display the hero section', async ({ page }) => {
    // Go to the home page
    await page.goto('/');

    // Expect the title or hero text to be visible
    await expect(page.locator('h1').first()).toBeVisible();
    
    // Instead of text=CareerGen which matches 3 elements, look for the Navbar brand link specifically
    await expect(page.getByRole('link', { name: 'CareerGen' }).first()).toBeVisible();
  });

  test('should have a working Sign In button', async ({ page }) => {
    await page.goto('/');

    // Wait for the auth button in the navbar (either 'Sign In' or 'Dashboard' if logged in)
    // Since this is a fresh browser context without cookies, it should be 'Sign In'
    const signInBtn = page.locator('text=Sign In').first();
    await expect(signInBtn).toBeVisible();
  });
});
