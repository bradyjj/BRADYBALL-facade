// footer.component.ts
import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../shared/services/data.service';
import { ScrollService } from '../../../shared/services/scroll.service';
import { Project } from '../../../common/models/project.model';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
    projects: Project[] = [];
    currentYear: number = new Date().getFullYear();

    constructor(
        private dataService: DataService,
        private scrollService: ScrollService
    ) { }

    ngOnInit(): void {
        this.loadProjects();
    }

    loadProjects(): void {
        this.dataService.getProjects().subscribe(
            (data: Project[]) => {
                this.projects = data;
            },
            error => {
                console.error('Error fetching projects:', error);
            }
        );
    }

    scrollToTop(): void {
        this.scrollService.scrollToTop();
    }
}