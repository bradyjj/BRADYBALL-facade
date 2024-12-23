// BRADYBALL-pitch.component.ts
import { Component, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { select } from 'd3-selection';
import * as d3 from 'd3';
import { Goal } from '../models/goal.model';

@Component({
  selector: 'BRADYBALL-pitch',
  templateUrl: './BRADYBALL-pitch.component.html',
  styleUrls: ['./BRADYBALL-pitch.component.scss']
})
export class BRADYBALLPitchComponent implements AfterViewInit {
  @Input() goal?: Goal;
  @ViewChild('pitch') private pitchRef!: ElementRef;
  private svg: any;
  private pitch: any;
  
  private readonly PITCH_WIDTH = 120;
  private readonly PITCH_HEIGHT = 80;
  private readonly PITCH_COLOR = '#2E7D32';
  private readonly LINE_COLOR = '#ffffff';

  ngAfterViewInit() {
    this.initializePitch();
    if (this.goal) {
      this.drawGoalSequence(this.goal);
    }
  }

  private initializePitch() {
    this.svg = select(this.pitchRef.nativeElement)
      .attr('viewBox', `0 0 ${this.PITCH_WIDTH} ${this.PITCH_HEIGHT}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Background
    this.svg.append('rect')
      .attr('width', this.PITCH_WIDTH)
      .attr('height', this.PITCH_HEIGHT)
      .attr('fill', this.PITCH_COLOR);

    this.pitch = this.svg.append('g');

    // Outer lines
    this.pitch.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.PITCH_WIDTH)
      .attr('height', this.PITCH_HEIGHT)
      .attr('fill', 'none')
      .attr('stroke', this.LINE_COLOR);

    // Center line
    this.pitch.append('line')
      .attr('x1', this.PITCH_WIDTH/2)
      .attr('y1', 0)
      .attr('x2', this.PITCH_WIDTH/2)
      .attr('y2', this.PITCH_HEIGHT)
      .attr('stroke', this.LINE_COLOR);

    // Center circle
    this.pitch.append('circle')
      .attr('cx', this.PITCH_WIDTH/2)
      .attr('cy', this.PITCH_HEIGHT/2)
      .attr('r', 9.15)
      .attr('fill', 'none')
      .attr('stroke', this.LINE_COLOR);

    // Penalty areas
    [0, this.PITCH_WIDTH].forEach(x => {
      this.pitch.append('rect')
        .attr('x', x < 60 ? 0 : this.PITCH_WIDTH - 16.5)
        .attr('y', (this.PITCH_HEIGHT - 40.32)/2)
        .attr('width', 16.5)
        .attr('height', 40.32)
        .attr('fill', 'none')
        .attr('stroke', this.LINE_COLOR);
    });

    // Goals
    [0, this.PITCH_WIDTH].forEach(x => {
      this.pitch.append('rect')
        .attr('x', x < 60 ? 0 : this.PITCH_WIDTH - 2)
        .attr('y', (this.PITCH_HEIGHT - 7.32)/2)
        .attr('width', 2)
        .attr('height', 7.32)
        .attr('fill', 'none')
        .attr('stroke', this.LINE_COLOR);
    });
  }

  private drawGoalSequence(goal: Goal) {
    const events = goal.buildup_events;
    
    // Draw pass lines
    events.forEach((event, i) => {
      if (i < events.length - 1) {
        this.pitch.append('line')
          .attr('x1', event.start_location[0])
          .attr('y1', event.start_location[1])
          .attr('x2', event.end_location[0])
          .attr('y2', event.end_location[1])
          .attr('stroke', '#ffeb3b')
          .attr('stroke-width', 1)
          .attr('opacity', 0)
          .transition()
          .delay(i * 1000)
          .duration(500)
          .attr('opacity', 1);
      }
    });

    // Draw shot
    const lastEvent = events[events.length - 1];
    this.pitch.append('line')
      .attr('x1', lastEvent.end_location[0])
      .attr('y1', lastEvent.end_location[1])
      .attr('x2', goal.shot_location[0])
      .attr('y2', goal.shot_location[1])
      .attr('stroke', '#f44336')
      .attr('stroke-width', 2)
      .attr('opacity', 0)
      .transition()
      .delay(events.length * 1000)
      .duration(500)
      .attr('opacity', 1);
  }
}