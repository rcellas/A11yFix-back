import { describe, it, expect } from 'vitest';
import { ElementSelector } from '../../../src/domain/finding/element-selector';

describe('ElementSelector Value Object', () => {
  it('should generate semantic Playwright locator with role and accessible name', () => {
    const selector = ElementSelector.create({
      cssSelector: '#terms-modal',
      role: 'dialog',
      accessibleName: 'Terms & Conditions',
    });

    expect(selector.hasSemanticRole()).toBe(true);
    expect(selector.toPlaywrightLocator()).toBe(
      "page.getByRole('dialog', { name: 'Terms & Conditions' })",
    );
  });

  it('should generate semantic Playwright locator with role only', () => {
    const selector = ElementSelector.create({
      cssSelector: '.tab-list',
      role: 'tablist',
    });

    expect(selector.toPlaywrightLocator()).toBe("page.getByRole('tablist')");
  });

  it('should fall back to getByLabel if only accessibleName is present', () => {
    const selector = ElementSelector.create({
      cssSelector: '#username',
      accessibleName: 'Email Address',
    });

    expect(selector.toPlaywrightLocator()).toBe("page.getByLabel('Email Address')");
  });

  it('should fall back to page.locator() when no role or accessible name exists', () => {
    const selector = ElementSelector.fromCss('.custom-container > div.active');

    expect(selector.toPlaywrightLocator()).toBe(
      "page.locator('.custom-container > div.active')",
    );
  });

  it('should escape single quotes properly in generated Playwright locators', () => {
    const selector = ElementSelector.create({
      cssSelector: '#btn',
      role: 'button',
      accessibleName: "User's Profile",
    });

    expect(selector.toPlaywrightLocator()).toBe(
      "page.getByRole('button', { name: 'User\\'s Profile' })",
    );
  });

  it('should reject empty cssSelector', () => {
    expect(() => ElementSelector.fromCss('')).toThrow('ElementSelector requires a non-empty cssSelector.');
  });
});
