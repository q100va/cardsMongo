import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeniorsCreateComponent } from './seniors-create.component';

describe('SeniorsCreateComponent', () => {
  let component: SeniorsCreateComponent;
  let fixture: ComponentFixture<SeniorsCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeniorsCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeniorsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
