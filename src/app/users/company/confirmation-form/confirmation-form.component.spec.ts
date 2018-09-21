import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingConfirmationFormComponent } from './confirmation-form.component';

describe( 'ConfirmationFormStudentComponent', () => {
  let component: TrainingConfirmationFormComponent;
  let fixture: ComponentFixture<TrainingConfirmationFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainingConfirmationFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingConfirmationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
