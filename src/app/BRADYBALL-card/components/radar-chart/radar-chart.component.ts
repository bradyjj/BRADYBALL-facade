import { Component, Input, ElementRef, SimpleChanges, OnChanges, AfterViewInit, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { RadarChartPlayerData, RadarChartDataPoint } from '../../models/radar-chart-player.model';
import { FontService } from '../../../../assets/fonts/font.service';
import { forkJoin } from 'rxjs';
import { BRADYBALLCardUtil } from '../../util/BRADYBALL-card.util';

@Component({
    selector: 'radar-chart',
    templateUrl: './radar-chart.component.html',
    styleUrls: ['./radar-chart.component.scss'],
})
export class RadarChartComponent implements OnInit, OnChanges, AfterViewInit {
    @Input() data!: RadarChartPlayerData;

    private svg: any;
    private titleGroup: any;
    private chartGroup: any;
    private margin = 100;
    private width = 800;
    private height = 800;
    private radius = Math.min(this.width, this.height) / 2 - this.margin;

    private helveticaNeueBase64: string = '';
    private courierNewBoldBase64: string = '';

    chartReady: boolean = false;

    private colorPalette: string[] = [];
    private radarAreaPath: string = '';
    private featureScales: { [key: string]: d3.ScaleLinear<number, number>; } = {};
    private angleStep: number = 0;

    constructor(private elementRef: ElementRef, private fontService: FontService, private BRADYBALLUtil: BRADYBALLCardUtil) { }

    ngOnInit(): void {
        this.defineColorPallette();
        forkJoin({
            helvetica: this.fontService.getBase64Font('assets/fonts/Helvetica Neue LT Std 55 Roman.woff'),
            courier: this.fontService.getBase64Font('assets/fonts/CourierNewPS-BoldMT.woff2')
        }).subscribe(result => {
            this.helveticaNeueBase64 = result.helvetica;
            this.courierNewBoldBase64 = result.courier;
            if (this.data) {
                this.createSvg();
                this.drawChart();
            }
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        console.log('RadarChart OnChanges:', changes);
        if (changes['data'] && this.data) {
            console.log('RadarChart Data:', this.data);
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

    private inlineFonts(): string {
        return `
            @font-face {
                font-family: 'Helvetica Neue LT Std';
                src: url(data:application/font-woff;charset=utf-8;base64,${this.helveticaNeueBase64}) format('woff');
            }
            @font-face {
                font-family: 'Courier New Bold';
                src: url(data:application/font-woff2;charset=utf-8;base64,${this.courierNewBoldBase64}) format('woff2');
                font-weight: bold;
            }
            text {
                font-family: 'Helvetica Neue LT Std', 'Courier New Bold';
            }
        `;
    }

    private defineColorPallette(): void {
        this.colorPalette = [
            this.BRADYBALLUtil.getCssVariableValue('--bb-brown-gold-color'),
            this.BRADYBALLUtil.getCssVariableValue('--bb-red-color'),
            this.BRADYBALLUtil.getCssVariableValue('--bb-dark-red-burgundy-color'),
            this.BRADYBALLUtil.getCssVariableValue('--bb-orange-color'),
            this.BRADYBALLUtil.getCssVariableValue('--bb-cream-off-white-color')
        ]
    }


    private createSvg(): void {
        d3.select(this.elementRef.nativeElement).select('svg').remove();
        this.svg = d3.select(this.elementRef.nativeElement)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        this.titleGroup = this.svg.append('g');
        this.chartGroup = this.svg.append('g')
            .attr('transform', `translate(${this.width / 2}, ${this.height / 2})`);

        this.inlineFonts();
    }

    saveSVG() {
        if (!this.helveticaNeueBase64 || !this.courierNewBoldBase64) {
            console.error('Fonts not loaded yet');
            return;
        }

        const svgNS = "http://www.w3.org/2000/svg";
        const newSvg = document.createElementNS(svgNS, "svg");
        newSvg.setAttribute('width', this.width.toString());
        newSvg.setAttribute('height', this.height.toString());
        newSvg.setAttribute('xmlns', "http://www.w3.org/2000/svg");

        // Clone the entire SVG content
        const svgContent = this.svg.node().cloneNode(true);
        newSvg.appendChild(svgContent);

        // Add inline fonts
        const styleElement = document.createElementNS(svgNS, "style");
        styleElement.textContent = this.inlineFonts() + `
        text {
            font-family: 'Helvetica Neue LT Std', 'Courier New Bold';
        }
    `;
        newSvg.insertBefore(styleElement, newSvg.firstChild);

        // Convert the SVG to a string
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(newSvg);

        // Add XML declaration
        svgString = '<?xml version="1.0" standalone="no"?>\n' + svgString;

        console.log('SVG string:', svgString); // Log the SVG string for debugging

        // Create a Blob with the SVG string
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });

        // Create a download link and trigger the download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(svgBlob);
        link.download = 'radar_chart.svg';
        link.click();
    }

    private drawChart(): void {
        if (!this.data || !this.data.dataPoints || this.data.dataPoints.length === 0) {
            console.error('No data available for radar chart');
            this.chartReady = false;
            return;
        }
        const dataPoints = this.data.dataPoints;
        const angleStep = (Math.PI * 2) / dataPoints.length;

        this.clearSvg();
        this.createVintageFilter();
        this.setBackground();
        this.recreateGroups();

        const featureScales = this.createFeatureScales(dataPoints);
        this.featureScales = featureScales;
        this.angleStep = (Math.PI * 2) / dataPoints.length;

        this.createRadarAreaMasks();
        this.drawAbstractSoccerPitch();

        this.createBlurFilters();
        this.drawCircularGrid();
        this.drawAxesAndLabels(dataPoints, angleStep, featureScales);
        this.createRandomGradient();
        this.drawDataArea(dataPoints, angleStep, featureScales);
        this.addDataPoints(dataPoints, angleStep, featureScales);
        this.addTitleAndInfo();
        this.moveChartDown();

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
        this.titleGroup = this.svg.append('g');
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
            .attr('stdDeviation', '0.75');

        const labelFilter = this.svg.append('defs')
            .append('filter')
            .attr('id', 'label-blur-filter');

        labelFilter.append('feGaussianBlur')
            .attr('in', 'SourceGraphic')
            .attr('stdDeviation', '0.4');
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

    private drawAxesAndLabels(dataPoints: RadarChartDataPoint[], angleStep: number, featureScales: { [key: string]: d3.ScaleLinear<number, number> }): void {
        dataPoints.forEach((point, index) => {
            const angle = index * angleStep;
            this.drawAxis(angle);
            this.drawScaleLabels(point, angle, featureScales);
            this.drawLabel(point, angle);
        });
    }

    private drawAxis(angle: number): void {
        const lineCoordinates = d3.pointRadial(angle, this.radius);
        this.chartGroup.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', lineCoordinates[0])
            .attr('y2', lineCoordinates[1])
            .attr('stroke', 'black');
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

            this.chartGroup.append('text')
                .attr('x', x)
                .attr('y', y)
                .text((point.scale * r).toFixed(1))
                .attr('font-size', `${randomSize}px`)
                .attr('font-family', "'Pinegrove'")
                .attr('fill', `black`)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .style('opacity', randomOpacity)
                .style('filter', 'url(#number-blur-filter)');
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
            .attr('font-size', '16px')
            .attr('font-family', "'Avro'")
            .attr('font-weight', 'bold')
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
            { offset: '0%', color: '#f8f5e3' },
            { offset: '20%', color: '#bf5700' },
            { offset: '40%', color: '#972828' },
            { offset: '60%', color: '#681e1e' },
            { offset: '70%', color: '#8B0000' },
            { offset: '80%', color: '#FF8C00' },
            { offset: '90%', color: '#8B4513' },
            { offset: '100%', color: '#405e9b' }
        ];

        colors.forEach(stop => {
            gradient.append('stop')
                .attr('offset', stop.offset)
                .attr('stop-color', stop.color)
                .attr('stop-opacity', 0.8);
        });

        this.addNoiseFilter();
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

    private drawDataArea(dataPoints: RadarChartDataPoint[], angleStep: number, featureScales: { [key: string]: d3.ScaleLinear<number, number> }): void {
        const area = d3.areaRadial<RadarChartDataPoint>()
            .angle((d, i) => i * angleStep)
            .innerRadius(0)
            .outerRadius(d => featureScales[d.key](d.value))
            .curve(d3.curveLinearClosed);

        this.chartGroup.append('path')
            .datum(dataPoints)
            .attr('d', area)
            .attr('fill', 'url(#vintageGradient)')
            .attr('stroke', 'black')
            .attr('stroke-width', 2);
    }

    private addDataPoints(dataPoints: RadarChartDataPoint[], angleStep: number, featureScales: { [key: string]: d3.ScaleLinear<number, number> }): void {
        dataPoints.forEach((point, index) => {
            const angle = index * angleStep;
            const [x, y] = d3.pointRadial(angle, featureScales[point.key](point.value));

            this.chartGroup.append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', 4)
                .attr('fill', 'black')
                .attr('stroke', 'black');
        });
    }

    private addTitleAndInfo(): void {
        this.titleGroup.append('text')
            .attr('x', this.width / 2 + 275)
            .attr('y', 35)
            .attr('text-anchor', 'middle')
            .attr('font-size', '18px')
            .attr('font-weight', 'bold')
            .attr('font-family', "'League Spartan'")
            .attr('fill', 'black')
            .text(`${this.data.player} - ${this.data.season}`);

        const infoText = `${this.data.position} | ${this.data.team} | ${this.data.league}`;
        this.titleGroup.append('text')
            .attr('x', this.width / 2 + 275)
            .attr('y', 55)
            .attr('text-anchor', 'middle')
            .attr('font-size', '14px')
            .attr('font-family', "'League Spartan'")
            .attr('fill', 'black')
            .text(infoText);
    }

    private createRadarAreaMasks(): void {
        if (!this.featureScales || !this.angleStep || !this.data) {
            console.error('Required properties are not set');
            return;
        }

        const radarArea = d3.areaRadial<RadarChartDataPoint>()
            .angle((d, i) => i * this.angleStep!)
            .innerRadius(0)
            .outerRadius(d => this.featureScales![d.key](d.value));

        const path = radarArea(this.data.dataPoints);
        this.radarAreaPath = path ? path : '';

        // Create a mask for the radar area
        const radarMask = this.svg.append('mask')
            .attr('id', 'radar-area-mask');

        radarMask.append('rect')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('fill', 'black');

        radarMask.append('path')
            .attr('d', this.radarAreaPath)
            .attr('fill', 'white');
    }

    private wobbleLine(x1: number, y1: number, x2: number, y2: number): string {
        const wobbleAmount = 2;
        let d = `M${x1},${y1}`;
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const steps = Math.floor(length / 10);
        for (let i = 1; i <= steps; i++) {
            const x = x1 + (x2 - x1) * (i / steps);
            const y = y1 + (y2 - y1) * (i / steps);
            const wobbleX = (Math.random() - 0.5) * wobbleAmount;
            const wobbleY = (Math.random() - 0.5) * wobbleAmount;
            d += ` L${x + wobbleX},${y + wobbleY}`;
        }
        return d;
    }

    private wobbleArc(centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number): string {
        const wobbleAmount = 2;
        let d = '';
        const steps = 20;
        for (let i = 0; i <= steps; i++) {
            const angle = startAngle + (endAngle - startAngle) * (i / steps);
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            const wobbleX = (Math.random() - 0.5) * wobbleAmount;
            const wobbleY = (Math.random() - 0.5) * wobbleAmount;
            d += (i === 0 ? 'M' : 'L') + `${x + wobbleX},${y + wobbleY}`;
        }
        return d;
    }

    private drawAbstractSoccerPitch(): void {
        const offWhiteColor = this.BRADYBALLUtil.getCssVariableValue('--bb-cream-off-white-color');
        const blackColor = '#000000';
        const lineOpacity = 0.6;
        const lineWidth = 2;
        const boxSpacing = .888;
        const boxScale = 1;

        const penaltyAreaWidth = this.radius * 0.4 * boxScale;
        const penaltyAreaHeight = this.radius * 0.8 * boxScale;
        const sixYardBoxWidth = penaltyAreaWidth * 0.4;
        const sixYardBoxHeight = penaltyAreaHeight * 0.4;
        const arcRadius = penaltyAreaHeight * 0.2;

        const bgGroup = this.svg.append('g')
            .attr('class', 'soccer-pitch-background')
            .attr('transform', `translate(${this.width / 2}, ${this.height / 2})`);

        // Draw penalty areas
        [-1, 1].forEach(direction => {
            const boxX = direction * this.radius * boxSpacing;

            // Penalty box
            this.drawWobblePath(bgGroup, [
                [boxX, -penaltyAreaHeight / 2],
                [boxX, penaltyAreaHeight / 2],
                [boxX - direction * penaltyAreaWidth, penaltyAreaHeight / 2],
                [boxX - direction * penaltyAreaWidth, -penaltyAreaHeight / 2],
                [boxX, -penaltyAreaHeight / 2]
            ], blackColor, lineWidth, lineOpacity);

            // 6-yard box
            this.drawWobblePath(bgGroup, [
                [boxX, -sixYardBoxHeight / 2],
                [boxX, sixYardBoxHeight / 2],
                [boxX - direction * sixYardBoxWidth, sixYardBoxHeight / 2],
                [boxX - direction * sixYardBoxWidth, -sixYardBoxHeight / 2],
                [boxX, -sixYardBoxHeight / 2]
            ], blackColor, lineWidth, lineOpacity);

            // Half circle (outside the penalty box, facing outward for both sides)
            this.drawWobbleArc(bgGroup,
                boxX - direction * penaltyAreaWidth,
                0,
                arcRadius,
                direction === -1 ? -Math.PI / 2 : Math.PI / 2,
                direction === -1 ? Math.PI / 2 : 3 * Math.PI / 2,
                blackColor,
                lineWidth,
                lineOpacity
            );
        });

        // Create a copy of the paths with black stroke for the radar area
        bgGroup.selectAll('path').clone()
            .attr('stroke', blackColor)
            .attr('stroke-opacity', 1)
            .attr('mask', 'url(#radar-area-mask)');

        // Apply the pitch mask to the original paths
        bgGroup.attr('mask', 'url(#pitch-mask)');
    }

    private drawWobblePath(group: d3.Selection<SVGGElement, unknown, null, undefined>, points: [number, number][], color: string, width: number, opacity: number): void {
        const d = points.reduce((acc, point, i, arr) => {
            if (i === 0) return `M${point[0]},${point[1]}`;
            return acc + this.wobbleLine(arr[i - 1][0], arr[i - 1][1], point[0], point[1]);
        }, '');

        group.append('path')
            .attr('d', d)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', width)
            .attr('stroke-opacity', opacity);
    }

    private drawWobbleArc(group: d3.Selection<SVGGElement, unknown, null, undefined>, centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number, color: string, width: number, opacity: number): void {
        group.append('path')
            .attr('d', this.wobbleArc(centerX, centerY, radius, startAngle, endAngle))
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', width)
            .attr('stroke-opacity', opacity);
    }

    private moveChartDown(): void {
        const chartTranslateY = 15;
        this.chartGroup.attr('transform', `translate(${this.width / 2}, ${this.height / 2 + chartTranslateY})`);
    }
}