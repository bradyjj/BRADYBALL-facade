import { Component, Input, ElementRef, SimpleChanges, OnChanges, AfterViewInit, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { RadarChartPlayerData, RadarChartDataPoint } from '../../models/radar-chart-player.model';
import { FontService } from '../../../../assets/fonts/font.service';
import { BRADYBALLCardUtil } from '../../util/player-analysis.util';

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

    public chartReady: boolean = false;
    fontsLoaded: boolean = false;

    private featureScales: { [key: string]: d3.ScaleLinear<number, number>; } = {};
    private angleStep: number = 0;

    private fonts: { [key: string]: string } = {};

    private readonly CREAM_COLOR;

    constructor(public elementRef: ElementRef, private fontService: FontService, private BRADYBALLUtil: BRADYBALLCardUtil) {
        this.CREAM_COLOR = this.BRADYBALLUtil.getCssVariableValue('--bb-cream-color');
    }

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

        this.fontService.loadFonts(fontFiles).subscribe(
            fonts => {
                this.fonts = fonts;
                this.fontsLoaded = true;
                if (this.data) {
                    this.createSvg();
                    this.drawChart();
                }
            },
            error => {
                console.error('Error loading fonts:', error);
                if (this.data) {
                    this.createSvg();
                    this.drawChart();
                }
            }
        );
    }

    private createSvg(): void {
        d3.select(this.elementRef.nativeElement).select('svg').remove();
        this.svg = d3.select(this.elementRef.nativeElement.querySelector('.radar-chart'))
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');
    
        this.chartGroup = this.svg.append('g')
            .attr('transform', `translate(${this.width / 2}, ${this.height / 2})`);
    }

    public saveSVG(): void {
        const svgElement = this.elementRef.nativeElement.querySelector('svg');
        if (!svgElement) {
            console.error('SVG element not found');
            return;
        }
    
        // Clone the SVG to avoid modifying the original
        const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    
        // Set basic SVG attributes for higher resolution
        const scale = 4;
        const width = this.width * scale;
        const height = this.height * scale;

        clonedSvg.setAttribute('width', `${width}`);
        clonedSvg.setAttribute('height', `${height}`);
        clonedSvg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
        clonedSvg.style.backgroundColor = 'transparent';
        clonedSvg.setAttribute('background-color', 'transparent');
    
        // Remove the background rectangle
        clonedSvg.querySelectorAll('rect').forEach(rect => {
            if (rect.getAttribute('width') === `${this.width}` && 
                rect.getAttribute('height') === `${this.height}` && 
                rect.getAttribute('fill') === 'none') {
                rect.remove();
            }
        });
    
        // Add font definitions and styles
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = this.getFontDefinitions();
        clonedSvg.insertBefore(defs, clonedSvg.firstChild);
    
        // Apply inline styles to text elements
        clonedSvg.querySelectorAll('text').forEach((textElement: SVGTextElement) => {
            this.applyInlineStyles(textElement);
        });
    
        // Serialize the SVG
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(clonedSvg);
    
        // Create a Blob with the SVG content
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    
        // Create a download link and trigger the download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'radar_chart.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    private getFontDefinitions(): string {
        return `
            <style>
                @font-face {
                    font-family: 'Pinegrove';
                    src: url(data:application/font-woff2;charset=utf-8;base64,${this.fonts['pinegrove.woff2']}) format('woff2');
                    font-weight: 400 700;
                    font-style: normal;
                }
                @font-face {
                    font-family: 'Courier Prime';
                    src: url(data:application/font-woff2;charset=utf-8;base64,${this.fonts['courier-prime-regular.woff2']}) format('woff2');
                    font-weight: normal;
                    font-style: normal;
                }
                @font-face {
                    font-family: 'Courier Prime';
                    src: url(data:application/font-woff2;charset=utf-8;base64,${this.fonts['courier-prime-bold.woff2']}) format('woff2');
                    font-weight: bold;
                    font-style: normal;
                }
                @font-face {
                    font-family: 'League Spartan';
                    src: url(data:application/font-woff2;charset=utf-8;base64,${this.fonts['league-spartan-regular.woff2']}) format('woff2');
                    font-weight: normal;
                    font-style: normal;
                }
                @font-face {
                    font-family: 'League Spartan';
                    src: url(data:application/font-woff2;charset=utf-8;base64,${this.fonts['league-spartan-bold.woff2']}) format('woff2');
                    font-weight: bold;
                    font-style: normal;
                }
                :root {
                    --bb-black-color: #000000;
                    --bb-white-color: #ffffff;
                    --bb-brown-gold-color: #b07c29;
                    --bb-red-color: #972828;
                    --bb-red-card-color: #ad563b;
                    --bb-dark-red-burgundy-color: #681e1e;
                    --bb-orange-color: #ff5b00;
                    --bb-blue-color: #405e9b;
                    --bb-blue-card-color: #3a85c7;
                    --bb-cream-off-white-color: #f8f5e3;
                    --bb-cream-color: #ded2a2;
                    --bb-green-color: #59c135;
                }
                .bb-text-bold { font-weight: bold; }
                .bb-text-semibold { font-weight: 600; }
                .bb-text-medium { font-weight: 500; }
                .bb-text-extra-bold { font-weight: 800; }
                .bb-text-black { font-weight: 900; }
                .bb-text-pinegrove { font-family: 'Pinegrove', sans-serif; color: var(--bb-black-color); }
                .bb-text-courier-prime { font-family: 'Courier Prime', monospace; color: var(--bb-black-color); }
                .bb-text-league-spartan { font-family: 'League Spartan', sans-serif; color: var(--bb-black-color); }
            </style>
        `;
    }

    private applyInlineStyles(textElement: SVGTextElement): void {
        const classList = Array.from(textElement.classList);
        let fontFamily = 'sans-serif';
        let fontWeight = 'normal';

        if (classList.includes('bb-text-pinegrove')) {
            fontFamily = 'Pinegrove, sans-serif';
        } else if (classList.includes('bb-text-courier-prime')) {
            fontFamily = 'Courier Prime, monospace';
        } else if (classList.includes('bb-text-league-spartan')) {
            fontFamily = 'League Spartan, sans-serif';
        }

        if (classList.includes('bb-text-bold')) {
            fontWeight = 'bold';
        } else if (classList.includes('bb-text-semibold')) {
            fontWeight = '600';
        } else if (classList.includes('bb-text-medium')) {
            fontWeight = '500';
        } else if (classList.includes('bb-text-extra-bold')) {
            fontWeight = '800';
        } else if (classList.includes('bb-text-black')) {
            fontWeight = '900';
        }

        textElement.style.fontFamily = fontFamily;
        textElement.style.fontWeight = fontWeight;
        textElement.style.color = '#000000';
    }

    private drawChart(): void {
        if (!this.data || !this.data.dataPoints || this.data.dataPoints.length === 0) {
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
        this.createGradient();
        this.drawDataArea(this.data.dataPoints);
        this.drawCircularGrid();
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
                this.drawSquiggle();
            } else {
                this.drawCircle(r);
            }
        });
    }

    private drawSquiggle(): void {
        const squiggleRadius = this.radius * 1.06 + 5;
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
            .attr('stroke-width', 4)
            .attr('fill', 'none');
    }

    private drawCircle(r: number): void {
        this.chartGroup.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', this.radius * r)
            .attr('stroke', 'black')
            .attr('stroke-width', 1.5)
            .attr('fill', 'none')
            .style('pointer-events', 'none');
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
            .attr('stroke-width', () => Math.random() * .8 + 0.5) // Varying thickness for hand-drawn effect
            .attr('fill', 'none');
    }

    private drawScaleLabels(point: RadarChartDataPoint, angle: number, featureScales: { [key: string]: d3.ScaleLinear<number, number> }): void {
        const circles = [0.2, 0.4, 0.6, 0.8, 1];
        circles.forEach((r, circleIndex) => {
            const [x, y] = d3.pointRadial(angle, this.radius * r);
            let randomSize = this.getRandomSize(circleIndex);
            let baseOpacity = 0.8;
            const randomOpacity = Math.random() * 0.5 + baseOpacity;

            // Define stroke size range
            const minStrokeWidth = 0.5;
            const maxStrokeWidth = 2;
            const randomStrokeWidth = Math.random() * (maxStrokeWidth - minStrokeWidth) + minStrokeWidth;

            // Add a small vertical offset
            const verticalOffset = randomSize * 0.3; // Adjust this value as needed

            const text = this.chartGroup.append('text')
                .attr('x', x)
                .attr('y', y + verticalOffset) // Add the vertical offset here
                .text((point.scale * r).toFixed(1))
                .attr('font-size', `${randomSize}px`)
                .attr('class', 'bb-text-pinegrove')
                .attr('fill', 'black')
                .attr('stroke', 'black')
                .attr('stroke-width', randomStrokeWidth)
                .attr('text-anchor', 'middle')
                .style('opacity', randomOpacity);

            // Fine-tune vertical alignment if needed
            text.each(function (this: SVGTextElement) {
                const bbox = this.getBBox();
                const dy = (bbox.height / 2) * 0.20; // Adjust this multiplier as needed
                d3.select(this).attr('dy', dy);
            });
        });
    }

    private getRandomSize(circleIndex: number, numberOfCircles: number = 5): number {
        const outerCircleIndex = numberOfCircles - 1;
        const outerCircleSize = 30;

        const firstCircleLargerSizeProbability = 0.1;
        const regularLargerSizeProbability = 0.2;

        const smallerSizeMin = 22;
        const smallerSizeMax = 27;

        const largeSizes = [30, 31, 32, 33];
        const firstCircleLargeSizes = [28, 29, 30];

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
        const labelRadius = this.radius + 60;
        const labelAngle = angle - Math.PI / 2;
        const labelX = labelRadius * Math.cos(labelAngle);
        const labelY = labelRadius * Math.sin(labelAngle);

        const fontSize = 24;

        // Draw the chalk box first
        this.drawChalkBox(labelX, labelY, point.label, fontSize, angle);

        // Create a group for the text and apply rotation
        const textGroup = this.chartGroup.append('g')
            .attr('transform', `translate(${labelX}, ${labelY}) rotate(${(angle * 180 / Math.PI)})`);

        // Now draw the text
        const textElement = textGroup.append('text')
            .attr('x', 0)
            .attr('y', 0)
            .text(point.label)
            .attr('font-size', `${fontSize}px`)
            .attr('class', 'bb-text-courier-prime bb-text-bold')
            .attr('font-weight', 'bold')
            .attr('fill', this.CREAM_COLOR)
            .attr('text-anchor', 'middle')
            .attr('text-rendering', 'geometricPrecision');

        const bbox = textElement.node().getBBox();
        textElement.attr('y', -bbox.height + 45 / 2 + fontSize / 2);
    }

    private createGradient(): void {
        const gradient = this.svg.append('defs')
            .append('radialGradient')
            .attr('id', 'vintageGradient')
            .attr('cx', '50%')
            .attr('cy', '50%')
            .attr('fx', '50%')
            .attr('fy', '50%')
            .attr('r', '50%')
            .attr('spreadMethod', 'pad');

        const colors = [
            { offset: '0%', color: '#FFFFFF' },     // Pure white
            { offset: '10%', color: '#FFF5E6' },    // Very light peachy white
            { offset: '20%', color: '#FFD700' },    // Golden yellow
            { offset: '30%', color: '#FF4500' },    // Vermillion/Orange-red
            { offset: '49%', color: '#8B0000' },    // Dark crimson red
            { offset: '50%', color: '#000000' },    // Pure black
            { offset: '55%', color: '#8B0000' },    // Dark crimson red
            { offset: '62%', color: '#FF4500' },    // Vermillion/Orange-red
            { offset: '69%', color: '#FFD700' },    // Golden yellow
            { offset: '70%', color: '#000000' },    // Pure black
            { offset: '71%', color: '#000080' },    // Navy blue
            { offset: '73%', color: '#0F6DD4' },    // Medium cerulean blue
            { offset: '80%', color: '#0080FF' },    // Bright azure blue
            { offset: '90%', color: '#4AC6FF' },    // Light sky blue
            { offset: '95%', color: '#7AD7FF' },    // Pale sky blue
            { offset: '100%', color: '#4AC6FF' },   // Light sky blue
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

        // Create a group for the data area
        const dataAreaGroup = this.chartGroup.append('g')
            .attr('class', 'data-area');

        // Create a clip path for the data area
        const clipPathId = 'dataAreaClip';
        const clipPath = this.svg.select('defs').append('clipPath')
            .attr('id', clipPathId);

        clipPath.append('path')
            .datum(dataPoints)
            .attr('d', area);

        // Create a full circle background with the gradient
        dataAreaGroup.append('circle')
            .attr('r', this.radius)
            .attr('fill', 'url(#vintageGradient)')
            .attr('clip-path', `url(#${clipPathId})`);

        // Draw the actual data area outline on top
        dataAreaGroup.append('path')
            .datum(dataPoints)
            .attr('d', area)
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', 3);
    }

    private drawChalkBox(x: number, y: number, text: string, fontSize: number, angle: number): void {
        const tempText = this.chartGroup.append('text')
            .attr('x', x)
            .attr('y', y)
            .text(text)
            .attr('font-size', `${fontSize}px`)
            .attr('text-anchor', 'middle')

        const bbox = tempText.node().getBBox();
        tempText.remove();

        const boxWidth = bbox.width + 15 * 2;
        const boxHeight = bbox.height + 5 * 2;

        const strokeGroup = this.chartGroup.append('g')
            .attr('transform', `rotate(${(angle * 180 / Math.PI)}, ${x}, ${y})`);

        // Create a simple rectangle with a rough edge effect
        strokeGroup.append('rect')
            .attr('x', x - boxWidth / 2)
            .attr('y', y - boxHeight / 2)
            .attr('width', boxWidth)
            .attr('height', boxHeight)
            .attr('fill', 'black')
            .attr('stroke', 'none')
            .attr('shape-rendering', 'geometricPrecision');
    }

}