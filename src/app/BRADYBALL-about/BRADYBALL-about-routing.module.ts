import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BRADYBALLAboutScreenComponent } from './components/BRADYBALL-about-screen/BRADYBALL-about-screen.component';

export const BRADYBALLAboutRoutes: Routes = [
    {
        path: 'BRADYBALL-about', children: [
            { path: '', component: BRADYBALLAboutScreenComponent }
        ]
    },
]; 

@NgModule({
    imports: [RouterModule.forChild(BRADYBALLAboutRoutes)],
    exports: [RouterModule]
})
export class BRADYBALLAboutRoutingModule { }
export const routedComponents = [BRADYBALLAboutScreenComponent];