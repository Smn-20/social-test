import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoBackToLoginComponent } from './go-back-to-login.component';

describe('GoBackToLoginComponent', () => {
    let component: GoBackToLoginComponent;
    let fixture: ComponentFixture<GoBackToLoginComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GoBackToLoginComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GoBackToLoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
