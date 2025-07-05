import { Component, ElementRef, ViewChild, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import * as THREE from 'three';

interface CategorySatellite {
    id: string;
    name: string;
    orbitRadius: number;
    orbitSpeed: number;
    rotationSpeed: number;
    orbitAngle: number;
    orbitTilt: number;
    position: THREE.Vector3;
    mesh?: THREE.Mesh;
    group?: THREE.Group;
    textGroup?: THREE.Group;
    orbitLine?: THREE.Line;
    timeOffset: number;
}

@Component({
    selector: 'soccer-ball',
    templateUrl: './soccer-ball.component.html',
    styleUrls: ['./soccer-ball.component.scss']
})
export class SoccerBallComponent implements OnInit, OnDestroy {
    @ViewChild('threeCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private soccerBall!: THREE.Group;
    private satellites: CategorySatellite[] = [];
    private animationId!: number;
    private raycaster = new THREE.Raycaster();
    private mouse = new THREE.Vector2();
    public hoveredSatellite: CategorySatellite | null = null;
    private controls: any; // For OrbitControls
    private isDestroyed = false;
    private cleanup?: () => void;
    private applyMomentum?: () => void;
    private rotationVelocity = { theta: 0, phi: 0 };
    private lastMouseTime = 0;
    private lastMouseMove = { x: 0, y: 0 };
    private spherical = new THREE.Spherical();

    // Example categories data
    private readonly categoryData = [
        { id: 'passing', name: 'Passing' },
        { id: 'defense', name: 'Defense' },
        { id: 'offense', name: 'Offense' },
        { id: 'midfield', name: 'Midfield' },
        { id: 'goalkeeping', name: 'Goalkeeping' },
        { id: 'fitness', name: 'Fitness' }
    ];

    constructor(private router: Router) { }

    ngOnInit() {
        this.initThreeJS();
        this.createSoccerBall();
        this.createSatellites();
        this.setupEventListeners();
        this.animate();
    }

    ngOnDestroy() {
        this.isDestroyed = true;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.controls) {
            this.controls.dispose();
        }
        if (this.cleanup) {
            this.cleanup(); // Clean up event listeners
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
    }

    private initThreeJS() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 10, 15);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvasRef.nativeElement,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(10, 10, 10);
        this.scene.add(pointLight);

        // Add OrbitControls (you'll need to import this)
        this.setupOrbitControls();
    }

    private setupOrbitControls() {
        let isMouseDown = false;
        let mouseX = 0;
        let mouseY = 0;

        // Convert current camera position to spherical coordinates
        this.spherical.setFromVector3(this.camera.position);

        const onMouseDown = (event: MouseEvent) => {
            isMouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
            this.lastMouseTime = Date.now();
            this.lastMouseMove = { x: 0, y: 0 };
            this.canvasRef.nativeElement.style.cursor = 'grabbing';

            // Stop momentum when user starts dragging
            this.rotationVelocity.theta = 0;
            this.rotationVelocity.phi = 0;
        };

        const onMouseUp = () => {
            isMouseDown = false;
            this.canvasRef.nativeElement.style.cursor = 'grab';
        };

        const onMouseMove = (event: MouseEvent) => {
            if (!isMouseDown) return;

            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;
            const currentTime = Date.now();
            const deltaTime = currentTime - this.lastMouseTime;

            // Sensitivity for rotation
            const rotateSpeed = 0.005;

            // Update spherical coordinates
            this.spherical.theta -= deltaX * rotateSpeed; // Horizontal rotation
            this.spherical.phi += deltaY * rotateSpeed;   // Vertical rotation (reversed)

            // Clamp phi to prevent flipping
            this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi));

            // Update camera position
            this.camera.position.setFromSpherical(this.spherical);
            this.camera.lookAt(0, 0, 0);

            // Calculate velocity for momentum (only if enough time has passed)
            if (deltaTime > 10) {
                this.rotationVelocity.theta = (deltaX * rotateSpeed) / (deltaTime / 16); // Normalized to 60fps
                this.rotationVelocity.phi = (deltaY * rotateSpeed) / (deltaTime / 16);
                this.lastMouseTime = currentTime;
            }

            this.lastMouseMove = { x: deltaX, y: deltaY };
            mouseX = event.clientX;
            mouseY = event.clientY;
        };

        const onWheel = (event: WheelEvent) => {
            event.preventDefault();
            const zoomSpeed = 0.1;

            // Update radius in spherical coordinates (FIXED: reversed direction)
            if (event.deltaY > 0 && this.spherical.radius > 5) {
                this.spherical.radius *= (1 - zoomSpeed); // Zoom in when scrolling down
            } else if (event.deltaY < 0 && this.spherical.radius < 30) {
                this.spherical.radius *= (1 + zoomSpeed); // Zoom out when scrolling up
            }

            // Update camera position
            this.camera.position.setFromSpherical(this.spherical);
            this.camera.lookAt(0, 0, 0);
        };

        // Add event listeners
        this.canvasRef.nativeElement.addEventListener('mousedown', onMouseDown);
        this.canvasRef.nativeElement.addEventListener('mouseup', onMouseUp);
        this.canvasRef.nativeElement.addEventListener('mouseleave', onMouseUp);
        this.canvasRef.nativeElement.addEventListener('mousemove', onMouseMove);
        this.canvasRef.nativeElement.addEventListener('wheel', onWheel);

        // Global mouse up handler
        document.addEventListener('mouseup', onMouseUp);

        // Set initial cursor
        this.canvasRef.nativeElement.style.cursor = 'grab';

        // Store cleanup function
        this.cleanup = () => {
            this.canvasRef.nativeElement.removeEventListener('mousedown', onMouseDown);
            this.canvasRef.nativeElement.removeEventListener('mouseup', onMouseUp);
            this.canvasRef.nativeElement.removeEventListener('mouseleave', onMouseUp);
            this.canvasRef.nativeElement.removeEventListener('mousemove', onMouseMove);
            this.canvasRef.nativeElement.removeEventListener('wheel', onWheel);
            document.removeEventListener('mouseup', onMouseUp);
        };

        // Apply momentum in animation loop
        this.applyMomentum = () => {
            if (isMouseDown) return; // Don't apply momentum while dragging

            // Apply velocity with damping
            const damping = 0.96; // How quickly momentum fades (higher = longer momentum)

            if (Math.abs(this.rotationVelocity.theta) > 0.001 || Math.abs(this.rotationVelocity.phi) > 0.001) {
                this.spherical.theta -= this.rotationVelocity.theta;
                this.spherical.phi += this.rotationVelocity.phi;

                // Clamp phi
                this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi));

                // Apply damping
                this.rotationVelocity.theta *= damping;
                this.rotationVelocity.phi *= damping;

                // Update camera
                this.camera.position.setFromSpherical(this.spherical);
                this.camera.lookAt(0, 0, 0);
            }
        };
    }

    private createSoccerBall() {
        this.soccerBall = new THREE.Group();

        // Create soccer ball geometry (icosahedron for soccer ball shape)
        const geometry = new THREE.IcosahedronGeometry(3, 1);

        // Create soccer ball material with wireframe
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            wireframeLinewidth: 2
        });

        const ball = new THREE.Mesh(geometry, material);
        this.soccerBall.add(ball);

        // Add soccer ball pattern (optional - creates the classic black/white pattern)
        this.createSoccerBallPattern();

        this.scene.add(this.soccerBall);
    }

    private createSoccerBallPattern() {
        // Create the classic soccer ball pentagon/hexagon pattern
        const pentagons = new THREE.Group();
        const hexagons = new THREE.Group();

        // Pentagon material (black)
        const pentagonMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

        // Hexagon material (white)
        const hexagonMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

        // Create pentagons (12 total)
        for (let i = 0; i < 12; i++) {
            const pentagonGeometry = new THREE.ConeGeometry(0.3, 0.1, 5);
            const pentagon = new THREE.Mesh(pentagonGeometry, pentagonMaterial);

            // Position pentagons on the sphere surface
            const phi = Math.acos(1 - 2 * (i + 0.5) / 12);
            const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

            pentagon.position.setFromSphericalCoords(3.1, phi, theta);
            pentagon.lookAt(0, 0, 0);

            pentagons.add(pentagon);
        }

        this.soccerBall.add(pentagons);
    }

    private generateOrbitConfigurations(count: number): { angle: number; tilt: number }[] {
        const configurations: { angle: number; tilt: number }[] = [];
        const goldenRatio = (1 + Math.sqrt(5)) / 2;

        for (let i = 0; i < count; i++) {
            const y = count === 1 ? 0 : 1 - (i / Math.max(count - 1, 1)) * 2;
            const theta = 2 * Math.PI * i / goldenRatio;
            const angle = theta;
            const tilt = Math.acos(y);

            configurations.push({ angle, tilt });
        }

        return configurations;
    }

    private createSatellites() {
        const configs = this.generateOrbitConfigurations(this.categoryData.length);

        this.categoryData.forEach((category, index) => {
            const config = configs[index];

            const satellite: CategorySatellite = {
                id: category.id,
                name: category.name,
                orbitRadius: 5 + (index * 2),
                orbitSpeed: 0.003 / (1 + index * 0.05), // Even slower orbit speed
                rotationSpeed: 0.001 + (index * 0.0005), // Much slower rotation
                orbitAngle: config.angle,
                orbitTilt: config.tilt,
                position: new THREE.Vector3(),
                timeOffset: Math.random() * Math.PI * 2
            };

            this.createSatelliteGroup(satellite);
            this.createOrbitTrail(satellite);
            this.satellites.push(satellite);
        });
    }

    private createSatelliteGroup(satellite: CategorySatellite) {
        // Main satellite group
        satellite.group = new THREE.Group();

        // Satellite mesh (sphere)
        const geometry = new THREE.SphereGeometry(0.15, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        satellite.mesh = new THREE.Mesh(geometry, material);
        satellite.group.add(satellite.mesh);

        // Text label
        satellite.textGroup = this.createTextLabel(satellite.name);
        satellite.group.add(satellite.textGroup);

        // Add user data for raycasting
        satellite.mesh.userData['satellite'] = satellite;

        this.scene.add(satellite.group);
    }

    private createTextLabel(text: string): THREE.Group {
        const textGroup = new THREE.Group();

        // Create background plane
        const textWidth = text.length * 0.4;
        const bgGeometry = new THREE.PlaneGeometry(textWidth + 0.4, 0.8);
        const bgMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const background = new THREE.Mesh(bgGeometry, bgMaterial);
        background.position.set(1, 1, 0);
        textGroup.add(background);

        // Create border
        const borderGeometry = new THREE.PlaneGeometry(textWidth + 0.5, 0.9);
        const borderMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.set(1, 1, -0.01);
        textGroup.add(border);

        // For text, we'll use a simple approach with canvas texture
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = 256;
        canvas.height = 64;

        context.fillStyle = 'white';
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.fillText(text.toUpperCase(), 128, 40);

        const textTexture = new THREE.CanvasTexture(canvas);
        const textMaterial = new THREE.MeshBasicMaterial({
            map: textTexture,
            transparent: true
        });
        const textPlane = new THREE.PlaneGeometry(textWidth, 0.6);
        const textMesh = new THREE.Mesh(textPlane, textMaterial);
        textMesh.position.set(1, 1, 0.01);
        textGroup.add(textMesh);

        return textGroup;
    }

    private createOrbitTrail(satellite: CategorySatellite) {
        const points: THREE.Vector3[] = [];
        const segments = 64;

        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * satellite.orbitRadius;
            const z = Math.sin(angle) * satellite.orbitRadius;

            const position = new THREE.Vector3(x, 0, z);

            // Apply orbit transformations
            position.applyAxisAngle(new THREE.Vector3(0, 1, 0), satellite.orbitAngle);
            position.applyAxisAngle(new THREE.Vector3(1, 0, 0), satellite.orbitTilt);

            points.push(position);
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineDashedMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.5,
            dashSize: 0.5,
            gapSize: 0.3
        });

        satellite.orbitLine = new THREE.Line(geometry, material);
        satellite.orbitLine.computeLineDistances();
        this.scene.add(satellite.orbitLine);
    }

    private setupEventListeners() {
        this.canvasRef.nativeElement.addEventListener('mousemove', (event) => {
            this.onMouseMove(event);
        });

        this.canvasRef.nativeElement.addEventListener('click', (event) => {
            this.onMouseClick(event);
        });
    }

    private onMouseMove(event: MouseEvent) {
        const rect = this.canvasRef.nativeElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersectableMeshes = this.satellites
            .map(s => s.mesh!)
            .filter(mesh => mesh);

        const intersects = this.raycaster.intersectObjects(intersectableMeshes);

        // Reset all satellites to default color
        this.satellites.forEach(satellite => {
            if (satellite.mesh) {
                (satellite.mesh.material as THREE.MeshBasicMaterial).color.setHex(0xffffff);
            }
        });

        if (intersects.length > 0) {
            const intersectedSatellite = intersects[0].object.userData['satellite'] as CategorySatellite;
            if (intersectedSatellite && intersectedSatellite.mesh) {
                (intersectedSatellite.mesh.material as THREE.MeshBasicMaterial).color.setHex(0x4a90e2);
                this.hoveredSatellite = intersectedSatellite;
                this.canvasRef.nativeElement.style.cursor = 'pointer';
            }
        } else {
            this.hoveredSatellite = null;
            this.canvasRef.nativeElement.style.cursor = 'default';
        }
    }

    private onMouseClick(event: MouseEvent) {
        if (this.hoveredSatellite) {
            // Navigate to the category page
            this.router.navigate(['/player-analysis'], {
                queryParams: { category: this.hoveredSatellite.id }
            });
        }
    }

    private animate() {
        if (this.isDestroyed) return;

        this.animationId = requestAnimationFrame(() => this.animate());

        // Apply momentum to camera rotation
        if (this.applyMomentum) {
            this.applyMomentum();
        }

        // Rotate soccer ball very slowly
        this.soccerBall.rotation.y += 0.001;

        // Update satellite positions
        this.satellites.forEach(satellite => {
            if (satellite.group) {
                satellite.timeOffset += satellite.orbitSpeed;

                const x = Math.cos(satellite.timeOffset) * satellite.orbitRadius;
                const z = Math.sin(satellite.timeOffset) * satellite.orbitRadius;

                satellite.position.set(x, 0, z);

                // Apply orbit transformations
                satellite.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), satellite.orbitAngle);
                satellite.position.applyAxisAngle(new THREE.Vector3(1, 0, 0), satellite.orbitTilt);

                satellite.group.position.copy(satellite.position);
                satellite.group.rotation.y += satellite.rotationSpeed;

                // Make text face camera but very infrequently to reduce movement
                if (satellite.textGroup && Math.floor(Date.now() / 500) % 2 === 0) {
                    satellite.textGroup.lookAt(this.camera.position);
                }
            }
        });

        this.camera.lookAt(0, 0, 0);
        this.renderer.render(this.scene, this.camera);
    }

    @HostListener('window:resize', ['$event'])
    onWindowResize() {
        // Update camera aspect ratio
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        // Update renderer size
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}