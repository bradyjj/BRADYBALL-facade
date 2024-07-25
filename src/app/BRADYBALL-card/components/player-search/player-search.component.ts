import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../shared/services/supabase.service';
import { Player } from '../../models/player.model';
import { PlayerStat } from '../../models/player-stat.model';
import { RadarChartDataPoint, RadarChartPlayerData } from '../../models/radar-chart-player.model';

@Component({
    selector: 'player-search',
    templateUrl: './player-search.component.html',
    styleUrls: ['./player-search.component.scss'],
})
export class PlayerSearchComponent implements OnInit {

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

    constructor(private supabaseService: SupabaseService) { }

    async ngOnInit(): Promise<void> {
        await this.fetchPlayerData(this.playerName);
        this.createRadarChartModel();
    }

    private fetchPlayerData(player: string): Promise<void> {
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

            console.log('Player Standard Data:', this.playerStandardData);
            console.log('Player Shooting Data:', this.playerShootingData);
            console.log('Player Passing Data:', this.playerPassingData);
            console.log('Player Passing Types Data:', this.playerPassingTypesData);
            console.log('Player Defense Data:', this.playerDefenseData);
            console.log('Player Possession Data:', this.playerPossessionData);
            console.log('Player Goal Shot Creation Data:', this.playerGoalShotCreationData);
            console.log('Player Keeper Data:', this.playerKeeperData);
            console.log('Player Keeper Adv Data:', this.playerKeeperAdvData);
            console.log('Player Playing Time Data:', this.playerPlayingTimeData);
            console.log('Player Misc Data:', this.playerMiscData);

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
        console.log('Combined Player Data:', this.combinedPlayerData);
    }

    private createRadarChartModel(): void {
        const latestSeason = Object.keys(this.combinedPlayerData).sort().pop();
        if (!latestSeason) return;

        const playerData = this.combinedPlayerData[latestSeason];

        const dataPoints: RadarChartDataPoint[] = [
            {
                key: 'ExpectedAssistsP90',
                value: 0.24,
                scale: 1,
                color: 'var(--bb-red-purple-color)',
                label: 'Expected Assists'
            },
            {
                key: 'NonPenExpectedGoalsP90',
                value: 0.6,
                scale: 1,
                color: 'var(--bb-violet-color)',
                label: 'Non-Pen xG'
            },
            {
                key: 'NonPenGoalsP90',
                value: 0.88,
                scale: 1,
                color: 'var(--bb-green-color)',
                label: 'Non-Pen Goals'
            },
            {
                key: 'ShotsOnTargetP90',
                value: 2.09,
                scale: 5,
                color: 'var(--bb-turquoise-color)',
                label: 'Shots on Target'
            },
            {
                key: 'ShotsP90',
                value: 4.67,
                scale: 5,
                color: 'var(--bb-green-2-color)',
                label: 'Shots'
            },
            {
                key: 'AerialPct',
                value: 0,
                scale: 100,
                color: 'var(--bb-red-purple-color)',
                label: 'Aerial %'
            },
            {
                key: 'ShotCreatingActionsP90',
                value: 4.04,
                scale: 10,
                color: 'var(--bb-violet-color)',
                label: 'Shot-Creating Actions'
            },
            {
                key: 'ProgPassesP90',
                value: 5.08,
                scale: 10,
                color: 'var(--bb-green-color)',
                label: 'Progressive Passes'
            },
            {
                key: 'BallWonP90',
                value: 0.12,
                scale: 5,
                color: 'var(--bb-turquoise-color)',
                label: 'Possession Won'
            },
            {
                key: 'TakeOnPct',
                value: 2.54,
                scale: 100,
                color: 'var(--bb-green-2-color)',
                label: 'Take-On %'
            }
        ];

        this.radarChartModel = {
            player: playerData.player,
            league: playerData.league,
            season: playerData.season,
            team: playerData.team,
            age: playerData.age,
            position: playerData.position,
            born: playerData.born,
            nation: playerData.nation,
            minutes_90s: playerData.minutes_90s,
            dataPoints: dataPoints
        };

        console.log('Radar Chart Model:', this.radarChartModel);
    }
}
