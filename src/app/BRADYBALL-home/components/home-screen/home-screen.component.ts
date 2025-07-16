// home-screen.component.ts
import { Component, ViewChild } from '@angular/core';
import { SoccerBallComponent } from '../soccer-ball/soccer-ball.component';

@Component({
	selector: 'home-screen',
	templateUrl: './home-screen.component.html',
	styleUrls: ['./home-screen.component.scss'],
})
export class HomeScreenComponent {
	@ViewChild(SoccerBallComponent) soccerBall!: SoccerBallComponent;

	public isZoomed = false;

	onZoomStateChanged(isZoomed: boolean) {
		this.isZoomed = isZoomed;
	}

	onBradyballClick() {
		if (this.isZoomed && this.soccerBall) {
			this.soccerBall.goBackToDefaultView();
		}
	}
}
