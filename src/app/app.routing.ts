import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { BRADYBALLHomeScreenComponent } from "./BRADYBALL-home/components/BRADYBALL-home-screen/BRADYBALL-home-screen.component";
import { BRADYBALLCardScreenComponent } from "./BRADYBALL-card/components/BRADYBALL-card-screen/BRADYBALL-card-screen.component";
import { BRADYBALLAboutScreenComponent } from "./BRADYBALL-about/components/BRADYBALL-about-screen/BRADYBALL-about-screen.component";

export const APP_ROUTES: Routes = [
    { path: '', component: BRADYBALLHomeScreenComponent }, // Default home screen
    { path: 'BRADYBALL-home', component: BRADYBALLHomeScreenComponent },
    { path: 'BRADYBALL-player-analysis', component: BRADYBALLCardScreenComponent },
    { path: 'BRADYBALL-about', component: BRADYBALLAboutScreenComponent },
    { path: '**', redirectTo: '/BRADYBALL-home' }, // Catch-all redirect
];

@NgModule({
    imports: [RouterModule.forRoot(APP_ROUTES)],
    exports: [RouterModule],
})
export class AppRoutingModule { }
