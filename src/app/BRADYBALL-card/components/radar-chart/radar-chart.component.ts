import { Component, Input, ElementRef, SimpleChanges, OnChanges } from '@angular/core';
import * as d3 from 'd3';
import { RadarChartPlayerData, RadarChartDataPoint } from '../../models/radar-chart-player.model';

@Component({
    selector: 'radar-chart',
    templateUrl: './radar-chart.component.html',
    styleUrls: ['./radar-chart.component.scss'],
})
export class RadarChartComponent implements OnChanges {
    @Input() data!: RadarChartPlayerData;

    private svg: any;
    private margin = 100;
    private width = 800;
    private height = 800;
    private radius = Math.min(this.width, this.height) / 2 - this.margin;

    chartReady: boolean = false;

    constructor(private elementRef: ElementRef) { }

    ngOnChanges(changes: SimpleChanges) {
        console.log('RadarChart OnChanges:', changes);
        if (changes['data'] && this.data) {
            console.log('RadarChart Data:', this.data);
            this.createSvg();
            this.drawChart();
        }
    }

    private createSvg(): void {
        d3.select(this.elementRef.nativeElement).select('svg').remove();
        this.svg = d3.select(this.elementRef.nativeElement)
            .append('svg')
        this.svg = d3.select(this.elementRef.nativeElement)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .append('g')
            .attr('transform', `translate(${this.width / 2},${this.height / 2})`);
    }

    private drawChart(): void {
        if (!this.data || !this.data.dataPoints || this.data.dataPoints.length === 0) {
            console.error('No data available for radar chart');
            this.chartReady = false;
            return;
        }
        const dataPoints = this.data.dataPoints;
        const angleStep = (Math.PI * 2) / dataPoints.length;

        // Create scales for each feature
        const featureScales = dataPoints.reduce((scales, point) => {
            scales[point.key] = d3.scaleLinear()
                .domain([0, point.scale])
                .range([0, this.radius]);
            return scales;
        }, {} as { [key: string]: d3.ScaleLinear<number, number> });

        // Draw circular grid
        const circles = [0.2, 0.4, 0.6, 0.8, 1];
        circles.forEach(r => {
            this.svg.append('circle')
                .attr('cx', 0)
                .attr('cy', 0)
                .attr('r', this.radius * r)
                .attr('stroke', 'lightgray')
                .attr('fill', 'none');

            // Add scale labels
            this.svg.append('text')
                .attr('x', 5)
                .attr('y', -this.radius * r)
                .text(r * 100 + '%')
                .attr('font-size', '12px')
                .attr('fill', 'gray');
        });

        // Draw axes and labels
        dataPoints.forEach((point, index) => {
            const angle = index * angleStep;
            const lineCoordinates = d3.pointRadial(angle, this.radius);
            this.svg.append('line')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', lineCoordinates[0])
                .attr('y2', lineCoordinates[1])
                .attr('stroke', 'gray');

            const labelRadius = this.radius + 40;
            const labelAngle = angle - Math.PI / 2;
            const labelX = labelRadius * Math.cos(labelAngle);
            const labelY = labelRadius * Math.sin(labelAngle);

            this.svg.append('text')
                .attr('x', labelX)
                .attr('y', labelY)
                .text(point.label)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .attr('font-size', '14px')
                .attr('font-family', 'Courier New Bold')
                .attr('font-weight', 'bold')
                .attr('fill', 'var(--bb-black-color)')
                .attr('transform', `rotate(${(angle * 180 / Math.PI)}, ${labelX}, ${labelY})`);
        });

        // Draw data
        const line = d3.lineRadial<RadarChartDataPoint>()
            .angle((d, i) => i * angleStep)
            .radius(d => featureScales[d.key](d.value))
            .curve(d3.curveLinearClosed);

        this.svg.append('path')
            .datum(dataPoints)
            .attr('d', line)
            .attr('stroke', dataPoints[0].color)
            .attr('fill', dataPoints[0].color)
            .attr('fill-opacity', 0.3);

        // Add title with player name and season
        this.svg.append('text')
            .attr('x', 0)
            .attr('y', -this.height / 2 + 20)
            .attr('text-anchor', 'middle')
            .attr('font-size', '18px')
            .attr('font-weight', 'bold')
            .text(`${this.data.player} - ${this.data.season}`);

        // Add additional player info
        const infoText = `${this.data.position} | ${this.data.team} | ${this.data.league}`;
        this.svg.append('text')
            .attr('x', 0)
            .attr('y', -this.height / 2 + 45)
            .attr('text-anchor', 'middle')
            .attr('font-size', '14px')
            .text(infoText);

        this.chartReady = true;
    }
}