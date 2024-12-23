export interface BuildupEvent {
    minute: number;
    player: string;
    second: number;
    pass_type: string | null;
    player_id: number;
    timestamp: string;
    end_location: [number, number];
    pass_outcome: string | null;
    start_location: [number, number];
}

export interface Goal {
    id: number;
    competition_name: string;
    goal_id: string;
    season: string;
    goal_scorer: string;
    fixture_name: string;
    match_date: string;
    timestamp: string;
    minute: number;
    second: number;
    goal_scorer_id: number;
    shot_xg: number;
    play_pattern: string;
    shot_location: [number, number];
    buildup_events: BuildupEvent[];
    created_at: string;
    updated_at: string;
    team: string;
}