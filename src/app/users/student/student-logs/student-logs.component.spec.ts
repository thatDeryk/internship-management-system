import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentLogsComponent } from './student-logs.component';

describe('StudentLogsComponent', () => {
  let component: StudentLogsComponent;
  let fixture: ComponentFixture<StudentLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentLogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
