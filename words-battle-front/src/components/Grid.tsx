import React from "react";

interface GridProps {
    loadColumn: (col: number) => React.ReactNode[]
}

const Grid = ({loadColumn} : GridProps)=> {

	return(
		<div className='grid'>
			<span id='col-1' className='col'>
				{loadColumn(1)}
			</span>
			<span id='col-2' className='col'>
				{loadColumn(2)}
			</span>
			<span id='col-3' className='col'>
				{loadColumn(3)}
			</span>
			<span id='col-4' className='col'>
				{loadColumn(4)}
			</span>
			<span id='col-5' className='col'>
				{loadColumn(5)}
			</span>
			<span id='col-6' className='col'>
				{loadColumn(6)}
			</span>
		</div>
	);
};

export default Grid;