import { Component, OnInit, ViewChild } from '@angular/core';
import { SupabaseService } from '../../../shared/services/supabase.service';
import { Player } from '../../models/player.model';
import { PlayerStat } from '../../models/player-stat.model';
import { RadarChartDataPoint, RadarChartPlayerData } from '../../models/radar-chart-player.model';
import { StatLineData } from '../../models/stat-line-player.model';
import { BRADYBALLCardUtil } from '../../util/BRADYBALL-card.util';
import { StatLineComponent } from '../stat-line/stat-line.component';
import { RadarChartComponent } from '../radar-chart/radar-chart.component';
import { PercentileRankComponent } from '../percentile-rank/percentile-rank.component';
import { PercentileRankData } from '../../models/percentile-rank.model';

@Component({
    selector: 'player-search',
    templateUrl: './player-search.component.html',
    styleUrls: ['./player-search.component.scss'],
})
export class PlayerSearchComponent implements OnInit {

    @ViewChild(StatLineComponent) statLine?: StatLineComponent;
    @ViewChild(RadarChartComponent) radarChart?: RadarChartComponent;
    @ViewChild(PercentileRankComponent) percentileRank?: PercentileRankComponent;

    playerName: string = "Kylian Mbappé";
    player = new Player();

    playerStandardData: any;
    playerShootingData: any;
    playerPassingData: any;
    playerPassingTypesData: any;
    playerDefenseData: any;
    playerPossessionData: any;
    playerGoalShotCreationData: any;
    playerKeeperData: any;
    playerKeeperAdvData: any;
    playerPlayingTimeData: any;
    playerMiscData: any;
    combinedPlayerData: { [season: string]: PlayerStat } = {};
    radarChartModel: RadarChartPlayerData = RadarChartPlayerData.createDefault();
    statLineModel: StatLineData = StatLineData.createDefault();
    percentileRankModel: PercentileRankData = PercentileRankData.createDefault();

    constructor(private supabaseService: SupabaseService, public BRADYBALLUtil: BRADYBALLCardUtil) { }

    async ngOnInit(): Promise<void> {
        await this.fetchPlayerData(this.playerName);
        this.createRadarChartModel();
        this.createStatLineDataModel();
        this.createPercentileRankModel();
    }

    public fetchPlayerData(player: string): Promise<void> {
        return Promise.all([
            this.supabaseService.getPlayerStandardData(player),
            this.supabaseService.getPlayerShootingData(player),
            this.supabaseService.getPlayerPassingData(player),
            this.supabaseService.getPlayerPassingTypesData(player),
            this.supabaseService.getPlayerDefenseData(player),
            this.supabaseService.getPlayerPossessionData(player),
            this.supabaseService.getPlayerGoalShotCreationData(player),
            this.supabaseService.getPlayerKeeperData(player),
            this.supabaseService.getPlayerKeeperAdvData(player),
            this.supabaseService.getPlayerPlayingTimeData(player),
            this.supabaseService.getPlayerMiscData(player)
        ]).then(results => {
            this.playerStandardData = results[0];
            this.playerShootingData = results[1];
            this.playerPassingData = results[2];
            this.playerPassingTypesData = results[3];
            this.playerDefenseData = results[4];
            this.playerPossessionData = results[5];
            this.playerGoalShotCreationData = results[6];
            this.playerKeeperData = results[7];
            this.playerKeeperAdvData = results[8];
            this.playerPlayingTimeData = results[9];
            this.playerMiscData = results[10];

            this.combinePlayerData(results);
        }).catch(error => {
            console.error('Error fetching player data:', error);
        });
    }

    private combinePlayerData(results: any[][]): void {
        results.forEach(dataSet => {
            dataSet.forEach(stat => {
                const season = stat.season;
                if (!this.combinedPlayerData[season]) {
                    this.combinedPlayerData[season] = {
                        season,
                        player: this.playerName
                    } as PlayerStat;
                }
                this.combinedPlayerData[season] = {
                    ...this.combinedPlayerData[season],
                    ...stat
                };
            });
        });
    }

    private createStatLineDataModel(): void {
        this.statLineModel = this.getMockData();
    }


    private getMockData(): StatLineData {
        return {
            player: "Kylian Mbappé",
            title: "RECENT CAREER PERFORMANCE",
            rows: [
                {
                    season: "2022-23",
                    dataPoints: [
                        { key: "Team", label: "Team", value: "Paris S-G" },
                        { key: "League", label: "League", value: "FRA-Ligue 1" },
                        { key: "Age", label: "Age", value: 23 },
                        { key: "MatchesPlayed", label: "Matches", value: 34 },
                        { key: "90sPlayed", label: "90s", value: 31.3 },
                        { key: "Goals", label: "Goals", value: 29 },
                        { key: "Assists", label: "Assists", value: 5 },
                        { key: "GoalsAndAssits", label: "G+A", value: 34 },
                        { key: "NonPenGoals", label: "nP-Goals", value: 26 },
                        { key: "NonPenExpectedGoals", label: "npxG", value: 22.2 },
                        { key: "ExpectedAssists", label: "xA", value: 7.4 },
                        { key: "GoalsOverExpected", label: "G-xG", value: 3.8 }
                    ]
                },
                {
                    season: "2023-24",
                    dataPoints: [
                        { key: "Team", label: "Team", value: "Paris S-G" },
                        { key: "League", label: "League", value: "FRA-Ligue 1" },
                        { key: "Age", label: "Age", value: 25 },
                        { key: "MatchesPlayed", label: "Matches", value: 29 },
                        { key: "90sPlayed", label: "90s", value: 24 },
                        { key: "Goals", label: "Goals", value: 27 },
                        { key: "Assists", label: "Assists", value: 7 },
                        { key: "GoalsAndAssits", label: "G+A", value: 34 },
                        { key: "NonPenGoals", label: "nP-Goals", value: 21 },
                        { key: "NonPenExpectedGoals", label: "npxG", value: 14.5 },
                        { key: "ExpectedAssists", label: "xA", value: 5.7 },
                        { key: "GoalsOverExpected", label: "G-xG", value: 6.5 }
                    ]
                },
                {
                    season: "Career",
                    dataPoints: [
                        { key: "Team", label: "Team", value: "" },
                        { key: "League", label: "League", value: "" },
                        { key: "Age", label: "Age", value: 21 },
                        { key: "MatchesPlayed", label: "Matches", value: 31 },
                        { key: "90sPlayed", label: "90s", value: 26.4 },
                        { key: "Goals", label: "Goals", value: 27 },
                        { key: "Assists", label: "Assists", value: 7 },
                        { key: "GoalsAndAssits", label: "G+A", value: 34 },
                        { key: "NonPenGoals", label: "nP-Goals", value: 21 },
                        { key: "NonPenExpectedGoals", label: "npxG", value: 17.4 },
                        { key: "ExpectedAssists", label: "xA", value: 4.8 },
                        { key: "GoalsOverExpected", label: "G-xG", value: 3.6 }
                    ]
                }
            ],
            information1: "* Led FRA-Ligue 1",
            information2: "# Led Big 5 European Leagues"
        };
    }

    private createRadarChartModel(): void {
        const latestSeason = Object.keys(this.combinedPlayerData).sort().pop();
        if (!latestSeason) return;

        const playerData = this.combinedPlayerData[latestSeason];

        const dataPoints: RadarChartDataPoint[] = [
            {
                key: 'ExpectedAssistsP90',
                value: 0.5,
                scale: .5,
                color: 'var(--bb-red-purple-color)',
                label: 'EXPECTED ASSISTS'
            },
            {
                key: 'NonPenExpectedGoalsP90',
                value: 1,
                scale: 1,
                color: 'var(--bb-violet-color)',
                label: 'NON-PEN xG'
            },
            {
                key: 'NonPenGoalsP90',
                value: 1,
                scale: 1,
                color: 'var(--bb-green-color)',
                label: 'NON-PEN GOALS'
            },
            {
                key: 'ShotsOnTargetP90',
                value: 2.5,
                scale: 2.5,
                color: 'var(--bb-turquoise-color)',
                label: 'SHOTS ON TARGET'
            },
            {
                key: 'AerialPct',
                value: 100,
                scale: 100,
                color: 'var(--bb-red-purple-color)',
                label: 'AERIAL %'
            },
            {
                key: 'ShotCreatingActionsP90',
                value: 8,
                scale: 8,
                color: 'var(--bb-violet-color)',
                label: 'SHOT CREATIONS'
            },
            {
                key: 'BallWonP90',
                value: 5,
                scale: 5,
                color: 'var(--bb-turquoise-color)',
                label: 'POSSESSION WON'
            }
        ];

        this.radarChartModel = {
            player: playerData.player,
            league: playerData.league,
            season: "2023-24",
            team: playerData.team,
            age: playerData.age,
            position: playerData.position,
            born: playerData.born,
            nation: playerData.nation,
            minutes_90s: playerData.minutes_90s,
            dataPoints: dataPoints
        };
    }

    private createPercentileRankModel(): void {
        const percentileRank = 22;
        const description = "Out of 25 competitors, Mbappe ranked 4th overall in the 2023-24 season, placing him in the 88th percentile based on the seven key attributes evaulated in the attribute overview.";

        this.percentileRankModel = {
            percentile: percentileRank,
            description: description
        }
    }

    saveRadarChart(): void {
        if (this.radarChart) {
            this.radarChart.saveSVG();
        }
    }
    
    saveStatLine(): void {
        if (this.statLine) {
            this.statLine.saveSVG();
        }
    }
    
    savePercentileRank(): void {
        if (this.percentileRank) {
            this.percentileRank.saveSVG();
        }
    }
}