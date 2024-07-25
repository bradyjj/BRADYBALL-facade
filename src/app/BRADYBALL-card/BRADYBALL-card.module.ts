import { NgModule } from "@angular/core";
import { BRADYBALLCardPageComponent } from "./components/BRADYBALL-card-page/BRADYBALL-card-page.component";
import { BRADYBALLCardScreenComponent } from "./components/BRADYBALL-card-screen/BRADYBALL-card-screen.component";
import { PlayerSearchComponent } from "./components/player-search/player-search.component";
import { BRADYBALLCardRoutingModule } from "./BRADYBALL-card-routing.module";
import { SharedModule } from "../shared/shared.module";
import { RadarChartComponent } from "./components/radar-chart/radar-chart.component";
import { StatLineComponent } from "./components/stat-line/stat-line.component";
import { CommonModule } from "@angular/common";

@NgModule({
    imports: [
        SharedModule,
        BRADYBALLCardRoutingModule,
        CommonModule
    ],
    exports: [],
    declarations: [
        BRADYBALLCardScreenComponent,
        BRADYBALLCardPageComponent,
        PlayerSearchComponent,
        RadarChartComponent,
        StatLineComponent
    ],
    providers: [],  
})
export class BRADYBALLCardModule { }