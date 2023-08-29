export type Position = [number, number];

export type Board = string[][];

export interface Definition {
  definitions: string;
  id: string;
}

export type Definitions = Definition[];

export interface User {
  username: string;
  color: string;
  health: number;
}
