import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { FontService } from "../../assets/fonts/font.service";
import { FormsModule } from "@angular/forms";
import { BRADYBALLAboutRoutingModule } from "./BRADYBALL-about-routing.module";
import { AboutScreenComponent } from "./components/about-screen/about-screen.component";
import { AboutPageComponent } from "./components/about-page/about-page.compoonent";
import { ResumeComponent } from "./components/resume/resume.component";
import { BRADYBALLCommonModule } from "../common/BRADYBALL-common.module";

@NgModule({
    imports: [
        SharedModule,
        BRADYBALLAboutRoutingModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        BRADYBALLCommonModule
    ],
    exports: [],
    declarations: [
        AboutScreenComponent,
        AboutPageComponent,
        ResumeComponent
    ],
    providers: [
        FontService,
    ],
})
export class BRADYBALLAboutModule { }