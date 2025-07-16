import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import { BRADYBALLPlayerAnalysisModule } from './BRADYBALL-player-analysis/BRADYBALL-player-analysis.module';
import { BRADYBALLHomeModule } from './BRADYBALL-home/BRADYBALL-home.module';
import { BRADYBALLCommonModule } from './common/BRADYBALL-common.module';
import { FontService } from '../assets/fonts/font.service';

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		HttpClientModule,
		AppRoutingModule,
		BRADYBALLPlayerAnalysisModule,
		BRADYBALLHomeModule,
		BRADYBALLCommonModule,
	],
	providers: [FontService],
	bootstrap: [AppComponent],
})
export class AppModule {}
