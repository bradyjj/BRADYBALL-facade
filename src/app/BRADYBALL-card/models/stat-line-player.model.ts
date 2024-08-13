export interface StatLineDataPoint {
    key: string;
    label: string;
    value: string | number;
    color?: string;
}

export interface StatLineRow {
    season: string;
    dataPoints: StatLineDataPoint[];
}

export interface StatLineData {
    player: string;
    rows: StatLineRow[];
}

export namespace StatLineData {
    export function createDefault(): StatLineData {
        return {
            player: '',
            rows: []
        };
    }
}