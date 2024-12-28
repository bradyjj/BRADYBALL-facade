import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlayerAnalysisScreenComponent } from './components/player-analysis-screen/player-analysis-screen.component';

export const BRADYBALLCardRoutes: Routes = [
    {
        path: 'player-analysis', children: [
            { path: '', component: PlayerAnalysisScreenComponent }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(BRADYBALLCardRoutes)],
    exports: [RouterModule]
})
export class BRADYBALLPlayerAnalysisRoutingModule { }
export const routedComponents = [PlayerAnalysisScreenComponent];