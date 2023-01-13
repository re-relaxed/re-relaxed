import { isAbsolute, resolve } from 'node:path';
import { cwd } from 'node:process';

/**
 * Resolve string path and return as absolut path string
 *
 * @param path
 * @returns
 */
export const getPathString = (path: string): string => {
  if (isAbsolute(path)) {
    return path;
  }

  return resolve(cwd(), path);
};
