import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoverPaswordComponent } from './recover-pasword.component';

describe('RecoverPaswordComponent', () => {
  let component: RecoverPaswordComponent;
  let fixture: ComponentFixture<RecoverPaswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecoverPaswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecoverPaswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
