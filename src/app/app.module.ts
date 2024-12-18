import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { BrowserModule } from "@angular/platform-browser";
import { BRADYBALLCardModule } from "./BRADYBALL-card/BRADYBALL-card.module";
import { RouterModule } from "@angular/router";
import { APP_ROUTES, AppRoutingModule } from "./app.routing";
import { BRADYBALLCardRoutingModule } from "./BRADYBALL-card/BRADYBALL-card-routing.module";
import { HttpClientModule } from "@angular/common/http";
import { FontService } from "../assets/fonts/font.service";
import { BRADYBALLAboutRoutingModule } from "./BRADYBALL-about/BRADYBALL-about-routing.module";
import { BRADYBALLAboutModule } from "./BRADYBALL-about/BRADYBALL-about.module";
import { BRADYBALLHomeRoutingModule } from "./BRADYBALL-home/BRADYBALL-home-routing.module";
import { BRADYBALLHomeModule } from "./BRADYBALL-home/BRADYBALL-home.module";

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        BRADYBALLCardRoutingModule,
        BRADYBALLCardModule,
        BRADYBALLAboutRoutingModule,
        BRADYBALLAboutModule,
        BRADYBALLHomeRoutingModule,
        BRADYBALLHomeModule,
        RouterModule.forRoot(APP_ROUTES, {useHash: true})
    ],
    providers: [FontService],
    bootstrap: [AppComponent]
})
export class AppModule { }