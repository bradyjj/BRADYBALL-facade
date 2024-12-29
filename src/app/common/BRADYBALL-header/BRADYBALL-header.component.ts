// BRADYBALL-header.component.ts
import { Component, EventEmitter, Output, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
    selector: 'BRADYBALL-header',
    templateUrl: './BRADYBALL-header.component.html',
    styleUrls: ['./BRADYBALL-header.component.scss']
})
export class BRADYBALLHeaderComponent implements OnInit {
    isCollapsed = false;
    isMobile = false;
    isScrolled = false;
    @Output() collapseChanged = new EventEmitter<boolean>();

    navItems = [
        { label: 'Home', route: '/home' },
        { label: 'About', route: '/about' },
        { label: 'Player Analysis', route: '/player-analysis' }
    ];

    constructor(
        private router: Router,
        private breakpointObserver: BreakpointObserver
    ) {}

    ngOnInit(): void {
        this.breakpointObserver
            .observe([Breakpoints.Handset])
            .subscribe(result => {
                this.isMobile = result.matches;
            });
    }

    @HostListener('window:scroll', [])
    onWindowScroll() {
        // Adjust this value based on when you want the header to collapse
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;
        this.isScrolled = scrollPosition > 50;
    }

    navigateHome(): void {
        this.router.navigateByUrl('/home');
    }

    toggleCollapse(): void {
        if (!this.isMobile) {
            this.isCollapsed = !this.isCollapsed;
            this.collapseChanged.emit(this.isCollapsed);
        }
    }
}