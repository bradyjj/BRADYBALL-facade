import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { BrowserModule } from "@angular/platform-browser";
import { BRADYBALLCardModule } from "./BRADYBALL-card/BRADYBALL-card.module";
import { RouterModule } from "@angular/router";
import { APP_ROUTES, AppRoutingModule } from "./app.routing";
import { BRADYBALLCardRoutingModule } from "./BRADYBALL-card/BRADYBALL-card-routing.module";
import { HttpClientModule } from "@angular/common/http";

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
        RouterModule.forRoot(APP_ROUTES, {useHash: true})
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }