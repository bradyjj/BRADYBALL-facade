import { Component } from '@angular/core';

@Component({
    selector: 'BRADYBALL-card-screen',
    templateUrl: './BRADYBALL-card-screen.component.html',
    styleUrls: ['./BRADYBALL-card-screen.component.scss'],
})
export class BRADYBALLCardScreenComponent {

    isCollapsed = false;
    
    constructor() { }

    refreshPage(): void {
        window.location.reload();
    }

    onHeaderCollapseChanged(collapsed: boolean): void {
        this.isCollapsed = collapsed;
    }
}
