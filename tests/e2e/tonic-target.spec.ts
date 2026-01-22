/**
 * E2E Tests for Tonic Target Practice
 */

import { test, expect } from '@playwright/test';

test.describe('Tonic Target Practice', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/tonic-target');
  });

  test('shows start screen initially', async ({ page }) => {
    // Use h2 specifically to avoid matching the h1 in the GameShell header
    await expect(page.locator('h2', { hasText: 'Tonic Target Practice' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start Practice' })).toBeVisible();
  });

  test('starts game after clicking start', async ({ page }) => {
    // Click start button
    await page.getByRole('button', { name: 'Start Practice' }).click();
    
    // Wait for loading (piano samples)
    // The game-ready marker appears when loaded
    await page.waitForSelector('[data-testid="game-ready"]', { timeout: 30000 });
    
    // Should see key display
    await expect(page.locator('text=Current Key')).toBeVisible();
  });

  test('can select chords in order', async ({ page }) => {
    // Start the game
    await page.getByRole('button', { name: 'Start Practice' }).click();
    await page.waitForSelector('[data-testid="game-ready"]', { timeout: 30000 });
    
    // Click ii chord (degree 2)
    await page.click('[data-testid="chord-degree-2"]');
    await expect(page.locator('[data-testid="slot-ii"]')).not.toContainText('___');
    
    // Click V chord (degree 5)
    await page.click('[data-testid="chord-degree-5"]');
    await expect(page.locator('[data-testid="slot-V"]')).not.toContainText('___');
    
    // Click I chord (degree 1)
    await page.click('[data-testid="chord-degree-1"]');
    await expect(page.locator('[data-testid="slot-I"]')).not.toContainText('___');
  });

  test('shows correct feedback for correct answer', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Practice' }).click();
    await page.waitForSelector('[data-testid="game-ready"]', { timeout: 30000 });
    
    // Select correct ii-V-I
    await page.click('[data-testid="chord-degree-2"]');
    await page.click('[data-testid="chord-degree-5"]');
    await page.click('[data-testid="chord-degree-1"]');
    
    // Submit
    await page.click('[data-testid="submit-button"]');
    
    // Should show correct feedback
    await expect(page.locator('[data-testid="feedback-correct"]')).toBeVisible();
    await expect(page.locator('text=Nice!')).toBeVisible();
  });

  test('shows incorrect feedback for wrong answer', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Practice' }).click();
    await page.waitForSelector('[data-testid="game-ready"]', { timeout: 30000 });
    
    // Select wrong chords (iii-vi-IV instead of ii-V-I)
    await page.click('[data-testid="chord-degree-3"]');
    await page.click('[data-testid="chord-degree-6"]');
    await page.click('[data-testid="chord-degree-4"]');
    
    // Submit
    await page.click('[data-testid="submit-button"]');
    
    // Should show incorrect feedback
    await expect(page.locator('[data-testid="feedback-incorrect"]')).toBeVisible();
    await expect(page.locator('[data-testid="correct-answer"]')).toBeVisible();
  });

  test('can proceed to next round', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Practice' }).click();
    await page.waitForSelector('[data-testid="game-ready"]', { timeout: 30000 });
    
    // Complete a round
    await page.click('[data-testid="chord-degree-2"]');
    await page.click('[data-testid="chord-degree-5"]');
    await page.click('[data-testid="chord-degree-1"]');
    await page.click('[data-testid="submit-button"]');
    
    // Wait for feedback
    await page.waitForSelector('[data-testid="feedback-correct"]');
    
    // Click next round
    await page.getByRole('button', { name: 'Next Round' }).click();
    
    // Should be back to selection mode (slots should be empty)
    await expect(page.locator('[data-testid="slot-ii"]')).toContainText('___');
  });
});

test.describe('Home Page', () => {
  test('shows game list', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByRole('heading', { name: 'Harmony Lab' })).toBeVisible();
    await expect(page.getByText('Tonic Target Practice')).toBeVisible();
    await expect(page.getByText('Chord Crush Clone')).toBeVisible();
  });

  test('can navigate to Tonic Target', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: 'Play' }).click();
    
    await expect(page).toHaveURL('/games/tonic-target');
  });
});
