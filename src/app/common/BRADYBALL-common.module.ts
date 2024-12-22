import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { BRADYBALLHeaderComponent } from "./BRADYBALL-header/BRADYBALL-header.component";
import { BRADYBALLFooterComponent } from "./BRADYBALL-footer/BRADYBALL-footer.component";

@NgModule({
    imports: [
        SharedModule,
        CommonModule,
        FormsModule,
        HttpClientModule
    ],
    exports: [
        BRADYBALLFooterComponent,
        BRADYBALLHeaderComponent,
    ],
    declarations: [
        BRADYBALLFooterComponent,
        BRADYBALLHeaderComponent,
    ]
})
export class BRADYBALLCommonModule { }