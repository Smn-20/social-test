import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSelectorComponent } from './dashboard-selector.component';

describe('DashboardSelectorComponent', () => {
  let component: DashboardSelectorComponent;
  let fixture: ComponentFixture<DashboardSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
