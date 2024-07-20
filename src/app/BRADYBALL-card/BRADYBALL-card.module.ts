import { NgModule } from "@angular/core";
import { BRADYBALLCardPageComponent } from "./components/BRADYBALL-card-page/BRADYBALL-card-page.component";
import { BRADYBALLCardScreenComponent } from "./components/BRADYBALL-card-screen/BRADYBALL-card-screen.component";
import { PlayerSearchComponent } from "./components/player-search/player-search.component";
import { BRADYBALLCardRoutingModule } from "./BRADYBALL-card-routing.module";
import { SharedModule } from "../shared/shared.module";

@NgModule({
    imports: [
        SharedModule,
        BRADYBALLCardRoutingModule
    ],
    exports: [],
    declarations: [
        BRADYBALLCardScreenComponent,
        BRADYBALLCardPageComponent,
        PlayerSearchComponent
    ],
    providers: [],  
})
export class BRADYBALLCardModule { }