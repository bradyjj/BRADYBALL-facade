import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-radar-chart',
    templateUrl: './radar-chart.component.html',
    styleUrls: ['./radar-chart.component.scss'],
    standalone: true
})
export class RadarChartComponent implements OnInit {
    data: any[] = [];

    constructor() { }

    async ngOnInit(): Promise<void> {
        
    }

    createChart(data: any[]): void {

    }
}