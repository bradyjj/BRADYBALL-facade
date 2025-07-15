import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { FooterComponent } from "./footer/footer.component";
import { AppRoutingModule } from "../app.routing";
import { PitchComponent } from "./pitch/pitch.component";
import { HeaderComponent } from './header/header.component';
import { MenuComponent } from './menu/menu.component';

@NgModule({
    imports: [
        SharedModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule
    ],
    exports: [
        FooterComponent,
        PitchComponent,
        HeaderComponent,
        MenuComponent
    ],
    declarations: [
        FooterComponent,
        PitchComponent,
        HeaderComponent,
        MenuComponent
    ]
})
export class BRADYBALLCommonModule { }