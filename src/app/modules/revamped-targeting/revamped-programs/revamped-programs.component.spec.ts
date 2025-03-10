import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevampedProgramsComponent } from './revamped-programs.component';

describe('RevampedProgramsComponent', () => {
    let component: RevampedProgramsComponent;
    let fixture: ComponentFixture<RevampedProgramsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RevampedProgramsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(RevampedProgramsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
