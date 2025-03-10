import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevampedCriteriaCreationModalComponent } from './revamped-criteria-creation-modal.component';

describe('RevampedCriteriaCreationModalComponent', () => {
  let component: RevampedCriteriaCreationModalComponent;
  let fixture: ComponentFixture<RevampedCriteriaCreationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevampedCriteriaCreationModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevampedCriteriaCreationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
