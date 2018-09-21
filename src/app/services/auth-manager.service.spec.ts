import { TestBed, inject } from '@angular/core/testing';

import { AuthManagerService } from './auth-manager.service';

describe('AuthManagerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthManagerService]
    });
  });

  it('should be created', inject([AuthManagerService], (service: AuthManagerService) => {
    expect(service).toBeTruthy();
  }));
});
