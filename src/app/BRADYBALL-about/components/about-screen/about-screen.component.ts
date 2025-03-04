import { Component, ViewChild } from '@angular/core';
import { ResumeComponent } from '../resume/resume.component';

@Component({
    selector: 'about-screen',
    templateUrl: './about-screen.component.html',
    styleUrls: ['./about-screen.component.scss'],
})
export class AboutScreenComponent {
    isCollapsed = false;

    constructor() { }

    @ViewChild(ResumeComponent) resumeComponent!: ResumeComponent;

    refreshPage(): void {
        window.location.reload();
    }

    onHeaderCollapseChanged(collapsed: boolean): void {
        this.isCollapsed = collapsed;
    }

    downloadResumePdf() {
        if (this.resumeComponent) {
            this.resumeComponent.downloadPDF();
        } else {
            console.error('Resume component not found');
        }
    }
}
