import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'BRADYBALL-header',
  templateUrl: './BRADYBALL-header.component.html',
  styleUrls: ['./BRADYBALL-header.component.scss']
})
export class BRADYBALLHeaderComponent {
    isCollapsed = false;
    @Output() collapseChanged = new EventEmitter<boolean>();

    refreshPage(): void {
        window.location.reload();
    }

    toggleCollapse(): void {
        this.isCollapsed = !this.isCollapsed;
        this.collapseChanged.emit(this.isCollapsed);
    }
}
