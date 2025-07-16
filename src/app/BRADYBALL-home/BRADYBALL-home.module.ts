import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FontService } from '../../assets/fonts/font.service';
import { FormsModule } from '@angular/forms';
import { BRADYBALLCommonModule } from '../common/BRADYBALL-common.module';
import { BRADYBALLHomeRoutingModule } from './BRADYBALL-home-routing.module';
import { HomeScreenComponent } from './components/home-screen/home-screen.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { SoccerBallComponent } from './components/soccer-ball/soccer-ball.component';
import { ResumeComponent } from './components/resume/resume.component';
import { CrtMonitorComponent } from '../common/crt-monitor/crt-monitor.component';
import { AboutContentComponent } from './components/about-content/about-content.component';

@NgModule({
	imports: [
		SharedModule,
		BRADYBALLHomeRoutingModule,
		CommonModule,
		FormsModule,
		HttpClientModule,
		BRADYBALLCommonModule,
	],
	exports: [],
	declarations: [
		HomeScreenComponent,
		HomePageComponent,
		SoccerBallComponent,
		ResumeComponent,
		CrtMonitorComponent,
		AboutContentComponent,
	],
	providers: [FontService],
})
export class BRADYBALLHomeModule {}
