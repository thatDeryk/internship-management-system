import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InternEvaluationComponent } from './intern-evaluation.component';

describe( 'InternEvaluationComponent', () => {
  let component: InternEvaluationComponent;
  let fixture: ComponentFixture<InternEvaluationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InternEvaluationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent( InternEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
