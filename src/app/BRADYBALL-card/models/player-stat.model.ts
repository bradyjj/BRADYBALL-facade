export interface PlayerStat {
    league?: string;
    season: string;
    team?: string;
    player: string;
    nation?: string;
    position?: string;
    age?: number;
    born?: number;
    minutes_90s?: number;
    tackles_tkl?: number;
    tackles_tklw?: number;
    tackles_def_3rd?: number;
    tackles_mid_3rd?: number;
    tackles_att_3rd?: number;
    challenges_tkl?: number;
    challenges_att?: number;
    challenges_tkl_pct?: number;
    challenges_lost?: number;
    blocks_blocks?: number;
    blocks_sh?: number;
    blocks_pass?: number;
    interceptions?: number;
    tackles_plus_interceptions?: number;
    clearances?: number;
    errors?: number;
    sca_total?: number;
    sca_per_90?: number;
    sca_types_pass_live?: number;
    sca_types_pass_dead?: number;
    sca_types_to?: number;
    sca_types_sh?: number;
    sca_types_fld?: number;
    sca_types_def?: number;
    gca_total?: number;
    gca_per_90?: number;
    gca_types_pass_live?: number;
    gca_types_pass_dead?: number;
    gca_types_to?: number;
    gca_types_sh?: number;
    gca_types_fld?: number;
    gca_types_def?: number;
    goals_ga?: number;
    goals_pka?: number;
    goals_fk?: number;
    goals_ck?: number;
    goals_og?: number;
    expected_psxg?: number;
    expected_psxg_sot?: number;
    expected_psxg_plus_minus?: number;
    expected_per_90?: number;
    launched_cmp?: number;
    launched_att?: number;
    launched_cmp_pct?: number;
    passes_att_gk?: number;
    passes_thr?: number;
    passes_launch_pct?: number;
    passes_avg_len?: number;
    goal_kicks_att?: number;
    goal_kicks_launch_pct?: number;
    goal_kicks_avg_len?: number;
    crosses_opp?: number;
    crosses_stp?: number;
    crosses_stp_pct?: number;
    sweeper_opa?: number;
    sweeper_opa_per_90?: number;
    sweeper_avg_dist?: number;
    playing_time_mp?: number;
    playing_time_starts?: number;
    playing_time_min?: number;
    playing_time_90s?: number;
    performance_ga?: number;
    performance_ga90?: number;
    performance_sota?: number;
    performance_saves?: number;
    performance_save_pct?: number;
    performance_w?: number;
    performance_d?: number;
    performance_l?: number;
    performance_cs?: number;
    performance_cs_pct?: number;
    penalty_kicks_pkatt?: number;
    penalty_kicks_pka?: number;
    penalty_kicks_pksv?: number;
    penalty_kicks_pkm?: number;
    penalty_kicks_save_pct?: number;
    performance_crdy?: number;
    performance_crdr?: number;
    performance_2crdy?: number;
    performance_fls?: number;
    performance_fld?: number;
    performance_off?: number;
    performance_crs?: number;
    performance_int?: number;
    performance_tklw?: number;
    performance_pkwon?: number;
    performance_pkcon?: number;
    performance_og?: number;
    performance_recov?: number;
    aerial_duels_won?: number;
    aerial_duels_lost?: number;
    aerial_duels_won_pct?: number;
    total_cmp?: number;
    total_att?: number;
    total_cmp_pct?: number;
    total_tot_dist?: number;
    total_prg_dist?: number;
    short_cmp?: number;
    short_att?: number;
    short_cmp_pct?: number;
    medium_cmp?: number;
    medium_att?: number;
    medium_cmp_pct?: number;
    long_cmp?: number;
    long_att?: number;
    long_cmp_pct?: number;
    ast?: number;
    xag?: number;
    expected_xa?: number;
    expected_a_xag?: number;
    kp?: number;
    passes_into_final_third?: number;
    ppa?: number;
    crspa?: number;
    prog_passes?: number;
    att?: number;
    pass_types_live?: number;
    pass_types_dead?: number;
    pass_types_fk?: number;
    pass_types_tb?: number;
    pass_types_sw?: number;
    pass_types_crs?: number;
    pass_types_ti?: number;
    pass_types_ck?: number;
    corner_kicks_in?: number;
    corner_kicks_out?: number;
    corner_kicks_str?: number;
    outcomes_cmp?: number;
    outcomes_off?: number;
    outcomes_blocks?: number;
    playing_time_mn_per_mp?: number;
    playing_time_min_pct?: number;
    starts_starts?: number;
    starts_mn_per_start?: number;
    starts_compl?: number;
    subs_subs?: number;
    subs_mn_per_sub?: number;
    subs_unsub?: number;
    team_success_ppm?: number;
    team_success_ong?: number;
    team_success_onga?: number;
    team_success_plus_minus?: number;
    team_success_plus_minus_per_90?: number;
    team_success_on_off?: number;
    team_success_xg_ongxg?: number;
    team_success_xg_ongxga?: number;
    team_success_xg_plus_minus?: number;
    team_success_xg_plus_minus_per_90?: number;
    team_success_xg_on_off?: number;
    touches_total?: number;
    touches_def_pen?: number;
    touches_def_3rd?: number;
    touches_mid_3rd?: number;
    touches_att_3rd?: number;
    touches_att_pen?: number;
    touches_live?: number;
    take_ons_att?: number;
    take_ons_succ?: number;
    take_ons_succ_pct?: number;
    take_ons_tkld?: number;
    take_ons_tkld_pct?: number;
    carries_total?: number;
    carries_tot_dist?: number;
    carries_prg_dist?: number;
    carries_prgc?: number;
    carries_1_3?: number;
    carries_cpa?: number;
    carries_mis?: number;
    carries_dis?: number;
    receiving_rec?: number;
    receiving_prg_r?: number;
    standard_gls?: number;
    standard_sh?: number;
    standard_sot?: number;
    standard_sot_pct?: number;
    standard_sh_per_90?: number;
    standard_sot_per_90?: number;
    standard_g_sh?: number;
    standard_g_sot?: number;
    standard_dist?: number;
    standard_fk?: number;
    standard_pk?: number;
    standard_pkatt?: number;
    expected_xg?: number;
    expected_npxg?: number;
    expected_npxg_per_sh?: number;
    expected_g_xg?: number;
    expected_np_g_xg?: number;
}