import { Component, OnInit } from "@angular/core";
import { ScrollService } from "../../../shared/services/scroll.service";

// header.component.ts
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    showProjectsMenu = false;

    constructor(private scrollService: ScrollService) { }

    ngOnInit(): void {
        window.addEventListener('scroll', this.onScroll.bind(this));
    }

    ngOnDestroy(): void {
        window.removeEventListener('scroll', this.onScroll.bind(this));
    }

    onScroll(): void {
        const scrollPosition = window.pageYOffset;
        const header = document.querySelector('header');

        if (scrollPosition > 50) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    }

    showProjects(): void {
        this.showProjectsMenu = !this.showProjectsMenu;
    }
}