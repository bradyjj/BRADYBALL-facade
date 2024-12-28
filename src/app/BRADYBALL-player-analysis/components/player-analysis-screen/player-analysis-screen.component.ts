import { Component } from '@angular/core';

@Component({
    selector: 'player-analysis-screen',
    templateUrl: './player-analysis-screen.component.html',
    styleUrls: ['./player-analysis-screen.component.scss'],
})
export class PlayerAnalysisScreenComponent {

    isCollapsed = false;
    
    constructor() { }

    refreshPage(): void {
        window.location.reload();
    }

    onHeaderCollapseChanged(collapsed: boolean): void {
        this.isCollapsed = collapsed;
    }
}
