import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { FontService } from "../../assets/fonts/font.service";
import { FormsModule } from "@angular/forms";
import { HomeScreenComponent } from "./components/home-screen/home-screen.component";
import { BRADYBALLHomeRoutingModule } from "./BRADYBALL-home-routing.module";
import { BRADYBALLCommonModule } from "../common/BRADYBALL-common.module";
import { HomePageComponent } from "./components/home-page/home-page.component";

@NgModule({
    imports: [
        SharedModule,
        BRADYBALLHomeRoutingModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        BRADYBALLCommonModule
    ],
    exports: [],
    declarations: [
        HomeScreenComponent,
        HomePageComponent,
    ],
    providers: [
        FontService,
    ],
})
export class BRADYBALLHomeModule { }