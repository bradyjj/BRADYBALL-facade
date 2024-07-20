import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BRADYBALLCardScreenComponent } from './components/BRADYBALL-card-screen/BRADYBALL-card-screen.component';


export const BRADYBALLcardRoutes: Routes = [
    {
        path: 'BRADYBALL-card', children: [
            { path: '', component: BRADYBALLCardScreenComponent }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(BRADYBALLcardRoutes)],
    exports: [RouterModule]
})
export class BRADYBALLCardRoutingModule { }
export const routedComponents = [BRADYBALLCardScreenComponent];