import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import { StatLineData } from '../../models/stat-line-player.model';
import { FontService } from '../../../../assets/fonts/font.service';
import { BRADYBALLCardUtil } from '../../util/BRADYBALL-card.util';

@Component({
    selector: 'stat-line',
    templateUrl: './stat-line.component.html',
    styleUrls: ['./stat-line.component.scss'],
})
export class StatLineComponent implements OnInit, OnChanges, AfterViewInit {
    @Input() data!: StatLineData;

    private colorPalette: string[] = [];
    private svg: any;
    private margin = { top: 20, right: 20, bottom: 20, left: 20 };
    private minColumnWidth = 70;
    private maxColumnWidth = 150;
    private rowHeight = 40;
    private fontSize = 14;
    private headerFontSize = 16;
    private width: number = 0;
    private height: number = 0;

    tableReady: boolean = false;

    constructor(private elementRef: ElementRef, private fontService: FontService, private BRADYBALLUtil: BRADYBALLCardUtil) { }

    ngOnInit(): void {
        this.defineColorPalette();
    }

    private defineColorPalette(): void {
        this.colorPalette = [
            this.BRADYBALLUtil.getCssVariableValue('--bb-brown-gold-color'),
            this.BRADYBALLUtil.getCssVariableValue('--bb-red-color'),
            this.BRADYBALLUtil.getCssVariableValue('--bb-dark-red-burgundy-color'),
            this.BRADYBALLUtil.getCssVariableValue('--bb-orange-color'),
            this.BRADYBALLUtil.getCssVariableValue('--bb-cream-off-white-color')
        ];
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
            console.error('No data available for stat line table');
            this.tableReady = false;
            return;
        }

        this.defineColorPalette();
        d3.select(this.elementRef.nativeElement).select('svg').remove();

        const layout = this.calculateLayout();
        this.width = layout.totalWidth;
        this.height = (this.data.rows.length + 1) * this.rowHeight;
        const totalWidth = this.width + this.margin.left + this.margin.right;
        const totalHeight = this.height + this.margin.top + this.margin.bottom;

        this.svg = d3.select(this.elementRef.nativeElement)
            .append('svg')
            .attr('width', totalWidth)
            .attr('height', totalHeight)
            .append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        this.createBaseGradient();
        this.createVintageFilter();
        //this.drawTableHeader(layout);
        this.drawTableColumns(layout);
        this.drawTableRows(layout);

        this.tableReady = true;
    }

    private calculateLayout() {
        const headers = ['Season', ...this.data.rows[0].dataPoints.map(dp => dp.label)];
        const columnWidths = headers.map(header => {
            const width = Math.max(this.minColumnWidth, Math.min(this.maxColumnWidth, header.length * 10));
            return this.isNumeric(header) ? this.minColumnWidth : width;
        });
        const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);

        return { columnWidths, totalWidth };
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
            { offset: '40%', color: '#8B0000' },    // Dark red
            { offset: '48%', color: '#660000' },    // Very dark red
            { offset: '50%', color: '#000000' },    // Black circle
            { offset: '52%', color: '#660000' },    // Very dark red
            { offset: '60%', color: '#8B0000' },    // Dark red
            { offset: '70%', color: '#FF4500' },    // Orange-red
            { offset: '75%', color: '#FFD700' },    // Back to yellow (vibrant but worn)
            { offset: '80%', color: '#FF4500' },    // Orange-red
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
                .attr('stop-opacity', stop.offset === '50%' || stop.offset === '90%' ? 0.95 : 0.88);
        });

        this.addNoiseFilter();
        this.addVintageOverlay();
    }

    private addNoiseFilter(): void {
        const filter = this.svg.append('defs')
            .append('filter')
            .attr('id', 'noise');

        filter.append('feTurbulence')
            .attr('type', 'fractalNoise')
            .attr('baseFrequency', '0.7')
            .attr('numOctaves', '4')
            .attr('stitchTiles', 'stitch');

        filter.append('feColorMatrix')
            .attr('type', 'saturate')
            .attr('values', '0.8');

        filter.append('feComposite')
            .attr('operator', 'in')
            .attr('in2', 'SourceGraphic')
            .attr('result', 'noisy');

        filter.append('feBlend')
            .attr('in', 'SourceGraphic')
            .attr('in2', 'noisy')
            .attr('mode', 'overlay')
            .attr('opacity', '0.15');
    }

    private addVintageOverlay(): void {
        const overlay = this.svg.append('defs')
            .append('radialGradient')
            .attr('id', 'vintageOverlay')
            .attr('cx', '50%')
            .attr('cy', '50%')
            .attr('r', '50%');

        overlay.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#FFA07A')
            .attr('stop-opacity', '0.1');

        overlay.append('stop')
            .attr('offset', '50%')
            .attr('stop-color', '#CD5C5C')
            .attr('stop-opacity', '0.15');

        overlay.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#8B4513')
            .attr('stop-opacity', '0.2');
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
    }

    private drawTableHeader(layout: any): void {
        this.svg.append('text')
            .attr('x', layout.totalWidth / 2)
            .attr('y', -this.margin.top / 2)
            .attr('text-anchor', 'middle')
            .attr('font-family', 'Courier Prime')
            .attr('font-size', '24px')
            .attr('fill', this.colorPalette[1])
            .text(this.data.player);
    }

    private drawTableColumns(layout: any): void {
        const headers = ['', ...this.data.rows[0].dataPoints.map(dp => dp.label)];
        let xPosition = 0;

        this.svg.selectAll('.header')
            .data(headers)
            .enter()
            .append('text')
            .attr('x', (d: any, i: number) => {
                const x = xPosition + layout.columnWidths[i] / 2;
                xPosition += layout.columnWidths[i];
                return x;
            })
            .attr('y', this.rowHeight / 2)
            .attr('text-anchor', 'middle')
            .attr('font-family', 'Courier Prime')
            .attr('font-size', `${this.headerFontSize}px`)
            .attr('font-weight', 'bold')
            .attr('fill', this.colorPalette[2])
            .text((d: any) => d);
    }

    private drawTableRows(layout: any): void {
        this.data.rows.forEach((row, rowIndex) => {
            const yPosition = (rowIndex + 1.5) * this.rowHeight;
            let xPosition = 0;

            // Add season
            this.svg.append('text')
                .attr('x', layout.columnWidths[0] / 2)
                .attr('y', yPosition)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('font-family', 'Courier Prime')
                .attr('font-size', `${this.fontSize}px`)
                .attr('font-weight', 'bold')
                .attr('fill', this.BRADYBALLUtil.getCssVariableValue('--bb-red-color'))
                .text(row.season);

            xPosition += layout.columnWidths[0];

            // Add other data points
            row.dataPoints.forEach((dataPoint, i) => {
                const x = xPosition + layout.columnWidths[i + 1] / 2;
                xPosition += layout.columnWidths[i + 1];

                const text = this.svg.append('text')
                    .attr('x', x)
                    .attr('y', yPosition)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .attr('font-family', 'Pinegrove')
                    .attr('font-size', `${this.fontSize}px`)
                    .attr('fill', 'black')
                    .text(dataPoint.value);

                if (this.isNumeric(dataPoint.value)) {
                    text.attr('transform', `
                        translate(
                            ${this.getMisprintOffset(1)}, 
                            ${this.getMisprintOffset(1)}
                        ) 
                        rotate(
                            ${this.getMisprintRotation(0.5)}, 
                            ${x}, 
                            ${yPosition}
                        )
                    `);
                }
            });
        });
    }

    private getMisprintOffset(factor: number = 1): number {
        return (Math.random() - 0.5) * 2 * factor;
    }

    private getMisprintRotation(factor: number = 1): number {
        return (Math.random() - 0.5) * 2 * factor;
    }

    private isNumeric(value: any): boolean {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }
}