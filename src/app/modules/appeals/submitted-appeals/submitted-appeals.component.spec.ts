import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmittedAppealsComponent } from './submitted-appeals.component';

describe('SubmittedAppealsComponent', () => {
    let component: SubmittedAppealsComponent;
    let fixture: ComponentFixture<SubmittedAppealsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SubmittedAppealsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SubmittedAppealsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
