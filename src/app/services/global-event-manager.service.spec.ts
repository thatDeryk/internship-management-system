import { TestBed, inject } from '@angular/core/testing';

import { GlobalEventManagerService } from './global-event-manager.service';

describe('GlobalEventManagerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GlobalEventManagerService]
    });
  });

  it('should be created', inject([GlobalEventManagerService], (service: GlobalEventManagerService) => {
    expect(service).toBeTruthy();
  }));
});
