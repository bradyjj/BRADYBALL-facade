import { Component, Input, ElementRef, SimpleChanges, OnChanges, AfterViewInit, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { RadarChartPlayerData, RadarChartDataPoint } from '../../models/radar-chart-player.model';
import { FontService } from '../../../../assets/fonts/font.service';
import { BRADYBALLCardUtil } from '../../util/BRADYBALL-card.util';

@Component({
    selector: 'radar-chart',
    templateUrl: './radar-chart.component.html',
    styleUrls: ['./radar-chart.component.scss'],
})
export class RadarChartComponent implements OnInit, OnChanges, AfterViewInit {
    @Input() data!: RadarChartPlayerData;

    private svg: any;
    private chartGroup: any;
    private margin = 100;
    private width = 800;
    private height = 800;
    private radius = Math.min(this.width, this.height) / 2 - this.margin;

    chartReady: boolean = false;

    private featureScales: { [key: string]: d3.ScaleLinear<number, number>; } = {};
    private angleStep: number = 0;

    private fonts: { [key: string]: string } = {};

    constructor(public elementRef: ElementRef, private fontService: FontService, private BRADYBALLUtil: BRADYBALLCardUtil) { }

    ngOnInit(): void {
        this.loadFonts();
        if (this.data) {
            this.createSvg();
            this.drawChart();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['data'] && this.data) {
            this.createSvg();
            this.drawChart();
        }
    }

    ngAfterViewInit() {
        if (this.data) {
            this.createSvg();
            this.drawChart();
        }
    }

    private loadFonts(): void {
        const fontFiles = [
            'pinegrove.woff2',
            'courier-prime-regular.woff2',
            'courier-prime-bold.woff2',
            'league-spartan-regular.woff2',
            'league-spartan-bold.woff2'
        ];

        this.fontService.loadFonts(fontFiles).subscribe(fonts => {
            this.fonts = fonts;
        });
    }

    private createSvg(): void {
        d3.select(this.elementRef.nativeElement).select('svg').remove();
        this.svg = d3.select(this.elementRef.nativeElement)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        this.chartGroup = this.svg.append('g')
            .attr('transform', `translate(${this.width / 2}, ${this.height / 2})`);
    }

    saveSVG(): void {
        const svgElement = this.elementRef.nativeElement.querySelector('svg');

        // Add a style element to the SVG
        const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        styleElement.textContent = `
            @font-face {
                font-family: 'Pinegrove';
                src: url(data:application/font-woff2;charset=utf-8;base64,${this.fonts['pinegrove.woff2']}) format('woff2');
                font-weight: 400 700;
                font-style: normal;
            }
            .bb-text-pinegrove { font-family: 'Pinegrove', sans-serif; }
            .bb-text-courier-prime { font-family: 'Courier Prime', monospace; }
            .bb-text-league-spartan { font-family: 'League Spartan', sans-serif; }
            .bb-text-bold { font-weight: bold; }
        `;
        svgElement.insertBefore(styleElement, svgElement.firstChild);

        this.BRADYBALLUtil.saveCombinedSVG([svgElement], 'radar_chart.svg', this.fonts);
    }

    private drawChart(): void {
        if (!this.data || !this.data.dataPoints || this.data.dataPoints.length === 0) {
            console.error('No data available for radar chart');
            this.chartReady = false;
            return;
        }
        this.featureScales = this.createFeatureScales(this.data.dataPoints);
        this.angleStep = (Math.PI * 2) / this.data.dataPoints.length;

        this.clearSvg();
        this.createVintageFilter();
        this.setBackground();
        this.recreateGroups();
        this.createBlurFilters();
        this.drawCircularGrid();
        this.createBaseGradient();
        this.drawDataArea(this.data.dataPoints);
        this.drawAxesAndLabels(this.data.dataPoints);

        this.chartReady = true;
    }

    private clearSvg(): void {
        this.svg.selectAll("*").remove();
    }

    private createVintageFilter(): void {
        const defs = this.svg.append('defs');
        const filter = defs.append('filter')
            .attr('id', 'vintage-filter');

        filter.append('feColorMatrix')
            .attr('type', 'matrix')
            .attr('values', '0.9 0.1 0.1 0 0 0.1 0.9 0.1 0 0 0.1 0.1 0.9 0 0 0 0 0 1 0');

        filter.append('feComponentTransfer')
            .selectAll('funcRGB')
            .data(['R', 'G', 'B'])
            .enter().append('feFunc' + 'RGB')
            .attr('type', 'linear')
            .attr('slope', '0.9')
            .attr('intercept', '0.1');

        this.chartGroup.attr('filter', 'url(#vintage-filter)');
    }

    private setBackground(): void {
        this.svg.append('rect')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('fill', 'none');
    }

    private recreateGroups(): void {
        this.chartGroup = this.svg.append('g')
            .attr('transform', `translate(${this.width / 2}, ${this.height / 2})`);
    }

    private createFeatureScales(dataPoints: RadarChartDataPoint[]): { [key: string]: d3.ScaleLinear<number, number> } {
        return dataPoints.reduce((scales, point) => {
            scales[point.key] = d3.scaleLinear()
                .domain([0, point.scale])
                .range([0, this.radius]);
            return scales;
        }, {} as { [key: string]: d3.ScaleLinear<number, number> });
    }

    private createBlurFilters(): void {
        const numberFilter = this.svg.append('defs')
            .append('filter')
            .attr('id', 'number-blur-filter');

        numberFilter.append('feGaussianBlur')
            .attr('in', 'SourceGraphic')
            .attr('stdDeviation', '.3');

        const labelFilter = this.svg.append('defs')
            .append('filter')
            .attr('id', 'label-blur-filter');

        labelFilter.append('feGaussianBlur')
            .attr('in', 'SourceGraphic')
            .attr('stdDeviation', '0.1');
    }

    private drawCircularGrid(): void {
        const circles = [0.2, 0.4, 0.6, 0.8, 1];
        circles.forEach((r, i) => {
            if (i === circles.length - 1) {
                this.drawSquiggle(r);
            } else {
                this.drawCircle(r);
            }
        });
    }

    private drawSquiggle(r: number): void {
        const squiggleRadius = this.radius * 1.05;
        const squigglePoints = 200;
        const squiggleData = Array.from({ length: squigglePoints }, (_, i) => {
            const angle = (i / squigglePoints) * Math.PI * 2;
            const noise = (Math.sin(angle * 20) + Math.sin(angle * 15) + Math.sin(angle * 10)) * (this.radius * 0.015);
            return [
                (squiggleRadius + noise) * Math.cos(angle),
                (squiggleRadius + noise) * Math.sin(angle)
            ];
        });

        const lineFunction = d3.line().curve(d3.curveBasisClosed);
        this.chartGroup.append('path')
            .attr('d', lineFunction(squiggleData as [number, number][]))
            .attr('stroke', 'black')
            .attr('stroke-width', 3)
            .attr('fill', 'none');
    }

    private drawCircle(r: number): void {
        this.chartGroup.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', this.radius * r)
            .attr('stroke', 'black')
            .attr('fill', 'none');
    }

    private drawAxesAndLabels(dataPoints: RadarChartDataPoint[]): void {
        dataPoints.forEach((point, index) => {
            const angle = index * this.angleStep;
            this.drawAxis(angle);
            this.drawScaleLabels(point, angle, this.featureScales);
            this.drawLabel(point, angle);
        });
    }

    private drawAxis(angle: number): void {
        const lineCoordinates = d3.pointRadial(angle, this.radius * 1.1);
        const squigglePoints = 100; // Number of points to create the squiggly effect
        const squiggleData = Array.from({ length: squigglePoints }, (_, i) => {
            const proportion = i / (squigglePoints - 1);
            const noise = (Math.sin(proportion * 20 * Math.PI) + Math.cos(proportion * 10 * Math.PI)) * 1.2;
            return [
                (proportion * lineCoordinates[0]) + noise,
                (proportion * lineCoordinates[1]) + noise
            ];
        });

        const lineFunction = d3.line().curve(d3.curveBasis);

        this.chartGroup.append('path')
            .attr('d', lineFunction(squiggleData as [number, number][]))
            .attr('stroke', 'black')
            .attr('stroke-width', () => Math.random() * .75 + 0.5) // Varying thickness for hand-drawn effect
            .attr('fill', 'none');
    }

    private drawScaleLabels(point: RadarChartDataPoint, angle: number, featureScales: { [key: string]: d3.ScaleLinear<number, number> }): void {
        const circles = [0.2, 0.4, 0.6, 0.8, 1];
        circles.forEach((r, circleIndex) => {
            // Randomly decide whether to draw this label if its not the first or last
            if (circleIndex !== circles.length - 1 && circleIndex !== 0) {
                const chanceToIncludeLabel = .8;
                if (Math.random() > chanceToIncludeLabel) {
                    return;
                }
            }

            const [x, y] = d3.pointRadial(angle, this.radius * r);
            let randomSize = this.getRandomSize(circleIndex);
            let baseOpacity = 0.8;
            const randomOpacity = Math.random() * 0.5 + baseOpacity;

            const text = this.chartGroup.append('text')
                .attr('x', x)
                .attr('y', y)
                .text((point.scale * r).toFixed(1))
                .attr('font-size', `${randomSize}px`)
                .attr('class', 'bb-text-pinegrove')
                .attr('fill', 'black')
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .style('opacity', randomOpacity)
                .style('filter', 'url(#number-blur-filter)');

            // Randomly apply bold weight to some labels
            if (Math.random() > 0.5) {
                text.classed('bb-text-bold', true);
            }
        });
    }

    private getRandomSize(circleIndex: number, numberOfCircles: number = 5): number {
        const outerCircleIndex = numberOfCircles - 1;
        const outerCircleSize = 18;

        const firstCircleLargerSizeProbability = 0.085;
        const regularLargerSizeProbability = 0.2;

        const smallerSizeMin = 15.5;
        const smallerSizeMax = 24;

        const largeSizes = [28, 30, 32];
        const firstCircleLargeSizes = [28, 29];

        if (circleIndex === outerCircleIndex) {
            return outerCircleSize;
        }
        else if (circleIndex === 0) {
            if (Math.random() < firstCircleLargerSizeProbability) {
                return firstCircleLargeSizes[Math.floor(Math.random() * firstCircleLargeSizes.length)];
            }
            else {
                return Math.random() * (smallerSizeMax - smallerSizeMin) + smallerSizeMin;
            }
        }
        else {
            if (Math.random() < regularLargerSizeProbability) {
                return largeSizes[Math.floor(Math.random() * largeSizes.length)];
            }
            else {
                return Math.random() * (smallerSizeMax - smallerSizeMin) + smallerSizeMin;
            }
        }
    }

    private drawLabel(point: RadarChartDataPoint, angle: number): void {
        const labelRadius = this.radius + 40;
        const labelAngle = angle - Math.PI / 2;
        const labelX = labelRadius * Math.cos(labelAngle);
        const labelY = labelRadius * Math.sin(labelAngle);

        this.chartGroup.append('text')
            .attr('x', labelX)
            .attr('y', labelY)
            .text(point.label)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('font-size', '20px')
            .attr('class', 'bb-text-courier-prime bb-text-extra-bold')
            .classed('bb-text-extra-bold', true)
            .attr('fill', 'black')
            .attr('transform', `rotate(${(angle * 180 / Math.PI)}, ${labelX}, ${labelY})`)
            .style('filter', 'url(#label-blur-filter)');
    }

    private createBaseGradient(): void {
        const gradient = this.svg.append('defs')
            .append('radialGradient')
            .attr('id', 'vintageGradient')
            .attr('cx', '50%')
            .attr('cy', '50%')
            .attr('r', '50%');

        const colors = [
            { offset: '0%', color: '#FFFFFF' },     // Bright white center
            { offset: '10%', color: '#FFF5E6' },    // Warm off-white
            { offset: '20%', color: '#FFD700' },    // Yellow
            { offset: '30%', color: '#FF4500' },    // Orange-red
            { offset: '48%', color: '#8B0000' },    // Dark red
            { offset: '50%', color: '#660000' },    // Very dark red
            { offset: '52%', color: '#000000' },    // Black circle
            { offset: '54%', color: '#660000' },    // Very dark red
            { offset: '56%', color: '#8B0000' },    // Dark red
            { offset: '65%', color: '#FF4500' },    // Orange-red
            { offset: '73%', color: '#FFD700' },    // Back to yellow (vibrant but worn)
            { offset: '79%', color: '#FF4500' },    // Orange-red
            { offset: '85%', color: '#8B0000' },    // Dark red again
            { offset: '90%', color: '#000000' },    // Thin black ring
            { offset: '92%', color: '#4AC6FF' },    // Vivid sky blue (from image)
            { offset: '96%', color: '#1E5AA8' },    // Medium blue (from image)
            { offset: '100%', color: '#0080FF' },   // Bright blue (from image)
        ];

        colors.forEach(stop => {
            gradient.append('stop')
                .attr('offset', stop.offset)
                .attr('stop-color', stop.color)
                .attr('stop-opacity', stop.offset === '80%' || stop.offset === '90%' ? .9 : 0.85);
        });

        this.addNoiseFilter();
        this.addTextureOverlay();
    }

    private addTextureOverlay(): void {
        const texture = this.svg.append('defs')
            .append('pattern')
            .attr('id', 'texturePattern')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', '100')
            .attr('height', '100');

        texture.append('rect')
            .attr('width', '100')
            .attr('height', '100')
            .attr('fill', 'url(#vintageGradient)');

        texture.append('filter')
            .attr('id', 'textureFilter')
            .append('feTurbulence')
            .attr('type', 'fractalNoise')
            .attr('baseFrequency', '0.01')
            .attr('numOctaves', '5');

        texture.append('rect')
            .attr('width', '100')
            .attr('height', '100')
            .attr('fill', 'transparent')
            .attr('filter', 'url(#textureFilter)')
            .attr('opacity', '0.3');
    }

    private createRandomGradient(type: 'defense' | 'attack' | 'mixed' = 'mixed'): void {
        const gradient = this.svg.append('defs')
            .append('radialGradient')
            .attr('id', 'vintageGradient')
            .attr('cx', '50%')
            .attr('cy', '50%')
            .attr('r', '50%');

        let baseColors;
        switch (type) {
            case 'defense':
                baseColors = ['#405e9b', '#681e1e', '#8B0000', '#972828'];
                break;
            case 'attack':
                baseColors = ['#ff5b00', '#FF8C00', '#bf5700', '#59c135'];
                break;
            default:
                baseColors = ['#f8f5e3', '#bf5700', '#972828', '#681e1e', '#8B0000', '#FF8C00', '#8B4513', '#405e9b'];
        }

        const colors = baseColors.map(color => ({
            offset: Math.random() * 100 + '%',
            color: color,
            opacity: Math.random() * 0.5 + 0.5
        })).sort((a, b) => parseFloat(a.offset) - parseFloat(b.offset));

        colors.forEach(stop => {
            gradient.append('stop')
                .attr('offset', stop.offset)
                .attr('stop-color', stop.color)
                .attr('stop-opacity', .8);
        });

        // Add noise
        this.addNoiseFilter();
    }

    private addNoiseFilter(): void {
        const filter = this.svg.append('defs')
            .append('filter')
            .attr('id', 'noise');

        filter.append('feTurbulence')
            .attr('type', 'fractalNoise')
            .attr('baseFrequency', '0.65')
            .attr('numOctaves', '3')
            .attr('stitchTiles', 'stitch');

        filter.append('feColorMatrix')
            .attr('type', 'saturate')
            .attr('values', '0');

        filter.append('feBlend')
            .attr('in', 'SourceGraphic')
            .attr('in2', 'noise')
            .attr('mode', 'multiply');
    }

    private drawDataArea(dataPoints: RadarChartDataPoint[]): void {
        const area = d3.areaRadial<RadarChartDataPoint>()
            .angle((d, i) => i * this.angleStep)
            .innerRadius(0)
            .outerRadius(d => this.featureScales[d.key](d.value))
            .curve(d3.curveLinearClosed);

        this.chartGroup.append('path')
            .datum(dataPoints)
            .attr('d', area)
            .attr('fill', 'url(#vintageGradient)')
            .attr('stroke', 'black')
            .attr('stroke-width', 2);
    }

}