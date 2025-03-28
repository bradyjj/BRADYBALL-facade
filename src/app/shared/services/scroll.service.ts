// services/scroll.service.ts
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ScrollService {

    constructor() { }

    scrollToTop(duration: number = 500): void {
        const start = window.pageYOffset;
        const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();

        const scroll = (): void => {
            const now = 'now' in window.performance ? performance.now() : new Date().getTime();
            const time = Math.min(1, ((now - startTime) / duration));

            window.scrollTo(0, Math.ceil((1 - this.easeOutExpo(time)) * start));

            if (time < 1) {
                requestAnimationFrame(scroll);
            }
        };

        requestAnimationFrame(scroll);
    }

    scrollToElement(elementId: string, offset: number = 0, duration: number = 500): void {
        const element = document.getElementById(elementId);
        if (!element) return;

        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        this.scrollToPosition(offsetPosition, duration);
    }

    scrollToPosition(position: number, duration: number = 500): void {
        const start = window.pageYOffset;
        const distance = position - start;
        const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();

        const scroll = (): void => {
            const now = 'now' in window.performance ? performance.now() : new Date().getTime();
            const time = Math.min(1, ((now - startTime) / duration));

            window.scrollTo(0, Math.ceil(this.easeOutExpo(time) * distance + start));

            if (time < 1) {
                requestAnimationFrame(scroll);
            }
        };

        requestAnimationFrame(scroll);
    }

    showProjects(): void {
        // Logic to scroll to projects section
        const footer = document.querySelector('footer');
        if (footer) {
            const footerPosition = footer.getBoundingClientRect().top + window.pageYOffset;
            const windowHeight = window.innerHeight;
            this.scrollToPosition(footerPosition - windowHeight + 20);
        }
    }

    // Easing function
    private easeOutExpo(pos: number): number {
        return pos === 1 ? 1 : -Math.pow(2, -10 * pos) + 1;
    }
}