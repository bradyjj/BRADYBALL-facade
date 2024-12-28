import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'BRADYBALL-footer',
    templateUrl: './BRADYBALL-footer.component.html',
    styleUrls: ['./BRADYBALL-footer.component.scss']
})
export class BRADYBALLFooterComponent {
    constructor(private router: Router) { }
}
