import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationFormStudentComponent } from './confirmation-form-student.component';

describe( 'ConfirmationFormStudentComponent', () => {
  let component: ConfirmationFormStudentComponent;
  let fixture: ComponentFixture<ConfirmationFormStudentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmationFormStudentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent( ConfirmationFormStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
