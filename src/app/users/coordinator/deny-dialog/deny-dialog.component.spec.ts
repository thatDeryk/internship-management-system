import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DenyDialogComponent } from './deny-dialog.component';

describe('DenyDialogComponent', () => {
  let component: DenyDialogComponent;
  let fixture: ComponentFixture<DenyDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DenyDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DenyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
