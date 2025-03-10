import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevampedConditionComponent } from './revamped-condition.component';

describe('RevampedConditionComponent', () => {
  let component: RevampedConditionComponent;
  let fixture: ComponentFixture<RevampedConditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevampedConditionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevampedConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
