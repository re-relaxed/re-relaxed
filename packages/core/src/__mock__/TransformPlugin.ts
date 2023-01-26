import { extname, resolve } from 'node:path';

import type { PathLike } from 'node:fs';
import { TransformPlugin } from '../types';

export class MockTransformPlugin extends TransformPlugin {
  transform(): Promise<string> {
    return Promise.resolve(resolve('.', './src/__mock__/template.html'));
  }

  checkFileType(path: PathLike): boolean {
    return extname(path.toString()) === '.test';
  }
}
