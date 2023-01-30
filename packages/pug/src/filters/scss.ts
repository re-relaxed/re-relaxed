import sass from 'sass';
import { PugCustomFilterFunc } from '../types';

export const ScssPugFilter: PugCustomFilterFunc = (content, options) => {
  if (options.filename.endsWith('.scss') || options.filename.endsWith('.sass')) {
    return sass.compile(options.filename).css;
  }

  return sass.compileString(content).css;
};
