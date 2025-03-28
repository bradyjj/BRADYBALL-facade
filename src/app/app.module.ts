import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";

import { AppComponent } from "./app.component";
import { APP_ROUTES, AppRoutingModule } from "./app.routing";
import { BRADYBALLPlayerAnalysisModule } from "./BRADYBALL-player-analysis/BRADYBALL-player-analysis.module";
import { BRADYBALLAboutModule } from "./BRADYBALL-about/BRADYBALL-about.module";
import { BRADYBALLHomeModule } from "./BRADYBALL-home/BRADYBALL-home.module";
import { BRADYBALLCommonModule } from "./common/BRADYBALL-common.module";
import { FontService } from "../assets/fonts/font.service";
import { BRADYBALLNewModule } from "./BRADYBALL.new/BRADYBALL-new.module";

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        BRADYBALLPlayerAnalysisModule,
        BRADYBALLAboutModule,
        BRADYBALLHomeModule,
        BRADYBALLCommonModule,
        BRADYBALLNewModule,
        RouterModule.forRoot(APP_ROUTES, { useHash: false })
    ],
    providers: [FontService],
    bootstrap: [AppComponent]
})
export class AppModule { }
