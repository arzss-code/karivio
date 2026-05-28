import { test, expect } from '@playwright/test';

test.describe('Auth Redirection', () => {
  test('should show Login Required modal if accessing /app without session', async ({ page }) => {
    // Attempt to access the protected dashboard route
    await page.goto('/app');

    // Verify the fallback modal/UI is shown (we built a fallback UI for login=required)
    await expect(page.locator('h2', { hasText: 'Login Required' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Sign In with Google' })).toBeVisible();
  });
});
