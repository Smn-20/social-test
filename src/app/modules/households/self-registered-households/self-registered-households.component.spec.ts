import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelfRegisteredHouseholdsComponent } from './self-registered-households.component';

describe('SelfRegisteredHouseholdsComponent', () => {
  let component: SelfRegisteredHouseholdsComponent;
  let fixture: ComponentFixture<SelfRegisteredHouseholdsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelfRegisteredHouseholdsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelfRegisteredHouseholdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
