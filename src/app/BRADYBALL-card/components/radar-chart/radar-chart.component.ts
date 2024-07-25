import { Component, Input, OnInit, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'radar-chart',
    templateUrl: './radar-chart.component.html',
    styleUrls: ['./radar-chart.component.scss'],
})
export class RadarChartComponent implements OnInit {
    @Input() data: any[] = [];

    response: any = {
        "data": [
            {
                "PlayerName": "Kylian Mbappé",
                "League": "FRA-Ligue 1",
                "Team": "Paris S-G",
                "Nation": "FRA",
                "Position": "FW",
                "Age": 25,
                "Born": 1998,
                "MatchesPlayed": 29,
                "MinutesPlayed": 2158,
                "90sPlayed": 24,
                "ExpectedAssistsP90": 0.24,
                "NonPenExpectedGoalsP90": 0.6,
                "NonPenGoalsP90": 0.88,
                "ShotsOnTargetP90": 2.09,
                "ShotsP90": 4.67,
                "AerialPct": 0,
                "ShotCreatingActionsP90": 4.04,
                "ProgPassesP90": 5.08,
                "BallWonP90": 0.12,
                "SuccessfulTakeOnsP90": 2.54,
                "TakeOnPct": 45.9
            }
        ]
    }

    private svg: any;
    private margin = 50;
    private width = 500;
    private height = 500;
    private radius = Math.min(this.width, this.height) / 2 - this.margin;
    private color = d3.scaleOrdinal(d3.schemeCategory10);

    constructor(private elementRef: ElementRef) { }

    ngOnInit() {
        if (this.data.length === 0 && this.response.data.length > 0) {
            this.data = this.response.data;
        }
        this.createSvg();
        this.drawChart();
    }

    private createSvg(): void {
        this.svg = d3.select(this.elementRef.nativeElement)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .append('g')
            .attr('transform', `translate(${this.width / 2},${this.height / 2})`);
    }

    private drawChart(): void {
        const features = [
            "ExpectedAssistsP90", "NonPenExpectedGoalsP90", "NonPenGoalsP90",
            "ShotsOnTargetP90", "ShotsP90", "AerialPct", "ShotCreatingActionsP90",
            "ProgPassesP90", "BallWonP90", "SuccessfulTakeOnsP90", "TakeOnPct"
        ];

        // Helper function to check if a value is a valid number
        const isValidNumber = (value: any): value is number =>
            typeof value === 'number' && !isNaN(value) && isFinite(value);

        const radialScale = d3.scaleLinear()
            .domain([0, d3.max(this.data, d =>
                Math.max(...features.map(f => isValidNumber(d[f]) ? d[f] : 0))
            ) || 1]) // Use 1 as fallback if all values are invalid
            .range([0, this.radius]);

        const angleScale = d3.scalePoint()
            .range([0, Math.PI * 2])
            .domain(features);

        // draw circular grid
        const circles = [0.2, 0.4, 0.6, 0.8, 1];
        circles.forEach(r => {
            this.svg.append('circle')
                .attr('cx', 0)
                .attr('cy', 0)
                .attr('r', radialScale(r))
                .attr('stroke', 'gray')
                .attr('fill', 'none');
        });

        // draw axis
    features.forEach(f => {
            const angle = angleScale(f);
            const lineCoordinates = d3.pointRadial(angle, this.radius);
            this.svg.append('line')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', lineCoordinates[0])
                .attr('y2', lineCoordinates[1])
                .attr('stroke', 'gray');

            const labelCoordinates = d3.pointRadial(angle, this.radius + 20);
            this.svg.append('text')
                .attr('x', labelCoordinates[0])
                .attr('y', labelCoordinates[1])
                .text(f)
                .attr('text-anchor', 'middle');
        });

        // draw data
        const line = d3.lineRadial()
            .angle(d => angleScale(d.axis))
            .radius(d => radialScale(d.value))
            .curve(d3.curveLinearClosed);

        this.data.forEach((d, i) => {
            const dataPoints = features.map(f => ({ axis: f, value: d[f] }));

            this.svg.append('path')
                .datum(dataPoints)
                .attr('d', line)
                .attr('stroke', this.color(i.toString()))
                .attr('fill', this.color(i.toString()))
                .attr('fill-opacity', 0.3);
        });
    }
}