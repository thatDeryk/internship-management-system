import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordinatorProfileComponent } from './coordinator-profile.component';

describe('CoordinatorProfileComponent', () => {
  let component: CoordinatorProfileComponent;
  let fixture: ComponentFixture<CoordinatorProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoordinatorProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoordinatorProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
