import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevampedCriteriaConditionCreationModalComponent } from './revamped-criteria-condition-creation-modal.component';

describe('RevampedCriteriaConditionCreationModalComponent', () => {
  let component: RevampedCriteriaConditionCreationModalComponent;
  let fixture: ComponentFixture<RevampedCriteriaConditionCreationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevampedCriteriaConditionCreationModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevampedCriteriaConditionCreationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
