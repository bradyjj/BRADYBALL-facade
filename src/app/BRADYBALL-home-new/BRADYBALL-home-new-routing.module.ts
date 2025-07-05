import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NewHomeScreenComponent } from './components/new-home-screen/new-home-screen.component';

export const BRADYBALLHomeRoutes: Routes = [
    {
        path: 'home', children: [
            { path: '', component: NewHomeScreenComponent }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(BRADYBALLHomeRoutes)],
    exports: [RouterModule]
})
export class BRADYBALLHomeNewRoutingModule { }
export const routedComponents = [NewHomeScreenComponent];