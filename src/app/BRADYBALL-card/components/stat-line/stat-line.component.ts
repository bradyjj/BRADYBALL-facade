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
    private readonly MARGIN = { top: 100, right: 4, bottom: 25, left: 4 };
    private readonly CELL_PADDING = 15;
    private readonly ROW_HEIGHT = 40;
    private readonly FONT_SIZE = 17;
    private readonly HEADER_FONT_SIZE = 18;
    private readonly BORDER_RADIUS = 20;
    private readonly BORDER_WIDTH = 18;
    private readonly TITLE_BACKGROUND_HEIGHT = 90;
    private readonly TITLE_LEFT_MARGIN = 20;
    private readonly CREAM_COLOR;
    private readonly BACKGROUND_COLOR;
    private readonly TABLE_PADDING = 20;

    private width: number = 0;
    private height: number = 0;

    tableReady: boolean = false;
    fontsLoaded: boolean = false;

    private fonts: { [key: string]: string } = {};

    constructor(public elementRef: ElementRef, private fontService: FontService, private BRADYBALLUtil: BRADYBALLCardUtil) {
        this.CREAM_COLOR = this.BRADYBALLUtil.getCssVariableValue('--bb-cream-off-white-color');
        this.BACKGROUND_COLOR = this.BRADYBALLUtil.getCssVariableValue('--bb-red-color');
    }

    ngOnInit(): void {
        this.loadFonts();
    }

    private async loadFonts(): Promise<void> {
        const fontFiles = [
            'courier-prime-regular.woff2',
            'courier-prime-bold.woff2',
            'eb-garamond-regular.woff2',
            'eb-garamond-bold.woff2',
            'merriweather-regular.woff2',
            'merriweather-bold.woff2'
        ];

        this.fontService.loadFonts(fontFiles).subscribe(
            (fonts) => {
                this.fonts = fonts;
                this.fontsLoaded = true;
                if (this.data) {
                    this.drawTable();
                }
            },
            (error) => {
                console.error('Error loading fonts:', error);
                if (this.data) {
                    this.drawTable();
                }
            }
        );
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
        this.width = layout.totalWidth + this.MARGIN.left + this.MARGIN.right;
        this.height = (this.data.rows.length + 1) * this.ROW_HEIGHT + this.MARGIN.top + this.MARGIN.bottom + this.TABLE_PADDING;

        this.svg = d3.select(this.elementRef.nativeElement)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .append('g')
            .attr('transform', `translate(${this.MARGIN.left},${this.MARGIN.top})`);

        this.createClipPath();
        this.drawBackground(layout);
        this.drawBorder();
        this.drawTitle();
        this.drawTableContent(layout);

        this.tableReady = true;
    }

    private calculateLayout() {
        const headers = ['Season', ...this.data.rows[0].dataPoints.map(dp => dp.label)];
        const columnWidths = headers.map((header, index) => {
            let maxWidth = this.getTextWidth(header, `${this.HEADER_FONT_SIZE}px Courier Prime`);

            this.data.rows.forEach(row => {
                let cellText = index === 0 ? row.season : row.dataPoints[index - 1].value.toString();
                const cellWidth = this.getTextWidth(cellText, `${this.FONT_SIZE}px Courier Prime`);
                maxWidth = Math.max(maxWidth, cellWidth);
            });

            return maxWidth + this.CELL_PADDING * 2.5;
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

    private createClipPath(): void {
        const clipPath = this.svg.append("defs")
            .append("clipPath")
            .attr("id", "rounded-corners");

        const path = this.createRoundedRectPath(
            -this.MARGIN.left,
            -this.MARGIN.top,
            this.width,
            this.height,
            this.BORDER_RADIUS
        );

        clipPath.append("path")
            .attr("d", path);
    }

    private drawBackground(layout: any): void {
        const totalWidth = this.width;
        const totalHeight = this.height;

        // Create a group for the background elements
        const backgroundGroup = this.svg.append('g')
            .attr('clip-path', 'url(#rounded-corners)');

        // Full background
        backgroundGroup.append('rect')
            .attr('x', -this.MARGIN.left)
            .attr('y', -this.MARGIN.top)
            .attr('width', totalWidth)
            .attr('height', totalHeight)
            .attr('fill', this.BACKGROUND_COLOR);
    }

    private drawBorder(): void {
        // Draw the border path
        const path = `
            M ${-this.MARGIN.left + this.BORDER_RADIUS},${-this.MARGIN.top}
            h ${this.width - 2 * this.BORDER_RADIUS}
            a ${this.BORDER_RADIUS},${this.BORDER_RADIUS} 0 0 1 ${this.BORDER_RADIUS},${this.BORDER_RADIUS}
            v ${this.height - 2 * this.BORDER_RADIUS}
            a ${this.BORDER_RADIUS},${this.BORDER_RADIUS} 0 0 1 ${-this.BORDER_RADIUS},${this.BORDER_RADIUS}
            h ${-(this.width - 2 * this.BORDER_RADIUS)}
            a ${this.BORDER_RADIUS},${this.BORDER_RADIUS} 0 0 1 ${-this.BORDER_RADIUS},${-this.BORDER_RADIUS}
            v ${-(this.height - 2 * this.BORDER_RADIUS)}
            a ${this.BORDER_RADIUS},${this.BORDER_RADIUS} 0 0 1 ${this.BORDER_RADIUS},${-this.BORDER_RADIUS}
            z
        `;

        this.svg.append('path')
            .attr('d', path)
            .attr('fill', 'none')
            .attr('stroke', this.CREAM_COLOR)
            .attr('stroke-width', this.BORDER_WIDTH)
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round');
    }

    private drawTitle(): void {
        if (this.data.title) {
            const titleText = this.data.title.toUpperCase();
            const firstLetter = titleText.charAt(0);
            const restOfTitle = titleText.slice(1);

            const fontSize = 52;
            const smallerFontSize = fontSize * 0.45;
            const titleYOffset = -this.MARGIN.top / 2 + 25;
            const letterSpacing = 1;
            const radius = this.BORDER_RADIUS - this.BORDER_WIDTH / 2;
            const bottomLeftRadius = radius * 1.8;

            const backgroundPath = `
                    M ${-this.MARGIN.left + this.BORDER_WIDTH / 2},${-this.MARGIN.top + this.BORDER_WIDTH / 2 + radius}
                    q 0,${-radius} ${radius},${-radius}
                    h ${this.width - 2 * radius - this.BORDER_WIDTH}
                    q ${radius},0 ${radius},${radius}
                    v ${this.TITLE_BACKGROUND_HEIGHT - radius + this.BORDER_WIDTH / 2}
                    h ${-(this.width - bottomLeftRadius - this.BORDER_WIDTH)}
                    q ${-bottomLeftRadius},0 ${-bottomLeftRadius},${bottomLeftRadius}
                    z
                `;

            this.svg.append('path')
                .attr('d', backgroundPath)
                .attr('class', 'bb-black-color')
                .attr('fill', 'black');

            const tempText = this.svg.append('text')
                .attr('font-family', 'Times New Roman, serif')
                .attr('font-size', `${smallerFontSize}px`)
                .attr('letter-spacing', `${letterSpacing}px`)
                .text(restOfTitle);
            const restOfTitleWidth = tempText.node().getComputedTextLength();
            tempText.remove();

            const underlineWidth = restOfTitleWidth + fontSize * 0.8;

            this.svg.append('text')
                .attr('x', this.TITLE_LEFT_MARGIN)
                .attr('y', titleYOffset)
                .attr('text-anchor', 'start')
                .attr('class', 'bb-text-eb-garamond bb-text-bold bb-cream-off-white-color')
                .attr('font-family', 'EB Garamond, serif')
                .attr('font-weight', 'bold')
                .attr('font-size', `${fontSize}px`)
                .attr('fill', this.CREAM_COLOR)
                .style('fill', this.CREAM_COLOR)
                .text(firstLetter);

            this.svg.append('line')
                .attr('x1', this.TITLE_LEFT_MARGIN + fontSize * 0.85)
                .attr('y1', titleYOffset - 1.5)
                .attr('x2', this.TITLE_LEFT_MARGIN + underlineWidth + 7)
                .attr('y2', titleYOffset - 1.5)
                .attr('class', 'bb-cream-off-white-color')
                .attr('stroke', this.CREAM_COLOR)
                .attr('stroke-width', 3.5);

            this.svg.append('text')
                .attr('x', this.TITLE_LEFT_MARGIN + fontSize * 0.70)
                .attr('y', titleYOffset - fontSize * 0.25)
                .attr('text-anchor', 'start')
                .attr('class', 'bb-text-merriweather bb-text-bold bb-cream-off-white-color')
                .attr('font-size', `${smallerFontSize}px`)
                .attr('letter-spacing', `${letterSpacing}px`)
                .attr('fill', this.CREAM_COLOR)
                .style('fill', this.CREAM_COLOR)
                .text(restOfTitle);

            const diamondSize = 8;
            const xOffset = 13;
            const yOffset = 2;
            this.svg.append('path')
                .attr('d', `M${this.TITLE_LEFT_MARGIN + underlineWidth + xOffset},${titleYOffset - diamondSize / 2 - yOffset} 
                                L${this.TITLE_LEFT_MARGIN + underlineWidth + xOffset + diamondSize / 2},${titleYOffset - yOffset} 
                                L${this.TITLE_LEFT_MARGIN + underlineWidth + xOffset},${titleYOffset + diamondSize / 2 - yOffset} 
                                L${this.TITLE_LEFT_MARGIN + underlineWidth + xOffset - diamondSize / 2},${titleYOffset - yOffset} Z`)
                .attr('class', 'bb-cream-off-white-color')
                .attr('fill', this.CREAM_COLOR)
                .style('fill', this.CREAM_COLOR);
        }
    }

    private drawGridLines(layout: any, extraTopSpace: number): void {
        for (let i = 1; i <= this.data.rows.length; i++) {
            this.svg.append('line')
                .attr('x1', this.BORDER_WIDTH)
                .attr('y1', i * this.ROW_HEIGHT + extraTopSpace)
                .attr('x2', layout.totalWidth - this.BORDER_WIDTH)
                .attr('y2', i * this.ROW_HEIGHT + extraTopSpace)
                .attr('stroke', 'black')
                .attr('stroke-width', i === this.data.rows.length || i === 1 ? 2 : 1);
        }
    }

    private createRoundedRectPath(x: number, y: number, width: number, height: number, radius: number): string {
        return `
            M ${x + radius} ${y}
            h ${width - 2 * radius}
            a ${radius} ${radius} 0 0 1 ${radius} ${radius}
            v ${height - 2 * radius}
            a ${radius} ${radius} 0 0 1 ${-radius} ${radius}
            h ${-width + 2 * radius}
            a ${radius} ${radius} 0 0 1 ${-radius} ${-radius}
            v ${-height + 2 * radius}
            a ${radius} ${radius} 0 0 1 ${radius} ${-radius}
            z
        `;
    }

    private drawTableContent(layout: any): void {
        const headers = ['Season', ...this.data.rows[0].dataPoints.map(dp => dp.label)];

        // Draw headers
        this.drawRow(headers, 0, layout.columnWidths, true, this.TABLE_PADDING);

        // Draw data rows
        this.data.rows.forEach((row, index) => {
            const rowData = [row.season, ...row.dataPoints.map(dp => dp.value.toString())];
            this.drawRow(rowData, index + 1, layout.columnWidths, false, this.TABLE_PADDING, row.season.toLowerCase() === 'career');
        });

        // Adjust grid lines
        this.drawGridLines(layout, this.TABLE_PADDING);
    }

    private drawRow(rowData: string[], rowIndex: number, columnWidths: number[], isHeader: boolean, extraTopSpace: number, isCareer: boolean = false): void {
        let xPosition = 0;
        rowData.forEach((cellValue, columnIndex) => {
            const yPosition = (rowIndex + 0.5) * this.ROW_HEIGHT + extraTopSpace;
            this.drawCell(cellValue, xPosition, columnWidths[columnIndex], yPosition, isHeader, isCareer);
            xPosition += columnWidths[columnIndex];
        });
    }

    private drawCell(value: string, x: number, width: number, y: number, isHeader: boolean = false, isCareer: boolean = false): void {
        const text = this.svg.append('text')
            .attr('x', x + width / 2)
            .attr('y', y)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('class', `bb-text-courier-prime ${isHeader || isCareer ? 'bb-text-bold' : ''}`)
            .attr('font-size', isHeader || isCareer ? `${this.HEADER_FONT_SIZE}px` : `${this.FONT_SIZE}px`)
            .attr('fill', this.CREAM_COLOR)
            .style('fill', this.CREAM_COLOR)
            .text(value);
    }

    private wrapText(text: string, x: number, y: number, maxWidth: number, color: string, anchor: string): void {
        const words = text.split(/\s+/);
        let line: string[] = [];
        let lineNumber = 0;
        const lineHeight = 1.1;

        const textElement = this.svg.append("text")
            .attr("x", x)
            .attr("y", y)
            .attr("text-anchor", anchor)
            .attr("class", "bb-text-courier-prime bb-text-bold")
            .attr("font-size", "14px")
            .attr("fill", color)
            .attr("dominant-baseline", "middle");

        let tspan = textElement.append("tspan")
            .attr("x", x)
            .attr("dy", "0em");

        for (let word of words) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > maxWidth && line.length > 1) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = textElement.append("tspan")
                    .attr("x", x)
                    .attr("dy", `${lineHeight}em`)
                    .text(word);
                lineNumber++;
            }
        }

        // Center the text block vertically
        const totalHeight = (lineNumber + 1) * lineHeight;
        textElement.attr("transform", `translate(0, ${-totalHeight / 2}em)`);
    }

    saveSVG(): void {
        const svgElement = this.elementRef.nativeElement.querySelector('svg');
        if (!svgElement) {
            console.error('SVG element not found');
            return;
        }

        // Clone the SVG to avoid modifying the original
        const clonedSvg = svgElement.cloneNode(true) as SVGElement;

        // Serialize the SVG
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(clonedSvg);

        // Embed fonts
        svgString = this.fontService.embedFontsInSVG(svgString, this.fonts);

        // Save the SVG
        this.BRADYBALLUtil.saveSVGToFile(svgString, 'stat_line.svg');
    }
}