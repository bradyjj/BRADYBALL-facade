export class PercentileRankData {
	constructor(
		public percentile?: number,
		public description?: string,
	) {}

	static createDefault(): PercentileRankData {
		return new PercentileRankData(0, '');
	}
}
