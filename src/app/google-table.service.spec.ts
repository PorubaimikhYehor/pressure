import { TestBed } from '@angular/core/testing';

import { GoogleTableService } from './google-table.service';

describe('GoogleTableService', () => {
  let service: GoogleTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
