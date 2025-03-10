import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslationUpdateComponent } from './translation-update.component';

describe('TranslationUpdateComponent', () => {
  let component: TranslationUpdateComponent;
  let fixture: ComponentFixture<TranslationUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TranslationUpdateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TranslationUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
