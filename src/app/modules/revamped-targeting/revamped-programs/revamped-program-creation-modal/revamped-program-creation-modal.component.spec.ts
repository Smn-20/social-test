import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevampedProgramCreationModalComponent } from './revamped-program-creation-modal.component';

describe('RevampedProgramCreationModalComponent', () => {
  let component: RevampedProgramCreationModalComponent;
  let fixture: ComponentFixture<RevampedProgramCreationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevampedProgramCreationModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevampedProgramCreationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
