export interface PugCustomFilterOptionsParam {
  filename: string;
}

export type PugCustomFilterFunc = (content: string, options: PugCustomFilterOptionsParam) => string;
