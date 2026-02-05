import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JustInCaseComponent } from './just-in-case.component';

describe('JustInCaseComponent', () => {
  let component: JustInCaseComponent;
  let fixture: ComponentFixture<JustInCaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JustInCaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JustInCaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
