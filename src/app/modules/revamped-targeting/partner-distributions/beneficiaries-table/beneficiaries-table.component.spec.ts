import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiariesTableComponent } from './beneficiaries-table.component';

describe('BeneficiariesTableComponent', () => {
  let component: BeneficiariesTableComponent;
  let fixture: ComponentFixture<BeneficiariesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BeneficiariesTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeneficiariesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
