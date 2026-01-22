/**
 * Test setup file
 * Configure test environment
 */

import '@testing-library/jest-dom';
import { afterEach } from 'bun:test';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
