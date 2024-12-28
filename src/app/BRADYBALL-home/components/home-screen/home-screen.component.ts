// BRADYBALL-home-screen.component.ts
import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { select, Selection } from 'd3-selection';
import * as d3 from 'd3';
import 'd3-transition';
import { Goal } from '../../../common/models/goal.model';

@Component({
    selector: 'home-screen',
    templateUrl: './home-screen.component.html',
    styleUrls: ['./home-screen.component.scss']
})
export class HomeScreenComponent implements AfterViewInit, OnDestroy {
    @ViewChild('pitchSvg') svgElement!: ElementRef;
    isCollapsed = false;

    private svg!: Selection<SVGElement, unknown, null, undefined>;
    private animationFrameId: number | null = null;

    exampleGoal: Goal =
        {
            "id": 49864,
            "goal_id": "3698dcf2-d86d-43cb-83e5-6f2cd0778178",
            "competition_name": "FIFA World Cup",
            "season": "2022",
            "fixture_name": "Brazil vs Serbia",
            "match_date": "2022-11-24",
            "timestamp": "00:27:54.741",
            "minute": 72,
            "second": 54,
            "goal_scorer": "Richarlison",
            "goal_scorer_id": 3280,
            "team": "Brazil",
            "shot_xg": 0.07569885,
            "play_pattern": "From Throw In",
            "shot_location": [
                107.1,
                39.6
            ],
            "buildup_events": [
                {
                    "minute": 72,
                    "player": "Alex Sandro",
                    "second": 41,
                    "player_id": 6945,
                    "technique": "Dribble",
                    "timestamp": "00:27:41.918",
                    "event_type": "carry",
                    "end_location": [
                        58.9,
                        18.6
                    ],
                    "carry_outcome": null,
                    "start_location": [
                        45.8,
                        25.8
                    ]
                },
                {
                    "minute": 72,
                    "player": "Alex Sandro",
                    "second": 43,
                    "key_pass": false,
                    "player_id": 6945,
                    "recipient": "Vinícius Júnior",
                    "technique": "Left Foot Ground Pass",
                    "timestamp": "00:27:43.300",
                    "event_type": "pass",
                    "pass_height": "Ground Pass",
                    "end_location": [
                        83.2,
                        7.9
                    ],
                    "pass_outcome": null,
                    "recipient_id": 18395,
                    "start_location": [
                        58.9,
                        18.6
                    ]
                },
                {
                    "minute": 72,
                    "player": "Vinícius Júnior",
                    "second": 45,
                    "player_id": 18395,
                    "technique": "Dribble",
                    "timestamp": "00:27:45.371",
                    "event_type": "carry",
                    "end_location": [
                        82.4,
                        7.7
                    ],
                    "carry_outcome": null,
                    "start_location": [
                        83.2,
                        7.9
                    ]
                },
                {
                    "minute": 72,
                    "player": "Vinícius Júnior",
                    "second": 45,
                    "key_pass": false,
                    "player_id": 18395,
                    "recipient": "Neymar",
                    "technique": "Right Foot Ground Pass",
                    "timestamp": "00:27:45.626",
                    "event_type": "pass",
                    "pass_height": "Ground Pass",
                    "end_location": [
                        77.6,
                        13.8
                    ],
                    "pass_outcome": null,
                    "recipient_id": 4320,
                    "start_location": [
                        82.4,
                        7.7
                    ]
                },
                {
                    "minute": 72,
                    "player": "Neymar",
                    "second": 46,
                    "player_id": 4320,
                    "technique": "Dribble",
                    "timestamp": "00:27:46.939",
                    "event_type": "carry",
                    "end_location": [
                        86.8,
                        15.9
                    ],
                    "carry_outcome": null,
                    "start_location": [
                        77.6,
                        13.8
                    ]
                },
                {
                    "minute": 72,
                    "player": "Neymar",
                    "second": 49,
                    "key_pass": false,
                    "player_id": 4320,
                    "recipient": "Vinícius Júnior",
                    "technique": "Right Foot Ground Pass",
                    "timestamp": "00:27:49.268",
                    "event_type": "pass",
                    "pass_height": "Ground Pass",
                    "end_location": [
                        100.4,
                        10.7
                    ],
                    "pass_outcome": null,
                    "recipient_id": 18395,
                    "start_location": [
                        86.8,
                        15.9
                    ]
                },
                {
                    "minute": 72,
                    "player": "Vinícius Júnior",
                    "second": 50,
                    "player_id": 18395,
                    "technique": "Dribble",
                    "timestamp": "00:27:50.618",
                    "event_type": "carry",
                    "end_location": [
                        109.4,
                        24.8
                    ],
                    "carry_outcome": null,
                    "start_location": [
                        100.4,
                        10.7
                    ]
                },
                {
                    "minute": 72,
                    "player": "Vinícius Júnior",
                    "second": 52,
                    "key_pass": true,
                    "player_id": 18395,
                    "recipient": "Richarlison",
                    "technique": "Right Foot Low Pass",
                    "timestamp": "00:27:52.908",
                    "event_type": "pass",
                    "pass_height": "Low Pass",
                    "end_location": [
                        108.6,
                        42.5
                    ],
                    "pass_outcome": null,
                    "recipient_id": 3280,
                    "start_location": [
                        109.4,
                        24.8
                    ]
                },
                {
                    "minute": 72,
                    "player": "Richarlison",
                    "second": 53,
                    "player_id": 3280,
                    "technique": "Dribble",
                    "timestamp": "00:27:53.957",
                    "event_type": "carry",
                    "end_location": [
                        107.1,
                        39.6
                    ],
                    "carry_outcome": null,
                    "start_location": [
                        108.6,
                        42.5
                    ]
                },
                {
                    "xg": 0.07569885,
                    "minute": 72,
                    "player": "Richarlison",
                    "second": 54,
                    "player_id": 3280,
                    "technique": "Right Foot Volley",
                    "timestamp": "00:27:54.741",
                    "event_type": "shot",
                    "end_location": [
                        120,
                        37,
                    ],
                    "shot_outcome": "Goal",
                    "shot_technique": "Volley",
                    "start_location": [
                        107.1,
                        39.6
                    ]
                }
            ],
            "created_at": "2024-12-24 04:50:43.394999+00",
            "updated_at": "2024-12-24 04:50:43.394999+00",
            "shot_technique": "Right Foot Volley"
        }

    ngAfterViewInit(): void {
        this.initializePitch();
    }

    ngOnDestroy(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    onHeaderCollapseChanged(collapsed: boolean): void {
        this.isCollapsed = collapsed;
    }

    private initializePitch(): void {
        const element = this.svgElement.nativeElement;
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }

        this.svg = select(element as SVGElement)
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', '0 0 1000 700')
            .attr('preserveAspectRatio', 'xMidYMid slice');
    }
}