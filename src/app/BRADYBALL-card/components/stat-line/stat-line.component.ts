import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import { FontService } from '../../../../assets/fonts/font.service';
import { BRADYBALLCardUtil } from '../../util/BRADYBALL-card.util';
import { StatLineData, StatLineRow, StatLineDataPoint } from '../../models/stat-line-player.model';

@Component({
    selector: 'stat-line',
    templateUrl: './stat-line.component.html',
    styleUrls: ['./stat-line.component.scss'],
})
export class StatLineComponent implements OnInit, OnChanges, AfterViewInit {
    @Input() data!: StatLineData;

    private svg: any;
    private margin = { top: 60, right: 40, bottom: 60, left: 40 };
    private cellPadding = 15;
    private rowHeight = 40;
    private fontSize = 14;
    private headerFontSize = 16;
    private width: number = 0;
    private height: number = 0;

    tableReady: boolean = false;

    constructor(private elementRef: ElementRef, private fontService: FontService, private BRADYBALLUtil: BRADYBALLCardUtil) { }

    ngOnInit(): void { }

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
            .attr('stroke-width', 4);
    }

    private drawTitle(): void {
        if (this.data.player) {
            this.svg.append('text')
                .attr('x', this.width / 2 - this.margin.left)
                .attr('y', -this.margin.top / 2)
                .attr('text-anchor', 'middle')
                .attr('font-family', 'Courier Prime')
                .attr('font-size', '20px')
                .attr('font-weight', 'bold')
                .attr('fill', 'black')
                .text(this.data.title);
        }
    }

    private drawGridLines(layout: any): void {
        // Horizontal grid lines
        for (let i = 1; i <= this.data.rows.length; i++) {
            const isHeaderLine = i === 1;
            const isCareerRow = i === this.data.rows.length;

            if (isHeaderLine || !isCareerRow) {
                this.drawHandDrawnLine(
                    0,
                    i * this.rowHeight,
                    layout.totalWidth,
                    i * this.rowHeight,
                    isHeaderLine || isCareerRow ? 2 : 1
                );
            }
        }
    }

    private drawHandDrawnLine(x1: number, y1: number, x2: number, y2: number, strokeWidth: number = 1): void {
        const lineFunction = d3.line().curve(d3.curveBasis);
        const points = this.generateHandDrawnPoints(x1, y1, x2, y2);

        this.svg.append('path')
            .attr('d', lineFunction(points))
            .attr('stroke', 'black')
            .attr('stroke-width', strokeWidth)
            .attr('fill', 'none');
    }

    private generateHandDrawnPoints(x1: number, y1: number, x2: number, y2: number): [number, number][] {
        const points: [number, number][] = [];
        const numPoints = 10;
        const randomness = 1;

        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const x = x1 + (x2 - x1) * t + (Math.random() - 0.5) * randomness;
            const y = y1 + (y2 - y1) * t + (Math.random() - 0.5) * randomness;
            points.push([x, y]);
        }

        return points;
    }

    private drawTableContent(layout: any): void {
        const headers = ['Season', ...this.data.rows[0].dataPoints.map(dp => dp.label)];

        // Draw headers
        this.drawRow(headers, 0, layout.columnWidths, true);

        // Draw data rows
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
                this.drawCell(cellValue, xPosition, columnWidths[columnIndex], yPosition, isHeader);
            }
            xPosition += columnWidths[columnIndex];
        });
    }

    private drawCell(value: string, x: number, width: number, y: number, isHeader: boolean = false): void {
        this.svg.append('text')
            .attr('x', x + width / 2)
            .attr('y', y)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-family', 'Courier Prime')
            .attr('font-size', isHeader ? `${this.headerFontSize}px` : `${this.fontSize}px`)
            .attr('font-weight', isHeader ? 'bold' : 'normal')
            .attr('fill', 'black')
            .text(value);
    }

    private drawBottomInformation(): void {
        const bottomY = this.height - this.margin.top - this.margin.bottom + 30;
        const centerX = this.width / 2 - this.margin.left;
        const maxWidth = (this.width - this.margin.left - this.margin.right) / 2 - 10;

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
            .attr("font-family", "Courier Prime")
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
                    .attr("font-family", "Courier Prime")
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

    saveSVG(): void {
        const svgElement = this.elementRef.nativeElement.querySelector('svg');
        this.BRADYBALLUtil.saveSVG(svgElement, 'stat_line.svg', ['courier-prime.woff2']);
    }

    private getEmbeddedStyles(courierPrimeFont: string): string {
        return `
            @font-face {
                font-family: 'Courier Prime';
                src: url(data:application/font-woff2;charset=utf-8;base64,${courierPrimeFont}) format('woff2');
                font-weight: normal;
                font-style: normal;
            }
            
            :root {
                --bb-black-color: #000000;
                --bb-white-color: #ffffff;
                --bb-brown-gold-color: #b07c29;
                --bb-red-color: #972828;
                --bb-dark-red-burgundy-color: #681e1e;
                --bb-orange-color: #ff5b00;
                --bb-blue-color: #405e9b;
                --bb-cream-off-white-color: #f8f5e3;
                --bb-green-color: #59c135;
            }
            text {
                font-family: 'Courier Prime', monospace;
            }
        `;
    }
}