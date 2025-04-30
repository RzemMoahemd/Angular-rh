import { TestBed } from '@angular/core/testing';

import { RoleRedirectGuardGuard } from './role-redirect.guard.guard';

describe('RoleRedirectGuardGuard', () => {
  let guard: RoleRedirectGuardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RoleRedirectGuardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
