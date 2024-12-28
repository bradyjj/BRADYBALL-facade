import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AboutScreenComponent } from './components/about-screen/about-screen.component';

export const BRADYBALLAboutRoutes: Routes = [
    {
        path: 'BRADYBALL-about', children: [
            { path: '', component: AboutScreenComponent }
        ]
    },
]; 

@NgModule({
    imports: [RouterModule.forChild(BRADYBALLAboutRoutes)],
    exports: [RouterModule]
})
export class BRADYBALLAboutRoutingModule { }
export const routedComponents = [AboutScreenComponent];