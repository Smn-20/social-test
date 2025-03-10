import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppealDetailsComponent } from './appeal-details.component';

describe('AppealDetailsComponent', () => {
    let component: AppealDetailsComponent;
    let fixture: ComponentFixture<AppealDetailsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AppealDetailsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AppealDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
