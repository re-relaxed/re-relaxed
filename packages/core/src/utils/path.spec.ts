import { describe, it, expect, vi, afterEach } from 'vitest';

import { getPathString } from './path';

const mockCWD = '/srv/data';

describe('path utils', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getPathString', () => {
    it('correctly returns absolut path unchanged', () => {
      const pathA = '/test/path';
      const pathB = '/srv/data/test';

      expect(getPathString(pathA)).toStrictEqual(pathA);
      expect(getPathString(pathB)).toStrictEqual(pathB);
    });

    it('correctly returns relativ path based on cwd', () => {
      // mock cwd function to return predictable path
      vi.mock('node:process', async (importOriginal) => {
        const mod = await importOriginal();
        return {
          ...(mod as object),
          cwd: () => mockCWD,
        };
      });

      const pathA = '../path';
      const pathB = './test';
      const pathC = 'test';

      expect(getPathString(pathA)).toStrictEqual('/srv/path');
      expect(getPathString(pathB)).toStrictEqual('/srv/data/test');
      expect(getPathString(pathC)).toStrictEqual('/srv/data/test');
    });
  });
});
