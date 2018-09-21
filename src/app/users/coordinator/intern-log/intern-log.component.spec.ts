import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InternLogComponent } from './intern-log.component';

describe('InternLogComponent', () => {
  let component: InternLogComponent;
  let fixture: ComponentFixture<InternLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InternLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InternLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
