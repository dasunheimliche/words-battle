export type Position = [number, number];
export type Board = string[][];

export interface User {
	username: string,
	color: string,
	health: number
}