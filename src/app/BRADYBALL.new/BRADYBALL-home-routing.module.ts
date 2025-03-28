import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeScreenComponent } from './components/home-screen/home-screen.component';

export const BRADYBALLHomeRoutes: Routes = [
    {
        path: 'home', children: [
            { path: '', component: HomeScreenComponent }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(BRADYBALLHomeRoutes)],
    exports: [RouterModule]
})
export class BRADYBALLHomeRoutingModule { }
export const routedComponents = [HomeScreenComponent];