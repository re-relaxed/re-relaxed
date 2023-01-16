import { describe, it, expect, vi, afterEach, afterAll } from 'vitest';
import { existsSync } from 'fs';
import { readFile, rm, writeFile } from 'fs/promises';
import { resolve } from 'path';

import { getPathString, ensureDirExists, createTmpFile } from './path';

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

  describe('ensureDirExists', () => {
    it('does create dir if not existing', async () => {
      const testPaths = ['/tmp/test123', '/tmp/test1234', '/tmp/asdads', '/tmp/asdasd324234'];

      const promises: Promise<void>[] = [];

      testPaths.forEach((p) => {
        promises.push(ensureDirExists(p));
      });

      await Promise.all(promises);

      testPaths.forEach((p) => {
        expect(existsSync(p)).toBe(true);
      });

      // clean up our mess in tmp
      await Promise.all(testPaths.map((p) => rm(p, { recursive: true, force: true })));
    });

    it('does creates missing parent dirs', async () => {
      const testPaths = [
        '/tmp/test/test123',
        '/tmp/test/test/test1234',
        '/tmp/test/test2/test1234',
      ];

      const promises: Promise<void>[] = [];

      testPaths.forEach((p) => {
        promises.push(ensureDirExists(p));
      });

      await Promise.all(promises);

      testPaths.forEach((p) => {
        expect(existsSync(p)).toBe(true);
      });

      // clean up our mess in tmp
      await rm('/tmp/test', { recursive: true, force: true });
    });
  });

  describe('createTmpFile', async () => {
    const tmpOutPath = '/tmp/';
    const inputFile = 'input.html';
    const inputFilePath = resolve(tmpOutPath, inputFile);
    const inputFileContent = '<h1>Hello World</h1>';

    await writeFile(inputFilePath, inputFileContent, {
      encoding: 'utf-8',
    });

    afterAll(async () => {
      await rm(inputFilePath);
    });

    it('does create a correct tmp file', async () => {
      const newTmpFile = await createTmpFile(inputFilePath, tmpOutPath);
      const tmpFileContent = await readFile(newTmpFile, {
        encoding: 'utf-8',
      });

      expect(existsSync(newTmpFile)).toBe(true);
      expect(tmpFileContent).toStrictEqual(inputFileContent);

      await rm(newTmpFile);
    });

    it('allows overriding the default file name', async () => {
      const expectOutputPath = resolve(tmpOutPath, 'test.html');
      const newTmpFile = await createTmpFile(inputFilePath, tmpOutPath, 'test.html');

      expect(existsSync(expectOutputPath)).toBe(true);
      expect(newTmpFile).toStrictEqual(expectOutputPath);

      await rm(newTmpFile);
    });
  });
});
