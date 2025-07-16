import { Component, AfterViewInit, HostListener } from '@angular/core';
@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
	private animationId: number | null = null;
	private particles: any[] = [];
	private comets: any[] = [];
	private canvas: HTMLCanvasElement | null = null;
	private ctx: CanvasRenderingContext2D | null = null;
	private width = 0;
	private height = 0;

	ngAfterViewInit() {
		this.canvas = document.getElementById('space-canvas') as HTMLCanvasElement;
		if (!this.canvas) return;
		this.ctx = this.canvas.getContext('2d');
		this.resizeCanvas();
		this.initParticles();
		this.animate();
	}

	@HostListener('window:resize')
	onResize() {
		this.resizeCanvas();
	}

	private resizeCanvas() {
		if (!this.canvas) return;
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.canvas.width = this.width;
		this.canvas.height = this.height;
	}

	private initParticles() {
		this.particles = [];
		this.comets = [];
		const numParticles = Math.floor((this.width * this.height) / 5000); // fewer for performance
		for (let i = 0; i < numParticles; i++) {
			this.particles.push({
				x: Math.random() * this.width,
				y: Math.random() * this.height,
				r: Math.random() * 0.8 + 0.2, // smaller stars
				speed: Math.random() * 0.08 + 0.02,
				angle: Math.random() * Math.PI * 2,
				alpha: Math.random() * 0.5 + 0.4,
				color: Math.random() < 0.7 ? '#eaf6ff' : '#3df2ad', // mostly white, some blue/green
			});
		}
	}

	private spawnComet() {
		// Only allow comets within ±20 degrees of horizontal (0 or PI)
		const baseAngles = [0, Math.PI];
		const base = baseAngles[Math.floor(Math.random() * baseAngles.length)];
		const angle = base + (Math.random() - 0.5) * (Math.PI / 9); // ±20 degrees
		const speed = Math.random() * 1.2 + 0.6; // slower
		this.comets.push({
			x: Math.random() * this.width,
			y: Math.random() * this.height,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			length: Math.random() * 80 + 60,
			alpha: 1.0,
		});
	}

	private animate = () => {
		if (!this.ctx || !this.canvas) return;
		this.ctx.clearRect(0, 0, this.width, this.height);
		// Draw particles (stars)
		for (const p of this.particles) {
			p.x += Math.cos(p.angle) * p.speed;
			p.y += Math.sin(p.angle) * p.speed;
			if (p.x < 0) p.x = this.width;
			if (p.x > this.width) p.x = 0;
			if (p.y < 0) p.y = this.height;
			if (p.y > this.height) p.y = 0;
			this.ctx.save();
			this.ctx.globalAlpha = p.alpha;
			this.ctx.beginPath();
			this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
			this.ctx.fillStyle = p.color;
			this.ctx.fill();
			this.ctx.restore();
		}
		// Slow down comet spawn rate
		if (Math.random() < 0.0015) {
			this.spawnComet();
		}
		// Draw and update comets (unchanged)
		for (let i = this.comets.length - 1; i >= 0; i--) {
			const c = this.comets[i];
			this.ctx.save();
			this.ctx.globalAlpha = c.alpha;
			const grad = this.ctx.createLinearGradient(
				c.x,
				c.y,
				c.x - c.vx * c.length,
				c.y - c.vy * c.length,
			);
			grad.addColorStop(0, '#fff');
			grad.addColorStop(0.2, '#3df2ad');
			grad.addColorStop(1, 'rgba(191,201,213,0)');
			this.ctx.strokeStyle = grad;
			this.ctx.lineWidth = 2.5;
			this.ctx.beginPath();
			this.ctx.moveTo(c.x, c.y);
			this.ctx.lineTo(c.x - c.vx * c.length, c.y - c.vy * c.length);
			this.ctx.stroke();
			this.ctx.restore();
			c.x += c.vx;
			c.y += c.vy;
			c.alpha -= 0.008; // slower fade
			if (
				c.alpha <= 0 ||
				c.x < -100 ||
				c.x > this.width + 100 ||
				c.y < -100 ||
				c.y > this.height + 100
			) {
				this.comets.splice(i, 1);
			}
		}
		this.animationId = requestAnimationFrame(this.animate);
	};

	ngOnDestroy() {
		if (this.animationId) {
			cancelAnimationFrame(this.animationId);
		}
	}
}
