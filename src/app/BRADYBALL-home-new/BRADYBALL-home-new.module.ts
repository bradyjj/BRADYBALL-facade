import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { FontService } from "../../assets/fonts/font.service";
import { FormsModule } from "@angular/forms";
import { BRADYBALLCommonModule } from "../common/BRADYBALL-common.module";
import { BRADYBALLHomeNewRoutingModule } from "./BRADYBALL-home-new-routing.module";
import { NewHomeScreenComponent } from "./components/new-home-screen/new-home-screen.component";
import { NewHomePageComponent } from "./components/new-home-page/new-home-page.component";
import { SoccerBallComponent } from "./components/soccer-ball/soccer-ball.component";

@NgModule({
    imports: [
        SharedModule,
        BRADYBALLHomeNewRoutingModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        BRADYBALLCommonModule
    ],
    exports: [],
    declarations: [
        NewHomeScreenComponent,
        NewHomePageComponent,
        SoccerBallComponent,
    ],
    providers: [
        FontService,
    ],
})
export class BRADYBALLHomeNewModule { }