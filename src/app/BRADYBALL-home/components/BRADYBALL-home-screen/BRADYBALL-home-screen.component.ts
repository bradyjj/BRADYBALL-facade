// BRADYBALL-home-screen.component.ts
import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { select, Selection } from 'd3-selection';
import * as d3 from 'd3';
import 'd3-transition';
import { Goal } from '../../../common/models/goal.model';

@Component({
    selector: 'BRADYBALL-home-screen',
    templateUrl: './BRADYBALL-home-screen.component.html',
    styleUrls: ['./BRADYBALL-home-screen.component.scss']
})
export class BRADYBALLHomeScreenComponent implements AfterViewInit, OnDestroy {
    @ViewChild('pitchSvg') svgElement!: ElementRef;
    isCollapsed = false;
    private svg!: Selection<SVGElement, unknown, null, undefined>;
    private animationFrameId: number | null = null;
    exampleGoal: Goal =
        {
            "id": 2259,
            "goal_id": "d934c972-47ec-4f8a-b3b3-bb3eca2704b5",
            "competition_name": "FIFA World Cup",
            "season": "2022",
            "fixture_name": "Brazil vs Serbia",
            "match_date": "2022-11-24",
            "timestamp": "00:27:54.741",
            "minute": 72,
            "second": 54,
            "goal_scorer": "Richarlison de Andrade",
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
                    "player": "Danilo Luiz da Silva",
                    "second": 33,
                    "pass_type": "Throw-in",
                    "player_id": 3063,
                    "timestamp": "00:27:33.854",
                    "end_location": [
                        45.8,
                        75.9
                    ],
                    "pass_outcome": null,
                    "start_location": [
                        29.9,
                        80
                    ]
                },
                {
                    "minute": 72,
                    "player": "Raphael Dias Belloli",
                    "second": 35,
                    "pass_type": null,
                    "player_id": 10595,
                    "timestamp": "00:27:35.297",
                    "end_location": [
                        70,
                        27.3
                    ],
                    "pass_outcome": "Incomplete",
                    "start_location": [
                        44.3,
                        75.9
                    ]
                },
                {
                    "minute": 72,
                    "player": "Darko Lazović",
                    "second": 39,
                    "pass_type": "Interception",
                    "player_id": 7145,
                    "timestamp": "00:27:39.524",
                    "end_location": [
                        74.3,
                        54.3
                    ],
                    "pass_outcome": "Incomplete",
                    "start_location": [
                        50.1,
                        52.8
                    ]
                },
                {
                    "minute": 72,
                    "player": "Alex Sandro Lobo Silva",
                    "second": 43,
                    "pass_type": null,
                    "player_id": 6945,
                    "timestamp": "00:27:43.300",
                    "end_location": [
                        83.2,
                        7.9
                    ],
                    "pass_outcome": null,
                    "start_location": [
                        58.9,
                        18.6
                    ]
                },
                {
                    "minute": 72,
                    "player": "Vinícius José Paixão de Oliveira Júnior",
                    "second": 45,
                    "pass_type": null,
                    "player_id": 18395,
                    "timestamp": "00:27:45.626",
                    "end_location": [
                        77.6,
                        13.8
                    ],
                    "pass_outcome": null,
                    "start_location": [
                        82.4,
                        7.7
                    ]
                },
                {
                    "minute": 72,
                    "player": "Neymar da Silva Santos Junior",
                    "second": 49,
                    "pass_type": null,
                    "player_id": 4320,
                    "timestamp": "00:27:49.268",
                    "end_location": [
                        100.4,
                        10.7
                    ],
                    "pass_outcome": null,
                    "start_location": [
                        86.8,
                        15.9
                    ]
                },
                {
                    "minute": 72,
                    "player": "Vinícius José Paixão de Oliveira Júnior",
                    "second": 52,
                    "pass_type": null,
                    "player_id": 18395,
                    "timestamp": "00:27:52.908",
                    "end_location": [
                        108.6,
                        42.5
                    ],
                    "pass_outcome": null,
                    "start_location": [
                        109.4,
                        24.8
                    ]
                }
            ],
            "created_at": "2024-12-23 17:49:09.839109+00",
            "updated_at": "2024-12-23 17:49:09.839109+00"
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