import React,{Dispatch, useEffect} from 'react';
import {useState} from 'react';

type position = [number, number];

interface props {
    tilePosition: position,
    lastPosition: position,
    selection: position[] | undefined,
    setSelection: Dispatch<position[]>,
    char:string,
    setLastPosition: Dispatch<position>,
	state: boolean,
	setState: Dispatch<boolean>;
}

const Tile = ({tilePosition, lastPosition, setLastPosition, char, selection, setSelection, state, setState}: props)=> {
	const [position] = useState<position>(tilePosition);
	const [check, setCheck] = useState(false);

	useEffect(()=> {
		if (state === false) {
			setCheck(false);
		}
	},[state]);

	const handleNewPosition = ():React.MouseEventHandler<HTMLDivElement> | undefined => {

		if ((lastPosition[0] === -1 && lastPosition[1] === -1)) {
			console.log("CLICKEABLE");
			setLastPosition(tilePosition);
			setCheck(true);
			setState(true);
			if (selection) {
				setSelection([...selection, tilePosition]);
			} else {
				setSelection([tilePosition]);
			}
			return;
		}

		if (!isClickeable()) {
			return;
		}

		setCheck(true);
		setLastPosition(tilePosition);
		setState(true);
		if (selection) {
			setSelection([...selection, tilePosition]);
		} else {
			setSelection([tilePosition]);
		}
        
	};

	const isClickeable = ():boolean=> {
		if ((position[0] <= lastPosition[0]+1 && position[0] >= lastPosition[0] - 1) && (position[1] <= lastPosition[1] + 1 && position[1] >= lastPosition[1] - 1)) {
			console.log("CLICKEABLE");
			return true;
		}
		console.log("NOT CLICKEABLE");
		return false;
	};

	const doNothing = ()=> {
		return;
	};

	return (
		<div style={check? {backgroundColor: "pink"} : {backgroundColor: "white"}} className='item' onClick={!check? handleNewPosition : doNothing}>{char}</div>
	);
};

export default Tile;