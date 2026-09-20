import { TestBed } from '@angular/core/testing';

import { NativeFeatures } from './native-features';

describe('NativeFeatures', () => {
  let service: NativeFeatures;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NativeFeatures);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
