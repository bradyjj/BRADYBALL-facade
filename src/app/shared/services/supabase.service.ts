import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BRADYBALLCardConstants } from '../../BRADYBALL-player-analysis/util/player-analysis.constant';
import { environment } from '../../../environments/environment';

const SUPABASE_KEY = environment.SUPABASE_KEY;
const SUPABASE_URL = environment.SUPABASE_URL;

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private supabase: SupabaseClient

    constructor(private http: HttpClient) {
        this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: {
                storage: localStorage,
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        });
    }

    // Player Stats Methods
    public async getPlayerStandardData(player: string): Promise<any[]> {
        return this.getData(BRADYBALLCardConstants.FBR_PL_STANDARD_STATS, player);
    }

    public async getPlayerShootingData(player: string): Promise<any[]> {
        return this.getData(BRADYBALLCardConstants.FBR_PL_SHOOTING_STATS, player);
    }

    public async getPlayerPassingData(player: string): Promise<any[]> {
        return this.getData(BRADYBALLCardConstants.FBR_PL_PASSING_STATS, player);
    }

    public async getPlayerPassingTypesData(player: string): Promise<any[]> {
        return this.getData(BRADYBALLCardConstants.FBR_PL_PASSING_TYPES_STATS, player);
    }

    public async getPlayerDefenseData(player: string): Promise<any[]> {
        return this.getData(BRADYBALLCardConstants.FBR_PL_DEFENSE_STATS, player);
    }

    public async getPlayerPossessionData(player: string): Promise<any[]> {
        return this.getData(BRADYBALLCardConstants.FBR_PL_POSSESSION_STATS, player);
    }

    public async getPlayerGoalShotCreationData(player: string): Promise<any[]> {
        return this.getData(BRADYBALLCardConstants.FBR_PL_GOAL_SHOT_CREATION_STATS, player);
    }

    public async getPlayerKeeperData(player: string): Promise<any[]> {
        return this.getData(BRADYBALLCardConstants.FBR_PL_KEEPER_STATS, player);
    }

    public async getPlayerKeeperAdvData(player: string): Promise<any[]> {
        return this.getData(BRADYBALLCardConstants.FBR_PL_KEEPER_ADV_STATS, player);
    }

    public async getPlayerPlayingTimeData(player: string): Promise<any[]> {
        return this.getData(BRADYBALLCardConstants.FBR_PL_PLAYING_TIME_STATS, player);
    }

    public async getPlayerMiscData(player: string): Promise<any[]> {
        return this.getData(BRADYBALLCardConstants.FBR_PL_MISC_STATS, player);
    }

    // Team Stats Methods
    public async getTeamStandardData(player: string): Promise<any[]> {
        return this.getData(BRADYBALLCardConstants.FBR_TM_STANDARD_STATS, player);
    }

    public async getTeamShootingData(player: string): Promise<any[]> {
        return this.getData(BRADYBALLCardConstants.FBR_TM_SHOOTING_STATS, player);
    }

    public async getTeamPassingData(player: string): Promise<any[]> {
        return this.getData(BRADYBALLCardConstants.FBR_TM_PASSING_STATS, player);
    }

    public async getTeamPassingTypesData(player: string): Promise<any[]> {
        return this.getData(BRADYBALLCardConstants.FBR_TM_PASSING_TYPES_STATS, player);
    }

    public async getTeamDefenseData(player: string): Promise<any[]> {
        return this.getData(BRADYBALLCardConstants.FBR_TM_DEFENSE_STATS, player);
    }

    public async getTeamPossessionData(player: string): Promise<any[]> {
        return this.getData(BRADYBALLCardConstants.FBR_TM_POSSESSION_STATS, player);
    }

    public async getTeamGoalShotCreationData(player: string): Promise<any[]> {
        return this.getData(BRADYBALLCardConstants.FBR_TM_GOAL_SHOT_CREATION_STATS, player);
    }

    public async getTeamKeeperData(player: string): Promise<any[]> {
        return this.getData(BRADYBALLCardConstants.FBR_TM_KEEPER_STATS, player);
    }

    public async getTeamKeeperAdvData(player: string): Promise<any[]> {
        return this.getData(BRADYBALLCardConstants.FBR_TM_KEEPER_ADV_STATS, player);
    }

    public async getTeamPlayingTimeData(player: string): Promise<any[]> {
        return this.getData(BRADYBALLCardConstants.FBR_TM_PLAYING_TIME_STATS, player);
    }

    public async getTeamMiscData(player: string): Promise<any[]> {
        return this.getData(BRADYBALLCardConstants.FBR_TM_MISC_STATS, player);
    }

    // Generic method to fetch data
    private async getData(tableName: string, player: string): Promise<any[]> {
        try {
            const { data, error } = await this.supabase
                .from(tableName)
                .select('*')
                .eq('player', player);

            if (error) {
                console.error(`Error fetching data from ${tableName}:`, error);
                return [];
            }
            return data;
        } catch (error) {
            console.error(`Error fetching data from ${tableName}:`, error);
            return [];
        }
    }
}
