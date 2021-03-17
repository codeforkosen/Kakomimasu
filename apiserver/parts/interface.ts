export interface ApiOption {
  option?: {
    dryRun?: boolean;
  };
}

export interface IBoard {
  name: string;
  width: number;
  height: number;
  nagent: number;
  points: number[];
}
