import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevampedProgramComponentsComponent } from './revamped-program-components.component';

describe('RevampedProgramComponentsComponent', () => {
  let component: RevampedProgramComponentsComponent;
  let fixture: ComponentFixture<RevampedProgramComponentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevampedProgramComponentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevampedProgramComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
