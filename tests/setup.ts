/**
 * Test setup file
 * Configure test environment
 */

import { Window } from 'happy-dom';
import '@testing-library/jest-dom';
import { afterEach } from 'bun:test';

if (!globalThis.document) {
  const happyWindow = new Window();
  (globalThis as { window?: Window }).window = happyWindow;
  (globalThis as { document?: Document }).document = happyWindow.document;
  (globalThis as { navigator?: Navigator }).navigator = happyWindow.navigator;
}

if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = (callback: FrameRequestCallback) => {
    return setTimeout(() => callback(Date.now()), 0);
  };
  globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id);
}

const { cleanup } = await import('@testing-library/react');

afterEach(() => {
  cleanup();
});
