import { NgModule } from "@angular/core";
import { PlayerAnalysisPageComponent } from "./components/player-analysis-page/player-analysis-page.component";
import { PlayerAnalysisScreenComponent } from "./components/player-analysis-screen/player-analysis-screen.component";
import { PlayerSearchComponent } from "./components/player-search/player-search.component";
import { SharedModule } from "../shared/shared.module";
import { RadarChartComponent } from "./components/radar-chart/radar-chart.component";
import { StatLineComponent } from "./components/stat-line/stat-line.component";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { FontService } from "../../assets/fonts/font.service";
import { BRADYBALLCardUtil } from "./util/player-analysis.util";
import { PercentileRankComponent } from './components/percentile-rank/percentile-rank.component';
import { FormsModule } from "@angular/forms";
import { BRADYBALLCommonModule } from "../common/BRADYBALL-common.module";
import { BRADYBALLPlayerAnalysisRoutingModule } from "./BRADYBALL-player-analysis-routing.module";

@NgModule({
    imports: [
        SharedModule,
        BRADYBALLPlayerAnalysisRoutingModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        BRADYBALLCommonModule
    ],
    exports: [],
    declarations: [
        PlayerAnalysisScreenComponent,
        PlayerAnalysisPageComponent,
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
export class BRADYBALLPlayerAnalysisModule { }