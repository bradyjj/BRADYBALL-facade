export type Location = [number, number];

export interface BuildupEvent {
    timestamp: string;
    minute: number;
    second: number;
    player: string;
    player_id: number;
    start_location: Location;
    event_type: 'pass' | 'dribble' | 'carry' | 'shot';
    technique: string | null;

    // Pass-specific fields
    end_location?: Location;
    recipient?: string;
    recipient_id?: number;
    key_pass?: boolean;
    pass_outcome?: string | null;
    pass_height?: string;

    // Carry/Dribble-specific fields
    carry_outcome?: string | null;
    dribble_outcome?: string | null;

    // Shot-specific fields
    shot_outcome?: string;
    shot_technique?: string;
    xg?: number;
}

export interface Goal {
    id: number;
    goal_id: string;
    competition_name: string;
    season: string;
    fixture_name: string;
    match_date: string;
    timestamp: string;
    minute: number;
    second: number;
    goal_scorer: string;
    goal_scorer_id: number;
    team: string;
    shot_xg: number;
    play_pattern: string;
    shot_location: Location;
    shot_technique: string;
    buildup_events: BuildupEvent[];
    created_at: string;
    updated_at: string;
}

// Utility types
export type EventType = 'pass' | 'dribble' | 'carry' | 'shot';

export type PassHeight = 'Ground Pass' | 'Low Pass' | 'High Pass';

export type PlayPattern =
    | 'Regular Play'
    | 'From Free Kick'
    | 'From Corner'
    | 'From Throw In'
    | 'From Counter'
    | 'From Kick Off'
    | 'From Goal Kick';