import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeScreenComponent } from './BRADYBALL-home/components/home-screen/home-screen.component';
import { PlayerAnalysisScreenComponent } from './BRADYBALL-player-analysis/components/player-analysis-screen/player-analysis-screen.component';

export const APP_ROUTES: Routes = [
	{ path: '', redirectTo: '/home', pathMatch: 'full' },
	{ path: 'home', component: HomeScreenComponent },
	{ path: 'player-analysis', component: PlayerAnalysisScreenComponent },
	{ path: 'about', redirectTo: '/home' },
	{ path: '**', redirectTo: '/home' },
];

@NgModule({
	imports: [RouterModule.forRoot(APP_ROUTES, { useHash: false })],
	exports: [RouterModule],
})
export class AppRoutingModule {}
