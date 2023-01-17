import type { PaperFormat, PDFMargin } from 'puppeteer';

export interface CreateInstanceOptions {
  tmpDir?: string;
  outDir?: string;
  puppeteerOptions?: {
    args?: string[];
  };
  pdfOptions: {
    format?: PaperFormat;
    margin?: PDFMargin;
    height?: number | string;
    width?: number | string;
    landscape?: boolean;
  };
}
