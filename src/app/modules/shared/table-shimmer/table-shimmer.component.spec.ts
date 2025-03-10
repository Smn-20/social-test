import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableShimmerComponent } from './table-shimmer.component';

describe('TableShimmerComponent', () => {
    let component: TableShimmerComponent;
    let fixture: ComponentFixture<TableShimmerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TableShimmerComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TableShimmerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
