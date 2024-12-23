import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'BRADYBALL-header',
  templateUrl: './BRADYBALL-header.component.html',
  styleUrls: ['./BRADYBALL-header.component.scss']
})
export class BRADYBALLHeaderComponent {
    isCollapsed = false;
    @Output() collapseChanged = new EventEmitter<boolean>();

    constructor(private router: Router) {}

    // Method to navigate to /home
    navigateHome(): void {
        this.router.navigateByUrl('/home');
    }

    toggleCollapse(): void {
        this.isCollapsed = !this.isCollapsed;
        this.collapseChanged.emit(this.isCollapsed);
    }
}
