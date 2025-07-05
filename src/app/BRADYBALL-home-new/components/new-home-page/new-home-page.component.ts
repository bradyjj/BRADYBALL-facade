import { Component } from "@angular/core";

@Component({
    selector: 'new-home-page',
    templateUrl: './new-home-page.component.html',
    styleUrls: ['./new-home-page.component.scss']
})
export class NewHomePageComponent { 
    refreshPage(): void {
        window.location.reload();
    }
}