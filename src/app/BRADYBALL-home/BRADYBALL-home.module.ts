import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { FontService } from "../../assets/fonts/font.service";
import { FormsModule } from "@angular/forms";
import { BRADYBALLHomePageComponent } from "./components/BRADYBALL-home-page/ BRADYBALL-home-page.component";
import { BRADYBALLHomeScreenComponent } from "./components/BRADYBALL-home-screen/BRADYBALL-home-screen.component";
import { BRADYBALLHomeRoutingModule } from "./BRADYBALL-home-routing.module";

@NgModule({
    imports: [
        SharedModule,
        BRADYBALLHomeRoutingModule,
        CommonModule,
        FormsModule,
        HttpClientModule
    ],
    exports: [],
    declarations: [
        BRADYBALLHomeScreenComponent,
        BRADYBALLHomePageComponent
    ],
    providers: [
        FontService,
    ],
})
export class BRADYBALLHomeModule { }