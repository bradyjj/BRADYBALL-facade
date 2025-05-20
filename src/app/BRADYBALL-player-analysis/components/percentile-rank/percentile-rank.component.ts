import { Component, Input, ElementRef, OnInit, OnChanges, AfterViewInit, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import { FontService } from '../../../../assets/fonts/font.service';
import { BRADYBALLCardUtil } from '../../util/player-analysis.util';
import { PercentileRankData } from '../../models/percentile-rank.model';

@Component({
    selector: 'percentile-rank',
    templateUrl: './percentile-rank.component.html',
    styleUrls: ['./percentile-rank.component.scss']
})
export class PercentileRankComponent implements OnInit, OnChanges, AfterViewInit {
    @Input() data?: PercentileRankData;

    private svg: any;
    private width = 800;
    private height = 300;

    public chartReady: boolean = false;
    fontsLoaded: boolean = false;

    private readonly CREAM_COLOR;
    private readonly RED_COLOR;
    private readonly BLACK_COLOR;
    private readonly WHITE_COLOR;
    private readonly YELLOW_COLOR;
    private readonly DIGITAL_COLOR = '#ffffff';

    private fonts: { [key: string]: string } = {};

    constructor(
        public elementRef: ElementRef,
        private fontService: FontService,
        private BRADYBALLUtil: BRADYBALLCardUtil
    ) {
        this.CREAM_COLOR = this.BRADYBALLUtil.getCssVariableValue('--bb-cream-color');
        this.RED_COLOR = this.BRADYBALLUtil.getCssVariableValue('--bb-red-card-color');
        this.BLACK_COLOR = this.BRADYBALLUtil.getCssVariableValue('--bb-black-color');
        this.WHITE_COLOR = this.BRADYBALLUtil.getCssVariableValue('--bb-white-color');
        this.YELLOW_COLOR = this.BRADYBALLUtil.getCssVariableValue('--bb-pale-yellow');
    }

    ngOnInit(): void {
        this.loadFonts();
        if (this.data) {
            this.createSvg();
            this.drawChart();
        }  
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data'] && this.data) {
            this.createSvg();
            this.drawChart();
        }
    }

    ngAfterViewInit(): void {
        if (this.data) {
            this.createSvg();
            this.drawChart();
        }
    }

    private loadFonts(): void {
        const fontFiles = [
            'league-spartan-regular.woff2',
            'league-spartan-bold.woff2',
            'TX-02-Regular.woff2',
            'TX-02-Bold.woff2',
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
        this.svg = d3.select(this.elementRef.nativeElement.querySelector('.gauge-container'))
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');
    }

    public saveSVG(): void {
        const svgElement = this.elementRef.nativeElement.querySelector('svg');
        if (!svgElement) {
            console.error('SVG element not found');
            return;
        }

        // Clone the SVG
        const clonedSvg = svgElement.cloneNode(true) as SVGElement;

        // Set basic SVG attributes for higher resolution
        const scale = 4;
        clonedSvg.setAttribute('width', `${this.width * scale}`);
        clonedSvg.setAttribute('height', `${this.height * scale}`);
        clonedSvg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
        clonedSvg.style.backgroundColor = 'transparent';
        clonedSvg.setAttribute('background-color', 'transparent'); // Ensure transparency

        // Create fixed font definitions that handle the Berkeley Mono/TX-02 mapping
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = this.getFontDefinitions();
        clonedSvg.insertBefore(defs, clonedSvg.firstChild);

        // Collect all filter ids used in the SVG
        const usedFilterIds = new Set<string>();
        const elementsWithFilters = clonedSvg.querySelectorAll('[filter]');
        elementsWithFilters.forEach((el) => {
            const filterAttr = el.getAttribute('filter');
            if (filterAttr && filterAttr.startsWith('url(#')) {
                // Extract ID from url(#filterId)
                const filterId = filterAttr.substring(5, filterAttr.length - 1);
                usedFilterIds.add(filterId);
            }
        });

        // Add necessary filter definitions
        const missingFilters = [
            'innerShadow', 'distressedEdges', 'outerRimShadow',
            'blur1px', 'enhancedNeedleGlow', 'displayGlow',
            'stickyNoteTextShadow' // Add the sticky note text shadow filter
        ];

        // TypeScript safety: defs is guaranteed to exist at this point
        const defElement = defs;
        missingFilters.forEach(filterId => {
            if (usedFilterIds.has(filterId) && !defElement.querySelector(`#${filterId}`)) {
                this.createFilterDirectly(defElement, filterId);
            }
        });

        this.applyCorrectFontAttributes(clonedSvg);

        this.enhanceStickyNoteForExport(clonedSvg);

        this.postProcessSpecificElements(clonedSvg);

        // Serialize to string with proper XML declaration
        const serializer = new XMLSerializer();
        let svgString = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    ${serializer.serializeToString(clonedSvg)}`;

        // Save file with corrected SVG string
        this.BRADYBALLUtil.saveSVGToFile(svgString, 'percentile_rank.svg');
    }

    private enhanceStickyNoteForExport(svgElement: SVGElement): void {
        // Find all sticky note text elements
        const stickyNoteTexts = svgElement.querySelectorAll('.sticky-note-text, .sticky-note-shadow');

        // Enhance each text element with proper styling
        stickyNoteTexts.forEach((textElement) => {
            const svgTextElement = textElement as SVGTextElement;
            const isShadow = svgTextElement.classList.contains('sticky-note-shadow');

            // Set explicit font attributes
            svgTextElement.style.fontFamily = "'League Spartan', sans-serif";
            svgTextElement.setAttribute('font-family', "'League Spartan', sans-serif");
            svgTextElement.style.fontWeight = 'bold';
            svgTextElement.setAttribute('font-weight', 'bold');

            // Set proper fill color
            if (isShadow) {
                svgTextElement.style.fill = "rgba(0,0,0,0.35)";
                svgTextElement.setAttribute('fill', 'rgba(0,0,0,0.35)');
                // Apply filter if it exists
                const filter = svgTextElement.getAttribute('filter');
                if (filter) {
                    svgTextElement.style.filter = filter;
                }
            } else {
                svgTextElement.style.fill = this.BLACK_COLOR;
                svgTextElement.setAttribute('fill', this.BLACK_COLOR);
            }

            // Explicitly set text rendering for better font display
            svgTextElement.setAttribute('text-rendering', 'geometricPrecision');
            textElement.setAttribute('text-rendering', 'geometricPrecision');
        });
    }

    // Add this to your createFilterDirectly method to include the sticky note text shadow
    private createFilterDirectly(defs: Element, filterId: string): void {
        switch (filterId) {
            // ... existing cases ...

            case 'stickyNoteTextShadow':
                // Create text shadow filter specifically for sticky note
                const textShadowFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
                textShadowFilter.setAttribute('id', 'stickyNoteTextShadow');
                textShadowFilter.setAttribute('x', '-20%');
                textShadowFilter.setAttribute('y', '-20%');
                textShadowFilter.setAttribute('width', '140%');
                textShadowFilter.setAttribute('height', '140%');

                const feDropShadow = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
                feDropShadow.setAttribute('dx', '1');
                feDropShadow.setAttribute('dy', '1');
                feDropShadow.setAttribute('stdDeviation', '0.5');
                feDropShadow.setAttribute('flood-opacity', '0.2');
                feDropShadow.setAttribute('flood-color', '#000000');

                textShadowFilter.appendChild(feDropShadow);
                defs.appendChild(textShadowFilter);
                break;

            // ... other cases ...
        }
    }

    private getFontDefinitions(): string {
        return `
            <style>
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
                
                /* TX-02 fonts with proper naming to match CSS */
                @font-face {
                    font-family: 'TX-02';
                    src: url(data:application/font-woff2;charset=utf-8;base64,${this.fonts['TX-02-Regular.woff2']}) format('woff2');
                    font-weight: normal;
                    font-style: normal;
                }
                @font-face {
                    font-family: 'TX-02';
                    src: url(data:application/font-woff2;charset=utf-8;base64,${this.fonts['TX-02-Bold.woff2']}) format('woff2');
                    font-weight: bold;
                    font-style: normal;
                }
                
                /* Color Variables */
                :root {
                    --bb-cream-color: ${this.CREAM_COLOR};
                    --bb-red-card-color: ${this.RED_COLOR};
                    --bb-black-color: ${this.BLACK_COLOR};
                    --bb-white-color: ${this.WHITE_COLOR};
                    --bb-pale-yellow: ${this.YELLOW_COLOR};
                }
                
                .bb-text-bold { font-weight: bold }
                .bb-text-berkeley-mono { font-family: 'TX-02', 'Berkeley Mono', monospace; color: var(--bb-white-color); }
                .bb-text-league-spartan { font-family: 'League Spartan', sans-serif; color: var(--bb-black-color); }

                /* Ensure all text has proper rendering */
                text {
                    text-rendering: geometricPrecision;
                    shape-rendering: geometricPrecision;
                }
                
                /* Special selection for tick labels and digital display */
                .ticks text {
                    font-family: 'TX-02', 'Berkeley Mono', monospace !important;
                    fill: #ffffff !important;
                }
                .digital-display text {
                    font-family: 'TX-02', 'Berkeley Mono', monospace !important;
                    fill: #ffffff !important;
                }
                
                /* Special styling for sticky note text */
                .sticky-note-text {
                    font-family: 'League Spartan', sans-serif !important;
                    font-weight: bold !important;
                    fill: ${this.BLACK_COLOR} !important;
                    text-rendering: geometricPrecision;
                }
                .sticky-note-shadow {
                    font-family: 'League Spartan', sans-serif !important;
                    font-weight: bold !important;
                    fill: rgba(0,0,0,0.35) !important;
                    filter: url(#stickyNoteTextShadow);
                }
            </style>
        `;
    }

    // Special handling for specific elements like tick labels and digital display
    private postProcessSpecificElements(svgElement: SVGElement): void {
        // Process tick labels specifically to use TX-02 font
        const tickLabels = svgElement.querySelectorAll('.ticks text');
        tickLabels.forEach(label => {
            label.setAttribute('font-family', "'TX-02', 'Berkeley Mono', monospace");

            if (label.textContent && !isNaN(parseFloat(label.textContent.trim()))) {
                label.setAttribute('fill', '#ffffff');
                (label as SVGElement).style.fill = '#ffffff';
            }
        });

        // Fix digital display text to use TX-02 font
        const digitalDisplay = svgElement.querySelectorAll('.digital-display text');
        digitalDisplay.forEach(text => {
            text.setAttribute('font-family', "'TX-02', 'Berkeley Mono', monospace");
            text.setAttribute('fill', '#ffffff');
            (text as SVGElement).style.fill = '#ffffff';
        });
    }

    // Apply correct font attributes to all text elements
    private applyCorrectFontAttributes(svgElement: SVGElement): void {
        const textElements = svgElement.querySelectorAll('text');

        textElements.forEach((textElement: SVGTextElement) => {
            const classList = Array.from(textElement.classList || []);

            // Fix Berkeley Mono references to use TX-02
            if (classList.includes('bb-text-berkeley-mono')) {
                textElement.style.fontFamily = "'TX-02', 'Berkeley Mono', monospace";
                textElement.setAttribute('font-family', "'TX-02', 'Berkeley Mono', monospace");
                textElement.style.fill = "#ffffff";
                textElement.setAttribute('fill', '#ffffff');

                // Add explicit font-weight if it's bold
                if (classList.includes('bb-text-bold')) {
                    textElement.style.fontWeight = 'bold';
                    textElement.setAttribute('font-weight', 'bold');
                }
            }
            // Handle League Spartan text
            else if (classList.includes('bb-text-league-spartan')) {
                textElement.style.fontFamily = "'League Spartan', sans-serif";
                textElement.setAttribute('font-family', "'League Spartan', sans-serif");

                if (classList.includes('bb-text-bold')) {
                    textElement.style.fontWeight = 'bold';
                    textElement.setAttribute('font-weight', 'bold');
                }
            }

            // Preserve filter effects
            const filter = textElement.getAttribute('filter');
            if (filter) {
                textElement.style.filter = filter;
            }
        });
    }

    private drawDescription(): void {
        if (!this.data?.description) return;

        // Stick Note Dimensions
        const NOTE_WIDTH = 380;
        const NOTE_HEIGHT = 200;

        const descriptionGroup = this.svg.append('g')
            .attr('transform', `translate(${this.height + 50}, 60)`)
            .attr('class', 'sticky-note-container');

        const stickyNote = descriptionGroup.append('g')
            .attr('transform', 'rotate(-2)');

        // Create distressed edges filter
        const defs = this.svg.select('defs');
        const distressFilter = defs.append('filter')
            .attr('id', 'distressedEdges')
            .attr('x', '-10%')
            .attr('y', '-10%')
            .attr('width', '120%')
            .attr('height', '120%');

        // Add turbulence for worn edge effect
        distressFilter.append('feTurbulence')
            .attr('type', 'fractalNoise')
            .attr('baseFrequency', '0.04')
            .attr('numOctaves', '5')
            .attr('seed', '3')
            .attr('result', 'noise');

        distressFilter.append('feDisplacementMap')
            .attr('in', 'SourceGraphic')
            .attr('in2', 'noise')
            .attr('scale', '3')
            .attr('xChannelSelector', 'R')
            .attr('yChannelSelector', 'G')
            .attr('result', 'displacedEdges');

        const textShadowFilter = defs.append('filter')
            .attr('id', 'stickyNoteTextShadow')
            .attr('x', '-20%')
            .attr('y', '-20%')
            .attr('width', '140%')
            .attr('height', '140%');

        textShadowFilter.append('feDropShadow')
            .attr('dx', '1')
            .attr('dy', '1')
            .attr('stdDeviation', '0.5')
            .attr('flood-opacity', '0.2')
            .attr('flood-color', '#000000');

        stickyNote.append('rect')
            .attr('width', NOTE_WIDTH)
            .attr('height', NOTE_HEIGHT)
            .attr('fill', '#FFE01F')
            .attr('rx', 2)
            .attr('ry', 2)
            .attr('filter', 'url(#distressedEdges)')
            .style('filter', 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))');

        // Add paper texture with more visible grain
        const paperPattern = defs.append('pattern')
            .attr('id', 'enhancedPaperTexture')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 100)
            .attr('height', 100);

        paperPattern.append('rect')
            .attr('width', 100)
            .attr('height', 100)
            .attr('fill', '#FFE01F');

        paperPattern.append('filter')
            .attr('id', 'paperNoise')
            .append('feTurbulence')
            .attr('type', 'fractalNoise')
            .attr('baseFrequency', '0.4')
            .attr('numOctaves', '5')
            .attr('stitchTiles', 'stitch');

        stickyNote.append('rect')
            .attr('width', NOTE_WIDTH)
            .attr('height', NOTE_HEIGHT)
            .attr('fill', 'url(#enhancedPaperTexture)')
            .attr('rx', 2)
            .attr('ry', 2)
            .attr('opacity', 0.25);

        const tapeConfig = [
            { x: 0, y: 0, rotation: -45 },
            { x: NOTE_WIDTH, y: 0, rotation: 45 },
            { x: 0, y: NOTE_HEIGHT, rotation: 45 },
            { x: NOTE_WIDTH, y: NOTE_HEIGHT, rotation: -45 }
        ];

        tapeConfig.forEach(({ x, y, rotation }) => {
            stickyNote.append('rect')
                .attr('width', 40)
                .attr('height', 30)
                .attr('fill', '#00000020')
                .attr('x', x - 20)
                .attr('y', y - 15)
                .attr('rx', 2)
                .attr('ry', 2)
                .attr('transform', `rotate(${rotation}, ${x}, ${y})`);

            // Create main tape piece with worn texture
            const tape = stickyNote.append('rect')
                .attr('width', 36)
                .attr('height', 26)
                .attr('fill', '#ffffff')
                .attr('opacity', 0.7)
                .attr('rx', 1)
                .attr('ry', 1)
                .attr('x', x - 18)
                .attr('y', y - 13)
                .attr('transform', `rotate(${rotation}, ${x}, ${y})`)
                .attr('filter', 'url(#distressedEdges)');

            // Add creases to the tape for worn look
            stickyNote.append('line')
                .attr('x1', x - 15)
                .attr('y1', y - 8)
                .attr('x2', x + 15)
                .attr('y2', y - 8)
                .attr('stroke', '#00000015')
                .attr('stroke-width', 0.7)
                .attr('transform', `rotate(${rotation}, ${x}, ${y})`);

            // Add tape highlight with some irregularity
            stickyNote.append('rect')
                .attr('width', 30)
                .attr('height', 20)
                .attr('fill', '#ffffff')
                .attr('opacity', 0.3)
                .attr('rx', 1)
                .attr('ry', 1)
                .attr('x', x - 15)
                .attr('y', y - 10)
                .attr('transform', `rotate(${rotation}, ${x}, ${y})`);
        });

        // Auto-size and position text
        const words = this.data.description.split(/\s+/);
        const availableWidth = NOTE_WIDTH - 40;
        const availableHeight = NOTE_HEIGHT - 40;

        // Create temporary text to measure
        let fontSize = 20;
        let finalLines: string[] = [];
        let lineHeight: number;

        // Binary search for optimal font size
        const findOptimalFontSize = () => {
            let min = 12; // Increase min size for better visibility
            let max = 24;

            while (min <= max) {
                fontSize = Math.floor((min + max) / 2);
                let line: string[] = [];
                finalLines = [];

                let tempText = descriptionGroup.append('text')
                    .attr('font-size', `${fontSize}px`)
                    .attr('class', 'bb-text-league-spartan bb-text-bold')
                    .attr('font-family', 'League Spartan')
                    .attr('font-weight', 'bold');

                // Try to fit text with current font size
                words.forEach(word => {
                    line.push(word);
                    tempText.text(line.join(' '));
                    if ((tempText.node() as SVGTextContentElement).getComputedTextLength() > availableWidth) {
                        finalLines.push(line.slice(0, -1).join(' '));
                        line = [word];
                    }
                });
                if (line.length > 0) finalLines.push(line.join(' '));

                lineHeight = fontSize * 1.3;
                const totalHeight = finalLines.length * lineHeight;

                tempText.remove();

                if (totalHeight > availableHeight) {
                    max = fontSize - 1;
                } else {
                    min = fontSize + 1;
                }
            }
            return fontSize;
        };

        fontSize = findOptimalFontSize();

        // Create a text group for better organization
        const textGroup = stickyNote.append('g')
            .attr('class', 'sticky-note-text');

        // Draw the final text with enhanced shadow for better readability
        finalLines.forEach((line, i) => {
            // Text shadow (darker and more defined for better visibility in export)
            textGroup.append('text')
                .attr('class', 'bb-text-league-spartan bb-text-bold sticky-note-shadow')
                .attr('font-family', 'League Spartan')
                .attr('font-weight', 'bold')
                .attr('font-size', `${fontSize}px`)
                .attr('fill', 'rgba(0,0,0,0.35)') // Darker shadow
                .attr('x', 41)
                .attr('y', 36 + (i * lineHeight))
                .attr('filter', 'url(#stickyNoteTextShadow)')
                .text(line);

            // Main text with explicitly set attributes to ensure export quality
            textGroup.append('text')
                .attr('class', 'bb-text-league-spartan bb-text-bold sticky-note-text')
                .attr('font-family', 'League Spartan')
                .attr('font-weight', 'bold')
                .attr('font-size', `${fontSize}px`)
                .attr('fill', this.BLACK_COLOR)
                .attr('x', 40)
                .attr('y', 35 + (i * lineHeight))
                .text(line);
        });
    }

    private drawChart(): void {
        if (!this.data || typeof this.data.percentile !== 'number') {
            this.chartReady = false;
            return;
        }

        this.svg.selectAll("*").remove();
        this.createFilters();
        this.createVintageEffects();
        this.createRaceTrackGradient();

        this.drawDashboardContainer();
        this.drawDescription();

        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const gaugeRadius = Math.min(centerX, centerY) * 0.75;

        // Convert percentile to 0-10 scale for the gauge
        const percentileValue = this.data.percentile / 10;

        // Define angles for the gauge arc (similar to GT3 RS gauge)
        const startAngle = 140;
        const endAngle = 400;

        // Create the main gauge group
        const gaugeGroup = this.svg.append('g')
            .attr('transform', `translate(${centerX * 0.5}, ${centerY})`);

        // Create the metallic outer rim (silver like in GT3 RS)
        gaugeGroup.append('circle')
            .attr('r', gaugeRadius * 1.12)
            .attr('fill', 'none')
            .attr('stroke', 'url(#silverRimGradient)')
            .attr('stroke-width', gaugeRadius * 0.08)
            .attr('filter', 'url(#outerRimShadow)');

        // NEW: Add solid black circle after silver one
        gaugeGroup.append('circle')
            .attr('r', gaugeRadius * 1.08)
            .attr('fill', '#000000')
            .attr('stroke', '#222222')
            .attr('stroke-width', 1.5);

        // Create inner dark border
        gaugeGroup.append('circle')
            .attr('r', gaugeRadius * 1)
            .attr('fill', '#0A0A0A')
            .attr('stroke', '#333333')
            .attr('stroke-width', 1);

        gaugeGroup.append('circle')
            .attr('r', gaugeRadius * 0.80)
            .attr('fill', 'none')
            .attr('stroke', 'url(#concentricPattern)')
            .attr('stroke-width', gaugeRadius * 0.20)
            .attr('opacity', 0.9);

        // NEW: Add inner texture with diagonal pattern
        const innerRadius = gaugeRadius * 0.70;
        gaugeGroup.append('circle')
            .attr('r', innerRadius)
            .attr('fill', '#080808')
            .attr('stroke', '#1A1A1A')
            .attr('stroke-width', 0.5);

        // Add subtle diagonal texture pattern to inner face
        const diagonalPattern = this.svg.append('defs')
            .append('pattern')
            .attr('id', 'diagonalPattern')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 6)
            .attr('height', 6)
            .attr('patternTransform', 'rotate(45)');

        diagonalPattern.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', 6)
            .attr('stroke', '#222')
            .attr('stroke-width', 0.7);

        gaugeGroup.append('circle')
            .attr('r', innerRadius)
            .attr('fill', 'url(#diagonalPattern)')
            .attr('opacity', 0.4);

        // Draw the tick marks and labels with GT3 RS styling
        this.drawTicks(gaugeGroup, gaugeRadius, startAngle, endAngle);

        // Draw the needle
        this.drawNeedle(gaugeGroup, gaugeRadius, percentileValue, startAngle, endAngle);

        // Draw the digital display at the bottom
        this.drawDigitalDisplay(gaugeGroup, gaugeRadius, this.data.percentile);

        this.chartReady = true;
    }

    private createRaceTrackGradient(): void {
        const defs = this.svg.select('defs').empty() ? this.svg.append('defs') : this.svg.select('defs');

        const concentricPattern = defs.append('pattern')
            .attr('id', 'concentricPattern')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 200)
            .attr('height', 200);

        // Background color (dark)
        concentricPattern.append('rect')
            .attr('width', 200)
            .attr('height', 200)
            .attr('fill', '#111111');

        // Create concentric circular stripes (horizontal lines)
        // This creates the subtle horizontal lines seen in the GT3 RS
        for (let i = 0; i < 40; i++) {
            concentricPattern.append('circle')
                .attr('cx', 100)
                .attr('cy', 100)
                .attr('r', 95 - i * 2)
                .attr('fill', 'none')
                .attr('stroke', '#222222')
                .attr('stroke-width', 1)
                .attr('opacity', 0.6);
        }

        // Add red zone gradient (for 9-10 range)
        const redZoneGradient = defs.append('linearGradient')
            .attr('id', 'redZoneGradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '0%');

        redZoneGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#FF0000');

        redZoneGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#AA0000');

        // Create gradient for the silver outer rim (like in GT3 RS)
        const silverRimGradient = defs.append('linearGradient')
            .attr('id', 'silverRimGradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

        silverRimGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#C0C0C0');

        silverRimGradient.append('stop')
            .attr('offset', '50%')
            .attr('stop-color', '#E8E8E8');

        silverRimGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#A0A0A0');
    }


    private drawNeedle(group: any, radius: number, value: number, startAngle: number, endAngle: number): void {
        const needleGroup = group.append('g').attr('class', 'needle');

        // Calculate the angle for the current value
        const scale = d3.scaleLinear()
            .domain([0, 10])
            .range([startAngle, endAngle]);

        const angle = scale(value);
        const angleRad = (angle * Math.PI) / 180;

        // Draw needle
        const needleLength = radius * 0.8;
        const counterbalanceLength = radius * 0.15; // Length of the part extending out the back
        const needleBaseWidth = 10;

        // Calculate needle points for the main (forward) part
        const tip = {
            x: needleLength * Math.cos(angleRad),
            y: needleLength * Math.sin(angleRad)
        };

        const leftBase = {
            x: -needleBaseWidth / 2 * Math.cos(angleRad + Math.PI / 2),
            y: -needleBaseWidth / 2 * Math.sin(angleRad + Math.PI / 2)
        };

        const rightBase = {
            x: needleBaseWidth / 2 * Math.cos(angleRad + Math.PI / 2),
            y: needleBaseWidth / 2 * Math.sin(angleRad + Math.PI / 2)
        };

        // Calculate the counter-balance tip (opposite direction)
        const counterTip = {
            x: -counterbalanceLength * Math.cos(angleRad),
            y: -counterbalanceLength * Math.sin(angleRad)
        };

        // Add a glow effect specifically for the needle
        const needleGlow = group.append('defs')
            .append('filter')
            .attr('id', 'enhancedNeedleGlow')
            .attr('x', '-40%')
            .attr('y', '-40%')
            .attr('width', '180%')
            .attr('height', '180%');

        needleGlow.append('feGaussianBlur')
            .attr('stdDeviation', '2')
            .attr('result', 'coloredBlur');

        const needleGlowMerge = needleGlow.append('feMerge');
        needleGlowMerge.append('feMergeNode').attr('in', 'coloredBlur');
        needleGlowMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Create needle path for the forward part with brighter yellow
        needleGroup.append('path')
            .attr('d', `M ${leftBase.x},${leftBase.y} L ${tip.x},${tip.y} L ${rightBase.x},${rightBase.y} Z`)
            .attr('fill', '#FFDD00') // Brighter yellow
            .attr('stroke', '#444')
            .attr('stroke-width', 1)
            .attr('filter', 'url(#enhancedNeedleGlow)');

        // Add the counter-balance part extending out the back (also yellow)
        needleGroup.append('path')
            .attr('d', `M ${leftBase.x},${leftBase.y} L ${counterTip.x},${counterTip.y} L ${rightBase.x},${rightBase.y} Z`)
            .attr('fill', '#FFDD00') // Same bright yellow for continuity
            .attr('stroke', '#444')
            .attr('stroke-width', 1);

        // Add central pivot
        needleGroup.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 8)
            .attr('fill', '#555')
            .attr('stroke', '#333')
            .attr('stroke-width', 1);

        needleGroup.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 6)
            .attr('fill', '#888')
            .attr('stroke', '#333')
            .attr('stroke-width', 0.5);

        needleGroup.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 3)
            .attr('fill', '#333');
    }

    private drawTicks(group: any, radius: number, startAngle: number, endAngle: number): void {
        const ticksGroup = group.append('g').attr('class', 'ticks');
        const majorTickLength = radius * 0.09;  // For numbered ticks
        const mediumTickLength = radius * 0.05; // For ticks at .5 intervals
        const smallTickLength = radius * 0.05;  // For minor ticks

        // Define tick widths for different sizes
        const majorTickWidth = 3;
        const mediumTickWidth = 3;
        const smallTickWidth = 1.5;

        // Get the current percentile value to determine where blurring should stop
        // Make sure this.data exists and use safe access
        const currentValue = this.data?.percentile ? this.data.percentile / 10 : 8.8; // Default to 8.8 if data not available

        // Calculate angles for tick marks (0-10 scale)
        const scale = d3.scaleLinear()
            .domain([0, 10])
            .range([startAngle, endAngle]);

        // Create more subtle motion blur filters with different intensities
        const defs = this.svg.select('defs');

        // Create different levels of blur for progressive effect, but much more subtle
        [1, 2, 3].forEach(level => {
            const motionBlur = defs.append('filter')
                .attr('id', `subtleMotionBlur${level}`)
                .attr('x', '-50%')
                .attr('y', '-50%')
                .attr('width', '200%')
                .attr('height', '200%');

            motionBlur.append('feGaussianBlur')
                .attr('in', 'SourceGraphic')
                .attr('stdDeviation', `${level * 0.3},0`) // Very subtle horizontal blur, no vertical blur
                .attr('result', 'blur');
        });

        // Draw all tick marks with full range from 0 to 10
        for (let i = 0; i <= 100; i++) {
            const isMajor = i % 10 === 0;
            const isMedium = i % 5 === 0 && !isMajor;
            const isSmall = !isMajor && !isMedium;

            if (isMajor || isMedium || isSmall) {
                const value = i / 10;
                const angle = scale(value);
                const angleRad = (angle * Math.PI) / 180;

                let tickLength = smallTickLength;
                let tickWidth = smallTickWidth;

                if (isMajor) {
                    tickLength = majorTickLength;
                    tickWidth = majorTickWidth;
                } else if (isMedium) {
                    tickLength = mediumTickLength;
                    tickWidth = mediumTickWidth;
                }

                // Calculate coordinates
                const innerX = (radius) * Math.cos(angleRad);
                const innerY = (radius) * Math.sin(angleRad);
                const outerX = (radius - tickLength) * Math.cos(angleRad);
                const outerY = (radius - tickLength) * Math.sin(angleRad);

                // Determine if this is in the red zone (9-10)
                const isRedZone = value >= 9;

                let tickColor = '#ffffff';

                if (isRedZone) {
                    tickColor = '#ff0000';
                } else if (isSmall || isMedium) {
                    if (value < 2) {
                        tickColor = '#FFD700';
                    } else if (value < 5) {
                        tickColor = '#FFA500';
                    } else if (value < 8) {
                        tickColor = '#FF8C00';
                    } else if (value < 9) {
                        tickColor = '#FF4500';
                    } else {
                        tickColor = '#FF0000';
                    }
                }

                // Draw tick mark
                ticksGroup.append('line')
                    .attr('x1', innerX)
                    .attr('y1', innerY)
                    .attr('x2', outerX)
                    .attr('y2', outerY)
                    .attr('stroke', tickColor)
                    .attr('stroke-width', tickWidth)
                    .attr('stroke-linecap', 'square');

                // Add label for major ticks
                if (isMajor) {
                    const labelRadius = radius * 0.78;
                    const labelX = labelRadius * Math.cos(angleRad);
                    const labelY = labelRadius * Math.sin(angleRad);

                    // Determine text alignment based on position
                    let textAnchor = 'middle';
                    if (value === 0) textAnchor = 'end';
                    else if (value === 10) textAnchor = 'start';
                    else if (value < 5) textAnchor = 'end';
                    else if (value > 5) textAnchor = 'start';

                    // Calculate blur level based on distance from current value
                    // Apply motion blur effect that intensifies as we move further from the current value
                    // but only to numbers that come before the current position
                    // Using much more subtle blur levels
                    let filterValue = 'none';

                    // Only apply blur to values before the current value (needle position)
                    if (value < currentValue) {
                        // Calculate distance from current value, but limit the blur effect
                        const distance = currentValue - value;
                        // Limit blur levels to just 3 levels max
                        const blurLevel = Math.min(3, Math.ceil(distance));
                        // Only apply blur if it's at least 1 value away from current
                        if (distance >= 1) {
                            filterValue = `url(#subtleMotionBlur${blurLevel})`;
                        }
                    }

                    // Create a subtle shadow effect for better readability against black background
                    const shadowFilter = defs.append('filter')
                        .attr('id', `textShadow-${i}`)
                        .attr('x', '-30%')
                        .attr('y', '-30%')
                        .attr('width', '160%')
                        .attr('height', '160%');

                    shadowFilter.append('feDropShadow')
                        .attr('dx', '0')
                        .attr('dy', '0')
                        .attr('stdDeviation', '1')
                        .attr('flood-opacity', '0.5')
                        .attr('flood-color', '#000000');

                    // Add label with crisp white text
                    ticksGroup.append('text')
                        .attr('x', labelX)
                        .attr('y', labelY)
                        .attr('class', 'bb-text-berkeley-mono bb-text-bold')
                        .attr('font-weight', 'bold')
                        .attr('text-anchor', textAnchor)
                        .attr('dominant-baseline', 'middle')
                        .attr('fill', '#ffffff') // Keep text white
                        .attr('font-size', '14px')
                        .attr('filter', `${filterValue} url(#textShadow-${i})`) // Add subtle shadow for better readability
                        .text(value);

                    // If we want to simulate the blur from the example clock even more accurately
                    // We could add a duplicate text slightly offset to create a motion trail effect
                    if (value < currentValue) {
                        const distanceFromCurrent = currentValue - value;
                        if (distanceFromCurrent > 2) {
                            ticksGroup.append('text')
                                .attr('x', labelX - 2) // Slight offset to create motion trail
                                .attr('y', labelY)
                                .attr('class', 'bb-text-berkeley-mono bb-text-bold')
                                .attr('text-anchor', textAnchor)
                                .attr('dominant-baseline', 'middle')
                                .attr('fill', '#ffffff')
                                .attr('font-size', '14px')
                                .attr('opacity', 0.4) // Semi-transparent
                                .attr('filter', filterValue)
                                .text(value);
                        }
                    }
                }
            }
        }
    }

    private drawDigitalDisplay(group: any, radius: number, percentile: number): void {
        const digitalGroup = group.append('g').attr('class', 'digital-display');

        // Position below the gauge as in the reference image
        const displayWidth = radius * 1.45;
        const displayHeight = radius * 0.5;
        const displayY = radius * .45;

        // Create a more subtle curved digital display background
        const displayPath = `
            M ${-displayWidth / 2},${displayY + displayHeight * 0.48}
            A ${radius},${radius} 0 0 0 ${displayWidth / 2},${displayY + displayHeight * 0.48}
            L ${displayWidth * 0.23},${displayY - displayHeight * 0.2}
            L ${-displayWidth * 0.23},${displayY - displayHeight * 0.2}
            Z
        `;

        // Create a clip path for the display screen
        const displayClip = this.svg.select('defs').append('clipPath')
            .attr('id', 'displayClip');

        displayClip.append('path')
            .attr('d', displayPath);

        // Create darker background with grid texture for digital display
        digitalGroup.append('path')
            .attr('d', displayPath)
            .attr('fill', '#060606')
            .attr('filter', 'url(#innerShadow)')
            .attr('stroke', '#222222')
            .attr('stroke-width', 1);

        // Add grid texture pattern for the LCD screen (like in image 2)
        const screenPattern = this.svg.select('defs').append('pattern')
            .attr('id', 'screenPattern')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 4)
            .attr('height', 4);

        screenPattern.append('rect')
            .attr('width', 4)
            .attr('height', 4)
            .attr('fill', '#000000');

        screenPattern.append('rect')
            .attr('width', 1)
            .attr('height', 1)
            .attr('fill', '#111111');

        screenPattern.append('rect')
            .attr('x', 2)
            .attr('y', 2)
            .attr('width', 1)
            .attr('height', 1)
            .attr('fill', '#111111');

        digitalGroup.append('path')
            .attr('d', displayPath)
            .attr('fill', 'url(#screenPattern)')
            .attr('opacity', 0.8);

        // Define a silver gradient in your defs section (add this where you define other patterns/gradients)
        const silverGradient = this.svg.select('defs').append('linearGradient')
            .attr('id', 'silverGradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

        silverGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#e0e0e0');

        silverGradient.append('stop')
            .attr('offset', '45%')
            .attr('stop-color', '#c0c0c0');

        silverGradient.append('stop')
            .attr('offset', '55%')
            .attr('stop-color', '#a0a0a0');

        silverGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#b8b8b8');

        // You might also want to add highlights
        digitalGroup.append('path')
            .attr('d', displayPath)
            .attr('fill', 'none')
            .attr('stroke', 'rgba(255, 255, 255, 0.5)')
            .attr('stroke-width', 2)
            .attr('filter', 'url(#blur1px)');

        // Display the percentile with enhanced glow - larger like in image 2
        digitalGroup.append('text')
            .attr('x', 0)
            .attr('y', displayY + displayHeight * 0.42)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', this.DIGITAL_COLOR)
            .attr('class', 'bb-text-berkeley-mono bb-text-bold')
            .attr('font-size', '36px')
            .attr('filter', 'url(#displayGlow)')
            .text(`${Math.round(percentile)}%`);

        // Add RANK text to the right of the percentage
        // digitalGroup.append('text')
        //     .attr('x', 0)
        //     .attr('y', displayY + displayHeight * 0.8)
        //     .attr('text-anchor', 'start')
        //     .attr('dominant-baseline', 'middle')
        //     .attr('fill', this.DIGITAL_COLOR)
        //     .attr('class', 'bb-text-berkeley-mono bb-text-bold')
        //     .attr('font-size', '12px')
        //     .attr('opacity', 0.9)
        //     .attr('filter', 'url(#displayGlow)')
        //     .text('RANK');
    }

    private drawDashboardContainer(): void {
        interface GradientStop {
            offset: string;
            color: string;
        }

        const containerGroup = this.svg.append('g');
        const defs = this.svg.select('defs').empty() ? this.svg.append('defs') : this.svg.select('defs');

        this.createGradients(defs);
        this.createFiltersAndPatterns(defs);
        this.drawBorders(containerGroup);
        this.drawScreen(containerGroup);
        this.drawScrews(containerGroup);
    }

    private createFilters(): void {
        const defs = this.svg.append('defs');

        // Call this to add LCD screen effect
        this.createLCDScreenEffect(defs);

        // Add a rich inner shadow for depth
        const deepInnerShadow = defs.append('filter')
            .attr('id', 'deepInnerShadow')
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%');

        deepInnerShadow.append('feOffset')
            .attr('dx', '0')
            .attr('dy', '4');

        deepInnerShadow.append('feGaussianBlur')
            .attr('stdDeviation', '6')
            .attr('result', 'blur');

        deepInnerShadow.append('feComposite')
            .attr('operator', 'out')
            .attr('in', 'SourceGraphic')
            .attr('in2', 'blur')
            .attr('result', 'inverse');

        deepInnerShadow.append('feFlood')
            .attr('flood-color', 'black')
            .attr('flood-opacity', '0.8')
            .attr('result', 'color');

        deepInnerShadow.append('feComposite')
            .attr('operator', 'in')
            .attr('in', 'color')
            .attr('in2', 'inverse')
            .attr('result', 'shadow');

        deepInnerShadow.append('feComposite')
            .attr('operator', 'over')
            .attr('in', 'shadow')
            .attr('in2', 'SourceGraphic');

        // Create glow effect for needle and highlighting
        const needleGlow = defs.append('filter')
            .attr('id', 'needleGlow')
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%');

        needleGlow.append('feGaussianBlur')
            .attr('stdDeviation', '2')
            .attr('result', 'coloredBlur');

        const needleMerge = needleGlow.append('feMerge');
        needleMerge.append('feMergeNode').attr('in', 'coloredBlur');
        needleMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Enhanced digital display glow for better visibility
        const digitalGlow = defs.append('filter')
            .attr('id', 'displayGlow')
            .attr('x', '-20%')
            .attr('y', '-20%')
            .attr('width', '140%')
            .attr('height', '140%');

        digitalGlow.append('feGaussianBlur')
            .attr('stdDeviation', '2')
            .attr('result', 'blur');

        digitalGlow.append('feComponentTransfer')
            .append('feFuncA')
            .attr('type', 'linear')
            .attr('slope', '3.5');

        const digitalMerge = digitalGlow.append('feMerge');
        digitalMerge.append('feMergeNode').attr('in', 'blur');
        digitalMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Rest of the filter setup...
    }

    private createVintageEffects(): void {
        const defs = this.svg.append('defs');

        // Create gold/bronze metallic outer border
        const metallicBorder = defs.append('linearGradient')
            .attr('id', 'metallicBorder')
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '100%');

        // Add transform to make gradient follow the circular path
        metallicBorder.attr('gradientTransform', 'rotate(45)');

        // Define gradient stops for a gold/bronze metallic look
        metallicBorder.selectAll('stop')
            .data([
                { offset: '0%', color: '#D4AF37' },   // Gold
                { offset: '20%', color: '#B87333' },  // Bronze
                { offset: '40%', color: '#CD7F32' },  // Bronze
                { offset: '60%', color: '#FFC000' },  // Gold
                { offset: '80%', color: '#B87333' },  // Bronze
                { offset: '100%', color: '#D4AF37' }  // Gold
            ])
            .enter()
            .append('stop')
            .attr('offset', (d: any) => d.offset)
            .attr('stop-color', (d: any) => d.color);

        // Add shadow effect for the outer rim
        const outerRimShadow = defs.append('filter')
            .attr('id', 'outerRimShadow')
            .attr('x', '-20%')
            .attr('y', '-20%')
            .attr('width', '140%')
            .attr('height', '140%');

        outerRimShadow.append('feGaussianBlur')
            .attr('in', 'SourceAlpha')
            .attr('stdDeviation', '1')
            .attr('result', 'blur');

        outerRimShadow.append('feOffset')
            .attr('in', 'blur')
            .attr('dx', '1')
            .attr('dy', '1')
            .attr('result', 'offsetBlur');

        const rimMerge = outerRimShadow.append('feMerge');
        rimMerge.append('feMergeNode').attr('in', 'offsetBlur');
        rimMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    }

    private addTubeEffects(defs: any): void {
        const tubeGlow = defs.append('filter')
            .attr('id', 'tubeGlow')
            .attr('height', '300%')
            .attr('width', '300%')
            .attr('x', '-100%')
            .attr('y', '-100%');

        tubeGlow.append('feGaussianBlur')
            .attr('stdDeviation', '1')
            .attr('result', 'coloredBlur');

        // Tube inner shadow for depth
        const tubeInnerShadow = defs.append('filter')
            .attr('id', 'tubeInnerShadow')
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%');

        tubeInnerShadow.append('feGaussianBlur')
            .attr('stdDeviation', '2')
            .attr('result', 'blur');

        tubeInnerShadow.append('feOffset')
            .attr('dx', '0')
            .attr('dy', '2');

        // Liquid effect
        const liquidEffect = defs.append('filter')
            .attr('id', 'liquidEffect')
            .attr('height', '300%')
            .attr('width', '300%')
            .attr('x', '-100%')
            .attr('y', '-100%');

        liquidEffect.append('feGaussianBlur')
            .attr('stdDeviation', '2')
            .attr('result', 'blur');

        liquidEffect.append('feComposite')
            .attr('operator', 'in')
            .attr('in2', 'SourceGraphic');

        // Glass highlight gradient
        const glassHighlight = defs.append('linearGradient')
            .attr('id', 'glassHighlight')
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

        glassHighlight.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#ffffff')
            .attr('stop-opacity', '0.4');

        glassHighlight.append('stop')
            .attr('offset', '50%')
            .attr('stop-color', '#ffffff')
            .attr('stop-opacity', '0.1');

        glassHighlight.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#ffffff')
            .attr('stop-opacity', '0.2');
    }

    // Creates all gradient definitions needed for metallic effects
    private createGradients(defs: any): void {
        // Screw base gradient
        const screwGradient = defs.append('radialGradient')
            .attr('id', 'screwGradient')
            .attr('cx', '40%')
            .attr('cy', '40%')
            .attr('r', '60%')
            .attr('fx', '40%')
            .attr('fy', '40%');

        screwGradient.append('stop').attr('offset', '0%').attr('stop-color', '#E8E8E8');
        screwGradient.append('stop').attr('offset', '50%').attr('stop-color', '#B0B0B0');
        screwGradient.append('stop').attr('offset', '100%').attr('stop-color', '#808080');

        // Screw highlight effect
        const screwHighlight = defs.append('radialGradient')
            .attr('id', 'screwHighlight')
            .attr('cx', '30%')
            .attr('cy', '30%')
            .attr('r', '70%')
            .attr('fx', '30%')
            .attr('fy', '30%');

        screwHighlight.append('stop').attr('offset', '0%').attr('stop-color', 'rgba(255,255,255,0.6)');
        screwHighlight.append('stop').attr('offset', '50%').attr('stop-color', 'rgba(255,255,255,0.2)');
        screwHighlight.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(255,255,255,0)');
    }

    // Creates shadow effects and screen patterns
    private createFiltersAndPatterns(defs: any): void {
        // Inner shadow for depth effect
        const innerShadow = defs.append('filter')
            .attr('id', 'innerShadow')
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%');

        innerShadow.append('feOffset')
            .attr('dx', '0')
            .attr('dy', '3');

        innerShadow.append('feGaussianBlur')
            .attr('stdDeviation', '4')
            .attr('result', 'offset-blur');

        innerShadow.append('feComposite')
            .attr('operator', 'out')
            .attr('in', 'SourceGraphic')
            .attr('in2', 'offset-blur')
            .attr('result', 'inverse');

        innerShadow.append('feFlood')
            .attr('flood-color', 'black')
            .attr('flood-opacity', '0.6')
            .attr('result', 'color');

        innerShadow.append('feComposite')
            .attr('operator', 'in')
            .attr('in', 'color')
            .attr('in2', 'inverse')
            .attr('result', 'shadow');

        innerShadow.append('feComposite')
            .attr('operator', 'over')
            .attr('in', 'shadow')
            .attr('in2', 'SourceGraphic');

        // Screen clip path
        defs.append('clipPath')
            .attr('id', 'screenClip')
            .append('rect')
            .attr('width', this.width - 32)
            .attr('height', this.height - 32)
            .attr('x', 16)
            .attr('y', 16)
            .attr('rx', 28)
            .attr('ry', 28);

        // Scan line pattern for screen effect
        const scanlinePattern = defs.append('pattern')
            .attr('id', 'scanlines')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 2)
            .attr('height', 2);

        scanlinePattern.append('rect')
            .attr('width', 2)
            .attr('height', 1)
            .attr('fill', '#ffffff')
            .attr('opacity', 0.03);
    }

    // Draws the main border layers
    private drawBorders(containerGroup: any): void {
        // Metallic outer border
        containerGroup.append('rect')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('rx', 40)
            .attr('ry', 40)
            .attr('fill', '#909090');

        // Grey middle border
        const greyInset = 8;
        containerGroup.append('rect')
            .attr('width', this.width - (greyInset * 2))
            .attr('height', this.height - (greyInset * 2))
            .attr('x', greyInset)
            .attr('y', greyInset)
            .attr('rx', 35)
            .attr('ry', 35)
            .attr('fill', '#505050')
            .attr('filter', 'url(#innerShadow)');

        // Black inner border
        const blackInset = 16;
        containerGroup.append('rect')
            .attr('width', this.width - (blackInset * 2))
            .attr('height', this.height - (blackInset * 2))
            .attr('x', blackInset)
            .attr('y', blackInset)
            .attr('rx', 30)
            .attr('ry', 30)
            .attr('fill', '#1A1A1A')
            .attr('filter', 'url(#innerShadow)');
    }

    // Draws the screen area with scan line effect
    private drawScreen(containerGroup: any): void {
        const screenGroup = containerGroup.append('g')
            .attr('clip-path', 'url(#screenClip)');

        screenGroup.append('rect')
            .attr('width', this.width - 32)
            .attr('height', this.height - 32)
            .attr('x', 16)
            .attr('y', 16)
            .attr('rx', 28)
            .attr('ry', 28)
            .attr('fill', '#1A1A1A');

        screenGroup.append('rect')
            .attr('width', this.width - 32)
            .attr('height', this.height - 32)
            .attr('x', 16)
            .attr('y', 16)
            .attr('rx', 28)
            .attr('ry', 28)
            .attr('fill', 'url(#scanlines)');
    }

    // Draws the corner screws with metallic effect
    private drawScrews(containerGroup: any): void {
        const screwPositionOffset = 35;
        const screwPositions = [
            [screwPositionOffset, screwPositionOffset],
            [this.width - screwPositionOffset, screwPositionOffset],
            [screwPositionOffset, this.height - screwPositionOffset],
            [this.width - screwPositionOffset, this.height - screwPositionOffset]
        ];

        screwPositions.forEach(([x, y]) => {
            const screwGroup = containerGroup.append('g')
                .attr('transform', `translate(${x},${y})`);

            screwGroup.append('circle')
                .attr('r', 8)
                .attr('fill', 'url(#screwGradient)')
                .attr('filter', 'url(#innerShadow)');

            screwGroup.append('circle')
                .attr('r', 6)
                .attr('fill', 'none')
                .attr('stroke', '#1A1A1A')
                .attr('stroke-width', 1);

            screwGroup.append('path')
                .attr('d', 'M-3,0 H3 M0,-3 V3')
                .attr('stroke', '#1A1A1A')
                .attr('stroke-width', 1.5)
                .attr('stroke-linecap', 'round');

            screwGroup.append('circle')
                .attr('r', 3)
                .attr('fill', 'url(#screwHighlight)')
                .attr('opacity', 0.6);
        });
    }

    private addGaugeEffects(defs: any): void {
        // Gauge glow effect
        const gaugeGlow = defs.append('filter')
            .attr('id', 'gaugeGlow')
            .attr('height', '300%')
            .attr('width', '300%')
            .attr('x', '-100%')
            .attr('y', '-100%');

        gaugeGlow.append('feGaussianBlur')
            .attr('stdDeviation', '3')
            .attr('result', 'coloredBlur');

        const glowMerge = gaugeGlow.append('feMerge');
        glowMerge.append('feMergeNode').attr('in', 'coloredBlur');
        glowMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Metallic overlay for shine
        const metallicOverlay = defs.append('linearGradient')
            .attr('id', 'metallicOverlay')
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

        metallicOverlay.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#ffffff')
            .attr('stop-opacity', '0.3');

        metallicOverlay.append('stop')
            .attr('offset', '50%')
            .attr('stop-color', '#ffffff')
            .attr('stop-opacity', '0');

        metallicOverlay.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#ffffff')
            .attr('stop-opacity', '0.3');
    }

    private createLCDScreenEffect(defs: any): void {
        // Vintage LCD effect from your older code
        const lcdScreen = defs.append('pattern')
            .attr('id', 'lcdScreen')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', '4')
            .attr('height', '4');

        lcdScreen.append('rect')
            .attr('width', '4')
            .attr('height', '4')
            .attr('fill', '#1a1a1a');

        lcdScreen.append('rect')
            .attr('width', '2')
            .attr('height', '2')
            .attr('fill', '#000')
            .attr('fill-opacity', '0.3');

        // Enhanced LED glow effect
        const ledGlow = defs.append('filter')
            .attr('id', 'ledGlow')
            .attr('height', '300%')
            .attr('width', '300%')
            .attr('x', '-100%')
            .attr('y', '-100%');

        ledGlow.append('feGaussianBlur')
            .attr('stdDeviation', '2')
            .attr('result', 'coloredBlur');

        const feMerge = ledGlow.append('feMerge');
        feMerge.append('feMergeNode').attr('in', 'coloredBlur');
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    }
}