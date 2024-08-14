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
    title?: string;
    information1?: string;
    information2?: string;
    rows: StatLineRow[];
}

export namespace StatLineData {
    export function createDefault(): StatLineData {
        return {
            player: '',
            title: 'RECENT CAREER PERFORMANCE',
            rows: []
        };
    }
}