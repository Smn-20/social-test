import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramComponentDetailsComponent } from './program-component-details.component';

describe('ProgramComponentDetailsComponent', () => {
  let component: ProgramComponentDetailsComponent;
  let fixture: ComponentFixture<ProgramComponentDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgramComponentDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramComponentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
