import { Component, Input, HostListener } from '@angular/core';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
	@Input() categories: string[] = [];
	menuOpen = false;
	isClosing = false;
	isHoveringMenu = false;
	hoveredIndex: number | null = null;
	mouseY: number = 0;

	@HostListener('document:mousemove', ['$event'])
	onMouseMove(event: MouseEvent) {
		if (this.menuOpen) {
			this.mouseY = event.clientY;
		}
	}

	openMenu() {
		this.isClosing = false;
		this.menuOpen = true;
	}

	closeMenu() {
		if (this.menuOpen) {
			this.isClosing = true;
			// Wait for closing animations to complete before hiding
			setTimeout(() => {
				this.menuOpen = false;
				this.isClosing = false;
			}, 200);
		}
	}

	onMenuMouseEnter() {
		this.isHoveringMenu = true;
		this.openMenu();
	}

	onMenuMouseLeave() {
		this.isHoveringMenu = false;
		// Simple delay to allow moving to menu entries
		setTimeout(() => {
			if (!this.isHoveringMenu) {
				this.closeMenu();
			}
		}, 150);
	}

	onMenuContainerMouseEnter() {
		this.isHoveringMenu = true;
	}

	onMenuContainerMouseLeave() {
		this.isHoveringMenu = false;
		this.hoveredIndex = null;
		this.closeMenu();
	}

	onMenuItemEnter(index: number) {
		this.hoveredIndex = index;
	}

	onMenuItemLeave() {
		this.hoveredIndex = null;
	}

	get menuEntries(): string[] {
		return ['MENU', ...this.categories];
	}

	getDataId(category: string): string {
		return category.toLowerCase().replace(/\s+/g, '-');
	}

	getHistogramPeak(i: number): number {
		// For now, return the center bar index (simulate peak alignment)
		return 9;
	}

	// Generate all histogram lines (3 per menu entry: entry + 2 intermediate)
	getHistogramLines(): Array<{
		index: number;
		type: 'entry' | 'intermediate';
		position: number;
	}> {
		const lines: Array<{
			index: number;
			type: 'entry' | 'intermediate';
			position: number;
		}> = [];

		for (let i = 0; i < this.categories.length; i++) {
			// Add the main entry line
			lines.push({
				index: i,
				type: 'entry',
				position: i * 50, // Relative to container
			});

			// Add 2 intermediate lines (except for the last entry)
			if (i < this.categories.length - 1) {
				lines.push({
					index: i,
					type: 'intermediate',
					position: i * 50 + 16.67, // 1/3 of the way to next entry
				});
				lines.push({
					index: i,
					type: 'intermediate',
					position: i * 50 + 33.33, // 2/3 of the way to next entry
				});
			}
		}

		return lines;
	}

	getDashedLineLength(lineInfo: {
		index: number;
		type: 'entry' | 'intermediate';
		position: number;
	}): number {
		if (!this.menuOpen) {
			return 20; // Base length when menu is closed
		}

		// Adjust mouse Y position to account for container offset
		const adjustedMouseY = this.mouseY - 140; // Subtract container top offset

		// Calculate distance from adjusted mouse Y position to line position
		const distance = Math.abs(adjustedMouseY - lineInfo.position);
		const maxDistance = 100; // Maximum distance for wave effect

		// Create a wave effect based on distance from mouse
		let waveIntensity = 0;
		if (distance < maxDistance) {
			// Create a bell curve effect - strongest at mouse position, weaker as distance increases
			waveIntensity = Math.max(0, 1 - distance / maxDistance);
			waveIntensity = Math.pow(waveIntensity, 2); // Make the curve more pronounced
		}

		// Base length plus wave effect
		const baseLength = 20;
		const maxWaveLength = 60; // Maximum length for the wave peak

		const finalLength = baseLength + waveIntensity * maxWaveLength;

		return Math.round(finalLength);
	}
}
