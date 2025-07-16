import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'crt-monitor',
	templateUrl: './crt-monitor.component.html',
	styleUrls: ['./crt-monitor.component.scss'],
})
export class CrtMonitorComponent {
	@Input() title: string = '';
	@Input() showMonitor: boolean = false;
	@Input() isAboutSection: boolean = false;
	@Output() overlayClick = new EventEmitter<MouseEvent>();

	onOverlayClick(event: MouseEvent) {
		this.overlayClick.emit(event);
	}
}
