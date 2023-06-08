import React, {Dispatch, useState, useEffect} from 'react';
import axios from 'axios';
import style from '../styles/startForm.module.css';

interface User {
	username: string,
	color: string,
	health: number,
}

interface Props {
    user: User,
    joinRoom: (e:React.MouseEvent<HTMLButtonElement>)=> void;
    createRoom: (e:React.MouseEvent<HTMLButtonElement>)=>void;
    setUser: Dispatch<User>
    setRoom: Dispatch<string>
}

type Mode = "join" | "create";

const StartForm = ({user, joinRoom, createRoom, setUser, setRoom}: Props)=> {

	let woke = true;
	if (typeof window !== "undefined" && sessionStorage.getItem('sleep')) {
		const isWoke = sessionStorage.getItem('sleep');
		if (isWoke) {
			woke = JSON.parse(isWoke);
		}
		else {
			woke = true;
		}
	}

	const [mode, setMode] = useState<Mode>("create");
	const [sleep, setSleep] = useState<boolean>(woke);

	useEffect(()=> {
		axios.get('https://words-battle-api.onrender.com/despertar')
			.then(_response => {
				setSleep(false);
				sessionStorage.setItem("sleep", "false");
			})
			.catch(error => console.error('Error al despertar el servidor:', error));
	}, []);

	// const wakeUpServer = async()=> {
	// 	await axios.get('https://words-battle-api.onrender.com/despertar')
	// 		.then(_response => {
	// 			setSleep(false);
	// 		})
	// 		.catch(error => console.error('Error al despertar el servidor:', error));
	// };

	return (
		<div className='start-form-container' >
			<form className={style['start-form']}>
				<div className={style.title}>WORDS BATTLE</div>
				<div className={style.options}>
					<div className={mode === "create"? `${style.option} ${style.selected}` : style.option } onClick={()=>setMode("create")}>CREATE ROOM</div>
					<div className={mode === "join"? `${style.option} ${style.selected}` : style.option} onClick={()=>setMode("join")}>JOIN ROOM</div>
				</div>
				<div className={style.inputs}>
					<label >USERNAME:</label>
					<input type="text" placeholder='username' onChange={e=>setUser({username: e.target.value, color: "", health:100})} value={user.username} required/>
					<label >ROOM:</label>
					<input type="text" placeholder='room' onChange={e=>setRoom(e.target.value)} required/>
				</div>
				{mode === "create" && <button type='submit' onClick={sleep === false? createRoom : undefined}>CREATE ROOM</button>}
				{mode === "join" && <button type='submit' onClick={sleep === false? joinRoom : undefined}>JOIN ROOM</button>}
				{sleep === false && <div className={style.message}>Server is awake!</div>}
				{sleep === true && <div className={style.message}><span>Sorry, free host, server is sleeping.</span><span>Wait a few seconds...</span></div>}
			</form>
		</div>
	);
};

export default StartForm;