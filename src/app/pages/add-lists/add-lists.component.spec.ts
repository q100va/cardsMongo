import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddListsComponent } from './add-lists.component';

describe('AddListsComponent', () => {
  let component: AddListsComponent;
  let fixture: ComponentFixture<AddListsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddListsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
