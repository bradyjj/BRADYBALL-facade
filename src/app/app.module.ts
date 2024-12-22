import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";

import { AppComponent } from "./app.component";
import { APP_ROUTES, AppRoutingModule } from "./app.routing";
import { BRADYBALLCardModule } from "./BRADYBALL-card/BRADYBALL-card.module";
import { BRADYBALLAboutModule } from "./BRADYBALL-about/BRADYBALL-about.module";
import { BRADYBALLHomeModule } from "./BRADYBALL-home/BRADYBALL-home.module";
import { BRADYBALLCommonModule } from "./common/BRADYBALL-common.module";
import { FontService } from "../assets/fonts/font.service";

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        BRADYBALLCardModule,
        BRADYBALLAboutModule,
        BRADYBALLHomeModule,
        BRADYBALLCommonModule,
        RouterModule.forRoot(APP_ROUTES, { useHash: true })
    ],
    providers: [FontService],
    bootstrap: [AppComponent]
})
export class AppModule { }
