import {
	AfterViewInit,
	Component,
	ElementRef,
	Input,
	OnChanges,
	OnInit,
	SimpleChanges,
} from '@angular/core';
import * as d3 from 'd3';
import { FontService } from '../../../../assets/fonts/font.service';
import { BRADYBALLCardUtil } from '../../util/player-analysis.util';
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
	private readonly FONT_SIZE = 21;
	private readonly HEADER_FONT_SIZE = 22;
	private readonly BORDER_RADIUS = 20;
	private readonly BORDER_WIDTH = 8;
	private readonly TITLE_BACKGROUND_HEIGHT = 110;
	private readonly TITLE_LEFT_MARGIN = 20;
	private readonly CREAM_COLOR;
	private readonly RED_COLOR;
	private readonly BLACK_COLOR;
	private readonly TABLE_PADDING = 10;

	private titleTextColor: string = ``;
	private chartBackgroundColor: string = ``;
	private chartTextColor: string = ``;
	private borderColor: string = ``;

	private width: number = 0;
	private height: number = 0;

	tableReady: boolean = false;
	fontsLoaded: boolean = false;

	private fonts: { [key: string]: string } = {};

	constructor(
		public elementRef: ElementRef,
		private fontService: FontService,
		private BRADYBALLUtil: BRADYBALLCardUtil,
	) {
		this.CREAM_COLOR = this.BRADYBALLUtil.getCssVariableValue('--bb-cream-color');
		this.RED_COLOR = this.BRADYBALLUtil.getCssVariableValue('--bb-red-card-color');
		this.BLACK_COLOR = this.BRADYBALLUtil.getCssVariableValue('--bb-black-color');

		this.titleTextColor = this.BLACK_COLOR;
		this.chartBackgroundColor = this.RED_COLOR;
		this.chartTextColor = this.CREAM_COLOR;
		this.borderColor = this.BLACK_COLOR;
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
			'merriweather-bold.woff2',
			'league-spartan-regular.woff2',
			'league-spartan-bold.woff2',
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
			},
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

	private createSvg(): void {
		// Clear any existing SVG
		d3.select(this.elementRef.nativeElement).select('svg').remove();

		// Calculate dimensions from layout
		const layout = this.calculateLayout();
		this.width = Math.max(layout.totalWidth + this.MARGIN.left + this.MARGIN.right, 800); // Set minimum width
		this.height =
			(this.data.rows.length + 1) * this.ROW_HEIGHT +
			this.MARGIN.top +
			this.MARGIN.bottom +
			this.TABLE_PADDING;

		// Create new SVG
		this.svg = d3
			.select(this.elementRef.nativeElement.querySelector('.stat-table'))
			.append('svg')
			.attr('width', this.width)
			.attr('height', this.height)
			.attr('viewBox', `0 0 ${this.width} ${this.height}`)
			.attr('preserveAspectRatio', 'xMinYMid meet')
			.append('g')
			.attr('transform', `translate(${this.MARGIN.left},${this.MARGIN.top})`);
	}

	private drawTable(): void {
		if (!this.data || !this.data.rows || this.data.rows.length === 0) {
			this.tableReady = false;
			return;
		}

		const layout = this.calculateLayout();
		this.createSvg(); // Call the new createSvg method

		this.drawBackgroundAndBorder();
		this.drawTitle();
		this.drawTableContent(layout);

		this.tableReady = true;
	}

	private drawBackgroundAndBorder(): void {
		const totalWidth = this.width;
		const totalHeight = this.height;
		const borderRadius = this.BORDER_RADIUS;
		const borderWidth = this.BORDER_WIDTH;
		const x = -this.MARGIN.left;
		const y = -this.MARGIN.top;
		const creamHeight = this.TITLE_BACKGROUND_HEIGHT;

		// 1. Draw black background (full rectangle)
		this.svg
			.append('rect')
			.attr('x', x)
			.attr('y', y)
			.attr('width', totalWidth)
			.attr('height', totalHeight)
			.attr('fill', this.borderColor);

		// 2. Draw cream background (full area with rounded corners)
		const creamPath = `
            M ${x + borderWidth / 2},${y + borderRadius}
            Q ${x + borderWidth / 2},${y + borderWidth / 2} ${x + borderRadius},${y + borderWidth / 2}
            H ${x + totalWidth - borderRadius}
            Q ${x + totalWidth - borderWidth / 2},${y + borderWidth / 2} ${x + totalWidth - borderWidth / 2},${y + borderRadius}
            V ${y + totalHeight - borderRadius}
            Q ${x + totalWidth - borderWidth / 2},${y + totalHeight - borderWidth / 2} ${x + totalWidth - borderRadius},${y + totalHeight - borderWidth / 2}
            H ${x + borderRadius}
            Q ${x + borderWidth / 2},${y + totalHeight - borderWidth / 2} ${x + borderWidth / 2},${y + totalHeight - borderRadius}
            Z
        `;
		this.svg.append('path').attr('d', creamPath).attr('fill', this.CREAM_COLOR);

		// 3. Draw red background (bottom section with curved top-left corner and straight right edge)
		const redPath = `
            M ${x + borderWidth / 2},${y + creamHeight + borderRadius}
            Q ${x + borderWidth / 2},${y + creamHeight} ${x + borderWidth / 2 + borderRadius},${y + creamHeight}
            H ${x + totalWidth - borderWidth / 2}
            V ${y + totalHeight - borderRadius}
            Q ${x + totalWidth - borderWidth / 2},${y + totalHeight - borderWidth / 2} ${x + totalWidth - borderRadius},${y + totalHeight - borderWidth / 2}
            H ${x + borderRadius}
            Q ${x + borderWidth / 2},${y + totalHeight - borderWidth / 2} ${x + borderWidth / 2},${y + totalHeight - borderRadius}
            Z
        `;
		this.svg.append('path').attr('d', redPath).attr('fill', this.RED_COLOR);

		// 4. Add stroke to the red background
		this.svg
			.append('path')
			.attr('d', redPath)
			.attr('fill', 'none')
			.attr('stroke', this.borderColor)
			.attr('stroke-width', 3);

		// 5. Draw outer border (transparent fill, only stroke)
		const borderPath = `
            M ${x + borderWidth / 2},${y + borderRadius}
            Q ${x + borderWidth / 2},${y + borderWidth / 2} ${x + borderRadius},${y + borderWidth / 2}
            H ${x + totalWidth - borderRadius}
            Q ${x + totalWidth - borderWidth / 2},${y + borderWidth / 2} ${x + totalWidth - borderWidth / 2},${y + borderRadius}
            V ${y + totalHeight - borderRadius}
            Q ${x + totalWidth - borderWidth / 2},${y + totalHeight - borderWidth / 2} ${x + totalWidth - borderRadius},${y + totalHeight - borderWidth / 2}
            H ${x + borderRadius}
            Q ${x + borderWidth / 2},${y + totalHeight - borderWidth / 2} ${x + borderWidth / 2},${y + totalHeight - borderRadius}
            Z
        `;
		this.svg
			.append('path')
			.attr('d', borderPath)
			.attr('fill', 'none')
			.attr('stroke', this.borderColor)
			.attr('stroke-width', borderWidth);
	}

	private calculateLayout() {
		const headers = ['Season', ...this.data.rows[0].dataPoints.map((dp) => dp.label)];
		const columnWidths = headers.map((header, index) => {
			let maxWidth = this.getTextWidth(header, `${this.HEADER_FONT_SIZE}px League Spartan`);

			this.data.rows.forEach((row) => {
				let cellText =
					index === 0 ? row.season : row.dataPoints[index - 1].value.toString();
				const cellWidth = this.getTextWidth(cellText, `${this.FONT_SIZE}px League Spartan`);
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

	private drawBackground(layout: any): void {
		const totalWidth = this.width;
		const totalHeight = this.height;
		const curveRadius = this.BORDER_RADIUS * 2;

		// Create a group for the background elements
		const backgroundGroup = this.svg.append('g');

		// Full cream background
		backgroundGroup
			.append('rect')
			.attr('x', -this.MARGIN.left)
			.attr('y', -this.MARGIN.top)
			.attr('width', totalWidth)
			.attr('height', totalHeight)
			.attr('fill', this.CREAM_COLOR);

		// Path for the red background and stroke
		const redBackgroundPath = `
            M ${-this.MARGIN.left},${-this.MARGIN.top + this.TITLE_BACKGROUND_HEIGHT + curveRadius}
            q 0,${-curveRadius} ${curveRadius},${-curveRadius}
            h ${totalWidth - curveRadius - this.MARGIN.left}
            v ${totalHeight - this.TITLE_BACKGROUND_HEIGHT - this.BORDER_RADIUS}
            a ${this.BORDER_RADIUS},${this.BORDER_RADIUS} 0 0 1 ${-this.BORDER_RADIUS},${this.BORDER_RADIUS}
            h ${-(totalWidth - 2 * this.BORDER_RADIUS)}
            a ${this.BORDER_RADIUS},${this.BORDER_RADIUS} 0 0 1 ${-this.BORDER_RADIUS},${-this.BORDER_RADIUS}
            v ${-(totalHeight - this.TITLE_BACKGROUND_HEIGHT - curveRadius)}
            z
        `;

		// Red background for the chart area (excluding title area)
		backgroundGroup
			.append('path')
			.attr('d', redBackgroundPath)
			.attr('fill', this.chartBackgroundColor);

		// Stroke around the red section only
		backgroundGroup
			.append('path')
			.attr('d', redBackgroundPath)
			.attr('fill', 'none')
			.attr('stroke', this.borderColor)
			.attr('stroke-width', 3);
	}

	private drawTitle(): void {
		if (this.data.title) {
			const titleText = this.data.title.toUpperCase();
			const firstLetter = titleText.charAt(0);
			const restOfTitle = titleText.slice(1);

			const fontSize = 58;
			const smallerFontSize = fontSize * 0.45;
			const titleYOffset = -this.MARGIN.top + this.BORDER_WIDTH + 70; // Adjusted Y position
			const letterSpacing = 1;

			const titleGroup = this.svg
				.append('g')
				.attr('transform', `translate(${this.BORDER_WIDTH / 2}, 0)`);

			titleGroup
				.append('text')
				.attr('x', this.TITLE_LEFT_MARGIN)
				.attr('y', titleYOffset)
				.attr('text-anchor', 'start')
				.attr('class', 'bb-text-eb-garamond bb-text-bold bb-black-color')
				.attr('font-family', 'EB Garamond, serif')
				.attr('font-weight', 'bold')
				.attr('font-size', `${fontSize}px`)
				.attr('fill', this.titleTextColor)
				.text(firstLetter);

			const tempText = titleGroup
				.append('text')
				.attr('font-family', 'Times New Roman, serif')
				.attr('font-size', `${smallerFontSize}px`)
				.attr('letter-spacing', `${letterSpacing}px`)
				.text(restOfTitle);
			const restOfTitleWidth = tempText.node().getComputedTextLength();
			tempText.remove();

			const underlineWidth = restOfTitleWidth + fontSize * 0.8;

			titleGroup
				.append('line')
				.attr('x1', this.TITLE_LEFT_MARGIN + fontSize * 0.85)
				.attr('y1', titleYOffset - 1.5)
				.attr('x2', this.TITLE_LEFT_MARGIN + underlineWidth + 7)
				.attr('y2', titleYOffset - 1.5)
				.attr('class', 'bb-black-color')
				.attr('stroke', this.titleTextColor)
				.attr('stroke-width', 3.5);

			titleGroup
				.append('text')
				.attr('x', this.TITLE_LEFT_MARGIN + fontSize * 0.7)
				.attr('y', titleYOffset - fontSize * 0.25)
				.attr('text-anchor', 'start')
				.attr('class', 'bb-text-merriweather bb-text-bold bb-black-color')
				.attr('font-size', `${smallerFontSize}px`)
				.attr('letter-spacing', `${letterSpacing}px`)
				.attr('fill', this.titleTextColor)
				.text(restOfTitle);

			const diamondSize = 8;
			const xOffset = 13;
			const yOffset = 2;
			titleGroup
				.append('path')
				.attr(
					'd',
					`M${this.TITLE_LEFT_MARGIN + underlineWidth + xOffset},${titleYOffset - diamondSize / 2 - yOffset} 
                            L${this.TITLE_LEFT_MARGIN + underlineWidth + xOffset + diamondSize / 2},${titleYOffset - yOffset} 
                            L${this.TITLE_LEFT_MARGIN + underlineWidth + xOffset},${titleYOffset + diamondSize / 2 - yOffset} 
                            L${this.TITLE_LEFT_MARGIN + underlineWidth + xOffset - diamondSize / 2},${titleYOffset - yOffset} Z`,
				)
				.attr('class', 'bb-black-color')
				.attr('fill', this.titleTextColor);
		}
	}

	private drawGridLines(layout: any, extraTopSpace: number): void {
		// Middle rows (lighter)
		for (let i = 0; i < this.data.rows.length - 1; i++) {
			this.svg
				.append('rect')
				.attr('x', this.BORDER_WIDTH)
				.attr('y', (i + 1) * this.ROW_HEIGHT + extraTopSpace)
				.attr('width', layout.totalWidth - 2 * this.BORDER_WIDTH)
				.attr('height', this.ROW_HEIGHT)
				.attr('fill', this.BLACK_COLOR)
				.attr('fill-opacity', '0.05');
		}

		// Draw horizontal grid lines
		for (let i = 1; i <= this.data.rows.length; i++) {
			this.svg
				.append('line')
				.attr('x1', this.BORDER_WIDTH)
				.attr('y1', i * this.ROW_HEIGHT + extraTopSpace)
				.attr('x2', layout.totalWidth - this.BORDER_WIDTH)
				.attr('y2', i * this.ROW_HEIGHT + extraTopSpace)
				.attr('stroke', 'black')
				.attr('stroke-width', i === this.data.rows.length || i === 1 ? 2 : 1)
				.attr('stroke-opacity', 1);
		}

		// Calculate positions
		let xPosition = 0;
		const positions = layout.columnWidths.map((width: number) => {
			xPosition += width;
			return xPosition;
		});

		// Draw vertical lines
		positions.forEach((pos: number, index: number) => {
			const isLineExemption = index === 1 || index === 0 || index === 2;

			if (isLineExemption) {
				// Draw line from top to just before career row
				this.svg
					.append('line')
					.attr('x1', pos)
					.attr('y1', extraTopSpace)
					.attr('x2', pos)
					.attr('y2', this.data.rows.length * this.ROW_HEIGHT + extraTopSpace)
					.attr('stroke', 'black')
					.attr('stroke-width', 1)
					.attr('stroke-opacity', 0.3);
			} else {
				// Draw full lines for all other columns
				this.svg
					.append('line')
					.attr('x1', pos)
					.attr('y1', extraTopSpace)
					.attr('x2', pos)
					.attr('y2', (this.data.rows.length + 1) * this.ROW_HEIGHT + extraTopSpace)
					.attr('stroke', 'black')
					.attr('stroke-width', 1)
					.attr('stroke-opacity', 0.3);
			}
		});
	}

	private drawTableContent(layout: any): void {
		const headers = ['Season', ...this.data.rows[0].dataPoints.map((dp) => dp.label)];

		// Draw headers
		const startY = this.TITLE_BACKGROUND_HEIGHT - this.MARGIN.top + this.TABLE_PADDING;
		this.drawRow(headers, 0, layout.columnWidths, true, startY);

		this.data.rows.forEach((row, index) => {
			const rowData = [row.season, ...row.dataPoints.map((dp) => dp.value.toString())];
			this.drawRow(
				rowData,
				index + 1,
				layout.columnWidths,
				false,
				startY,
				row.season.toLowerCase() === 'career',
			);
		});

		this.drawGridLines(layout, startY);
	}

	private drawRow(
		rowData: string[],
		rowIndex: number,
		columnWidths: number[],
		isHeader: boolean,
		extraTopSpace: number,
		isCareer: boolean = false,
	): void {
		let xPosition = 0;
		rowData.forEach((cellValue, columnIndex) => {
			const yPosition = (rowIndex + 0.65) * this.ROW_HEIGHT + extraTopSpace;
			this.drawCell(
				cellValue,
				xPosition,
				columnWidths[columnIndex],
				yPosition,
				isHeader,
				isCareer,
			);
			xPosition += columnWidths[columnIndex];
		});
	}

	private drawCell(
		value: string,
		x: number,
		width: number,
		y: number,
		isHeader: boolean = false,
		isCareer: boolean = false,
	): void {
		const fontSize = isHeader || isCareer ? this.HEADER_FONT_SIZE : this.FONT_SIZE;
		const fontWeight = isHeader || isCareer ? '700' : '500';

		// Create a group for the text and its stroke
		const textGroup = this.svg
			.append('g')
			.attr('transform', `translate(${x + width / 2}, ${y})`);

		// Add the stroke (black outline)
		textGroup
			.append('text')
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'auto')
			.attr('class', `bb-text-league-spartan bb-text-bold`)
			.attr('font-weight', 'bold')
			.attr('font-family', 'League Spartan')
			.attr('font-size', `${fontSize}px`)
			.attr('font-weight', fontWeight)
			.attr('stroke', 'black')
			.attr('stroke-width', '1.25px')
			.attr('fill', 'none')
			.attr('text-rendering', 'geometricPrecision')
			.text(value);

		// Add subtle drop shadow for depth
		textGroup
			.append('text')
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'auto')
			.attr('class', `bb-text-league-spartan bb-text-bold`)
			.attr('font-weight', 'bold')
			.attr('font-family', 'League Spartan')
			.attr('font-size', `${fontSize}px`)
			.attr('font-weight', fontWeight)
			.attr('fill', 'rgba(0,0,0,0.3)')
			.attr('transform', 'translate(1,1)')
			.text(value);

		// Add the main text
		textGroup
			.append('text')
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'auto')
			.attr('class', `bb-text-league-spartan bb-text-bold`)
			.attr('font-weight', 'bold')
			.attr('font-family', 'League Spartan')
			.attr('font-size', `${fontSize}px`)
			.attr('font-weight', fontWeight)
			.attr('fill', this.chartTextColor)
			.style('fill', this.chartTextColor)
			.attr('text-rendering', 'geometricPrecision')
			.text(value);
	}

	saveSVG(): void {
		const svgElement = this.elementRef.nativeElement.querySelector('svg');
		if (!svgElement) {
			console.error('SVG element not found');
			return;
		}

		// Clone the SVG
		const clonedSvg = svgElement.cloneNode(true) as SVGElement;

		// Set basic SVG attributes
		clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

		// Set a higher base resolution (4x the display size)
		const scale = 4;
		const width = this.width * scale;
		const height = this.height * scale;

		clonedSvg.setAttribute('width', `${width}`);
		clonedSvg.setAttribute('height', `${height}`);
		clonedSvg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);

		// Remove any existing background rectangles
		clonedSvg.querySelectorAll('rect').forEach((rect) => {
			if (
				rect.getAttribute('width') === '100%' ||
				rect.getAttribute('width') === `${width}`
			) {
				rect.remove();
			}
		});

		// Add style for text rendering
		const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
		styleElement.textContent = `
            text {
                text-rendering: geometricPrecision;
                shape-rendering: geometricPrecision;
            }
        `;
		clonedSvg.insertBefore(styleElement, clonedSvg.firstChild);

		// Serialize to string
		const serializer = new XMLSerializer();
		let svgString = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    ${serializer.serializeToString(clonedSvg)}`;

		// Embed fonts
		svgString = this.fontService.embedFontsInSVG(svgString, this.fonts);

		// Save the SVG
		this.BRADYBALLUtil.saveSVGToFile(svgString, 'stat_line.svg');
	}
}
