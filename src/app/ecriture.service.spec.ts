import { TestBed } from '@angular/core/testing';

import { EcritureService } from './ecriture.service';

describe('EcritureService', () => {
  let service: EcritureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EcritureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
