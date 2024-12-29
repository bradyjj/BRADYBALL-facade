// home-page.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ViewportScroller } from '@angular/common';

@Component({
    selector: 'home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit, OnDestroy { 
    private scrollListener: any;

    constructor(private viewportScroller: ViewportScroller) {}

    ngOnInit() {
        // Enable smooth scrolling
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Fix iOS bounce scroll
        this.scrollListener = (event: TouchEvent) => {
            if (event.touches.length > 1) {
                event.preventDefault();
            }
        };
        document.addEventListener('touchmove', this.scrollListener, { passive: false });
    }

    ngOnDestroy() {
        document.removeEventListener('touchmove', this.scrollListener);
        document.documentElement.style.scrollBehavior = '';
    }

    refreshPage(): void {
        window.location.reload();
    }

    scrollToTop(): void {
        this.viewportScroller.scrollToPosition([0, 0]);
    }
}