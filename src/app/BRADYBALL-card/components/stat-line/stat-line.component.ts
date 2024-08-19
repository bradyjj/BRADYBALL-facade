import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import { FontService } from '../../../../assets/fonts/font.service';
import { BRADYBALLCardUtil } from '../../util/BRADYBALL-card.util';
import { StatLineData } from '../../models/stat-line-player.model';

@Component({
    selector: 'stat-line',
    templateUrl: './stat-line.component.html',
    styleUrls: ['./stat-line.component.scss'],
})
export class StatLineComponent implements OnInit, OnChanges, AfterViewInit {
    @Input() data!: StatLineData;

    private svg: any;
    private margin = { top: 90, right: 35, bottom: 75, left: 35 };
    private cellPadding = 15;
    private rowHeight = 40;
    private fontSize = 14;
    private headerFontSize = 15;
    private width: number = 0;
    private height: number = 0;
    private bloodRedColor = '#BB0000';
    private stripeOpacity = 0.15;

    tableReady: boolean = false;

    private fonts: { [key: string]: string } = {};

    constructor(public elementRef: ElementRef, private fontService: FontService, private BRADYBALLUtil: BRADYBALLCardUtil) { }

    ngOnInit(): void {
        this.loadFonts();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['data'] && this.data) {
            this.drawTable();
        }
    }

    ngAfterViewInit() {
        if (this.data) {
            this.drawTable();
        }
    }

    private drawTable(): void {
        if (!this.data || !this.data.rows || this.data.rows.length === 0) {
            this.tableReady = false;
            return;
        }

        d3.select(this.elementRef.nativeElement).select('svg').remove();

        const layout = this.calculateLayout();
        this.width = layout.totalWidth + this.margin.left + this.margin.right;
        this.height = (this.data.rows.length + 1) * this.rowHeight + this.margin.top + this.margin.bottom;

        this.svg = d3.select(this.elementRef.nativeElement)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        this.drawBackground(layout);
        this.drawBorder();
        this.drawTitle();
        this.drawGridLines(layout);
        this.drawTableContent(layout);
        this.drawBottomInformation();

        this.tableReady = true;
    }

    private calculateLayout() {
        const headers = ['Season', ...this.data.rows[0].dataPoints.map(dp => dp.label)];
        const columnWidths = headers.map((header, index) => {
            let maxWidth = this.getTextWidth(header, `${this.headerFontSize}px Courier Prime`);

            this.data.rows.forEach(row => {
                let cellText = index === 0 ? row.season : row.dataPoints[index - 1].value.toString();
                const cellWidth = this.getTextWidth(cellText, `${this.fontSize}px Courier Prime`);
                maxWidth = Math.max(maxWidth, cellWidth);
            });

            return maxWidth + this.cellPadding * 2;
        });

        const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
        return { columnWidths, totalWidth };
    }

    private getTextWidth(text: string, font: string): number {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
            context.font = font;
            return context.measureText(text).width;
        }
        return 0;
    }

    private drawBackground(layout: any): void {
        const stripeHeight = this.rowHeight * (this.data.rows.length + 1);
        const totalWidth = layout.totalWidth;

        // Create a gradient for the faded paint effect
        const gradient = this.svg.append('defs')
            .append('linearGradient')
            .attr('id', 'fade-gradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '100%');

        gradient.append('stop')
            .attr('offset', '0%')
            .attr('style', 'stop-color:#BB0000;stop-opacity:0.35');

        gradient.append('stop')
            .attr('offset', '100%')
            .attr('style', 'stop-color:#BB0000;stop-opacity:0.05');

        // Apply the gradient as the background
        this.svg.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', totalWidth)
            .attr('height', stripeHeight)
            .attr('fill', 'url(#fade-gradient)');

        // Add vertical stripes for the worn paint effect
        const stripeWidth = 20;
        for (let x = 0; x < totalWidth; x += stripeWidth) {
            this.svg.append('line')
                .attr('x1', x)
                .attr('y1', 0)
                .attr('x2', x)
                .attr('y2', stripeHeight)
                .attr('stroke', this.bloodRedColor)
                .attr('stroke-width', 0)
                .attr('opacity', 0.05);
        }
    }

    private drawBorder(): void {
        const borderRadius = 10;
        this.svg.append('rect')
            .attr('x', -this.margin.left)
            .attr('y', -this.margin.top)
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('rx', borderRadius)
            .attr('ry', borderRadius)
            .attr('fill', 'none')
            .attr('stroke', this.BRADYBALLUtil.getCssVariableValue('--bb-black-color'))
            .attr('stroke-width', 5);
    }

    private drawTitle(): void {
        if (this.data.title) {
            const titleText = this.data.title.toUpperCase();
            const firstLetter = titleText.charAt(0);
            const restOfTitle = titleText.slice(1);

            const fontSize = 48;
            const smallerFontSize = fontSize * 0.45;
            const titleYOffset = -this.margin.top / 2 + 15;
            const letterSpacing = 1; // Adjust this value to increase or decrease spacing

            const tempText = this.svg.append('text')
                .attr('font-family', 'Times New Roman, serif')
                .attr('font-size', `${smallerFontSize}px`)
                .attr('letter-spacing', `${letterSpacing}px`)
                .text(restOfTitle);
            const restOfTitleWidth = tempText.node().getComputedTextLength();
            tempText.remove();

            const underlineWidth = restOfTitleWidth + fontSize * 0.8;

            this.svg.append('text')
                .attr('x', this.margin.left)
                .attr('y', titleYOffset)
                .attr('text-anchor', 'start')
                .attr('class', 'bb-text-eb-garamond bb-text-bold')
                .attr('font-size', `${fontSize}px`)
                .attr('fill', 'black')
                .text(firstLetter);

            this.svg.append('line')
                .attr('x1', this.margin.left + fontSize * 0.85)
                .attr('y1', titleYOffset - 1.5)
                .attr('x2', this.margin.left + underlineWidth + 7)
                .attr('y2', titleYOffset - 1.5)
                .attr('stroke', 'black')
                .attr('stroke-width', 3.5);

            this.svg.append('text')
                .attr('x', this.margin.left + fontSize * 0.70)
                .attr('y', titleYOffset - fontSize * 0.25)
                .attr('text-anchor', 'start')
                .attr('class', 'bb-text-merriweather bb-text-bold')
                .attr('font-size', `${smallerFontSize}px`)
                .attr('fill', 'black')
                .attr('letter-spacing', `${letterSpacing}px`)
                .text(restOfTitle);

            const diamondSize = 8;
            const xOffset = 13;
            const yOffset = 2;
            this.svg.append('path')
                .attr('d', `M${this.margin.left + underlineWidth + xOffset},${titleYOffset - diamondSize / 2 - yOffset} 
                            L${this.margin.left + underlineWidth + xOffset + diamondSize / 2},${titleYOffset - yOffset} 
                            L${this.margin.left + underlineWidth + xOffset},${titleYOffset + diamondSize / 2 - yOffset} 
                            L${this.margin.left + underlineWidth + xOffset - diamondSize / 2},${titleYOffset - yOffset} Z`)
                .attr('fill', 'black');
        }
    }

    private drawGridLines(layout: any): void {
        for (let i = 0; i <= this.data.rows.length; i++) {
            this.svg.append('line')
                .attr('x1', 0)
                .attr('y1', i * this.rowHeight)
                .attr('x2', layout.totalWidth)
                .attr('y2', i * this.rowHeight)
                .attr('stroke', 'black')
                .attr('stroke-width', i <= 1 || i === this.data.rows.length ? 2 : 1);
        }
    }

    private drawTableContent(layout: any): void {
        const headers = ['Season', ...this.data.rows[0].dataPoints.map(dp => dp.label)];

        this.drawRow(headers, 0, layout.columnWidths, true);

        this.data.rows.forEach((row, index) => {
            const rowData = [row.season, ...row.dataPoints.map(dp => dp.value.toString())];
            this.drawRow(rowData, index + 1, layout.columnWidths, false, row.season.toLowerCase() === 'career');
        });
    }

    private drawRow(rowData: string[], rowIndex: number, columnWidths: number[], isHeader: boolean, isCareer: boolean = false): void {
        let xPosition = 0;
        rowData.forEach((cellValue, columnIndex) => {
            const yPosition = (rowIndex + 0.5) * this.rowHeight;
            if (!isCareer || (isCareer && columnIndex !== 1 && columnIndex !== 2)) {
                this.drawCell(cellValue, xPosition, columnWidths[columnIndex], yPosition, isHeader, isCareer);
            }
            xPosition += columnWidths[columnIndex];
        });
    }

    private drawCell(value: string, x: number, width: number, y: number, isHeader: boolean = false, isCareer: boolean = false): void {
        const text = this.svg.append('text')
            .attr('x', x + width / 2)
            .attr('y', y)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('class', 'bb-text-courier-prime')
            .attr('font-size', isHeader || isCareer ? `${this.headerFontSize}px` : `${this.fontSize}px`)
            .attr('fill', 'black')
            .text(value);

        if (isHeader || isCareer) {
            text.classed('bb-text-bold', true);
        }
    }

    private drawBottomInformation(): void {
        const bottomY = this.height - this.margin.top - this.margin.bottom + 38;
        const centerX = this.width / 2 - this.margin.left;
        const maxWidth = (this.width - this.margin.left - this.margin.right) / 2 - 20;

        if (this.data.information1) {
            this.wrapText(this.data.information1, centerX / 2, bottomY, maxWidth, 'middle');
        }

        if (this.data.information2) {
            this.wrapText(this.data.information2, centerX * 1.5, bottomY, maxWidth, 'middle');
        }
    }

    private wrapText(text: string, x: number, y: number, maxWidth: number, anchor: string): void {
        const words = text.split(/\s+/).reverse();
        let line: string[] = [];
        let lineNumber = 0;
        const lineHeight = 1.1;
        const dy = 0;
        let tspan = this.svg.append("text")
            .attr("x", x)
            .attr("y", y)
            .attr("text-anchor", anchor)
            .attr("class", "bb-text-courier-prime")
            .attr("font-size", "14px")
            .attr("fill", "black")
            .attr("dominant-baseline", "middle")
            .append("tspan")
            .attr("x", x)
            .attr("dy", dy + "em");


        let word: string | undefined;
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > maxWidth) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = this.svg.append("text")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("text-anchor", anchor)
                    .attr("class", "bb-text-courier-prime")
                    .attr("font-size", "14px")
                    .attr("fill", "black")
                    .attr("dominant-baseline", "middle")
                    .append("tspan")
                    .attr("x", x)
                    .attr("dy", ++lineNumber * lineHeight + dy + "em")
                    .text(word);

            }
        }
    }

    private loadFonts(): void {
        const fontFiles = [
            'courier-prime-regular.woff2',
            'courier-prime-bold.woff2',
            'eb-garamond-regular.woff2',
            'eb-garamond-bold.woff2',
            'merriweather-regular.woff2',
            'merriweather-bold.woff2'
        ];

        this.fontService.getFonts(fontFiles).subscribe(fonts => {
            this.fonts = fonts;
        });
    }

    saveSVG(): void {
        const svgElement = this.elementRef.nativeElement.querySelector('svg');

        // Add a style element to the SVG
        const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        styleElement.textContent = `
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
                font-family: 'EB Garamond';
                src: url(data:application/font-woff2;charset=utf-8;base64,${this.fonts['eb-garamond-regular.woff2']}) format('woff2');
                font-weight: normal;
                font-style: normal;
            }
            @font-face {
                font-family: 'EB Garamond';
                src: url(data:application/font-woff2;charset=utf-8;base64,${this.fonts['eb-garamond-bold.woff2']}) format('woff2');
                font-weight: bold;
                font-style: normal;
            }
            @font-face {
                font-family: 'Merriweather';
                src: url(data:application/font-woff2;charset=utf-8;base64,${this.fonts['merriweather-regular.woff2']}) format('woff2');
                font-weight: normal;
                font-style: normal;
            }
            @font-face {
                font-family: 'Merriweather';
                src: url(data:application/font-woff2;charset=utf-8;base64,${this.fonts['merriweather-bold.woff2']}) format('woff2');
                font-weight: bold;
                font-style: normal;
            }
            .bb-text-courier-prime { font-family: 'Courier Prime', monospace; }
            .bb-text-eb-garamond { font-family: 'EB Garamond', serif; }
            .bb-text-merriweather { font-family: 'Merriweather', serif; }
            .bb-text-bold { font-weight: bold; }
        `;
        svgElement.insertBefore(styleElement, svgElement.firstChild);

        this.BRADYBALLUtil.saveCombinedSVG([svgElement], 'stat_line.svg', this.fonts);
    }
}