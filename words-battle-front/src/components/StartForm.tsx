import React, {Dispatch, useState} from 'react';

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

const StartForm = ({user, joinRoom, createRoom, setUser, setRoom}: Props)=> {

	const [mode, setMode] = useState<string>("");

	return (
		<form className='start-form'>
			<div className="start-form-input">
				<div className='start-form-title'>Username</div>
				<input value={user.username} type="text" placeholder='username'onChange={e=>setUser({username: e.target.value, color: "", health:100})}/>
			</div>
			<div className="start-form-input">
				<div className='pointer start-form-title' onClick={()=>setMode("create")}>CREATE ROOM</div>
				{mode==="create" && <div>
					<input type="text" placeholder='room name'onChange={e=>setRoom(e.target.value)}/>
					<button onClick={createRoom}>Start</button>
				</div>}
			</div>
			<div className="start-form-input">
				<div className='pointer start-form-title' onClick={()=>setMode("join")}>JOIN ROOM</div>
				{mode==="join" && <div>
					<input type="text" placeholder='room name' onChange={e=>setRoom(e.target.value)}/>
					<button onClick={joinRoom}>Join</button>
				</div>}
			</div>
		</form>
	);
};

export default StartForm;