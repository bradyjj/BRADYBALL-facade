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

    public gaugeReady: boolean = false;
    fontsLoaded: boolean = false;

    private readonly CREAM_COLOR;
    private readonly RED_COLOR;
    private readonly BLACK_COLOR;

    private fonts: { [key: string]: string } = {};

    constructor(
        public elementRef: ElementRef,
        private fontService: FontService,
        private BRADYBALLUtil: BRADYBALLCardUtil
    ) {
        this.CREAM_COLOR = this.BRADYBALLUtil.getCssVariableValue('--bb-cream-color');
        this.RED_COLOR = this.BRADYBALLUtil.getCssVariableValue('--bb-red-card-color');
        this.BLACK_COLOR = this.BRADYBALLUtil.getCssVariableValue('--bb-black-color');
    }

    ngOnInit(): void {
        this.loadFonts();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data'] && this.data) {
            this.createSvg();
            this.drawGauge();
        }
    }

    ngAfterViewInit(): void {
        if (this.data) {
            this.createSvg();
            this.drawGauge();
        }
    }

    private loadFonts(): void {
        const fontFiles = [
            'league-spartan-regular.woff2',
            'league-spartan-bold.woff2'
        ];

        this.fontService.loadFonts(fontFiles).subscribe(
            fonts => {
                this.fonts = fonts;
                this.fontsLoaded = true;
                if (this.data) {
                    this.createSvg();
                    this.drawGauge();
                }
            },
            error => {
                console.error('Error loading fonts:', error);
                if (this.data) {
                    this.createSvg();
                    this.drawGauge();
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

    saveSVG(): void {
        const svgElement = this.elementRef.nativeElement.querySelector('svg');
        if (!svgElement) {
            console.error('SVG element not found');
            return;
        }

        // Clone the SVG
        const clonedSvg = svgElement.cloneNode(true) as SVGElement;

        // Add font definitions
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = this.getFontDefinitions();
        clonedSvg.insertBefore(defs, clonedSvg.firstChild);

        // Serialize to string
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(clonedSvg);

        // Embed fonts
        svgString = this.fontService.embedFontsInSVG(svgString, this.fonts);

        // Save file
        this.BRADYBALLUtil.saveSVGToFile(svgString, 'percentile_rank.svg');
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
            </style>
        `;
    }

    private drawDescription(): void {
        if (!this.data?.description) return;

        // Stick Note Dimensions
        const NOTE_WIDTH = 380;
        const NOTE_HEIGHT = 160;

        const descriptionGroup = this.svg.append('g')
            .attr('transform', `translate(${this.height + 50}, 60)`);

        const stickyNote = descriptionGroup.append('g')
            .attr('transform', 'rotate(-1)');

        // Draw sticky note background with drop shadow first
        stickyNote.append('rect')
            .attr('width', NOTE_WIDTH)
            .attr('height', NOTE_HEIGHT)
            .attr('fill', '#fef9c3')
            .attr('rx', 1)
            .attr('ry', 1)
            .style('filter', 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))');

        // Add paper texture
        stickyNote.append('rect')
            .attr('width', NOTE_WIDTH)
            .attr('height', NOTE_HEIGHT)
            .attr('fill', 'url(#paperTexture)')
            .attr('rx', 1)
            .attr('ry', 1)
            .attr('opacity', 0.1);

        // Tape configuration for each corner
        const tapeConfig = [
            { x: 0, y: 0, rotation: -45 },
            { x: NOTE_WIDTH, y: 0, rotation: 45 },
            { x: 0, y: NOTE_HEIGHT, rotation: 45 },
            { x: NOTE_WIDTH, y: NOTE_HEIGHT, rotation: -45 }
        ];

        tapeConfig.forEach(({ x, y, rotation }) => {
            // Create tape backing shadow
            stickyNote.append('rect')
                .attr('width', 40)
                .attr('height', 30)
                .attr('fill', '#00000020')
                .attr('x', x - 20)
                .attr('y', y - 15)
                .attr('transform', `rotate(${rotation}, ${x}, ${y})`);

            // Create main tape piece
            stickyNote.append('rect')
                .attr('width', 36)
                .attr('height', 26)
                .attr('fill', '#ffffff')
                .attr('opacity', 0.7)
                .attr('x', x - 18)
                .attr('y', y - 13)
                .attr('transform', `rotate(${rotation}, ${x}, ${y})`);

            // Add tape highlight
            stickyNote.append('rect')
                .attr('width', 30)
                .attr('height', 20)
                .attr('fill', '#ffffff')
                .attr('opacity', 0.3)
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
            let min = 8;
            let max = 24;

            while (min <= max) {
                fontSize = Math.floor((min + max) / 2);
                let line: string[] = [];
                finalLines = [];

                let tempText = descriptionGroup.append('text')
                    .attr('font-size', `${fontSize}px`)
                    .attr('class', 'bb-text-league-spartan bb-text-bold');

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

        // Draw the final text
        finalLines.forEach((line, i) => {
            descriptionGroup.append('text')
                .attr('class', 'bb-text-league-spartan bb-text-bold')
                .attr('font-size', `${fontSize}px`)
                .attr('fill', this.BLACK_COLOR)
                .attr('x', 25)
                .attr('y', 35 + (i * lineHeight))
                .text(line);
        });
    }

    private createVintageEffects(): void {
        const defs = this.svg.append('defs');

        // Add noise filter for paper texture
        const noise = defs.append('filter')
            .attr('id', 'noise');

        noise.append('feTurbulence')
            .attr('type', 'fractalNoise')
            .attr('baseFrequency', 0.8)
            .attr('numOctaves', 4)
            .attr('stitchTiles', 'stitch');
        // Add to createVintageEffects():
        // Enhance the metallicBezel gradient
        const metallicBezel = defs.append('linearGradient')
            .attr('id', 'metallicBezel')
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '100%');

        metallicBezel.append('stop').attr('offset', '0%').attr('stop-color', '#FFE5B4');
        metallicBezel.append('stop').attr('offset', '15%').attr('stop-color', '#DDB068');
        metallicBezel.append('stop').attr('offset', '30%').attr('stop-color', '#8B4513');
        metallicBezel.append('stop').attr('offset', '50%').attr('stop-color', '#CD853F');
        metallicBezel.append('stop').attr('offset', '70%').attr('stop-color', '#8B4513');
        metallicBezel.append('stop').attr('offset', '85%').attr('stop-color', '#DDB068');
        metallicBezel.append('stop').attr('offset', '100%').attr('stop-color', '#FFE5B4');

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


        // Add embossed effect for digital display
        const displayEmboss = defs.append('filter')
            .attr('id', 'displayEmboss')
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%');

        displayEmboss.append('feGaussianBlur')
            .attr('in', 'SourceAlpha')
            .attr('stdDeviation', '2')
            .attr('result', 'blur');

        displayEmboss.append('feOffset')
            .attr('in', 'blur')
            .attr('dx', '2')
            .attr('dy', '2')
            .attr('result', 'offsetBlur');

        // Vintage LCD effect
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

        // Enhanced face gradient for more depth
        const faceGradient = defs.append('radialGradient')
            .attr('id', 'faceGradient')
            .attr('cx', '50%')
            .attr('cy', '50%')
            .attr('r', '50%');

        faceGradient.append('stop').attr('offset', '0%').attr('stop-color', '#F5E6CB');
        faceGradient.append('stop').attr('offset', '70%').attr('stop-color', '#E6D5B8');
        faceGradient.append('stop').attr('offset', '100%').attr('stop-color', '#DDB068');

        const insetShadow = defs.append('filter')
            .attr('id', 'insetShadow')
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%');

        insetShadow.append('feOffset')
            .attr('dx', '0')
            .attr('dy', '4');

        insetShadow.append('feGaussianBlur')
            .attr('stdDeviation', '4')
            .attr('result', 'blur');

        insetShadow.append('feComposite')
            .attr('operator', 'out')
            .attr('in', 'SourceGraphic')
            .attr('in2', 'blur')
            .attr('result', 'inverse');

        insetShadow.append('feFlood')
            .attr('flood-color', 'black')
            .attr('flood-opacity', '0.3');

        insetShadow.append('feComposite')
            .attr('operator', 'in')
            .attr('in2', 'inverse')
            .attr('result', 'shadow');

        insetShadow.append('feComposite')
            .attr('operator', 'over')
            .attr('in', 'shadow')
            .attr('in2', 'SourceGraphic');

        // Screw effects
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

        // Display effects
        const displayGlow = defs.append('filter')
            .attr('id', 'displayGlow')
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%');

        displayGlow.append('feGaussianBlur')
            .attr('in', 'SourceGraphic')
            .attr('stdDeviation', '1')
            .attr('result', 'blur');

        displayGlow.append('feComponentTransfer')
            .append('feFuncA')
            .attr('type', 'linear')
            .attr('slope', '3')
            .attr('intercept', '0');

        const digitalScreen = defs.append('linearGradient')
            .attr('id', 'digitalScreen')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

        digitalScreen.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#000000');
        digitalScreen.append('stop')
            .attr('offset', '50%')
            .attr('stop-color', '#111111');
        digitalScreen.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#000000');

        const screenPattern = defs.append('pattern')
            .attr('id', 'screenPattern')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', '2')
            .attr('height', '2')
            .attr('patternTransform', 'rotate(45)');

        screenPattern.append('rect')
            .attr('width', '1')
            .attr('height', '2')
            .attr('fill', '#000')
            .attr('fill-opacity', '0.3');

        // Add inner shadow for depth
        const innerShadow = defs.append('filter')
            .attr('id', 'innerShadow')
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%');

        innerShadow.append('feOffset')
            .attr('dx', '0')
            .attr('dy', '2');

        innerShadow.append('feGaussianBlur')
            .attr('stdDeviation', '3')
            .attr('result', 'offset-blur');

        innerShadow.append('feComposite')
            .attr('operator', 'out')
            .attr('in', 'SourceGraphic')
            .attr('in2', 'offset-blur')
            .attr('result', 'inverse');

        innerShadow.append('feFlood')
            .attr('flood-color', 'black')
            .attr('flood-opacity', '0.4')
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

        const displayShadow = defs.append('filter')
            .attr('id', 'displayShadow')
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%');

        displayShadow.append('feDropShadow')
            .attr('dx', '0')
            .attr('dy', '4')
            .attr('stdDeviation', '4')
            .attr('flood-color', 'rgba(0,0,0,0.3)');

        // Paper texture for sticky note
        const paperTexture = defs.append('pattern')
            .attr('id', 'paperTexture')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 50)
            .attr('height', 50);

        paperTexture.append('rect')
            .attr('width', 50)
            .attr('height', 50)
            .attr('fill', '#fef9c3')
            .attr('opacity', 0.8);

        // Add noise to paper texture
        paperTexture.append('filter')
            .attr('id', 'noise')
            .append('feTurbulence')
            .attr('type', 'fractalNoise')
            .attr('baseFrequency', '0.8')
            .attr('numOctaves', '4')
            .attr('stitchTiles', 'stitch');

        // Add drop shadow filter
        const dropShadow = defs.append('filter')
            .attr('id', 'noteShadow')
            .attr('x', '-20%')
            .attr('y', '-20%')
            .attr('width', '140%')
            .attr('height', '140%');

        dropShadow.append('feGaussianBlur')
            .attr('in', 'SourceAlpha')
            .attr('stdDeviation', '2')
            .attr('result', 'blur');

        dropShadow.append('feOffset')
            .attr('in', 'blur')
            .attr('dx', '1')
            .attr('dy', '1')
            .attr('result', 'offsetBlur');

        dropShadow.append('feComponentTransfer')
            .append('feFuncA')
            .attr('type', 'linear')
            .attr('slope', '0.5');

        dropShadow.append('feMerge')
            .selectAll('feMergeNode')
            .data(['offsetBlur', 'SourceGraphic'])
            .enter()
            .append('feMergeNode')
            .attr('in', (d: string) => d);

        // Add needle glow effect (more intense)
        const needleGlow = defs.append('filter')
            .attr('id', 'needleGlow')
            .attr('height', '300%')
            .attr('width', '300%')
            .attr('x', '-100%')
            .attr('y', '-100%');

        needleGlow.append('feGaussianBlur')
            .attr('stdDeviation', '3')
            .attr('result', 'coloredBlur');

        const needleMerge = needleGlow.append('feMerge');
        needleMerge.append('feMergeNode').attr('in', 'coloredBlur');
        needleMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        this.addTubeEffects(defs);
        this.addGaugeEffects(defs);

        const tickGlow = defs.append('filter')
            .attr('id', 'tickGlow')
            .attr('height', '200%')
            .attr('width', '200%')
            .attr('x', '-50%')
            .attr('y', '-50%');

        tickGlow.append('feGaussianBlur')
            .attr('stdDeviation', '0.5')
            .attr('result', 'blurOut');

        const tickMerge = tickGlow.append('feMerge');
        tickMerge.append('feMergeNode').attr('in', 'blurOut');
        tickMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        const enhancedFaceGradient = defs.append('radialGradient')
            .attr('id', 'enhancedFaceGradient')
            .attr('cx', '45%')
            .attr('cy', '45%')
            .attr('r', '60%')
            .attr('fx', '40%')
            .attr('fy', '40%');

        enhancedFaceGradient.append('stop').attr('offset', '0%').attr('stop-color', '#F5E6CB');
        enhancedFaceGradient.append('stop').attr('offset', '60%').attr('stop-color', '#E6D5B8');
        enhancedFaceGradient.append('stop').attr('offset', '100%').attr('stop-color', '#DDB068');

        // Outer rim gradient for 3D effect
        const outerRimGradient = defs.append('linearGradient')
            .attr('id', 'outerRimGradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

        outerRimGradient.append('stop').attr('offset', '0%').attr('stop-color', '#DDB068');
        outerRimGradient.append('stop').attr('offset', '30%').attr('stop-color', '#CD853F');
        outerRimGradient.append('stop').attr('offset', '50%').attr('stop-color', '#8B4513');
        outerRimGradient.append('stop').attr('offset', '70%').attr('stop-color', '#CD853F');
        outerRimGradient.append('stop').attr('offset', '100%').attr('stop-color', '#DDB068');

        // Update the dotMetallic gradient for sharper appearance
        const dotMetallic = defs.append('radialGradient')
            .attr('id', 'dotMetallic')
            .attr('cx', '30%')
            .attr('cy', '30%')
            .attr('r', '70%');

        dotMetallic.append('stop').attr('offset', '0%').attr('stop-color', '#FFE5B4');
        dotMetallic.append('stop').attr('offset', '40%').attr('stop-color', '#DDB068');
        dotMetallic.append('stop').attr('offset', '80%').attr('stop-color', '#8B4513');
        dotMetallic.append('stop').attr('offset', '100%').attr('stop-color', '#6B3410');

        const dotHighlight = defs.append('filter')
            .attr('id', 'dotHighlight');

        dotHighlight.append('feSpecularLighting')
            .attr('surfaceScale', '5')
            .attr('specularConstant', '1')
            .attr('specularExponent', '20')
            .attr('lighting-color', '#ffffff')
            .append('fePointLight')
            .attr('x', '50')
            .attr('y', '50')
            .attr('z', '100');

        const metallicBorder = defs.append('linearGradient')
            .attr('id', 'metallicBorder')
            .attr('gradientUnits', 'userSpaceOnUse');

        // Add transform to make gradient follow the circular path
        metallicBorder.attr('gradientTransform', 'rotate(45)');

        // Define gradient stops for a rich metallic look
        metallicBorder.selectAll('stop')
            .data([
                { offset: '0%', color: '#FFE5B4' },  // Light gold
                { offset: '20%', color: '#DDB068' },  // Medium gold
                { offset: '40%', color: '#CD853F' },  // Bronze
                { offset: '60%', color: '#8B4513' },  // Dark bronze
                { offset: '80%', color: '#DDB068' },  // Medium gold
                { offset: '100%', color: '#FFE5B4' }  // Light gold
            ])
            .enter()
            .append('stop')
            .attr('offset', (d: any) => d.offset)
            .attr('stop-color', (d: any) => d.color);

        // Also add a shadow effect for the rim if needed
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

    private drawGauge(): void {
        if (!this.data || typeof this.data.percentile !== 'number') {
            this.gaugeReady = false;
            return;
        }

        this.svg.selectAll("*").remove();
        this.createVintageEffects();
        this.drawDashboardContainer();

        const startAngle = 270;
        const endAngle = 450;
        const gaugeScale = 0.85;

        const defs = this.svg.select('defs');

        const gaugeGradient = defs.append('linearGradient')
            .attr('id', 'gaugeGradient')
            .attr('gradientUnits', 'userSpaceOnUse');

        gaugeGradient.attr('gradientTransform',
            `rotate(${startAngle}, ${this.width / 2}, ${this.height / 2})`);

        // Define gradient stops
        const gradientStops = [
            { offset: '0%', color: '#4AC6FF', opacity: 0.9 },    // Icy blue
            { offset: '25%', color: '#0F6DD4', opacity: 0.85 },  // Medium blue
            { offset: '50%', color: '#FFD700', opacity: 0.85 },  // Golden yellow
            { offset: '75%', color: '#FF4500', opacity: 0.85 },  // Orange-red
            { offset: '100%', color: '#8B0000', opacity: 0.9 }   // Dark red
        ];

        gradientStops.forEach(stop => {
            gaugeGradient.append('stop')
                .attr('offset', stop.offset)
                .attr('stop-color', stop.color)
                .attr('stop-opacity', stop.opacity);
        });

        const gaugeGroup = this.svg.append('g')
            .attr('class', 'gauge-group')
            .attr('transform', `translate(${this.height / 2 + 28}, ${this.height / 2}) scale(${gaugeScale})`);

        // Outermost dark edge
        gaugeGroup.append('circle')
            .attr('r', this.height / 2)
            .attr('fill', 'none')
            .attr('stroke', '#8B4513')
            .attr('stroke-width', .5);

        // Main outer rim - first layer (darker)
        gaugeGroup.append('circle')
            .attr('r', this.height / 2 - 1)
            .attr('fill', 'none')
            .attr('stroke', '#8B4513')
            .attr('stroke-width', 11)
            .attr('filter', 'url(#outerRimShadow)');

        // Main outer rim - second layer (metallic)
        gaugeGroup.append('circle')
            .attr('r', this.height / 2 - 1)
            .attr('fill', 'none')
            .attr('stroke', 'url(#outerRimGradient)')
            .attr('stroke-width', 6);

        // Pie-pan effect inner rings
        gaugeGroup.append('circle')
            .attr('r', this.height / 2 - 6)
            .attr('fill', 'none')
            .attr('stroke', '#8B4513')
            .attr('stroke-width', 0.5);

        gaugeGroup.append('circle')
            .attr('r', this.height / 2 - 8)
            .attr('fill', 'none')
            .attr('stroke', 'url(#metallicBorder)')
            .attr('stroke-width', 4);

        // Stepped ring for depth
        gaugeGroup.append('circle')
            .attr('r', this.height / 2 - 12)
            .attr('fill', 'none')
            .attr('stroke', '#8B4513')
            .attr('stroke-width', 4);

        // Inner metallic ring
        gaugeGroup.append('circle')
            .attr('r', this.height / 2 - 14)
            .attr('fill', 'none')
            .attr('stroke', 'url(#metallicBorder)')
            .attr('stroke-width', 2);

        // Deep inner ring
        gaugeGroup.append('circle')
            .attr('r', this.height / 2 - 16)
            .attr('fill', 'none')
            .attr('stroke', '#8B4513')
            .attr('stroke-width', 5)
            .attr('opacity', 1);

        // Main face with enhanced depth
        gaugeGroup.append('circle')
            .attr('r', this.height / 2 - 20)
            .attr('fill', 'url(#enhancedFaceGradient)')
            .attr('filter', 'url(#faceDepth)');

        // Main face with enhanced depth
        gaugeGroup.append('circle')
            .attr('r', this.height / 2 - 12)
            .attr('fill', 'url(#enhancedFaceGradient)')
            .attr('filter', 'url(#faceDepth)');

        // Move digital display down
        const digitalDisplayOffset = this.height / 4.5;

        this.drawTicks(gaugeGroup, startAngle, endAngle);
        this.drawNeedle(gaugeGroup, this.data.percentile, startAngle, endAngle);
        this.drawDigitalDisplay(gaugeGroup, this.data.percentile, digitalDisplayOffset);
        this.drawDescription();
    }

    private drawNeedle(group: any, value: number, startAngle: number, endAngle: number): void {
        const scale = d3.scaleLinear()
            .domain([0, 100])
            .range([startAngle, endAngle]);

        const angle = scale(value) - 90;
        const radius = this.height / 2 - 40;

        // Needle with enhanced contrast
        const needleGroup = group.append('g')
            .attr('transform', `rotate(${angle})`);

        // Add needle shadow for depth
        needleGroup.append('path')
            .attr('d', `M -2,-4 L ${radius},0 L -2,4 Z`)
            .attr('fill', '#800000')
            .attr('stroke', '#800000')
            .attr('stroke-width', 1)
            .attr('filter', 'url(#needleGlow)')
            .attr('opacity', 0.3)
            .attr('transform', 'translate(1, 1)');  // Offset for shadow effect

        // Main needle with brighter red
        needleGroup.append('path')
            .attr('d', `M -2,-4 L ${radius},0 L -2,4 Z`)
            .attr('fill', '#ff3333')  // Brighter red for better contrast
            .attr('stroke', '#cc0000')
            .attr('stroke-width', 1)
            .attr('filter', 'url(#needleGlow)');

        // Enhanced center cap
        const capGroup = group.append('g');

        capGroup.selectAll("*").remove();  // Clear existing cap

        capGroup.append('circle')
            .attr('r', 14)
            .attr('fill', 'url(#metallicBezel)')
            .attr('stroke', '#8B4513')
            .attr('stroke-width', 2)
            .attr('filter', 'url(#innerShadow)');

        // Middle ring with metallic effect
        capGroup.append('circle')
            .attr('r', 10)
            .attr('fill', 'url(#dotMetallic)')
            .attr('stroke', '#DDB068')
            .attr('stroke-width', 1);

        // Inner detail with highlight
        capGroup.append('circle')
            .attr('r', 6)
            .attr('fill', 'url(#dotMetallic)')
            .attr('stroke', '#8B4513')
            .attr('stroke-width', 0.5);

        // Small highlight
        capGroup.append('circle')
            .attr('cx', -2)
            .attr('cy', -2)
            .attr('r', 2)
            .attr('fill', '#FFE5B4')
            .attr('opacity', 0.7);
    }

    private drawTicks(group: any, startAngle: number, endAngle: number): void {
        if (!this.data || typeof this.data.percentile !== 'number') return;

        const scale = d3.scaleLinear()
            .domain([0, 100])
            .range([startAngle, endAngle]);

        const containerInnerRadius = this.height / 2 - 55;
        const containerOuterRadius = this.height / 2 - 35;
        const containerBorderWidth = 2.5;

        const mainGroup = group.append('g').attr('class', 'gauge-main');
        const ticksGroup = group.append('g').attr('class', 'gauge-ticks');
        const labelsGroup = group.append('g').attr('class', 'gauge-labels');

        const arcGenerator = d3.arc()
            .innerRadius(containerInnerRadius)
            .outerRadius(containerOuterRadius)
            .startAngle((startAngle - 2) * Math.PI / 180)
            .endAngle((endAngle + 2) * Math.PI / 180)
            .cornerRadius(2);

        const containerArc = d3.arc()
            .innerRadius(containerInnerRadius - containerBorderWidth)
            .outerRadius(containerOuterRadius + containerBorderWidth)
            .startAngle((startAngle - 3) * Math.PI / 180)
            .endAngle((endAngle + 3) * Math.PI / 180)
            .cornerRadius(3);

        // Draw container background
        mainGroup.append('path')
            .attr('d', containerArc)
            .attr('fill', '#1a1a1a')
            .attr('filter', 'url(#tubeInnerShadow)')
            .attr('opacity', 0.7);

        // Draw all ticks first
        const ticks = [];
        for (let i = 0; i <= 100; i += 5) {
            ticks.push(i);
        }
        // Ensure 0, 50, and 100 are in the array
        if (!ticks.includes(0)) ticks.push(0);
        if (!ticks.includes(50)) ticks.push(50);
        if (!ticks.includes(100)) ticks.push(100);
        ticks.sort((a, b) => a - b);

        ticks.forEach(tick => {
            const angleInRadians = (scale(tick) - 90) * (Math.PI / 180);
            const radius = containerOuterRadius - 1;
            const isMajor = tick % 20 === 0 || tick === 0 || tick === 100;
            const isMedium = tick % 10 === 0 && !isMajor;
            const tickLength = isMajor ? 18 : (isMedium ? 13 : 8);

            // Draw tick marks
            ticksGroup.append('line')
                .attr('x1', radius * Math.cos(angleInRadians))
                .attr('y1', radius * Math.sin(angleInRadians))
                .attr('x2', (radius - tickLength) * Math.cos(angleInRadians))
                .attr('y2', (radius - tickLength) * Math.sin(angleInRadians))
                .attr('stroke', '#FFE5B4')
                .attr('stroke-width', isMajor ? 3 : (isMedium ? 2 : 1.5))
                .attr('filter', 'url(#tickGlow)')
                .attr('opacity', isMajor ? 1 : (isMedium ? 0.9 : 0.8));

            if (isMajor) {
                const labelOffset = 45;
                const labelRadius = radius - labelOffset;
                const labelX = labelRadius * Math.cos(angleInRadians);
                const labelY = labelRadius * Math.sin(angleInRadians);

                const labelGroup = labelsGroup.append('g')
                    .attr('transform', `translate(${labelX}, ${labelY})`);

                [-1.5, -1, -0.5, 0, 0.5, 1, 1.5].forEach(dx => {
                    [-1.5, -1, -0.5, 0, 0.5, 1, 1.5].forEach(dy => {
                        if (dx === 0 && dy === 0) return;
                        labelGroup.append('text')
                            .attr('class', 'bb-text-league-spartan')
                            .attr('text-anchor', 'middle')
                            .attr('dominant-baseline', 'middle')
                            .attr('font-size', '16px')
                            .attr('font-weight', 'bold')
                            .attr('fill', '#8B4513')
                            .attr('opacity', 0.8)
                            .attr('transform', `translate(${dx}, ${dy})`)
                            .text(tick);
                    });
                });

                labelGroup.append('text')
                    .attr('class', 'bb-text-league-spartan')
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .attr('font-size', '16px')
                    .attr('font-weight', 'bold')
                    .attr('fill', '#8B4513')
                    .attr('opacity', 0.4)
                    .attr('transform', 'translate(0, 2)')
                    .text(tick);

                labelGroup.append('text')
                    .attr('class', 'bb-text-league-spartan')
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .attr('font-size', '16px')
                    .attr('font-weight', 'bold')
                    .attr('fill', '#DDB068')
                    .text(tick);

                labelGroup.append('text')
                    .attr('class', 'bb-text-league-spartan')
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .attr('font-size', '16px')
                    .attr('font-weight', 'bold')
                    .attr('fill', '#FFD700')
                    .attr('filter', 'url(#ledGlow)')
                    .attr('opacity', 0.6)
                    .text(tick);
            }
        });

        // Draw liquid fill after ticks
        const needleAngle = (scale(this.data.percentile) * Math.PI) / 180;
        const progressArc = d3.arc()
            .innerRadius(containerInnerRadius + 1)
            .outerRadius(containerOuterRadius - 1)
            .startAngle((startAngle - 1) * Math.PI / 180)
            .endAngle(needleAngle)
            .cornerRadius(2);

        mainGroup.append('path')
            .attr('d', progressArc)
            .attr('fill', 'url(#gaugeGradient)')
            .attr('filter', 'url(#liquidEffect)');

        // Draw container border
        mainGroup.append('path')
            .attr('d', containerArc)
            .attr('fill', 'none')
            .attr('stroke', '#6B3410')
            .attr('stroke-width', containerBorderWidth)
            .attr('filter', 'url(#tubeInnerShadow)');

        // Glass and metallic overlays
        mainGroup.append('path')
            .attr('d', arcGenerator)
            .attr('fill', 'url(#glassHighlight)')
            .attr('opacity', 0.2);

        mainGroup.append('path')
            .attr('d', arcGenerator)
            .attr('fill', 'url(#metallicOverlay)')
            .attr('opacity', 0.2);
    }

    private drawDigitalDisplay(group: any, value: number, yOffset: number = this.height / 3): void {
        const displayGroup = group.append('g')
            .attr('transform', `translate(0, ${yOffset})`);

        // Display outer casing (metallic frame)
        displayGroup.append('rect')
            .attr('x', -60)
            .attr('y', -35)
            .attr('width', 120)
            .attr('height', 70)
            .attr('rx', 6)
            .attr('fill', 'url(#metallicBezel)')
            .attr('stroke', '#8B4513')
            .attr('stroke-width', 2);

        // Inner bezel (beveled edge)
        const innerBezel = displayGroup.append('g');

        // Bezel shadow
        innerBezel.append('rect')
            .attr('x', -56)
            .attr('y', -31)
            .attr('width', 112)
            .attr('height', 62)
            .attr('rx', 4)
            .attr('fill', '#2a2a2a')
            .attr('stroke', '#8B4513')
            .attr('stroke-width', 1);

        // LCD background with original screen effect
        displayGroup.append('rect')
            .attr('x', -52)
            .attr('y', -27)
            .attr('width', 104)
            .attr('height', 54)
            .attr('rx', 4)
            .attr('fill', 'url(#lcdScreen)')
            .attr('filter', 'url(#innerShadow)');

        // Segment display style number
        const segmentGroup = displayGroup.append('g')
            .attr('transform', 'translate(0, 5)');

        // Create retro-digital number
        segmentGroup.append('text')
            .attr('class', 'bb-text-league-spartan bb-text-bold')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '41px')
            .attr('fill', '#FFDB58')  // Mustard yellow for vintage LED look
            .attr('filter', 'url(#ledGlow)')
            .attr('opacity', '0.9')
            .text(`${Math.round(value)}%`);

        // Add scan lines effect
        displayGroup.append('rect')
            .attr('x', -52)
            .attr('y', -27)
            .attr('width', 104)
            .attr('height', 54)
            .attr('fill', 'url(#lcdScreen)')
            .attr('opacity', '0.1');

        // Corner screws
        const screwPositions = [
            [-54, -29], [54, -29],
            [-54, 29], [54, 29]
        ];

        screwPositions.forEach(([x, y]) => {
            const screwGroup = displayGroup.append('g')
                .attr('transform', `translate(${x},${y})`);

            screwGroup.append('circle')
                .attr('r', 3)
                .attr('fill', 'url(#metallicBezel)')
                .attr('stroke', '#8B4513')
                .attr('stroke-width', 0.5);

            screwGroup.append('path')
                .attr('d', 'M-1.5,0 H1.5 M0,-1.5 V1.5')
                .attr('stroke', '#8B4513')
                .attr('stroke-width', 0.5)
                .attr('stroke-linecap', 'round');
        });
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
}