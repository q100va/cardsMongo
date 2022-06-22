import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NameDayComponent } from './name-day.component';

describe('NameDayComponent', () => {
  let component: NameDayComponent;
  let fixture: ComponentFixture<NameDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NameDayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NameDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
