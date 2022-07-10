import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstaOrdersComponent } from './insta-orders.component';

describe('InstaOrdersComponent', () => {
  let component: InstaOrdersComponent;
  let fixture: ComponentFixture<InstaOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstaOrdersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstaOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
