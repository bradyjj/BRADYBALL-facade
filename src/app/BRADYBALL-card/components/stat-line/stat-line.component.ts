import { Component } from '@angular/core';
import { SupabaseService } from '../../../shared/services/supabase.service';

@Component({
    selector: 'stat-line',
    templateUrl: './stat-line.component.html',
    styleUrls: ['./stat-line.component.scss'],
})
export class StatLineComponent {

    playerData: any;

    constructor(private supabaseService: SupabaseService) { }
}