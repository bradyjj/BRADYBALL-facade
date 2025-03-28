

// projects-menu.component.ts
import { Component, OnInit } from '@angular/core';
import { Project } from '../../models/project.model';
import { DataService } from '../../../shared/services/data.service';

@Component({
    selector: 'app-projects-menu',
    templateUrl: './projects-menu.component.html',
    styleUrls: ['./projects-menu.component.scss']
})
export class ProjectsMenuComponent implements OnInit {
    projects: Project[] = [];

    constructor(private dataService: DataService) { }

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
}