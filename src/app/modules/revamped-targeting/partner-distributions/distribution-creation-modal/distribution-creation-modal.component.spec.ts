import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributionCreationModalComponent } from './distribution-creation-modal.component';

describe('DistributionCreationModalComponent', () => {
  let component: DistributionCreationModalComponent;
  let fixture: ComponentFixture<DistributionCreationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DistributionCreationModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DistributionCreationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
