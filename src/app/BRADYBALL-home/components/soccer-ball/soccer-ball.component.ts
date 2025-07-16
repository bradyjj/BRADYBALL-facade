import {
	Component,
	ElementRef,
	ViewChild,
	OnInit,
	OnDestroy,
	HostListener,
	Output,
	EventEmitter,
} from '@angular/core';
import { Router } from '@angular/router';
import * as THREE from 'three';
import { FontService } from '../../../../assets/fonts/font.service';

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

// Example categories data
export const categoryData = [
	{ id: 'news', name: 'News' },
	{ id: 'blog', name: 'Blog' },
	{ id: 'about', name: 'About' },
	{ id: 'projects', name: 'Projects' },
	{ id: 'publications', name: 'Publications' },
];

@Component({
	selector: 'soccer-ball',
	templateUrl: './soccer-ball.component.html',
	styleUrls: ['./soccer-ball.component.scss'],
})
export class SoccerBallComponent implements OnInit, OnDestroy {
	@ViewChild('threeCanvas', { static: true })
	canvasRef!: ElementRef<HTMLCanvasElement>;

	public loading = true;
	public isZoomed = false;
	public currentCategory: string | null = null;
	public showCrtMonitor = false;

	@Output() zoomStateChanged = new EventEmitter<boolean>();

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
	private fontLoaded = false;
	private lastRaycastTime = 0;
	private readonly raycastInterval = 1000 / 30; // 30fps
	private lastWheelTime = 0;
	private lastWheelDelta = { theta: 0, phi: 0 };
	private lastTouchX: number | null = null;
	private lastTouchY: number | null = null;

	// Zoom animation properties
	private defaultCameraPosition = new THREE.Vector3(0, 10, 15);
	private zoomTargetPosition = new THREE.Vector3();
	private isZooming = false;
	private zoomStartTime = 0;
	private readonly zoomDuration = 1500; // 1.5 seconds
	private zoomEasing = 0.05; // Smoothing factor for zoom animation

	constructor(
		private router: Router,
		private fontService: FontService,
	) {}

	async ngOnInit() {
		await this.loadFont();
		this.initThreeJS();
		this.createSoccerBall();
		this.createSatellites();
		this.setupEventListeners();
		this.animate();
		this.loading = false;
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
			this.cleanup();
		}
		if (this.renderer) {
			this.renderer.dispose();
		}
	}

	private initThreeJS() {
		// Scene
		this.scene = new THREE.Scene();
		this.scene.background = null;

		// Camera (top-down view)
		this.camera = new THREE.PerspectiveCamera(
			95,
			window.innerWidth / window.innerHeight,
			0.1,
			1000,
		);
		this.camera.position.set(0, 10, 15);
		this.camera.lookAt(0, 0, 0);

		// Renderer
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvasRef.nativeElement,
			antialias: true,
			alpha: true,
		});

		// Set higher pixel ratio for better resolution (similar to zoom out effect)
		const pixelRatio = Math.min(window.devicePixelRatio * 1.5, 3); // Cap at 3x to avoid performance issues
		this.renderer.setPixelRatio(pixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setClearColor(0x000000, 0); // 0 alpha for transparent

		// Lighting
		const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
		this.scene.add(ambientLight);

		const pointLight = new THREE.PointLight(0xffffff, 1, 100);
		pointLight.position.set(10, 10, 10);
		this.scene.add(pointLight);

		// Add OrbitControls (you'll need to import this)
		this.setupOrbitControls();

		// Only set this once!
		this.spherical.setFromVector3(this.camera.position);
	}

	private setupOrbitControls() {
		let isMouseDown = false;
		let mouseX = 0;
		let mouseY = 0;

		// Convert current camera position to spherical coordinates (top-down)
		this.spherical.set(15, Math.PI / 2, 0); // radius, phi (90deg), theta (0deg)

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
			this.spherical.theta -= deltaX * rotateSpeed;
			this.spherical.phi += deltaY * rotateSpeed;

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

		this.canvasRef.nativeElement.addEventListener('mousedown', onMouseDown);
		this.canvasRef.nativeElement.addEventListener('mouseup', onMouseUp);
		this.canvasRef.nativeElement.addEventListener('mouseleave', onMouseUp);
		this.canvasRef.nativeElement.addEventListener('mousemove', onMouseMove);

		// Add wheel event for trackpad swipe (globe spin)
		const onWheel = (event: WheelEvent) => {
			// Only handle if not zooming (no ctrlKey)
			if (!event.ctrlKey) {
				event.preventDefault();
				const rotateSpeed = 0.0005; // Much slower for trackpad gestures
				let dTheta = 0,
					dPhi = 0;
				if (event.shiftKey) {
					dTheta = -event.deltaY * rotateSpeed;
				} else {
					dPhi = event.deltaY * rotateSpeed;
					dTheta = -event.deltaX * rotateSpeed;
				}
				this.spherical.theta += dTheta;
				this.spherical.phi += dPhi;
				this.camera.position.setFromSpherical(this.spherical);
				this.camera.lookAt(0, 0, 0);
				// Store for momentum
				this.lastWheelDelta.theta = dTheta;
				this.lastWheelDelta.phi = dPhi;
				this.lastWheelTime = Date.now();
			}
		};
		this.canvasRef.nativeElement.addEventListener('mousedown', onMouseDown);
		this.canvasRef.nativeElement.addEventListener('mouseup', onMouseUp);
		this.canvasRef.nativeElement.addEventListener('mouseleave', onMouseUp);
		this.canvasRef.nativeElement.addEventListener('mousemove', onMouseMove);
		this.canvasRef.nativeElement.addEventListener(
			'wheel',
			(e) => {
				onWheel(e);
				requestAnimationFrame(this.applyWheelMomentum);
			},
			{ passive: false },
		);

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

			if (
				Math.abs(this.rotationVelocity.theta) > 0.001 ||
				Math.abs(this.rotationVelocity.phi) > 0.001
			) {
				this.spherical.theta -= this.rotationVelocity.theta;
				this.spherical.phi += this.rotationVelocity.phi;

				// Apply damping
				this.rotationVelocity.theta *= damping;
				this.rotationVelocity.phi *= damping;

				// Update camera
				this.camera.position.setFromSpherical(this.spherical);
				this.camera.lookAt(0, 0, 0);
			}
		};
	}

	private applyWheelMomentum = () => {
		const now = Date.now();
		if (now - this.lastWheelTime < 100) {
			// Apply with damping
			const damping = 0.96;
			this.lastWheelDelta.theta *= damping;
			this.lastWheelDelta.phi *= damping;
			this.spherical.theta += this.lastWheelDelta.theta;
			this.spherical.phi += this.lastWheelDelta.phi;
			this.camera.position.setFromSpherical(this.spherical);
			this.camera.lookAt(0, 0, 0);
			if (
				Math.abs(this.lastWheelDelta.theta) > 0.001 ||
				Math.abs(this.lastWheelDelta.phi) > 0.001
			) {
				requestAnimationFrame(this.applyWheelMomentum);
			}
		}
	};

	private createSoccerBall() {
		this.soccerBall = new THREE.Group();

		const geometry = new THREE.IcosahedronGeometry(3, 1);

		const material = new THREE.MeshBasicMaterial({
			color: 0x00ae6b,
			wireframe: true,
			wireframeLinewidth: 2,
		});

		const ball = new THREE.Mesh(geometry, material);
		this.soccerBall.add(ball);

		this.scene.add(this.soccerBall);
	}

	private generateOrbitConfigurations(
		count: number,
	): { angle: number; tilt: number; timeOffset: number }[] {
		const configurations: {
			angle: number;
			tilt: number;
			timeOffset: number;
		}[] = [];

		// Use Fibonacci sphere distribution for better spacing
		const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle in radians

		for (let i = 0; i < count; i++) {
			const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
			const radius = Math.sqrt(1 - y * y); // radius at y
			const theta = phi * i; // golden angle increment

			// Convert to spherical coordinates
			const angle = theta;
			const tilt = Math.acos(y);

			// Calculate initial time offset for even distribution around the orbit
			const timeOffset = (i / count) * Math.PI * 2;

			configurations.push({ angle, tilt, timeOffset });
		}

		return configurations;
	}

	private createSatellites() {
		const configs = this.generateOrbitConfigurations(categoryData.length);

		categoryData.forEach((category: { id: string; name: string }, index: number) => {
			const config = configs[index];

			const satellite: CategorySatellite = {
				id: category.id,
				name: category.name,
				orbitRadius: 5 + index * 2, // Restore original varying radius
				orbitSpeed: 0.001 / (1 + index * 0.05), // Restore original varying speed
				rotationSpeed: 0.0003 + index * 0.0001, // Restore original varying rotation
				orbitAngle: config.angle,
				orbitTilt: config.tilt,
				position: new THREE.Vector3(),
				timeOffset: config.timeOffset, // Use deterministic timeOffset for consistent placement
			};

			this.createSatelliteGroup(satellite);
			this.createOrbitTrail(satellite);
			this.satellites.push(satellite);
		});
	}

	private createSatelliteGroup(satellite: CategorySatellite) {
		satellite.group = new THREE.Group();

		const geometry = new THREE.SphereGeometry(0.15, 8, 8);
		const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
		satellite.mesh = new THREE.Mesh(geometry, material);
		satellite.group.add(satellite.mesh);

		satellite.textGroup = this.createTextLabel(satellite.name, satellite.orbitRadius);
		satellite.group.add(satellite.textGroup);

		// Assign userData to the group only
		satellite.group.userData['satellite'] = satellite;

		this.scene.add(satellite.group);

		// In createTextLabel, after creating each mesh:
		const textValue = satellite.name.toUpperCase();
		const background = satellite.textGroup.children[0] as THREE.Mesh;
		const border = satellite.textGroup.children[1] as THREE.Mesh;
		const textPlane = satellite.textGroup.children[2] as THREE.Mesh;
		background.name = `${textValue}_background`;
		border.name = `${textValue}_border`;
		textPlane.name = `${textValue}_textPlane`;

		// Calculate initial position for the satellite
		const x = Math.cos(satellite.timeOffset) * satellite.orbitRadius;
		const z = Math.sin(satellite.timeOffset) * satellite.orbitRadius;

		satellite.position.set(x, 0, z);

		const rotationMatrix = new THREE.Matrix4();
		rotationMatrix.makeRotationY(-satellite.orbitAngle);
		rotationMatrix.multiply(new THREE.Matrix4().makeRotationX(satellite.orbitTilt));
		satellite.position.applyMatrix4(rotationMatrix);

		satellite.group.position.copy(satellite.position);
	}

	private getMaxLabelLength(): number {
		return Math.max(
			...categoryData.map((cat: { id: string; name: string }) => cat.name.length),
		);
	}

	private createTextLabel(text: string, orbitRadius: number): THREE.Group {
		const textGroup = new THREE.Group();
		// World units for label
		const labelHeight = 0.8 + orbitRadius * 0.07;
		const paddingX = 0.25;
		const paddingY = 0.25;
		const fontFamily = 'Squada One, Arial, Helvetica, sans-serif';
		const fontWeight = 'bold';
		const textValue = text.toUpperCase();
		const scale = 512;

		// Estimate font size in px for canvas
		const baseFontSize = labelHeight * 0.8 * scale;
		let fontSizePx = baseFontSize;
		if (textValue.length > 10) {
			fontSizePx = Math.max(16, baseFontSize * (10 / textValue.length));
		}
		const fontString = `${fontWeight} ${fontSizePx}px ${fontFamily}`;

		// Create a temp canvas to measure text
		const measureCanvas = document.createElement('canvas');
		const measureCtx = measureCanvas.getContext('2d')!;
		measureCtx.font = fontString;
		const textMetrics = measureCtx.measureText(textValue);
		const textWidthPx = textMetrics.width;
		// Approximate text height (ascent + descent)
		const textHeightPx =
			(textMetrics.actualBoundingBoxAscent || fontSizePx) +
			(textMetrics.actualBoundingBoxDescent || fontSizePx * 0.3);

		// Convert to world units
		const textWidthWorld = textWidthPx / scale;
		const textHeightWorld = textHeightPx / scale;
		const boxWidthWorld = textWidthWorld + 2 * paddingX;
		const boxHeightWorld = textHeightWorld + 2 * paddingY;

		// Now create the actual canvas for the label
		const canvasWidth = Math.round(boxWidthWorld * scale);
		const canvasHeight = Math.round(boxHeightWorld * scale);
		const canvas = document.createElement('canvas');
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
		const ctx = canvas.getContext('2d')!;
		ctx.font = fontString;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = 'white';
		// Draw text centered in the box
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillText(textValue, canvas.width / 2, canvas.height / 2);

		// If font loading is async, update texture when loaded
		if (document.fonts && document.fonts.load) {
			document.fonts.load(fontString).then(() => {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.font = fontString;
				ctx.fillStyle = 'white';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText(textValue, canvas.width / 2, canvas.height / 2);
				textTexture.needsUpdate = true;
			});
		}

		const textTexture = new THREE.CanvasTexture(canvas);
		textTexture.generateMipmaps = true;
		textTexture.minFilter = THREE.LinearMipmapLinearFilter;
		textTexture.magFilter = THREE.LinearFilter;

		// Background and border
		const bgGeometry = new THREE.PlaneGeometry(boxWidthWorld, boxHeightWorld);
		const bgMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
		const background = new THREE.Mesh(bgGeometry, bgMaterial);
		const borderGeometry = new THREE.PlaneGeometry(boxWidthWorld + 0.15, boxHeightWorld + 0.1);
		const borderMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
		const border = new THREE.Mesh(borderGeometry, borderMaterial);
		const textMaterial = new THREE.MeshBasicMaterial({
			map: textTexture,
			transparent: true,
			alphaTest: 0.1,
		});
		const textPlane = new THREE.Mesh(
			new THREE.PlaneGeometry(boxWidthWorld, boxHeightWorld),
			textMaterial,
		);

		// Offset the label so the dot is 1/3 from the left edge of the box
		const offsetX = boxWidthWorld / 6;
		const offsetY = 0.45 + boxHeightWorld / 2;
		background.position.set(offsetX, offsetY, -0.1);
		border.position.set(offsetX, offsetY, -0.11);
		textPlane.position.set(offsetX, offsetY, 0);
		textGroup.add(background);
		textGroup.add(border);
		textGroup.add(textPlane);
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

			const rotationMatrix = new THREE.Matrix4();
			rotationMatrix.makeRotationY(-satellite.orbitAngle);
			rotationMatrix.multiply(new THREE.Matrix4().makeRotationX(satellite.orbitTilt));
			position.applyMatrix4(rotationMatrix);

			points.push(position);
		}

		const geometry = new THREE.BufferGeometry().setFromPoints(points);
		const material = new THREE.LineDashedMaterial({
			color: 0xffffff,
			transparent: true,
			opacity: 0.5,
			dashSize: 0.5,
			gapSize: 0.3,
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
		const now = Date.now();
		if (now - this.lastRaycastTime < this.raycastInterval) return;
		this.lastRaycastTime = now;

		const rect = this.canvasRef.nativeElement.getBoundingClientRect();
		this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

		this.raycaster.setFromCamera(this.mouse, this.camera);

		// Reset all satellites to default colors
		this.satellites.forEach((satellite) => {
			if (satellite.mesh) {
				(satellite.mesh.material as THREE.MeshBasicMaterial).color.setHex(0xffffff);
			}
			if (satellite.textGroup) {
				const border = satellite.textGroup.children[1] as THREE.Mesh;
				const textPlane = satellite.textGroup.children[2] as THREE.Mesh;
				if (border && border.material) {
					(border.material as THREE.MeshBasicMaterial).color.setHex(0xffffff);
				}
				if (textPlane && textPlane.material) {
					(textPlane.material as THREE.MeshBasicMaterial).color.setHex(0xffffff);
				}
			}
		});

		// Handle hover state
		const groups = this.satellites
			.map((satellite) => satellite.group)
			.filter((group): group is THREE.Group => !!group);
		const intersects = this.raycaster.intersectObjects(groups, true);
		if (intersects.length > 0) {
			let intersectedSatellite: CategorySatellite | null = null;
			for (const intersect of intersects) {
				let obj: THREE.Object3D | null = intersect.object;
				while (obj) {
					if (obj.userData && obj.userData['satellite']) {
						intersectedSatellite = obj.userData['satellite'];
						break;
					}
					obj = obj.parent;
				}
				if (intersectedSatellite) break;
			}
			if (intersectedSatellite) {
				if (intersectedSatellite.mesh) {
					(intersectedSatellite.mesh.material as THREE.MeshBasicMaterial).color.setHex(
						0x277dff,
					);
				}
				if (intersectedSatellite.textGroup) {
					const border = intersectedSatellite.textGroup.children[1] as THREE.Mesh;
					const textPlane = intersectedSatellite.textGroup.children[2] as THREE.Mesh;
					if (border && border.material) {
						(border.material as THREE.MeshBasicMaterial).color.setHex(0x277dff);
					}
					if (textPlane && textPlane.material) {
						(textPlane.material as THREE.MeshBasicMaterial).color.setHex(0x277dff);
					}
				}
				this.hoveredSatellite = intersectedSatellite;
				this.canvasRef.nativeElement.style.cursor = 'pointer';
			}
		} else {
			this.hoveredSatellite = null;
			this.canvasRef.nativeElement.style.cursor = 'default';
		}
	}

	private onMouseClick(event: MouseEvent) {
		if (this.hoveredSatellite && !this.isZooming) {
			this.zoomToSatellite(this.hoveredSatellite);
		}
	}

	private animate() {
		if (this.isDestroyed) return;

		this.animationId = requestAnimationFrame(() => this.animate());

		// Apply momentum to camera rotation (only when not zooming)
		if (this.applyMomentum && !this.isZooming) {
			this.applyMomentum();
		}

		// Rotate soccer ball very slowly
		this.soccerBall.rotation.y += 0.001;

		// Update satellite positions
		this.satellites.forEach((satellite) => {
			if (satellite.group) {
				satellite.timeOffset += satellite.orbitSpeed;

				const x = Math.cos(satellite.timeOffset) * satellite.orbitRadius;
				const z = Math.sin(satellite.timeOffset) * satellite.orbitRadius;

				satellite.position.set(x, 0, z);

				const rotationMatrix = new THREE.Matrix4();
				rotationMatrix.makeRotationY(-satellite.orbitAngle);
				rotationMatrix.multiply(new THREE.Matrix4().makeRotationX(satellite.orbitTilt));
				satellite.position.applyMatrix4(rotationMatrix);

				satellite.group.position.copy(satellite.position);
				satellite.group.rotation.y += satellite.rotationSpeed;

				if (satellite.textGroup) {
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

		// Update renderer size with maintained pixel ratio
		const pixelRatio = Math.min(window.devicePixelRatio * 1.5, 3);
		this.renderer.setPixelRatio(pixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	private async loadFont(): Promise<void> {
		return new Promise((resolve) => {
			const fontFiles = ['squada-one-regular.ttf'];
			this.fontService.loadFonts(fontFiles).subscribe(
				async (fonts) => {
					// Wait for browser to confirm font is ready
					const fontString = 'bold 32px Squada One, Arial, Helvetica, sans-serif';
					if (document.fonts && document.fonts.load) {
						await document.fonts.load(fontString);
						await document.fonts.ready;
					}
					this.fontLoaded = true;
					resolve();
				},
				(error) => {
					console.warn('Failed to load fonts via service.', error);
					resolve();
				},
			);
		});
	}

	private zoomToSatellite(satellite: CategorySatellite) {
		if (this.isZooming) return;

		this.isZooming = true;
		this.zoomStartTime = Date.now();
		this.currentCategory = satellite.id;

		// Calculate zoom target position (closer to the satellite)
		const zoomDistance = 3; // Distance from satellite
		const direction = satellite.position.clone().normalize();
		this.zoomTargetPosition
			.copy(satellite.position)
			.add(direction.multiplyScalar(zoomDistance));

		// Start zoom animation
		this.animateZoom();
	}

	public getCategoryTitle(): string {
		if (!this.currentCategory) return 'About';

		const category = categoryData.find((cat) => cat.id === this.currentCategory);
		return category ? category.name : 'About';
	}

	public getCategoryContent(): string {
		if (!this.currentCategory) return 'about';

		switch (this.currentCategory) {
			case 'about':
				return 'about';
			case 'news':
				return 'news';
			case 'blog':
				return 'blog';
			case 'projects':
				return 'projects';
			case 'publications':
				return 'publications';
			default:
				return 'about';
		}
	}

	private animateZoom() {
		if (!this.isZooming) return;

		const elapsed = Date.now() - this.zoomStartTime;
		const progress = Math.min(elapsed / this.zoomDuration, 1);

		// Smooth easing function
		const easedProgress = this.easeInOutCubic(progress);

		// Interpolate camera position
		this.camera.position.lerpVectors(
			this.defaultCameraPosition,
			this.zoomTargetPosition,
			easedProgress,
		);
		this.camera.lookAt(0, 0, 0);

		if (progress < 1) {
			requestAnimationFrame(() => this.animateZoom());
		} else {
			this.isZooming = false;
			this.isZoomed = true;
			this.showCrtMonitor = true;
			this.zoomStateChanged.emit(true);
		}
	}

	private easeInOutCubic(t: number): number {
		return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
	}

	public goBackToDefaultView() {
		if (this.isZooming) return;

		this.isZooming = true;
		this.zoomStartTime = Date.now();
		this.showCrtMonitor = false;

		// Animate back to default position
		this.animateZoomBack();
	}

	private animateZoomBack() {
		if (!this.isZooming) return;

		const elapsed = Date.now() - this.zoomStartTime;
		const progress = Math.min(elapsed / this.zoomDuration, 1);

		// Smooth easing function
		const easedProgress = this.easeInOutCubic(progress);

		// Interpolate camera position back to default
		this.camera.position.lerpVectors(
			this.zoomTargetPosition,
			this.defaultCameraPosition,
			easedProgress,
		);
		this.camera.lookAt(0, 0, 0);

		if (progress < 1) {
			requestAnimationFrame(() => this.animateZoomBack());
		} else {
			this.isZooming = false;
			this.isZoomed = false;
			this.currentCategory = null;
			this.zoomStateChanged.emit(false);
		}
	}

	public onOverlayClick(event: MouseEvent) {
		// Only go back if clicking on the overlay background, not the monitor
		if (event.target === event.currentTarget) {
			this.goBackToDefaultView();
		}
	}
}
