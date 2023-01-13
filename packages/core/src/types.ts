export interface CreateInstanceOptions {
  tmpDir?: string;
  outDir?: string;
  puppeteerOptions?: {
    args?: string[];
  };
}
