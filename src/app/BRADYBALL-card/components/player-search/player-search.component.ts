import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../shared/services/supabase.service';
import { Player } from '../../models/player.model';
import { PlayerStat } from '../../models/player-stat.model';

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

    constructor(private supabaseService: SupabaseService) { }

    ngOnInit(): void {
        this.fetchPlayerData(this.playerName);
    }

    private fetchPlayerData(player: string): void {
        Promise.all([
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
}
