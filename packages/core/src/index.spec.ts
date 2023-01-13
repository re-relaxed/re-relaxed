import { describe, it, expect } from 'vitest';

import { ReRelaxed } from '.';

describe('ReRelaxed class', () => {
  describe('is implemented as a singleton', () => {
    it('can not be instantiated with new', () => {
      // @ts-expect-error we try to test the unwanted behavior for instantiation.
      expect(() => new ReRelaxed()).toThrowError(
        'This is a private constructor, use getInstance to get an instance.',
      );
    });

    it('can be instantiated via getInstance', async () => {
      const instance = await ReRelaxed.getInstance();

      expect(instance).not.toBe(undefined);
      expect(instance).not.toBe(null);
      expect(instance instanceof ReRelaxed).toBe(true);
      expect(ReRelaxed.getInstance()).resolves.not.toThrowError();
    });

    it('can be instantiated via getInstance', async () => {
      const instance = await ReRelaxed.getInstance();

      expect(instance).not.toBe(undefined);
      expect(instance instanceof ReRelaxed).toBeTruthy();
      expect(ReRelaxed.getInstance()).resolves.not.toThrowError();
    });

    it('getInstance always returns the same object', async () => {
      const instanceA = await ReRelaxed.getInstance();
      const instanceB = await ReRelaxed.getInstance();

      expect(instanceA === instanceB).toBe(true);
    });
  });
});
