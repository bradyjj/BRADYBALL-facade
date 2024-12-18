import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BRADYBALLHomeScreenComponent } from './components/BRADYBALL-home-screen/BRADYBALL-home-screen.component';

export const BRADYBALLHomeRoutes: Routes = [
    {
        path: 'BRADYBALL-home', children: [
            { path: '', component: BRADYBALLHomeScreenComponent }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(BRADYBALLHomeRoutes)],
    exports: [RouterModule]
})
export class BRADYBALLHomeRoutingModule { }
export const routedComponents = [BRADYBALLHomeScreenComponent];