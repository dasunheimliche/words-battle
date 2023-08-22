
import React, { Dispatch } from 'react';
import { parse } from 'node-html-parser';
import { Position, Board, User } from '../types/types';
import axios from 'axios';

export const daño = (selection: Position[] | undefined, board: Board, damages:Record<string, number>)=> {
	if (!selection) return null;
	return selection.reduce((acc, [x, y]) => acc + damages[board[y][x]], 0);
};

export const winner = (host: User, guest: User)=> {
	if (!host.username || !guest.username) return undefined;
	if (host.health <= 0) return `${guest.username} wins!`;
	if (guest.health <= 0) return `${host.username} wins!`;
	return undefined;
};

export const reload = ()=> {
	location.reload();
};

export const doNothing = ()=> {
	console.log("doing nothing");
};

export const getRandomLetter = (str: string)=> {
	return str.charAt(Math.floor(Math.random() * str.length));
};

export const loadDefinitions = (defs:({definitions: string, id:string})[]) => {
	return defs.map((def, i) => (
		<div className="definition" key={i}>{def.definitions}</div>
	));
};

export const selectedWord = (selection: Position[] | undefined, board: Board): string=> {
	if (!selection) return "";
	return selection.map(([x, y]) => board[y][x]).join("");
};

export const searchDefs = async(selection: Position[] | undefined, board: Board, setBlock: Dispatch<boolean>)=> {

	if (!selection || selection.length === 1) return;

	const word = selectedWord(selection, board).toLocaleLowerCase();
	let filteredWords: string[] = [];

	try {
		const { data: wordTextList } = await axios.get(`https://www.wordreference.com/autocomplete?dict=eses&query=${word}`);
		const lines = wordTextList.split('\n');
		const words = lines.map((line: string) => {
			const word = line.split('\t')[0].trim();
			const normalized = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			return normalized;
		});

		filteredWords = words.filter((word: string) => word !== "");

		if (!filteredWords.includes(word)) {
			return [{ definitions: "no word found", id: "error" }];
		}
	} catch (err) {
		return [{ definitions: "no word found", id: "error" }];
	}

	try {
		const { data: htmlResult } = await axios.get(`https://www.wordreference.com/definicion/${word}`);
		const root = parse(htmlResult);
		const main = root.querySelector('.entry');
		if (!main?.text) {
			throw Error;
		}

		setBlock(false);
		return [{ definitions: main?.text, id: "1" }];
	} catch (err) {
		return [{ definitions: "no word found", id: "error" }];
	}

};

export function isServerSleeping() {

	if (!(typeof window !== "undefined" && sessionStorage.getItem('sleep'))) return true;

	const sleep = sessionStorage.getItem('sleep');

	if (sleep === "false") {
		return false;
	}
	else if (sleep === "true") {
		return true;
	}
	
}