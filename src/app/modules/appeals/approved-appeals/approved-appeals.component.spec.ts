import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovedAppealsComponent } from './approved-appeals.component';

describe('ApprovedAppealsComponent', () => {
    let component: ApprovedAppealsComponent;
    let fixture: ComponentFixture<ApprovedAppealsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ApprovedAppealsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ApprovedAppealsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
