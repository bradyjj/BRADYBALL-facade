
import { AppComponent } from "../app.component";
import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { FontService } from "../../assets/fonts/font.service";
import { FormsModule } from "@angular/forms";
import { BRADYBALLCommonModule } from "../common/BRADYBALL-common.module";
import { NewsComponent } from "./components/news/news.component";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { ScrollService } from "../shared/services/scroll.service";
import { DataService } from "../shared/services/data.service";
import { BRADYBALLHomeRoutingModule } from "../BRADYBALL-home/BRADYBALL-home-routing.module";
import { ProjectsMenuComponent } from "./components/projects-menu/projects-menu.component";
import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from "./components/footer/footer.component";
import { NewsItemComponent } from "./components/news-item/news-item.component";

@NgModule({
    declarations: [
        SharedModule,
        BRADYBALLHomeRoutingModule,
        BRADYBALLCommonModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        BRADYBALLCommonModule,
        AppComponent,
        HeaderComponent,
        FooterComponent,
        NewsComponent,
        NewsItemComponent,
        ProjectsMenuComponent,
        ProjectDetailComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        RouterModule.forRoot([
            { path: '', component: NewsComponent },
        ])
    ],
    providers: [DataService, ScrollService, FontService],
    bootstrap: [AppComponent]
})
export class BRADYBALLNewModule { }