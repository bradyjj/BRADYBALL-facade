import { NgModule } from "@angular/core";
import { BRADYBALLCardPageComponent } from "./components/BRADYBALL-card-page/BRADYBALL-card-page.component";
import { BRADYBALLCardScreenComponent } from "./components/BRADYBALL-card-screen/BRADYBALL-card-screen.component";
import { PlayerSearchComponent } from "./components/player-search/player-search.component";
import { BRADYBALLCardRoutingModule } from "./BRADYBALL-card-routing.module";
import { SharedModule } from "../shared/shared.module";
import { RadarChartComponent } from "./components/radar-chart/radar-chart.component";
import { StatLineComponent } from "./components/stat-line/stat-line.component";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { FontService } from "../../assets/fonts/font.service";
import { BRADYBALLCardUtil } from "./util/BRADYBALL-card.util";
import { PercentileRankComponent } from './components/percentile-rank/percentile-rank.component';
import { FormsModule } from "@angular/forms";

@NgModule({
    imports: [
        SharedModule,
        BRADYBALLCardRoutingModule,
        CommonModule,
        FormsModule,
        HttpClientModule
    ],
    exports: [],
    declarations: [
        BRADYBALLCardScreenComponent,
        BRADYBALLCardPageComponent,
        PlayerSearchComponent,
        RadarChartComponent,
        StatLineComponent,
        PercentileRankComponent
    ],
    providers: [
        FontService,
        BRADYBALLCardUtil
    ],
})
export class BRADYBALLCardModule { }