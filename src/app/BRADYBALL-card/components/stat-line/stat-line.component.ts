import { Component } from '@angular/core';
import { SupabaseService } from '../../../shared/services/supabase.service';

@Component({
    selector: 'stat-line',
    templateUrl: './stat-line.component.html',
    styleUrls: ['./stat-line.component.scss'],
})
export class StatLineComponent {

    response = {
        "data": [
            {
                "Season": "2020-21",
                "PlayerName": "Kylian Mbappé",
                "League": "FRA-Ligue 1",
                "Team": "Paris S-G",
                "Nation": "FRA",
                "Position": "FW",
                "Age": 21,
                "Born": 1998,
                "MatchesPlayed": 31,
                "MinutesPlayed": 2380,
                "90sPlayed": 26.4,
                "Goals": 27,
                "Assists": 7,
                "GoalsAndAssits": 34,
                "NonPenGoals": 21,
                "NonPenExpectedGoals": 17.4,
                "ExpectedAssists": 4.8,
                "GoalsOverExpected": 3.6
            },
            {
                "Season": "2021-22",
                "PlayerName": "Kylian Mbappé",
                "League": "FRA-Ligue 1",
                "Team": "Paris S-G",
                "Nation": "FRA",
                "Position": "FW",
                "Age": 22,
                "Born": 1998,
                "MatchesPlayed": 35,
                "MinutesPlayed": 3023,
                "90sPlayed": 33.6,
                "Goals": 28,
                "Assists": 17,
                "GoalsAndAssits": 45,
                "NonPenGoals": 24,
                "NonPenExpectedGoals": 20.7,
                "ExpectedAssists": 12.6,
                "GoalsOverExpected": 3.3
            },
            {
                "Season": "2022-23",
                "PlayerName": "Kylian Mbappé",
                "League": "FRA-Ligue 1",
                "Team": "Paris S-G",
                "Nation": "FRA",
                "Position": "FW",
                "Age": 23,
                "Born": 1998,
                "MatchesPlayed": 34,
                "MinutesPlayed": 2818,
                "90sPlayed": 31.3,
                "Goals": 29,
                "Assists": 5,
                "GoalsAndAssits": 34,
                "NonPenGoals": 26,
                "NonPenExpectedGoals": 22.2,
                "ExpectedAssists": 7.4,
                "GoalsOverExpected": 3.8
            },
            {
                "Season": "2023-24",
                "PlayerName": "Kylian Mbappé",
                "League": "FRA-Ligue 1",
                "Team": "Paris S-G",
                "Nation": "FRA",
                "Position": "FW",
                "Age": 25,
                "Born": 1998,
                "MatchesPlayed": 29,
                "MinutesPlayed": 2158,
                "90sPlayed": 24,
                "Goals": 27,
                "Assists": 7,
                "GoalsAndAssits": 34,
                "NonPenGoals": 21,
                "NonPenExpectedGoals": 14.5,
                "ExpectedAssists": 5.7,
                "GoalsOverExpected": 6.5
            }
        ]
    }

    constructor(private supabaseService: SupabaseService) { 
        
    }
}