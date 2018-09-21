import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentApplicationFormComponent } from './student-application-form.component';

describe( 'StudentApplicationFormComponent', () => {
  let component: StudentApplicationFormComponent;
  let fixture: ComponentFixture<StudentApplicationFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentApplicationFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent( StudentApplicationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
