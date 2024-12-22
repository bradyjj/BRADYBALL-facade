import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { select, Selection } from 'd3-selection';
import * as d3 from 'd3';
import 'd3-transition';

interface Hotspot {
    type: 'bright-spot' | 'red-hotspot' | 'green-hotspot';
    x: number;
    y: number;
    radius: number;
    element: Selection<SVGCircleElement, unknown, null, undefined>;
}

interface GradientColor {
    offset: string;
    color: string;
    opacity: number;
}

interface GradientDefinition {
    id: string;
    colors: GradientColor[];
}

@Component({
    selector: 'BRADYBALL-home-screen',
    templateUrl: './BRADYBALL-home-screen.component.html',
    styleUrls: ['./BRADYBALL-home-screen.component.scss']
})
export class BRADYBALLHomeScreenComponent implements AfterViewInit, OnDestroy {
    @ViewChild('gradientSvg') svgElement!: ElementRef;
    isCollapsed = false;
    private svg!: Selection<SVGElement, unknown, null, undefined>;
    private animationFrameId: number | null = null;

    ngAfterViewInit(): void {
        this.initializeGradient();
    }

    ngOnDestroy(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    onHeaderCollapseChanged(collapsed: boolean): void {
        this.isCollapsed = collapsed;
    }

    private getRandomPosition(margin: number = 100): { x: number, y: number } {
        return {
            x: margin + Math.random() * (1000 - 2 * margin),
            y: margin + Math.random() * (1000 - 2 * margin)
        };
    }

    private initializeGradient(): void {
        const element = this.svgElement.nativeElement;
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }

        this.svg = select(element as SVGElement)
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', '0 0 1000 1000')
            .attr('preserveAspectRatio', 'xMidYMid slice');

        const defs = this.svg.append('defs');

        // Background with darker tone
        this.svg.append('rect')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('fill', '#001a00');

        // Base gradients
        const baseGradients: GradientDefinition[] = [
            {
                id: 'green-area', colors: [
                    { offset: '0%', color: '#00ff00', opacity: 0.8 },
                    { offset: '30%', color: '#006600', opacity: 0.7 },
                    { offset: '60%', color: '#003300', opacity: 0.6 },
                    { offset: '100%', color: '#001a00', opacity: 0.5 }
                ]
            },
            {
                id: 'red-area', colors: [
                    { offset: '0%', color: '#ff3300', opacity: 0.9 },
                    { offset: '40%', color: '#cc0000', opacity: 0.8 },
                    { offset: '70%', color: '#660000', opacity: 0.7 },
                    { offset: '100%', color: '#330000', opacity: 0.6 }
                ]
            }
        ];

        // Hotspot gradients
        const hotspotGradients: GradientDefinition[] = [
            {
                id: 'bright-spot', colors: [
                    { offset: '0%', color: '#ffff00', opacity: 1 },
                    { offset: '50%', color: '#ffcc00', opacity: 0.8 },
                    { offset: '100%', color: 'transparent', opacity: 0 }
                ]
            },
            {
                id: 'red-hotspot', colors: [
                    { offset: '0%', color: '#ff0000', opacity: 0.9 },
                    { offset: '50%', color: '#ff3300', opacity: 0.7 },
                    { offset: '100%', color: 'transparent', opacity: 0 }
                ]
            },
            {
                id: 'green-hotspot', colors: [
                    { offset: '0%', color: '#00ff00', opacity: 0.9 },
                    { offset: '50%', color: '#00cc00', opacity: 0.7 },
                    { offset: '100%', color: 'transparent', opacity: 0 }
                ]
            }
        ];

        // Create all gradients
        [...baseGradients, ...hotspotGradients].forEach(g => {
            const gradient = defs.append('radialGradient')
                .attr('id', g.id)
                .attr('cx', '50%')
                .attr('cy', '50%')
                .attr('r', '70%')
                .attr('spreadMethod', 'pad');

            g.colors.forEach(stop => {
                gradient.append('stop')
                    .attr('offset', stop.offset)
                    .attr('stop-color', stop.color)
                    .attr('stop-opacity', stop.opacity);
            });
        });

        // Create smoother base shapes
        const createOrganicPath = (centerX: number, centerY: number, radius: number): string => {
            const points: string[] = [];
            const numPoints = 48;
            const angleStep = (Math.PI * 2) / numPoints;
            
            for (let i = 0; i <= numPoints; i++) {
                const angle = i * angleStep;
                const variance = 0.95 + Math.random() * 0.1;
                const x = centerX + Math.cos(angle) * radius * variance;
                const y = centerY + Math.sin(angle) * radius * variance;
                
                if (i === 0) {
                    points.push(`M ${x} ${y}`);
                } else {
                    const cpRadius = radius * 1.1;
                    const cpAngle = angle - angleStep / 2;
                    const cpx = centerX + Math.cos(cpAngle) * cpRadius;
                    const cpy = centerY + Math.sin(cpAngle) * cpRadius;
                    points.push(`Q ${cpx} ${cpy} ${x} ${y}`);
                }
            }
            return points.join(' ') + 'Z';
        };

        // Add base areas
        const baseAreas = [
            { gradient: 'green-area', x: 650, y: 500, radius: 600 },
            { gradient: 'red-area', x: 350, y: 500, radius: 600 }
        ];

        const baseGroup = this.svg.append('g');
        baseAreas.forEach(area => {
            baseGroup.append('path')
                .attr('d', createOrganicPath(area.x, area.y, area.radius))
                .attr('fill', `url(#${area.gradient})`)
                .style('mix-blend-mode', 'screen');
        });

        // Create animated hotspots
        const hotspotGroup = this.svg.append('g');
        const hotspots: Hotspot[] = [];

        // Create initial hotspots
        for (let i = 0; i < 5; i++) {
            const pos = this.getRandomPosition();
            hotspots.push({
                type: 'bright-spot',
                x: pos.x,
                y: pos.y,
                radius: 30 + Math.random() * 40,
                element: hotspotGroup.append('circle')
            });
        }

        for (let i = 0; i < 8; i++) {
            const pos = this.getRandomPosition();
            const type = i < 4 ? 'red-hotspot' : 'green-hotspot' as const;
            hotspots.push({
                type,
                x: pos.x,
                y: pos.y,
                radius: 50 + Math.random() * 60,
                element: hotspotGroup.append('circle')
            });
        }

        // Initialize hotspots
        hotspots.forEach(spot => {
            spot.element
                .attr('cx', spot.x)
                .attr('cy', spot.y)
                .attr('r', spot.radius)
                .attr('fill', `url(#${spot.type})`)
                .style('mix-blend-mode', 'screen');
        });

        // Animate hotspots
        const animateHotspots = () => {
            hotspots.forEach(spot => {
                const newPos = this.getRandomPosition();
                spot.element
                    .transition()
                    .duration(15000 + Math.random() * 10000)
                    .ease(d3.easeSinInOut)
                    .attr('cx', newPos.x)
                    .attr('cy', newPos.y)
                    .transition()
                    .duration(15000 + Math.random() * 10000)
                    .ease(d3.easeSinInOut)
                    .attr('cx', spot.x)
                    .attr('cy', spot.y)
                    .on('end', function(this: SVGCircleElement) {
                        select(this)
                            .transition()
                            .duration(0)
                            .on('end', animateHotspots);
                    });
            });
        };

        animateHotspots();
    }
}