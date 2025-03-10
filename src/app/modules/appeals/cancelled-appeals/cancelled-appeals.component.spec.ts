import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelledAppealsComponent } from './cancelled-appeals.component';

describe('CancelledAppealsComponent', () => {
    let component: CancelledAppealsComponent;
    let fixture: ComponentFixture<CancelledAppealsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CancelledAppealsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CancelledAppealsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
