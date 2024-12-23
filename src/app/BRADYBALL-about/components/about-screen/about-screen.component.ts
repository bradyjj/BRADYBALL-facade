import { Component } from '@angular/core';

@Component({
    selector: 'about-screen',
    templateUrl: './about-screen.component.html',
    styleUrls: ['./about-screen.component.scss'],
})
export class AboutScreenComponent {
    isCollapsed = false;

    constructor() { }

    refreshPage(): void {
        window.location.reload();
    }

    onHeaderCollapseChanged(collapsed: boolean): void {
        this.isCollapsed = collapsed;
    }
}
