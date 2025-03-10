import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JurisdictionFilterComponent } from './jurisdiction-filter.component';

describe('JurisdictionFilterComponent', () => {
    let component: JurisdictionFilterComponent;
    let fixture: ComponentFixture<JurisdictionFilterComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JurisdictionFilterComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(JurisdictionFilterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
