import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { FontService } from "../../assets/fonts/font.service";
import { FormsModule } from "@angular/forms";
import { BRADYBALLAboutRoutingModule } from "./BRADYBALL-about-routing.module";
import { BRADYBALLAboutScreenComponent } from "./components/BRADYBALL-about-screen/BRADYBALL-about-screen.component";
import { BRADYBALLAboutPageComponent } from "./components/BRADYBALL-about-page/BRADYBALL-about-page.compoonent";
import { ResumeComponent } from "./components/resume/resume.component";

@NgModule({
    imports: [
        SharedModule,
        BRADYBALLAboutRoutingModule,
        CommonModule,
        FormsModule,
        HttpClientModule
    ],
    exports: [],
    declarations: [
        BRADYBALLAboutScreenComponent,
        BRADYBALLAboutPageComponent,
        ResumeComponent
    ],
    providers: [
        FontService,
    ],
})
export class BRADYBALLAboutModule { }