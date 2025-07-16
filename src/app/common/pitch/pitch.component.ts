import {
	Component,
	Input,
	ViewChild,
	ElementRef,
	OnInit,
	AfterViewInit,
	OnDestroy,
} from '@angular/core';
import { select } from 'd3-selection';
import { arc as d3Arc } from 'd3-shape';
import { BuildupEvent, Goal } from '../models/goal.model';
import { DatePipe, DecimalPipe } from '@angular/common';

/**
 * Configuration for event visualization styles
 * Modify these objects to change event appearances
 */
const EVENT_STYLES = {
	pass: {
		color: '#ffffff',
		marker: 'arrowhead-pass',
		radius: 1.5,
		outlineColor: '#ffffff',
	},
	keyPass: {
		color: '#ffeb3b',
		marker: 'arrowhead-keypass',
		radius: 1.5,
		outlineColor: '#000000',
	},
	shot: {
		color: '#ff4444',
		marker: 'arrowhead-shot',
		radius: 1.5,
		outlineColor: '#ff4444',
	},
	carry: {
		color: '#4CAF50',
		marker: 'arrowhead-carry',
		radius: 1.5,
		outlineColor: '#4CAF50',
	},
	dribble: {
		color: '#2196F3',
		marker: 'arrowhead-dribble',
		radius: 1.5,
		outlineColor: '#2196F3',
	},
};

/**
 * Animation timing configuration
 */
const ANIMATION_CONFIG = {
	baseDuration: 800,
	fadeInDuration: 300,
	eventDelay: 200,
};

@Component({
	selector: 'pitch',
	templateUrl: './pitch.component.html',
	styleUrls: ['./pitch.component.scss'],
	providers: [DecimalPipe, DatePipe],
})
export class PitchComponent implements OnInit, AfterViewInit, OnDestroy {
	@Input() goal?: Goal;
	@ViewChild('pitch') private pitchRef!: ElementRef;

	private svg: any;
	private pitch: any;
	private isVertical = false;

	// StatsBomb pitch dimensions (in meters)
	private readonly PITCH_LENGTH = 120;
	private readonly PITCH_WIDTH = 80;
	private readonly LINE_COLOR = 'rgba(255, 255, 255, 0.8)';
	private readonly PLAYER_RADIUS = EVENT_STYLES.pass.radius;

	eventStream: (BuildupEvent & { active: boolean })[] = [];
	currentEventIndex: number = -1;

	constructor() {}

	ngOnInit() {
		if (this.goal) {
			this.initializeEventStream();
		}
	}

	private initializeEventStream() {
		if (!this.goal) return;
		this.eventStream = this.goal.buildup_events.map((event) => ({
			...event,
			active: false,
		}));
	}

	ngAfterViewInit() {
		setTimeout(() => {
			this.initializePitch();
			if (this.goal) {
				this.drawGoalSequence(this.goal);
			}
		});
	}

	/**
	 * Initialize pitch visualization
	 */
	private initializePitch() {
		if (!this.pitchRef?.nativeElement) return;

		if (this.svg) {
			select(this.pitchRef.nativeElement).selectAll('*').remove();
		}

		this.svg = select(this.pitchRef.nativeElement)
			.attr('viewBox', `0 0 ${this.PITCH_LENGTH} ${this.PITCH_WIDTH}`)
			.attr('preserveAspectRatio', 'xMidYMid meet');

		this.createArrowMarkers();
		this.drawPitchBackground();
		this.drawFieldLines();
	}

	/**
	 * Create arrow markers for different event types
	 */
	private createArrowMarkers() {
		const defs = this.svg.append('defs');

		Object.entries(EVENT_STYLES).forEach(([type, style]) => {
			defs.append('marker')
				.attr('id', style.marker)
				.attr('viewBox', '0 -5 10 10')
				.attr('refX', 8)
				.attr('refY', 0)
				.attr('markerWidth', 6)
				.attr('markerHeight', 6)
				.attr('orient', 'auto')
				.attr('markerUnits', 'strokeWidth')
				.append('path')
				.attr('d', 'M0,-5 L10,0 L0,5')
				.attr('fill', style.color)
				.attr('opacity', 1);
		});
	}

	/**
	 * Scale coordinates from StatsBomb format to SVG coordinates
	 */
	private scaleCoordinates(x: number, y: number): [number, number] {
		if (this.isVertical) {
			return [(y / 80) * this.PITCH_LENGTH, ((120 - x) / 120) * this.PITCH_WIDTH];
		}
		return [(x / 120) * this.PITCH_LENGTH, (y / 80) * this.PITCH_WIDTH];
	}

	/**
	 * Draw sequence of events
	 */
	private drawGoalSequence(goal: Goal) {
		const events = [...goal.buildup_events];

		const animateEvent = (index: number) => {
			if (index >= events.length) return;

			const event = events[index];
			this.currentEventIndex = index;
			this.eventStream[index].active = true;

			const [startX, startY] = this.scaleCoordinates(
				event.start_location[0],
				event.start_location[1],
			);
			const [endX, endY] = event.end_location
				? this.scaleCoordinates(event.end_location[0], event.end_location[1])
				: [startX, startY];

			const style = this.getEventStyle(event);
			const eventGroup = this.pitch.append('g');

			// Draw the path first if there's an end location
			if (event.end_location) {
				if (event.event_type === 'pass') {
					const path = eventGroup
						.append('path')
						.attr('d', this.createCurvedPath(startX, startY, endX, endY)) // Removed the -2 from endX
						.attr('fill', 'none')
						.attr('stroke', style.color)
						.attr('stroke-width', 0.5)
						.attr('marker-end', `url(#${style.marker})`);

					const pathLength = path.node().getTotalLength();
					path.attr('stroke-dasharray', `${pathLength},${pathLength}`)
						.attr('stroke-dashoffset', pathLength)
						.transition()
						.duration(ANIMATION_CONFIG.baseDuration)
						.attr('stroke-dashoffset', 0);
				} else if (event.event_type === 'shot') {
					this.animateShot(event, startX, startY, endX, endY, () => {});
				} else if (event.event_type === 'dribble' || event.event_type === 'carry') {
					this.animateCarryOrDribble(event, startX, startY, endX, endY, () => {});
				}
			}

			// Draw start marker
			const startDot = eventGroup
				.append('circle')
				.attr('cx', startX)
				.attr('cy', startY)
				.attr('r', style.radius)
				.attr('fill', style.color)
				.attr('opacity', 0);

			if (event.key_pass) {
				startDot
					.attr('fill', style.outlineColor)
					.attr('stroke', style.color)
					.attr('stroke-width', 0.5);
			}

			startDot
				.transition()
				.duration(ANIMATION_CONFIG.fadeInDuration)
				.attr('opacity', 1)
				.on('end', () => {
					if (event.end_location && event.event_type !== 'shot') {
						const endDot = eventGroup
							.append('circle')
							.attr('cx', endX)
							.attr('cy', endY)
							.attr('r', style.radius)
							.attr('fill', style.color)
							.attr('opacity', 0);

						endDot
							.transition()
							.duration(ANIMATION_CONFIG.fadeInDuration)
							.attr('opacity', 1)
							.on('end', () => {
								setTimeout(
									() => animateEvent(index + 1),
									ANIMATION_CONFIG.eventDelay,
								);
							});
					} else {
						setTimeout(() => animateEvent(index + 1), ANIMATION_CONFIG.baseDuration);
					}
				});
		};

		animateEvent(0);
	}

	/**
	 * Animate different event types
	 */
	private animateEventPath(
		event: BuildupEvent,
		startX: number,
		startY: number,
		endX: number,
		endY: number,
		onComplete: () => void,
	) {
		const style = this.getEventStyle(event);

		switch (event.event_type) {
			case 'dribble':
			case 'carry':
				this.animateCarryOrDribble(event, startX, startY, endX, endY, onComplete);
				break;
			case 'pass':
				this.animatePass(event, startX, startY, endX, endY, onComplete);
				break;
			case 'shot':
				this.animateShot(event, startX, startY, endX, endY, onComplete);
				break;
			default:
				onComplete();
		}
	}

	/**
	 * Animate carry or dribble events
	 */
	private animateCarryOrDribble(
		event: BuildupEvent,
		startX: number,
		startY: number,
		endX: number,
		endY: number,
		onComplete: () => void,
	) {
		const style = this.getEventStyle(event);
		const path = this.pitch
			.append('path')
			.attr('d', this.createCurvedPath(startX, startY, endX, endY))
			.attr('fill', 'none')
			.attr('stroke', style.color)
			.attr('stroke-width', 0.5)
			.attr('opacity', 0.3);

		const pathNode = path.node();
		const pathLength = pathNode.getTotalLength();

		const dot = this.pitch
			.append('circle')
			.attr('cx', startX)
			.attr('cy', startY)
			.attr('r', style.radius)
			.attr('fill', style.color);

		dot.transition()
			.duration(ANIMATION_CONFIG.baseDuration)
			.attrTween('transform', () => {
				return (t: number) => {
					const point = pathNode.getPointAtLength(t * pathLength);
					return `translate(${point.x - startX},${point.y - startY})`;
				};
			})
			.on('end', onComplete);
	}

	/**
	 * Animate pass events
	 */
	private animatePass(
		event: BuildupEvent,
		startX: number,
		startY: number,
		endX: number,
		endY: number,
		onComplete: () => void,
	) {
		const style = this.getEventStyle(event);
		const pathGroup = this.pitch.append('g').lower();

		const path = pathGroup
			.append('path')
			.attr('d', this.createCurvedPath(startX, startY, endX - 3, endY))
			.attr('fill', 'none')
			.attr('stroke', style.color)
			.attr('stroke-width', 0.5)
			.attr('marker-end', `url(#${style.marker})`);

		const pathLength = path.node().getTotalLength();
		path.attr('stroke-dasharray', `${pathLength},${pathLength}`)
			.attr('stroke-dashoffset', pathLength)
			.transition()
			.duration(ANIMATION_CONFIG.baseDuration)
			.attr('stroke-dashoffset', 0)
			.on('end', () => {
				this.pitch
					.append('circle')
					.attr('cx', endX)
					.attr('cy', endY)
					.attr('r', style.radius)
					.attr('fill', style.color)
					.attr('opacity', 0)
					.transition()
					.duration(ANIMATION_CONFIG.fadeInDuration)
					.attr('opacity', 1)
					.on('end', onComplete);
			});
	}

	/**
	 * Animate shot events
	 */
	private animateShot(
		event: BuildupEvent,
		startX: number,
		startY: number,
		endX: number,
		endY: number,
		onComplete: () => void,
	) {
		const style = this.getEventStyle(event);
		const path = this.pitch
			.append('path')
			.attr('d', this.createCurvedPath(startX, startY, endX, endY))
			.attr('fill', 'none')
			.attr('stroke', style.color)
			.attr('stroke-width', 0.5)
			.attr('marker-end', `url(#${style.marker})`)
			.attr('opacity', 1);

		const pathLength = path.node().getTotalLength();
		path.attr('stroke-dasharray', pathLength)
			.attr('stroke-dashoffset', pathLength)
			.transition()
			.duration(ANIMATION_CONFIG.baseDuration)
			.attr('stroke-dashoffset', 0)
			.on('end', onComplete);
	}

	/**
	 * Draw pitch background with worn grass effect
	 */
	private drawPitchBackground() {
		const defs = this.svg.append('defs');

		// Create base grass pattern
		const grassPattern = defs
			.append('pattern')
			.attr('id', 'wornGrass')
			.attr('patternUnits', 'userSpaceOnUse')
			.attr('width', 20)
			.attr('height', 20);

		grassPattern.append('rect').attr('width', 20).attr('height', 20).attr('fill', '#1a472a');

		// Add noise texture
		for (let i = 0; i < 20; i++) {
			grassPattern
				.append('circle')
				.attr('cx', Math.random() * 20)
				.attr('cy', Math.random() * 20)
				.attr('r', Math.random() * 1)
				.attr('fill', '#143d23')
				.attr('opacity', 0.3);
		}

		// Create worn spots gradient
		const wornGradient = defs
			.append('radialGradient')
			.attr('id', 'wornSpot')
			.attr('gradientUnits', 'userSpaceOnUse')
			.attr('cx', '0')
			.attr('cy', '0')
			.attr('r', '10');

		wornGradient
			.append('stop')
			.attr('offset', '0%')
			.attr('stop-color', '#0f2d1c')
			.attr('stop-opacity', 0.7);

		wornGradient
			.append('stop')
			.attr('offset', '100%')
			.attr('stop-color', '#1a472a')
			.attr('stop-opacity', 0);

		this.pitch = this.svg.append('g');

		// Draw base rectangle
		this.pitch
			.append('rect')
			.attr('width', this.PITCH_LENGTH)
			.attr('height', this.PITCH_WIDTH)
			.attr('fill', 'url(#wornGrass)');

		// Add worn areas
		const wornAreas = [
			{ x: this.PITCH_LENGTH / 2, y: this.PITCH_WIDTH / 2, r: 12 },
			{ x: 11, y: this.PITCH_WIDTH / 2, r: 8 },
			{ x: this.PITCH_LENGTH - 11, y: this.PITCH_WIDTH / 2, r: 8 },
			{ x: 16.5, y: this.PITCH_WIDTH / 2, r: 15 },
			{ x: this.PITCH_LENGTH - 16.5, y: this.PITCH_WIDTH / 2, r: 15 },
		];

		wornAreas.forEach((area) => {
			this.pitch
				.append('circle')
				.attr('cx', area.x)
				.attr('cy', area.y)
				.attr('r', area.r)
				.attr('fill', 'url(#wornSpot)')
				.attr('transform', `translate(${area.x},${area.y})`);
		});
	}

	/**
	 * Draw field lines and markings
	 */
	private drawFieldLines() {
		// Outer boundary
		this.pitch
			.append('rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', this.PITCH_LENGTH)
			.attr('height', this.PITCH_WIDTH)
			.attr('fill', 'none')
			.attr('stroke', this.LINE_COLOR)
			.attr('stroke-width', 0.5);

		// Center line
		this.pitch
			.append('line')
			.attr('x1', this.PITCH_LENGTH / 2)
			.attr('y1', 0)
			.attr('x2', this.PITCH_LENGTH / 2)
			.attr('y2', this.PITCH_WIDTH)
			.attr('stroke', this.LINE_COLOR)
			.attr('stroke-width', 0.5);

		// Center circle
		this.pitch
			.append('circle')
			.attr('cx', this.PITCH_LENGTH / 2)
			.attr('cy', this.PITCH_WIDTH / 2)
			.attr('r', 9.15)
			.attr('fill', 'none')
			.attr('stroke', this.LINE_COLOR)
			.attr('stroke-width', 0.5);

		// Draw penalty areas and goal boxes
		[0, this.PITCH_LENGTH].forEach((x) => {
			const isLeft = x === 0;
			const boxX = isLeft ? 0 : this.PITCH_LENGTH - 16.5;

			// Penalty area
			this.pitch
				.append('rect')
				.attr('x', boxX)
				.attr('y', (this.PITCH_WIDTH - 40.32) / 2)
				.attr('width', 16.5)
				.attr('height', 40.32)
				.attr('fill', 'none')
				.attr('stroke', this.LINE_COLOR)
				.attr('stroke-width', 0.5);

			// Goal box
			const goalBoxX = isLeft ? 0 : this.PITCH_LENGTH - 5.5;
			this.pitch
				.append('rect')
				.attr('x', goalBoxX)
				.attr('y', (this.PITCH_WIDTH - 18.32) / 2)
				.attr('width', 5.5)
				.attr('height', 18.32)
				.attr('fill', 'none')
				.attr('stroke', this.LINE_COLOR)
				.attr('stroke-width', 0.5);

			// Penalty arc
			const arcGenerator = d3Arc()
				.innerRadius(9.15)
				.outerRadius(9.15)
				.startAngle(isLeft ? (38 * Math.PI) / 180 : (218 * Math.PI) / 180)
				.endAngle(isLeft ? (142 * Math.PI) / 180 : (322 * Math.PI) / 180);

			this.pitch
				.append('path')
				.attr('d', arcGenerator({} as any))
				.attr(
					'transform',
					`translate(${isLeft ? 11 : this.PITCH_LENGTH - 11},${this.PITCH_WIDTH / 2})`,
				)
				.attr('stroke', this.LINE_COLOR)
				.attr('fill', 'none')
				.attr('stroke-width', 0.5);

			// Penalty spot
			this.pitch
				.append('circle')
				.attr('cx', isLeft ? 11 : this.PITCH_LENGTH - 11)
				.attr('cy', this.PITCH_WIDTH / 2)
				.attr('r', 0.5)
				.attr('fill', this.LINE_COLOR);
		});
	}

	/**
	 * Get formatted description of an event
	 */
	public getEventDescription(event: BuildupEvent): string {
		switch (event.event_type) {
			case 'pass':
				const passHeight = event.pass_height ? `${event.pass_height} ` : '';
				const passOutcome = event.pass_outcome ? ` (${event.pass_outcome})` : '';
				return `${passHeight}Pass${passOutcome}`;
			case 'shot':
				const shotTechnique = event.shot_technique ? `${event.shot_technique} ` : '';
				const shotOutcome = event.shot_outcome ? ` (${event.shot_outcome})` : '';
				return `${shotTechnique}Shot${shotOutcome}`;
			case 'carry':
				return `Carry${event.carry_outcome ? ` (${event.carry_outcome})` : ''}`;
			case 'dribble':
				return `Dribble${event.dribble_outcome ? ` (${event.dribble_outcome})` : ''}`;
			default:
				return event.event_type;
		}
	}

	/**
	 * Get action type from event
	 */
	getActionType(event: BuildupEvent): string {
		if (event.technique) {
			return event.technique;
		}
		return event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1);
	}

	/**
	 * Get style configuration for an event type
	 */
	private getEventStyle(event: BuildupEvent) {
		if (event.event_type === 'pass' && event.key_pass) {
			return EVENT_STYLES.keyPass;
		}
		return EVENT_STYLES[event.event_type as keyof typeof EVENT_STYLES];
	}

	/**
	 * Create curved path between two points
	 */
	private createCurvedPath(x1: number, y1: number, x2: number, y2: number): string {
		const dx = x2 - x1;
		const dy = y2 - y1;
		const dr = Math.sqrt(dx * dx + dy * dy);
		const midX = (x1 + x2) / 2;
		const midY = (y1 + y2) / 2 - dr * 0.15;
		return `M${x1},${y1} Q${midX},${midY} ${x2},${y2}`;
	}

	/**
	 * Cleanup on component destruction
	 */
	ngOnDestroy() {
		if (this.svg) {
			select(this.pitchRef.nativeElement).selectAll('*').remove();
		}
	}
}
