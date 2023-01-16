import { copyFile, mkdir } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';
import { cwd } from 'node:process';

/**
 * Resolve string path and return as absolut path string
 *
 * @param path
 * @returns String - resolved path
 */
export const getPathString = (path: string): string => {
  if (isAbsolute(path)) {
    return path;
  }

  return resolve(cwd(), path);
};

/**
 * Create path if it does not exist
 *
 * @param path
 */
export const ensureDirExists = async (path: string): Promise<void> => {
  await mkdir(path, { recursive: true });
};

/**
 * Helper for creating a tmp file
 *
 * @param sourceFilePath
 * @param tmpDir
 * @param tmpFileName
 *
 * @returns @returns String - path to copied file
 */
export const createTmpFile = async (
  sourceFilePath: string,
  tmpDir: string,
  tmpFileName = 'tmp.html',
): Promise<string> => {
  const tmpHtmlFilePath = resolve(tmpDir, tmpFileName);

  await copyFile(sourceFilePath, tmpHtmlFilePath);

  return tmpHtmlFilePath;
};
