import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitialDashboardComponent } from './initial-dashboard.component';

describe('InitialDashboardComponent', () => {
  let component: InitialDashboardComponent;
  let fixture: ComponentFixture<InitialDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InitialDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitialDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
