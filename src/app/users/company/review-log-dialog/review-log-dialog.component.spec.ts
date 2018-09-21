import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewLogDialogComponent } from './review-log-dialog.component';

describe('ReviewLogDialogComponent', () => {
  let component: ReviewLogDialogComponent;
  let fixture: ComponentFixture<ReviewLogDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewLogDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewLogDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
