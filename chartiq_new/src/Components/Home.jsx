import React from 'react';
import Chart from '@chartiq/react-components';

export default function MyChart() {
	console.log("Home")
	return <Chart  config={{initialSymbol: "AXIS"}}/>
}