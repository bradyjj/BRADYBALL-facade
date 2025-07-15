import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { BRADYBALLHeaderComponent } from "./BRADYBALL-header/BRADYBALL-header.component";
import { BRADYBALLFooterComponent } from "./BRADYBALL-footer/BRADYBALL-footer.component";
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
        BRADYBALLFooterComponent,
        BRADYBALLHeaderComponent,
        PitchComponent,
        HeaderComponent,
        MenuComponent
    ],
    declarations: [
        BRADYBALLFooterComponent,
        BRADYBALLHeaderComponent,
        PitchComponent,
        HeaderComponent,
        HeaderComponent,
        MenuComponent
    ]
})
export class BRADYBALLCommonModule { }