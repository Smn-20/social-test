import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevampedProgramCriteriaCategoriesComponent } from './revamped-program-criteria-categories.component';

describe('RevampedProgramCriteriaCategoriesComponent', () => {
  let component: RevampedProgramCriteriaCategoriesComponent;
  let fixture: ComponentFixture<RevampedProgramCriteriaCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevampedProgramCriteriaCategoriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevampedProgramCriteriaCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
