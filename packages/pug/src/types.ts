export interface PugCustomFilterOptionsParam {
  filename: string;
}

export type PugCustomFilterFunc<
  T extends PugCustomFilterOptionsParam = PugCustomFilterOptionsParam,
> = (content: string, options: T) => string;
