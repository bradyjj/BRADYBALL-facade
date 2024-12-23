import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { select, Selection } from 'd3-selection';
import * as d3 from 'd3';
import 'd3-transition';

interface Hotspot {
    type: string;
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

    private createBaseGradients(): GradientDefinition[] {
        return [
            {
                id: 'deep-fundus', colors: [
                    { offset: '0%', color: '#CC4400', opacity: 0.95 },      // Bright red-orange
                    { offset: '20%', color: '#AA3300', opacity: 0.9 },      // Deep red-orange
                    { offset: '40%', color: '#882200', opacity: 0.85 },     // Rich red
                    { offset: '60%', color: '#661100', opacity: 0.8 },      // Dark red
                    { offset: '80%', color: '#441100', opacity: 0.75 },     // Very dark red
                    { offset: '100%', color: '#220000', opacity: 0.7 }      // Near black red
                ]
            },
            {
                id: 'warm-fundus', colors: [
                    { offset: '0%', color: '#FF6600', opacity: 0.9 },       // Bright orange
                    { offset: '20%', color: '#CC4400', opacity: 0.85 },     // Deep orange
                    { offset: '40%', color: '#AA3300', opacity: 0.8 },      // Rich orange-red
                    { offset: '60%', color: '#882200', opacity: 0.75 },     // Dark orange
                    { offset: '80%', color: '#661100', opacity: 0.7 },      // Very dark orange
                    { offset: '100%', color: '#440000', opacity: 0.65 }     // Near black orange
                ]
            }
        ];
    }

    private createHotspotGradients(): GradientDefinition[] {
        return [
            {
                id: 'bright-spot', colors: [
                    { offset: '0%', color: '#FFCC00', opacity: 0.9 },      // Bright golden
                    { offset: '40%', color: '#FF9900', opacity: 0.7 },     // Deep golden
                    { offset: '70%', color: '#FF6600', opacity: 0.5 },     // Orange
                    { offset: '100%', color: 'transparent', opacity: 0 }
                ]
            },
            {
                id: 'warm-spot', colors: [
                    { offset: '0%', color: '#FF8800', opacity: 0.85 },     // Warm orange
                    { offset: '40%', color: '#FF6600', opacity: 0.65 },    // Deep orange
                    { offset: '70%', color: '#CC4400', opacity: 0.45 },    // Dark orange
                    { offset: '100%', color: 'transparent', opacity: 0 }
                ]
            },
            {
                id: 'dark-spot', colors: [
                    { offset: '0%', color: '#CC3300', opacity: 0.8 },      // Dark red
                    { offset: '40%', color: '#AA2200', opacity: 0.6 },     // Deeper red
                    { offset: '70%', color: '#881100', opacity: 0.4 },     // Very dark red
                    { offset: '100%', color: 'transparent', opacity: 0 }
                ]
            }
        ];
    }

    private generateVessel(startX: number, startY: number, length: number, angle: number, depth: number = 0, isMainVessel: boolean = true): string {
        if (depth > 3) return '';
        
        let path = `M ${startX} ${startY}`;
        let x = startX;
        let y = startY;
        let currentAngle = angle;
        const stepSize = Math.max(2, 3 - depth);
        
        for (let i = 0; i < length; i += stepSize) {
            currentAngle += (Math.random() - 0.5) * (isMainVessel ? 0.1 : 0.25);
            x += Math.cos(currentAngle) * stepSize;
            y += Math.sin(currentAngle) * stepSize;
            path += ` L ${x} ${y}`;

            if (!isMainVessel && Math.random() < 0.05 / (depth + 1) && i > 20) {
                const branchLength = length * (0.4 - depth * 0.1);
                const branchAngle = currentAngle + (Math.random() - 0.5) * Math.PI * 0.3;
                path += ' ' + this.generateVessel(x, y, branchLength, branchAngle, depth + 1, false);
            } else if (isMainVessel && Math.random() < 0.08 && i > 40) {
                const branchLength = length * 0.6;
                const branchAngle = currentAngle + (Math.random() - 0.5) * Math.PI * 0.4;
                path += ' ' + this.generateVessel(x, y, branchLength, branchAngle, depth, false);
            }
        }
        return path;
    }

    private createVesselNetwork(vesselGroup: Selection<SVGGElement, unknown, null, undefined>, centerX: number, centerY: number): void {
        const numMainVessels = 6 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < numMainVessels; i++) {
            const baseAngle = (i / numMainVessels) * Math.PI * 2;
            const angle = baseAngle + (Math.random() - 0.5) * 0.2;
            const length = 200 + Math.random() * 250;

            const vesselPath = this.generateVessel(centerX, centerY, length, angle, 0, true);
            vesselGroup.append('path')
                .attr('d', vesselPath)
                .attr('stroke', '#992200')
                .attr('stroke-width', 1.2 + Math.random() * 0.6)
                .attr('fill', 'none')
                .attr('opacity', 0.7)
                .style('mix-blend-mode', 'screen');
        }

        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const startDistance = 30 + Math.random() * 60;
            const startX = centerX + Math.cos(angle) * startDistance;
            const startY = centerY + Math.sin(angle) * startDistance;
            const vesselPath = this.generateVessel(startX, startY, 80 + Math.random() * 100, angle, 0, false);
            
            vesselGroup.append('path')
                .attr('d', vesselPath)
                .attr('stroke', '#801a00')
                .attr('stroke-width', 0.3 + Math.random() * 0.2)
                .attr('fill', 'none')
                .attr('opacity', 0.5)
                .style('mix-blend-mode', 'screen');
        }

        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const startDistance = 50 + Math.random() * 100;
            const startX = centerX + Math.cos(angle) * startDistance;
            const startY = centerY + Math.sin(angle) * startDistance;
            const vesselPath = this.generateVessel(startX, startY, 40 + Math.random() * 60, angle, 1, false);
            
            vesselGroup.append('path')
                .attr('d', vesselPath)
                .attr('stroke', '#661500')
                .attr('stroke-width', 0.2)
                .attr('fill', 'none')
                .attr('opacity', 0.4)
                .style('mix-blend-mode', 'screen');
        }
    }

    private createOrganicPath(centerX: number, centerY: number, radius: number): string {
        const points: string[] = [];
        const numPoints = 72;  // Number of points around the circle
        const angleStep = (Math.PI * 2) / numPoints;
        
        // Create slightly irregular circle by adding random variance to radius
        for (let i = 0; i <= numPoints; i++) {
            const angle = i * angleStep;
            // Add small random variation to radius (98% to 102% of original radius)
            const variance = 0.98 + Math.random() * 0.04;
            const x = centerX + Math.cos(angle) * radius * variance;
            const y = centerY + Math.sin(angle) * radius * variance;
            
            if (i === 0) {
                points.push(`M ${x} ${y}`);  // Move to first point
            } else {
                // Create smooth curve between points using quadratic bezier
                const cpRadius = radius * 1.05;  // Control point slightly outside the radius
                const cpAngle = angle - angleStep / 2;  // Control point between current and previous point
                const cpx = centerX + Math.cos(cpAngle) * cpRadius;
                const cpy = centerY + Math.sin(cpAngle) * cpRadius;
                points.push(`Q ${cpx} ${cpy} ${x} ${y}`);
            }
        }
        return points.join(' ') + 'Z';  // Close the path
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

        // Create and add all gradients to defs
        [...this.createBaseGradients(), ...this.createHotspotGradients()].forEach(g => {
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

        // Create base background
        this.svg.append('rect')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('fill', '#110000');  // Very dark red background

        // Create main gradient group
        const backgroundGroup = this.svg.append('g');
        const centerOffsetX = (Math.random() - 0.5) * 200;
        const centerOffsetY = (Math.random() - 0.5) * 200;
        const centerX = 500 + centerOffsetX;
        const centerY = 500 + centerOffsetY;

        // Create base gradient areas with increased coverage
        const baseAreas = [
            { gradient: 'deep-fundus', x: centerX - 200, y: centerY, radius: 900 },
            { gradient: 'warm-fundus', x: centerX + 200, y: centerY, radius: 900 }
        ];

        // Add base gradients with optimized blend mode
        baseAreas.forEach(area => {
            backgroundGroup.append('path')
                .attr('d', this.createOrganicPath(area.x, area.y, area.radius))
                .attr('fill', `url(#${area.gradient})`)
                .style('mix-blend-mode', 'lighten');
        });

        // Create vessel network
        const vesselGroup = this.svg.append('g');
        this.createVesselNetwork(vesselGroup, centerX, centerY);

        // Create and animate hotspots with integrated blemishes
        const hotspotGroup = this.svg.append('g');
        const hotspots: Hotspot[] = [];
        const hotspotTypes = ['bright-spot', 'warm-spot', 'dark-spot'];

        // Create primary hotspots
        for (let i = 0; i < 8; i++) {
            const pos = this.getRandomPosition(150);
            const type = hotspotTypes[Math.floor(Math.random() * hotspotTypes.length)];
            const radius = 30 + Math.random() * 40;
            
            // Create main hotspot
            const element = hotspotGroup.append('circle')
                .attr('cx', pos.x)
                .attr('cy', pos.y)
                .attr('r', radius)
                .attr('fill', `url(#${type})`)
                .style('mix-blend-mode', 'screen');

            // Add blemishes within the hotspot
            const numBlemishes = 3 + Math.floor(Math.random() * 4);
            for (let j = 0; j < numBlemishes; j++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * radius * 0.8; // Keep within the hotspot
                const blemishX = pos.x + Math.cos(angle) * distance;
                const blemishY = pos.y + Math.sin(angle) * distance;
                
                hotspotGroup.append('circle')
                    .attr('cx', blemishX)
                    .attr('cy', blemishY)
                    .attr('r', 1 + Math.random() * 3)
                    .attr('fill', '#CC3300')
                    .attr('opacity', 0.3 + Math.random() * 0.3)
                    .style('mix-blend-mode', 'multiply');
            }

            hotspots.push({
                type,
                x: pos.x,
                y: pos.y,
                radius,
                element
            });
        }

        // Animate hotspots
        const animateHotspots = () => {
            hotspots.forEach(spot => {
                const newPos = this.getRandomPosition();
                spot.element
                    .transition()
                    .duration(20000)
                    .ease(d3.easeSinInOut)
                    .attr('cx', newPos.x)
                    .attr('cy', newPos.y)
                    .transition()
                    .duration(20000)
                    .ease(d3.easeSinInOut)
                    .attr('cx', spot.x)
                    .attr('cy', spot.y)
                    .on('end', function() {
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