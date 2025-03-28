import { Component, ViewChild } from '@angular/core';

@Component({
    selector: 'new-screen',
    templateUrl: './new-screen.component.html',
    styleUrls: ['./new-screen.component.scss'],
})
export class NewScreenComponent {
    isCollapsed = false;

    @ViewChild(ResumeComponent) resumeComponent!: ResumeComponent;

    onHeaderCollapseChanged(collapsed: boolean): void {
        this.isCollapsed = collapsed;
    }

    downloadResumePdf(): void {
        if (this.resumeComponent) {
            this.resumeComponent.downloadPDF();
        } else {
            console.error('Resume component not found');
        }
    }
}