import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleDetailComponent } from './role-detail.component';

describe('EditRoleComponent', () => {
    let component: RoleDetailComponent;
    let fixture: ComponentFixture<RoleDetailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RoleDetailComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(RoleDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
