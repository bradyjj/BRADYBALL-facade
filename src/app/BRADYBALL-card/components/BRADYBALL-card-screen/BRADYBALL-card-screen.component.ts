import { Component } from '@angular/core';

@Component({
    selector: 'BRADYBALL-card-screen',
    templateUrl: './BRADYBALL-card-screen.component.html',
    styleUrls: ['./BRADYBALL-card-screen.component.scss'],
})
export class BRADYBALLCardScreenComponent {
    constructor() { }

    refreshPage(): void {
        window.location.reload();
    }
}
