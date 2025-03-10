import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerDistributionsComponent } from './partner-distributions.component';

describe('PartnerDistributionsComponent', () => {
  let component: PartnerDistributionsComponent;
  let fixture: ComponentFixture<PartnerDistributionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartnerDistributionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartnerDistributionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
