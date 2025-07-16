import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BRADYBALLPitchComponent } from './BRADYBALL-pitch.component';

describe('BRADYBALLPitchComponent', () => {
	let component: BRADYBALLPitchComponent;
	let fixture: ComponentFixture<BRADYBALLPitchComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [BRADYBALLPitchComponent],
		});
		fixture = TestBed.createComponent(BRADYBALLPitchComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
