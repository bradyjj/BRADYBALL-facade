import { Component, OnInit, HostListener } from '@angular/core';

interface Card {
    title: string;
    description: string;
}

interface BackgroundElement {
    x: number;
    y: number;
    speed: number;
    size: number;
    opacity: number;
}

@Component({
    selector: 'BRADYBALL-home-screen',
    templateUrl: './BRADYBALL-home-screen.component.html',
    styleUrls: ['./BRADYBALL-home-screen.component.scss']
})
export class BRADYBALLHomeScreenComponent implements OnInit {
    logoUrl = 'assets/images/BRADYBALLFontPic.png';
    isImageLoaded = false;
    mouseX = 0;
    mouseY = 0;
    hoveredCard = -1;

    cards: Card[] = [
        { title: 'Player Analysis', description: 'Deep dive into player statistics' },
        { title: 'Team Insights', description: 'Comprehensive team performance data' },
        { title: 'Season Trends', description: 'Historical season analysis' }
    ];

    handleImageError() {
        console.error('Image failed to load:', this.logoUrl);
        this.isImageLoaded = false;
    }

    handleImageLoad() {
        this.isImageLoaded = true;
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent) {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
    }

    getCursorPosition(): string {
        return `translate(${this.mouseX}px, ${this.mouseY}px)`;
    }

    getParallaxTransform(factor: number): string {
        const moveX = (this.mouseX - window.innerWidth / 2) * factor * 0.002;
        const moveY = (this.mouseY - window.innerHeight / 2) * factor * 0.002;
        return `translate(${moveX}px, ${moveY}px)`;
    }

    onCardHover(index: number) {
        this.hoveredCard = index;
        this.expandCursor();
    }

    onCardLeave(index: number) {
        this.hoveredCard = -1;
        this.shrinkCursor();
    }

    expandCursor() {
        const cursor = document.querySelector('.cursor-follower');
        cursor?.classList.add('expanded');
    }

    shrinkCursor() {
        const cursor = document.querySelector('.cursor-follower');
        cursor?.classList.remove('expanded');
    }

    ngOnInit() {
        // Preload image
        const img = new Image();
        img.onload = () => this.isImageLoaded = true;
        img.onerror = () => this.isImageLoaded = false;
        img.src = this.logoUrl;
    }
}