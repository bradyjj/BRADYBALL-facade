export class RadarChartDataPoint {
	constructor(
		public key: string,
		public value: number,
		public scale: number,
		public color: string,
		public label: string,
	) {}
}

export class RadarChartPlayerData {
	constructor(
		public player: string,
		public season: string,
		public dataPoints: RadarChartDataPoint[],
		public league?: string,
		public team?: string,
		public nation?: string,
		public age?: number,
		public born?: number,
		public position?: string,
		public minutes_90s?: number,
	) {}

	static createDefault(): RadarChartPlayerData {
		return new RadarChartPlayerData(
			'', // player
			'', // season
			[], // dataPoints
			'', // league
			'', // team
			'', // nation
			0, // age
			0, // born
			'', // position
			0, // minutes_90s
		);
	}
}
