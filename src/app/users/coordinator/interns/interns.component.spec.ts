import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InternsComponent } from './interns.component';

describe('InternsComponent', () => {
  let component: InternsComponent;
  let fixture: ComponentFixture<InternsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InternsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InternsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
