/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { IspmisComponent } from './ispmis.component';

describe('IspmisComponent', () => {
  let component: IspmisComponent;
  let fixture: ComponentFixture<IspmisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IspmisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IspmisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
