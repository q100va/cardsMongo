import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllAbsentsComponent } from './all-absents.component';

describe('AllAbsentsComponent', () => {
  let component: AllAbsentsComponent;
  let fixture: ComponentFixture<AllAbsentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllAbsentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllAbsentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
