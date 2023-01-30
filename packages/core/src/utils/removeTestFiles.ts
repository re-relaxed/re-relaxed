import { readdir, rm } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

export const removeTestFiles = async (path = '.') => {
  const fileList = await readdir('.');
  const deletePromises: Promise<void>[] = [];

  fileList.forEach((file) => {
    const fileExtension = extname(file);

    if (fileExtension === '.html' || fileExtension == '.pdf') {
      deletePromises.push(rm(resolve(path, file), { maxRetries: 2, retryDelay: 100 }));
    }
  });

  await Promise.all(deletePromises);
};
