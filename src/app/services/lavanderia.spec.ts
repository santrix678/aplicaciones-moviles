import { TestBed } from '@angular/core/testing';

import { Lavanderia } from './lavanderia';

describe('Lavanderia', () => {
  let service: Lavanderia;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Lavanderia);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
