import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { categoryData } from '../../BRADYBALL-home/components/soccer-ball/soccer-ball.component';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
	@Input() isZoomed = false;
	@Output() bradyballClick = new EventEmitter<void>();

	isSettingsOpen = false;
	menuOpen = false;
	categories = ['About', 'News', 'Blog', 'Projects', 'Publications'];

	ngOnInit() {}

	toggleSettings() {
		this.isSettingsOpen = !this.isSettingsOpen;
	}

	openMenu() {
		this.menuOpen = true;
	}

	closeMenu() {
		this.menuOpen = false;
	}

	onBradyballClick() {
		this.bradyballClick.emit();
	}
}
