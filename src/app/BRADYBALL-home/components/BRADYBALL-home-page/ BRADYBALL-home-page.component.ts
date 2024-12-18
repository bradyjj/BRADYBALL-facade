import { Component } from "@angular/core";

@Component({
    selector: 'BRADYBALL-home-page',
    templateUrl: './BRADYBALL-home-page.component.html',
    styleUrls: ['./BRADYBALL-home-page.component.scss']
})
export class BRADYBALLHomePageComponent { 
    refreshPage(): void {
        window.location.reload();
    }
}