export interface PugCustomFilterOptionsParam {
  filename: string;
}

export type PugCustomFilterFunc = (
  content: string,
  options: PugCustomFilterOptionsParam | Record<string, unknown>,
) => string;
