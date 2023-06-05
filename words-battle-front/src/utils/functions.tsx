
import React, { Dispatch } from 'react';
import { parse } from 'node-html-parser';
import { Position, Board, User } from '../types/types';
import axios from 'axios';

export const daño = (selection: Position[] | undefined, board: Board, damages:Record<string, number>)=> {
	if (selection) {
		let hit = 0;
		for (let i=0; i < selection.length; i++) {
			const letter = board[selection[i][1]][selection[i][0]];
			const daño = damages[letter];
			hit = hit + daño;
		}

		return hit;
	}
};

export const winner = (host: User, guest: User)=> {
	if (host.username === "" || guest.username === "") {
		return undefined;
	}

	if (host.health <= 0) return (<div>{`${guest.username} wins!`}</div>);
	if (guest.health <= 0) return (<div>{`${host.username} wins!`}</div>);
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
	let word = "";
	if (selection) {
		for (let i=0; i < selection.length; i++) {
			const letter = board[selection[i][1]][selection[i][0]];
			word = word + letter;
		}
		return word;
	}
	return word;
};

export const searchDefs = async(selection: Position[] | undefined, board: Board, setBlock: Dispatch<boolean>)=> {

	if (!selection) {
		return;
	}

	if (selection.length === 1) {
		return;
	}

	let filteredWords: string[] = [];

	let word = "";
	for (let i=0; i < selection.length; i++) {
		word = word + board[selection[i][1]][selection[i][0]];
		word = word.toLocaleLowerCase();
	}
	try {
		const { data: wordTextList} = await axios.get(`https://www.wordreference.com/autocomplete?dict=eses&query=${word}`);
		const lines = wordTextList.split('\n');
		const words = lines.map((line:string) => {
			const word = line.split('\t')[0].trim();
			const normalized = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			return normalized;
		});

		filteredWords = words.filter((word:string) => word !== "");

		if (!filteredWords.includes(word)) {
			return [{definitions: "no word found", id: "error"}];
		}


	} catch(err) {
		return [{definitions: "no word found", id: "error"}];
	}


	try {
		const {data: htmlResult} = await axios.get(`https://www.wordreference.com/definicion/${word}`);
		const root = parse(htmlResult);
		const main = root.querySelector('.entry');
		if (!main?.text) {
			throw Error;
		}

		setBlock(false);
		return [{definitions: main?.text, id: "1"}];
	} catch(err) {
		return [{definitions: "no word found", id: "error"}];
	}
};