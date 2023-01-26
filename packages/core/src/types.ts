import type { PaperFormat, PDFMargin } from 'puppeteer';

export abstract class TransformPlugin {
  abstract transform(
    inputPath: string,
    outputPath: string,
    templateData?: unknown,
  ): Promise<string>;

  abstract checkFileType(path: string): boolean;
}

export interface CreateInstanceOptions {
  tmpDir?: string;
  outDir?: string;
  puppeteerOptions?: {
    args?: string[];
  };
  pdfOptions?: {
    format?: PaperFormat;
    margin?: PDFMargin;
    height?: number | string;
    width?: number | string;
    landscape?: boolean;
  };
  plugins?: {
    transform?: TransformPlugin;
  };
}
