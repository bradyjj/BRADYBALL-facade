import { RouterModule, Routes } from "@angular/router";
import { AppComponent } from "./app.component";
import { NgModule } from "@angular/core";

export const APP_ROUTES: Routes = [
    { path: '', redirectTo: '/BRADYBALL-home', pathMatch: 'full' },
    { path: 'card', redirectTo: '/BRADYBALL-card', pathMatch: 'full' },
    { path: 'about', redirectTo: '/BRADYBALL-about', pathMatch: 'full' },
    { path: 'app', component: AppComponent, children: [
        
    ]},
];

@NgModule({
    imports: [RouterModule.forRoot(APP_ROUTES)],
    exports: [RouterModule]
})
export class AppRoutingModule { }