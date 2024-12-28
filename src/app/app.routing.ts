import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AboutScreenComponent } from "./BRADYBALL-about/components/about-screen/about-screen.component";
import { HomeScreenComponent } from "./BRADYBALL-home/components/home-screen/home-screen.component";
import { PlayerAnalysisScreenComponent } from "./BRADYBALL-player-analysis/components/player-analysis-screen/player-analysis-screen.component";

export const APP_ROUTES: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeScreenComponent },
    { path: 'player-analysis', component: PlayerAnalysisScreenComponent },
    { path: 'about', component: AboutScreenComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(APP_ROUTES, { useHash: false })],
    exports: [RouterModule],
})
export class AppRoutingModule { }