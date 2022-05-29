import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeniorsDetailsComponent } from './seniors-details.component';

describe('SeniorsDetailsComponent', () => {
  let component: SeniorsDetailsComponent;
  let fixture: ComponentFixture<SeniorsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeniorsDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeniorsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
