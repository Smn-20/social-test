import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RevampedCriteriaCardComponent } from './revamped-criteria-card.component';

describe('RevampedCriteriaCardComponent', () => {
  let component: RevampedCriteriaCardComponent;
  let fixture: ComponentFixture<RevampedCriteriaCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevampedCriteriaCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevampedCriteriaCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
