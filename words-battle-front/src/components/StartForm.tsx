import React, {Dispatch, useState} from 'react';
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

	const [mode, setMode] = useState<Mode>("create");

	

	return (
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
			{mode === "create" && <button type='submit' onClick={createRoom}>CREATE ROOM</button>}
			{mode === "join" && <button type='submit' onClick={joinRoom}>JOIN ROOM</button>}
		</form>
	);
};

export default StartForm;