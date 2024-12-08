import { Component } from '@angular/core';

@Component({
    selector: 'BRADYBALL-about-screen',
    templateUrl: './BRADYBALL-about-screen.component.html',
    styleUrls: ['./BRADYBALL-about-screen.component.scss'],
})
export class BRADYBALLAboutScreenComponent {
    constructor() { }

    refreshPage(): void {
        window.location.reload();
    }
}
