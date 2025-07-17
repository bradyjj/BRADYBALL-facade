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
	public isHeaderFooterHidden = false;

	onZoomStateChanged(isZoomed: boolean) {
		this.isZoomed = isZoomed;
	}

	onHideHeaderFooter() {
		this.isHeaderFooterHidden = true;
	}

	onShowHeaderFooter() {
		this.isHeaderFooterHidden = false;
	}

	onBradyballClick() {
		if (this.isZoomed && this.soccerBall) {
			this.soccerBall.goBackToDefaultView();
		}
	}

	onCategorySelected(category: string) {
		if (this.soccerBall) {
			this.soccerBall.zoomToCategory(category);
		}
	}
}
